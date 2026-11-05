(function (root) {
    'use strict';
    const smartBmiCalculator = typeof module !== 'undefined' && module.exports
        ? require('./longevity-smart-bmi.js') : root.LongevitySmartBmi;

    function rowAt(dataset, sex, age) {
        const rows = dataset.tables[sex];
        if (!rows || !Number.isInteger(age) || age < 0 || age >= rows.length || rows[age].age !== age) {
            throw new RangeError('Choose a published integer age and statistical sex category');
        }
        return rows[age];
    }

    function survival(dataset, sex, age, targetAge) {
        const start = rowAt(dataset, sex, age);
        if (targetAge < age) throw new RangeError('Target age precedes current age');
        const end = rowAt(dataset, sex, targetAge);
        // Conditional on having reached age: l(target) / l(age), not survival from birth.
        return end.survivors / start.survivors;
    }

    function baseline(dataset, sex, age) {
        const row = rowAt(dataset, sex, age);
        const curve = dataset.tables[sex].slice(age).map(point => ({
            age: point.age, probability: point.survivors / row.survivors
        }));
        const belowHalf = curve.findIndex(point => point.probability <= 0.5);
        // An interval, rather than an invented exact median between integer observations.
        const medianAgeInterval = belowHalf > 0
            ? [curve[belowHalf - 1].age, curve[belowHalf].age] : null;
        return {
            age, sex, year: dataset._meta.year,
            remainingYears: row.remainingYears,
            expectedAge: age + row.remainingYears,
            nextYearDeathProbability: row.deathProbability,
            curve, medianAgeInterval,
            curveEndsAt: curve[curve.length - 1].age
        };
    }

    function maritalComparison(dataset, sex, age, status) {
        const rows = dataset.periods[dataset._meta.period];
        if (age !== dataset._meta.age || !Object.hasOwn(rows, status) || !['male', 'female'].includes(sex)) {
            throw new RangeError('This published comparison is available at age 65 only');
        }
        return { age, sex, status, period: dataset._meta.period,
            remainingYears: rows[status][sex],
            populationRemainingYears: rows.total[sex],
            differenceFromPopulation: rows[status][sex] - rows.total[sex],
            sourceUrl: dataset._meta.sourceUrl, causalEffect: false };
    }

    // ONE jointly adjusted study model, for relative comparisons only. Never apply
    // these ratios to the population baseline as if it described the reference group.
    function studyRelativeHazard(study, sex, profile) {
        if (!['male', 'female'].includes(sex)) throw new RangeError('Invalid statistical sex category');
        const coefficients = study.sexSpecific[sex];
        if (typeof profile.smoker !== 'boolean' || typeof profile.lowActivity !== 'boolean' ||
            typeof profile.noFruitYesterday !== 'boolean' || !['none', 'moderate', 'high'].includes(profile.alcoholYesterday)) {
            throw new TypeError('A complete profile in the study categories is required');
        }
        const factors = [
            profile.smoker ? coefficients.smoking : 1,
            profile.lowActivity ? coefficients.lowActivity : 1,
            profile.noFruitYesterday ? coefficients.noFruitYesterday : 1,
            profile.alcoholYesterday === 'none' ? 1 : coefficients[`${profile.alcoholYesterday}Alcohol`]
        ];
        return { relativeHazard: factors.reduce((a, b) => a * b, 1),
            reference: 'Nonsmoker, high leisure activity, fruit yesterday, no alcohol yesterday',
            absoluteRemainingYears: null, calibratedToSwiss2025: false };
    }

    // Archived additive prototype, retained for historical regression comparisons only.
    // The public UI uses LongevitySurvival.personalEstimate instead.
    function personalEstimate(dataset, model, sex, age, answers = {}, smartBmiData) {
        const base = rowAt(dataset, sex, age).remainingYears;
        const groups = {};
        const unknown = [];
        let bmi = null;
        let smartBmi = null;
        if (Number.isFinite(answers.height) && Number.isFinite(answers.weight) && answers.height >= 100 && answers.height <= 230 && answers.weight >= 30 && answers.weight <= 300) {
            bmi = answers.weight / ((answers.height / 100) ** 2);
            if (!smartBmiData) throw new TypeError('Smart BMI reference tables are required for the weight correction');
            smartBmi = smartBmiCalculator.calculate(smartBmiData, {age, sex, height: answers.height, weight: answers.weight});
            if (smartBmi) {
                // Our bounded heuristic, NOT a coefficient from Smart BMI or a mortality study.
                // Replace the former BMI correction; never add a second weight penalty.
                const distance = Math.max(model.bmi.centralMin - smartBmi.sbmi, 0, smartBmi.sbmi - model.bmi.centralMax);
                groups.bmi = distance === 0 ? 0 : -base * Math.min(model.bmi.maximumPenaltyFraction, distance * model.bmi.penaltyFractionPerPoint);
            } else unknown.push('bmi');
        } else unknown.push('bmi');
        const choice = (key, choices) => {
            const value = answers[key] ?? '';
            if (value !== '' && !choices.includes(value)) throw new RangeError(`Invalid ${key}`);
            return value;
        };
        const smoking = choice('smoking', ['no', 'yes', 'former']);
        if (smoking === 'no') groups.smoking = model.smoking.never;
        else if (smoking === 'yes' && Number.isFinite(answers.cigarettes) && answers.cigarettes >= 1 && answers.cigarettes <= model.smoking.maxCigarettes) {
            groups.smoking = answers.cigarettes * model.smoking.perCigarette;
        } else if (smoking === 'former' && Number.isFinite(answers.quitYears) && answers.quitYears >= 0 && answers.quitYears <= age) {
            groups.smoking = answers.quitYears > 5 ? model.smoking.formerOverFiveYears : 0;
        } else unknown.push('smoking');
        for (const key of ['activity', 'fruit', 'alcohol']) {
            const value = choice(key, Object.keys(model[key]));
            if (value === '') unknown.push(key);
            else groups[key] = model[key][value];
        }
        const status = choice('marital', ['single', 'married', 'widowed', 'divorced']);
        if (!status) unknown.push('marital');
        else {
            let value = 0;
            if (age > 30) {
                if (status === 'married') {
                    value = model.marital.marriedBase * base;
                    if (age > 50) value += model.marital.marriedAgeCoefficient * base * age;
                } else {
                    const rate = sex === 'male' ? model.marital.maleNotMarried
                        : status === 'divorced' ? model.marital.femaleDivorced : model.marital.femaleOtherNotMarried;
                    value = rate * base * (age < 45 ? (age - 30) / 15 : 1);
                }
            }
            groups.marital = value;
        }
        const supported = age >= model.ageRange[0] && age <= model.ageRange[1];
        const damping = age > model.dampingStartsAt
            ? Math.max(0, (model.dampingEndsAt - age) / (model.dampingEndsAt - model.dampingStartsAt)) : 1;
        // Weight already scales with the official remaining lifetime. Applying the
        // age multiplier again would damp it twice and break proportionality.
        const contributions = Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, supported ? value * (key === 'bmi' ? 1 : damping) : 0]));
        const sum = Object.values(contributions).reduce((total, value) => total + value, 0);
        const capped = Math.min(model.positiveCapYears, sum);
        const remainingYears = Math.max(base * model.minimumRemainingFraction, base + capped);
        return { remainingYears, expectedAge: age + remainingYears, baselineRemainingYears: base,
            difference: remainingYears - base, contributions, unknown, damping,
            considered: Object.keys(groups).length, supported, bmi, smartBmi,
            capApplied: capped !== sum, floorApplied: remainingYears !== base + capped,
            version: model.version, validated: false };
    }

    const api = { baseline, survival, maritalComparison, studyRelativeHazard, personalEstimate };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.LongevityCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

(function (root) {
    'use strict';
    const smart = typeof module !== 'undefined' && module.exports ? require('./longevity-smart-bmi.js') : root.LongevitySmartBmi;
    const discount = typeof module !== 'undefined' && module.exports ? require('./longevity-age-discount.js') : root.LongevityAgeDiscount;
    const cache = new WeakMap();
    const valid = (x, max) => Number.isFinite(x) && x >= 0 && x <= max;

    function exposures(model, sex, age, answers) {
        const result = {};
        if (answers.smoking === 'no') result.smoking = {smoking: 'no'};
        else if (['yes', 'former'].includes(answers.smoking) && valid(answers.cigarettes, 80) && answers.cigarettes >= 1 &&
            (answers.smoking === 'yes' || valid(answers.quitYears, age))) {
            result.smoking = {smoking: answers.smoking, cigarettes: answers.cigarettes, quitYears: answers.quitYears};
        }
        if (valid(answers.moderateMinutes, 2520) && valid(answers.vigorousMinutes, 2520) && answers.moderateMinutes + answers.vigorousMinutes <= 5040) {
            result.activity = Math.min(model.activity.dailyCap,
                (model.activity.moderateMet * answers.moderateMinutes + model.activity.vigorousMet * answers.vigorousMinutes) / 420);
        }
        if (Object.hasOwn(answers, 'fruitVegFrequency')) {
            // The simplified UI asks for total produce, never individual vegetables.
            // Unasked historic details receive the same published reference means,
            // not a personal "no carrots" penalty or invented healthy answers.
            const reference = model.reference[sex].unaskedDiet;
            if (valid(answers.fruitVegFrequency, 12) && reference) {
                result.fruit = Math.max(0, Math.min(10, 2 + Math.min(8, answers.fruitVegFrequency)
                    - 2 * (reference.noCarrotFraction + reference.highPotatoFraction + reference.highJuiceFraction)));
            }
        } else {
            // Prior detailed form schemas remain reproducible for research comparisons.
            // produceFrequency excluded potatoes; fruitFrequency included them.
            const hasProduce = Object.hasOwn(answers, 'produceFrequency');
            const validProduce = hasProduce ? valid(answers.produceFrequency, 12) : valid(answers.fruitFrequency, 12);
            const totalProduce = hasProduce ? answers.produceFrequency + answers.potatoFrequency / 7 : answers.fruitFrequency;
            if (validProduce && valid(answers.juiceFrequency, 6) &&
                ['yes', 'no'].includes(answers.carrots) && valid(answers.potatoFrequency, 21)) {
                result.fruit = Math.max(0, Math.min(10, 2 + Math.min(8, totalProduce)
                    - (answers.carrots === 'no' ? 2 : 0) - (answers.potatoFrequency >= (sex === 'male' ? 7 : 5) ? 2 : 0)
                    - 2 * Math.max(0, Math.min(5, answers.juiceFrequency - 1))));
            }
        }
        if (valid(answers.drinksWeek, 140) && ['yes', 'no'].includes(answers.binge)) {
            result.alcohol = answers.drinksWeek > (sex === 'male' ? 21 : 14) || answers.binge === 'yes';
        }
        return result;
    }

    function logRisk(model, sex, profile, elapsed) {
        const c = model.coefficients[sex];
        const s = profile.smoking;
        const smoking = s.smoking === 'no' ? 0 : (s.cigarettes >= 20 ? c.smokingHeavy : c.smokingLight)
            * (s.smoking === 'former' ? Math.exp(-(s.quitYears + elapsed) / c.quitScale) : 1);
        return smoking + c.activity * Math.log10(1 + profile.activity) + c.diet * profile.fruit
            + (profile.alcohol ? c.alcoholHeavy : 0);
    }

    function referenceCohort(model, sex) {
        const reference = model.reference[sex];
        return reference.smoking.flatMap(s => [false, true].map(alcohol => ({
            smoking: s, alcohol, activity: reference.activityDailyMet, fruit: reference.dietScore,
            weight: s.weight * (alcohol ? reference.heavyAlcoholFraction : 1 - reference.heavyAlcoholFraction)
        })));
    }

    function calibration(data, model, sex, age) {
        if (!cache.has(data)) cache.set(data, new WeakMap());
        const byModel = cache.get(data);
        if (!byModel.has(model)) byModel.set(model, new Map());
        const entries = byModel.get(model), key = `${sex}:${age}`;
        if (entries.has(key)) return entries.get(key);
        const cohort = referenceCohort(model, sex), hazards = [];
        for (let x = age; x < 99; x++) {
            const risk = cohort.map(p => Math.exp(logRisk(model, sex, p, x - age)));
            const q = data.tables[sex][x].deathProbability;
            let low = 0, high = 1;
            const meanSurvival = h => cohort.reduce((sum, p, i) => sum + p.weight * Math.exp(-h * risk[i]), 0);
            while (meanSurvival(high) > 1 - q) high *= 2;
            for (let i = 0; i < 44; i++) {
                const mid = (low + high) / 2;
                if (meanSurvival(mid) > 1 - q) low = mid; else high = mid;
            }
            const h = (low + high) / 2;
            hazards.push(h);
            let total = 0;
            cohort.forEach((p, i) => { p.weight *= Math.exp(-h * risk[i]); total += p.weight; });
            cohort.forEach(p => { p.weight /= total; });
        }
        const value = {hazards};
        entries.set(key, value);
        return value;
    }

    function integrate(data, model, sex, age, known, hazards, multiplier = 1, lifestyleWeight = 1) {
        const reference = referenceCohort(model, sex);
        // Convex mixture shrinks the entire joint lifestyle deviation, including
        // its survival curve. BMI is applied afterwards through a common hazard
        // multiplier and is deliberately not multiplied by lifestyleWeight.
        const cohort = reference.map(p => ({...p, ...known, survival: p.weight * lifestyleWeight}));
        if (lifestyleWeight < 1) cohort.push(...reference.map(p => ({...p, survival: p.weight * (1 - lifestyleWeight)})));
        const curve = [{age, probability: 1}];
        let years = 0;
        for (let i = 0; i < hazards.length; i++) {
            for (const p of cohort) {
                const h = hazards[i] * Math.exp(logRisk(model, sex, p, i)) * multiplier;
                const next = p.survival * Math.exp(-h);
                years += h > 1e-12 ? (p.survival - next) / h : p.survival;
                p.survival = next;
            }
            curve.push({age: age + i + 1, probability: cohort.reduce((sum, p) => sum + p.survival, 0)});
        }
        // Published table ends at 99. Common E(99) tail, not a fabricated personalized centenarian curve.
        years += curve[curve.length - 1].probability * data.tables[sex][99].remainingYears;
        return {years, curve};
    }

    function personalEstimate(data, model, sex, age, answers = {}, smartData, withContributions = true) {
        if (!['male', 'female'].includes(sex) || !Number.isInteger(age) || age < 18 || age > 99) throw new RangeError('Invalid age/sex');
        const base = data.tables[sex][age].remainingYears;
        const known = exposures(model, sex, age, answers);
        const smartBmi = smart.calculate(smartData, {age, sex, height: answers.height, weight: answers.weight});
        const supported = age >= model.ageRange[0] && age <= model.ageRange[1];
        const lifestyleDiscountFactor = supported && model.lifestyleDiscount ? discount.ageDiscount(age, model.lifestyleDiscount) : 1;
        const groups = ['smoking', 'activity', 'fruit', 'alcohol', 'bmi'];
        const unknown = groups.filter(key => key === 'bmi' ? !smartBmi : !Object.hasOwn(known, key));
        const contributions = {};
        const officialCurve = data.tables[sex].slice(age).map(p => ({age: p.age, probability: p.survivors / data.tables[sex][age].survivors}));
        let remainingYears = base, curve = officialCurve;
        if (supported) {
            const {hazards} = calibration(data, model, sex, age);
            const reference = integrate(data, model, sex, age, {}, hazards);
            const normalization = base / reference.years;
            const own = integrate(data, model, sex, age, known, hazards, 1, lifestyleDiscountFactor);
            remainingYears = own.years * normalization;
            curve = own.curve;
            if (smartBmi) {
                const distance = Math.max(model.bmi.centralMin - smartBmi.sbmi, smartBmi.sbmi - model.bmi.centralMax, 0);
                const correction = base * Math.min(model.bmi.maximumPenaltyFraction, distance * model.bmi.penaltyFractionPerPoint);
                if (correction > 0) {
                    const target = Math.max(0.1, remainingYears - correction);
                    let low = 1, high = 2;
                    while (integrate(data, model, sex, age, known, hazards, high, lifestyleDiscountFactor).years * normalization > target) high *= 2;
                    for (let i = 0; i < 28; i++) {
                        const mid = (low + high) / 2;
                        if (integrate(data, model, sex, age, known, hazards, mid, lifestyleDiscountFactor).years * normalization > target) low = mid; else high = mid;
                    }
                    const adjusted = integrate(data, model, sex, age, known, hazards, (low + high) / 2, lifestyleDiscountFactor);
                    remainingYears = adjusted.years * normalization; curve = adjusted.curve;
                }
                contributions.bmi = remainingYears - own.years * normalization;
            }
            // Exactly the official baseline when no numerical exposures have been supplied.
            if (Object.keys(known).length === 0 && (!smartBmi || smartBmi.category === 'central')) { remainingYears = base; curve = officialCurve; }
            if (withContributions) for (const key of groups.filter(k => k !== 'bmi' && Object.hasOwn(known, k))) {
                const without = {...answers};
                const fields = {smoking: ['smoking'], activity: ['moderateMinutes', 'vigorousMinutes'], fruit: ['fruitVegFrequency', 'produceFrequency', 'fruitFrequency'], alcohol: ['drinksWeek']};
                for (const field of fields[key]) delete without[field];
                contributions[key] = remainingYears - personalEstimate(data, model, sex, age, without, smartData, false).remainingYears;
            }
        }
        return {remainingYears, expectedAge: age + remainingYears, baselineRemainingYears: base,
            difference: remainingYears - base, curve, contributions, unknown, considered: 5 - unknown.length,
            supported, lifestyleDiscountFactor, smartBmi, bmi: smartBmi ? answers.weight / (answers.height / 100) ** 2 : null,
            capApplied: false, floorApplied: false, validated: false, version: model.version};
    }

    // Exposed for reproducible audits of the synthetic reference, not a second estimate.
    function referenceCurve(data, model, sex, age) {
        return integrate(data, model, sex, age, {}, calibration(data, model, sex, age).hazards).curve;
    }
    const api = {personalEstimate, exposures, logRisk, referenceCurve};
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.LongevitySurvival = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

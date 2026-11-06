'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../static/data/life-tables.json');
const model = require('../data/longevity-survival-model.json');
const smart = require('../data/longevity-smart-bmi.json');
const {personalEstimate, exposures, logRisk, referenceCurve} = require('../static/js/longevity-survival.js');
const estimate = (answers = {}, age = 60, sex = 'male') => personalEstimate(data, model, sex, age, answers, smart);
const near = (a, b, tolerance = 1e-6) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const profile = {smoking: 'yes', cigarettes: 20, moderateMinutes: 150, vigorousMinutes: 0,
    fruitFrequency: 3, carrots: 'yes', potatoFrequency: 2, juiceFrequency: 1, drinksWeek: 0, binge: 'no'};

test('unknown exposures remain exactly at the official age-conditional BFS baseline', () => {
    for (const sex of ['male', 'female']) for (const age of [18, 20, 30, 60, 80, 95, 99]) {
        const r = estimate({}, age, sex), row = data.tables[sex][age];
        assert.equal(r.remainingYears, row.remainingYears);
        assert.equal(r.curve[0].probability, 1);
        assert.equal(r.considered, 0);
        assert.equal(r.curve.at(-1).probability, data.tables[sex][99].survivors / row.survivors);
    }
    assert.equal(estimate({smoking: 'yes'}).remainingYears, 25);
    assert.equal(estimate({moderateMinutes: 150}).remainingYears, 25);
    assert.equal(estimate({fruitFrequency: 3}).remainingYears, 25);
    assert.equal(estimate({drinksWeek: 10}).remainingYears, 25);
});

test('age-only is the zero reference for every civil status and statistical sex category', () => {
    for (const sex of ['male', 'female']) for (const age of [20, 60, 80, 95]) {
        for (const marital of ['', 'single', 'married', 'widowed', 'divorced']) {
            const r = estimate({marital}, age, sex);
            assert.equal(r.remainingYears, data.tables[sex][age].remainingYears);
            assert.equal(r.difference, 0);
            assert.equal(r.considered, 0);
        }
    }
});

test('the joint log-risk uses published S8 coefficients and the sex-specific quit time functions', () => {
    // Tables 2 and 3 are separate male/female reference samples, not a pooled table.
    assert.equal(model.reference.male.smoking.at(-1).weight, .447);
    assert.equal(model.reference.female.smoking.at(-1).weight, .561);
    assert.equal(model.reference.female.heavyAlcoholFraction, .073);
    assert.equal(model.reference.female.activityDailyMet, 1.3);
    assert.equal(model.reference.female.dietScore, 5.604);
    const p = {smoking: {smoking: 'no'}, activity: 1.6, fruit: 5, alcohol: false};
    for (const [sex, light, heavy, sigma] of [['male', .90032, 1.03950, 15], ['female', .80685, 1.18030, 26]]) {
        const zero = logRisk(model, sex, p, 0);
        near(logRisk(model, sex, {...p, smoking: {smoking: 'yes', cigarettes: 10}}, 0) - zero, light);
        near(logRisk(model, sex, {...p, smoking: {smoking: 'yes', cigarettes: 20}}, 0) - zero, heavy);
        near(logRisk(model, sex, {...p, smoking: {smoking: 'former', cigarettes: 20, quitYears: 0}}, 0) - zero, heavy);
        near(logRisk(model, sex, {...p, smoking: {smoking: 'former', cigarettes: 20, quitYears: 5}}, 10) - zero, heavy * Math.exp(-15 / sigma));
    }
});

test('the synthetic mixture reproduces every annual BFS death probability before the display fallback', () => {
    for (const sex of ['male', 'female']) for (const age of [20, 60, 80, 95]) {
        const curve = referenceCurve(data, model, sex, age);
        let expected = 1;
        for (let i = 1; i < curve.length; i++) {
            expected *= 1 - data.tables[sex][age + i - 1].deathProbability;
            near(curve[i].probability, expected, 1e-10);
        }
    }
    assert.ok(estimate({smoking: 'no'}).remainingYears > 25);
});

test('question transformations preserve diet score, female potato threshold, activity units and alcohol bins', () => {
    const known = exposures(model, 'male', 60, profile);
    near(known.activity, 450 / 420);
    assert.equal(known.fruit, 5);
    assert.equal(exposures(model, 'male', 60, {...profile, fruitFrequency: 5, potatoFrequency: 5}).fruit, 7);
    assert.equal(exposures(model, 'female', 60, {...profile, fruitFrequency: 5, potatoFrequency: 5}).fruit, 5);
    assert.equal(exposures(model, 'male', 60, {...profile, juiceFrequency: 6, carrots: 'no'}).fruit, 0);
    assert.equal(exposures(model, 'male', 60, {...profile, drinksWeek: 21}).alcohol, false);
    assert.equal(exposures(model, 'male', 60, {...profile, drinksWeek: 22}).alcohol, true);
    assert.equal(exposures(model, 'female', 60, {...profile, drinksWeek: 15}).alcohol, true);
    assert.equal(exposures(model, 'male', 60, {...profile, binge: 'yes'}).alcohol, true);
});

test('quitting now improves future survival gradually; younger continuing smokers lose more remaining years', () => {
    const losses = [];
    for (const age of [30, 60, 80]) {
        const continuing = estimate(profile, age);
        const quitting = estimate({...profile, smoking: 'former', quitYears: 0}, age);
        const never = estimate({...profile, smoking: 'no'}, age);
        assert.ok(continuing.remainingYears < quitting.remainingYears);
        assert.ok(quitting.remainingYears < never.remainingYears);
        losses.push(never.remainingYears - continuing.remainingYears);
        assert.ok(estimate({...profile, cigarettes: 10}, age).remainingYears > continuing.remainingYears);
        assert.ok(estimate({...profile, smoking: 'former', quitYears: 15}, age).remainingYears > quitting.remainingYears);
    }
    assert.ok(losses[0] > 8 && losses[0] > losses[1] && losses[1] > losses[2]);
});

test('combined behaviours change one survival curve; factor comparisons must not be added', () => {
    const bad = {...profile, moderateMinutes: 0, fruitFrequency: 0, carrots: 'no', juiceFrequency: 5, drinksWeek: 30};
    const r = estimate(bad);
    assert.ok(estimate({...bad, moderateMinutes: 300}).remainingYears > r.remainingYears);
    assert.ok(estimate({...bad, fruitFrequency: 5, carrots: 'yes', juiceFrequency: 0}).remainingYears > r.remainingYears);
    const sum = Object.values(r.contributions).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - r.difference) > .01);
    for (const age of [30, 60, 80, 95]) for (const sex of ['male', 'female']) {
        const curve = estimate(bad, age, sex).curve;
        assert.equal(curve[0].probability, 1);
        assert.ok(curve.at(-1).probability > 0);
        for (let i = 1; i < curve.length; i++) assert.ok(curve[i].probability <= curve[i - 1].probability && curve[i].probability >= 0);
    }
});

test('Smart BMI retains the requested proportional correction and changes the modeled curve, without a second BMI penalty', () => {
    const a = estimate(profile), b = estimate({...profile, height: 180, weight: 110});
    assert.equal(b.smartBmi.sbmi, 48);
    near(a.remainingYears - b.remainingYears, .9);
    near(b.contributions.bmi, -.9);
    assert.ok(b.curve[20].probability < a.curve[20].probability);
    near(estimate({...profile, height: 180, weight: 81}).remainingYears, a.remainingYears);
    const old = estimate({...profile, height: 180, weight: 300}, 80);
    near(estimate(profile, 80).remainingYears - old.remainingYears, .76);
});

test('marital status no longer changes the result; alcohol initiation earns no bonus; unsupported ages stay official', () => {
    for (const marital of ['single', 'married', 'widowed', 'divorced']) assert.equal(estimate({...profile, marital}).remainingYears, estimate(profile).remainingYears);
    assert.equal(estimate({...profile, drinksWeek: 0}).remainingYears, estimate({...profile, drinksWeek: 10}).remainingYears);
    for (const age of [18, 19, 96, 99]) {
        const r = estimate({...profile, height: 180, weight: 110}, age);
        assert.equal(r.supported, false);
        assert.equal(r.remainingYears, data.tables.male[age].remainingYears);
    }
});


test('separate produce and weekly potatoes reconstruct the legacy total without counting potatoes twice', () => {
    for (const sex of ['male', 'female']) {
        const legacy = {...profile, fruitFrequency: 4, potatoFrequency: 7};
        const separated = {...legacy, produceFrequency: 3};
        assert.equal(exposures(model, sex, 60, separated).fruit, exposures(model, sex, 60, legacy).fruit);
        near(estimate(separated, 60, sex).remainingYears, estimate(legacy, 60, sex).remainingYears);
    }
    // Explicit new-schema unknown does not fall back to an unrelated legacy value.
    assert.equal(exposures(model, 'male', 60, {...profile, produceFrequency: null}).fruit, undefined);
    assert.equal(exposures(model, 'male', 60, {...profile, produceFrequency: 3, potatoFrequency: null}).fruit, undefined);
    assert.equal(exposures(model, 'male', 60, {...profile, produceFrequency: 12, potatoFrequency: 21, juiceFrequency: 0}).fruit, 8);
});

test('historical age weight shrinks positive and negative lifestyle deviations and their curves exactly once', () => {
    const undampedModel = {...model}; delete undampedModel.lifestyleDiscount;
    const good = {...profile, smoking:'no', moderateMinutes:300, fruitFrequency:5, juiceFrequency:0};
    const bad = {...profile, moderateMinutes:0, fruitFrequency:0, carrots:'no', juiceFrequency:5, drinksWeek:30};
    for (const sex of ['male','female']) for (const [age, weight] of [[40,1],[50,1],[60,.8],[80,.4],[95,.1]]) {
        for (const answers of [good,bad]) {
            const raw = personalEstimate(data,undampedModel,sex,age,answers,smart,false);
            const own = personalEstimate(data,model,sex,age,answers,smart,false);
            const reference = referenceCurve(data,model,sex,age);
            near(own.lifestyleDiscountFactor,weight);
            near(own.difference,raw.difference*weight);
            for(let i=0;i<own.curve.length;i++) {
                near(own.curve[i].probability,weight*raw.curve[i].probability+(1-weight)*reference[i].probability,1e-11);
            }
        }
    }
});

test('age weighting never discounts the SBMI penalty or invents a lifestyle change for BMI-only inputs', () => {
    for(const age of [40,60,80,95]) {
        const bmiOnly=estimate({height:180,weight:110},age);
        const combined=estimate({...profile,height:180,weight:110},age);
        const unweighted=estimate(profile,age);
        const penalty=-bmiOnly.contributions.bmi;
        near(data.tables.male[age].remainingYears-bmiOnly.remainingYears,penalty);
        near(unweighted.remainingYears-combined.remainingYears,penalty);
        assert.ok(penalty>0);
    }
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../static/data/life-tables.json');
const study = require('../data/longevity-study.json');
const { baseline, survival, maritalComparison, personalEstimate } = require('../static/js/longevity-core.js');
const heuristic = require('../data/longevity-heuristic.json');
const { legacy, studyRelativeHazard } = require('../scripts/lib/longevity-models.cjs');

test('BFS published age-60 reference values and conditional survival', () => {
    assert.equal(baseline(data, 'male', 60).remainingYears, 25);
    assert.equal(baseline(data, 'female', 60).remainingYears, 27.7);
    assert.equal(baseline(data, 'male', 60).expectedAge, 85);
    assert.equal(survival(data, 'male', 60, 60), 1);
    assert.equal(survival(data, 'male', 60, 80), data.tables.male[80].survivors / 94384);
    assert.notEqual(survival(data, 'male', 60, 80), data.tables.male[80].survivors / 100000);
    // Independent calculation from annual q(x), allowing published count rounding.
    const annualProduct = data.tables.male.slice(60, 80).reduce((s, row) => s * (1 - row.deathProbability), 1);
    assert.ok(Math.abs(annualProduct - survival(data, 'male', 60, 80)) < 0.00005);
});

test('personal heuristic starts at BFS and reacts to smoking dose, activity, BMI and civil status', () => {
    const estimate = answers => personalEstimate(data, heuristic, 'male', 60, answers);
    const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
    assert.equal(estimate({}).remainingYears, 25);
    assert.equal(estimate({}).considered, 0);
    close(estimate({smoking: 'no'}).remainingYears, 26.6);
    close(estimate({smoking: 'yes', cigarettes: 20}).remainingYears, 21.8);
    close(estimate({smoking: 'yes', cigarettes: 40}).remainingYears, 18.6);
    close(estimate({smoking: 'former', quitYears: 6}).remainingYears, 25.8);
    assert.equal(estimate({smoking: 'former', quitYears: 5}).remainingYears, 25);
    close(estimate({activity: 'high'}).remainingYears, 26.6);
    close(estimate({height: 180, weight: 81}).remainingYears, 25.8);
    close(estimate({height: 180, weight: 110}).remainingYears, 23.4);
    close(estimate({marital: 'married'}).remainingYears, 27.8);
    // The historical female-married double penalty is intentionally absent.
    close(personalEstimate(data, heuristic, 'female', 60, {marital: 'married'}).remainingYears, 30.8024);
    const combined = estimate({smoking: 'no', activity: 'high', fruit: 'yes', height: 180, weight: 81, alcohol: 'none', marital: 'married'});
    close(combined.remainingYears, 32.6);
    assert.equal(combined.considered, 6);
    assert.equal(combined.validated, false);
    assert.equal(baseline(data, 'male', 60).remainingYears, 25);
});

test('unknown details, unsupported BMI/age, alcohol bonus removal and bounds are explicit', () => {
    for (const answers of [{smoking: 'yes'}, {smoking: 'yes', cigarettes: 81}, {height: 180}, {height: 180, weight: 300}]) {
        const result = personalEstimate(data, heuristic, 'male', 60, answers);
        assert.equal(result.remainingYears, 25);
        assert.equal(result.considered, 0);
    }
    assert.equal(personalEstimate(data, heuristic, 'male', 60, {alcohol: 'moderate'}).remainingYears, 25);
    const older = personalEstimate(data, heuristic, 'male', 99, {smoking: 'yes', cigarettes: 80});
    assert.equal(older.remainingYears, baseline(data, 'male', 99).remainingYears);
    assert.equal(older.supported, false);
    const extreme = personalEstimate(data, heuristic, 'male', 80, {smoking: 'yes', cigarettes: 80, activity: 'none', alcohol: 'ten', marital: 'single', height: 180, weight: 110});
    assert.equal(extreme.floorApplied, true);
    assert.equal(extreme.remainingYears, 9.5 / 4);
    assert.throws(() => personalEstimate(data, heuristic, 'male', 60, {activity: 'invented'}), RangeError);
});

test('conditional curves, medians and the unpublished tail are handled explicitly', () => {
    for (const sex of ['male', 'female']) {
        for (let age = 0; age <= 99; age++) {
            const result = baseline(data, sex, age);
            assert.equal(result.curve[0].probability, 1);
            assert.equal(result.curveEndsAt, 99);
            assert.ok(result.curve.at(-1).probability > 0);
            for (let i = 1; i < result.curve.length; i++) {
                assert.ok(result.curve[i].probability <= result.curve[i - 1].probability);
            }
            if (result.medianAgeInterval) {
                const [lo, hi] = result.medianAgeInterval;
                assert.ok(survival(data, sex, age, lo) > 0.5);
                assert.ok(survival(data, sex, age, hi) <= 0.5);
            }
        }
        assert.equal(baseline(data, sex, 99).medianAgeInterval, null);
    }
    assert.throws(() => baseline(data, 'male', 60.5), RangeError);
    assert.throws(() => baseline(data, 'unknown', 60), RangeError);
    assert.throws(() => survival(data, 'male', 60, 100), RangeError);
    assert.throws(() => survival(data, 'male', 60, 59), RangeError);
});

test('legacy smoke/activity example, asymmetric cap and minimum lifetime', () => {
    assert.ok(Math.abs(legacy(25, 60, 'male', {df2: -4, ex: 2}).remainingYears - 23.4) < 1e-12);
    assert.equal(legacy(25, 60, 'male', {df2: 30}).remainingYears, 37);
    const extreme = legacy(25, 60, 'male', {df2: -80});
    assert.equal(extreme.remainingYears, 6.25);
    assert.equal(extreme.floorApplied, true);
    assert.equal(legacy(10, 80, 'male', {df2: -4}).ageMultiplier, 0.4);
    assert.equal(legacy(25, 60, 'male', {sf3: 'mar'}).groups.social, 3.5);
    assert.equal(legacy(25, 60, 'female', {sf3: 'mar'}).groups.social, 3);
    assert.equal(legacy(25, 60, 'male', {bmi: 20}).groups.bmi, -1);
    assert.equal(legacy(25, 60, 'male', {bmi: 20.1}).groups.bmi, 1);
    assert.throws(() => legacy(25, 96, 'male'), RangeError);
});

test('historical implementation agrees with eight executions of the original isolated PHP arithmetic', () => {
    const fixture = require('./fixtures/longevity-legacy-golden.json');
    for (const row of fixture.cases) {
        const actual = legacy(row.base, row.age, row.sex, row.input);
        assert.ok(Math.abs(actual.remainingYears - row.expected.remainingYears) < 1e-10);
        assert.ok(Math.abs(actual.rawCorrection - row.expected.rawCorrection) < 1e-10);
        assert.ok(Math.abs(actual.groups.social - row.expected.social) < 1e-10);
    }
});

test('study comparisons require complete profiles and never claim absolute life expectancy', () => {
    const reference = {smoker: false, lowActivity: false, noFruitYesterday: false, alcoholYesterday: 'none'};
    assert.equal(studyRelativeHazard(study, 'male', reference).relativeHazard, 1);
    assert.equal(studyRelativeHazard(study, 'male', {...reference, smoker: true}).relativeHazard, 1.63);
    const result = studyRelativeHazard(study, 'female', {...reference, smoker: true, lowActivity: true});
    assert.equal(result.relativeHazard, 1.52 * 1.22);
    assert.equal(result.absoluteRemainingYears, null);
    assert.equal(result.calibratedToSwiss2025, false);
    assert.throws(() => studyRelativeHazard(study, 'male', {}), TypeError);
});

test('marital group comparison preserves its period, age and population reference', () => {
    const marital = require('../static/data/life-marital-comparison.json');
    const male = maritalComparison(marital, 'male', 65, 'married');
    assert.equal(male.remainingYears, 20.8);
    assert.equal(male.populationRemainingYears, 19.8);
    assert.equal(male.differenceFromPopulation, 1);
    assert.equal(male.period, '2018/2023');
    assert.equal(male.causalEffect, false);
    assert.equal(maritalComparison(marital, 'female', 65, 'married').remainingYears, 24.1);
    assert.throws(() => maritalComparison(marital, 'male', 60, 'married'), RangeError);
    assert.throws(() => maritalComparison(marital, 'male', 65, 'cohabiting'), RangeError);
    assert.throws(() => maritalComparison(marital, 'male', 65, 'toString'), RangeError);
});

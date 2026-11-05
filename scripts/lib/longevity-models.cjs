'use strict';

// Research comparison only. Original PHP: gesundheit.inc, lines 413–561, 742–778.
// Supports integer ages 13–95; intentionally excludes legacy rounding/UI and bugs
// in fractional-age interpolation, age 1 and ages above 95.
function legacy(remainingYears, age, sex, input = {}) {
    if (!Number.isFinite(remainingYears) || remainingYears <= 0 ||
        !Number.isInteger(age) || age < 13 || age > 95 || !['male', 'female'].includes(sex)) {
        throw new RangeError('Legacy comparison supports ages 13–95 and positive remaining years');
    }
    const value = key => {
        const result = input[key] ?? 0;
        if (!Number.isFinite(result)) throw new TypeError(`Invalid legacy score: ${key}`);
        return result;
    };
    const sum = keys => keys.reduce((total, key) => total + value(key), 0);
    let bmi = 0;
    if (input.bmi !== undefined) {
        // PHP rounds BMI to one decimal before assigning the historical score.
        if (!Number.isFinite(input.bmi) || input.bmi <= 0) throw new RangeError('Invalid BMI');
        const rounded = Math.floor(input.bmi * 10 + 0.5) / 10;
        bmi = rounded > 30 ? -2 : rounded > 25 ? -1 : rounded > 20 ? 1 : -1;
    }
    let social = sum(['sf1', 'sf2', 'sf4', 'sf5', 'sf6', 'sf7', 'sf8']);
    const status = input.sf3 ?? '';
    if (!['', 'cel', 'mar', 'wid', 'div'].includes(status)) throw new RangeError('Invalid civil status');
    if (age > 30 && status === 'mar') {
        social += 0.02 * remainingYears;
        if (age > 50) social += 0.002 * remainingYears * age;
    }
    if (age > 30 && status !== '') {
        let penalty = 0;
        if (sex === 'male' && status !== 'mar') penalty = 0.15;
        // Historical PHP also penalizes married women here: preserve for comparison.
        if (sex === 'female') penalty = status === 'div' ? 0.06 : 0.02;
        social -= penalty * remainingYears * (age < 45 ? (age - 30) / 15 : 1);
    }
    const groups = {
        bmi, family: Math.max(-12, sum(['gf1', 'gf2', 'gf3'])), social,
        biomedicalAndDiet: sum(['bf1', 'bf2', 'bf3', 'bf4', 'bf5']),
        substances: sum(['df1', 'df2', 'df3', 'df4', 'df5']), activity: value('ex')
    };
    const rawCorrection = Object.values(groups).reduce((a, b) => a + b, 0);
    const ageMultiplier = age > 50 ? (100 - age) / 50 : 1;
    const cappedCorrection = Math.min(12, rawCorrection * ageMultiplier);
    const result = Math.max(remainingYears / 4, remainingYears + cappedCorrection);
    return { remainingYears: result, expectedAge: age + result, groups, rawCorrection,
        ageMultiplier, cappedCorrection, appliedCorrection: result - remainingYears,
        positiveCapApplied: rawCorrection * ageMultiplier > 12,
        floorApplied: remainingYears + cappedCorrection < remainingYears / 4 };
}

// Published sex-specific total-mortality estimates from ONE mutually adjusted model.
// Not an absolute mortality calculator, not calibrated to BFS, and not an estimate
// of the causal benefit of changing behaviour today.
const { studyRelativeHazard } = require('../../static/js/longevity-core.js');

module.exports = { legacy, studyRelativeHazard };

'use strict';

// Development only. Extracted from gesundheit.inc:549-558.
// Not imported by static/js or the public calculator.
function ageDiscount(age, {fullUntil = 50, zeroAt = 100} = {}) {
    if (!Number.isFinite(age) || age < 0 || age > 120) throw new RangeError('Expected age 0-120');
    if (!Number.isFinite(fullUntil) || !Number.isFinite(zeroAt) || fullUntil < 0 || zeroAt > 120 || zeroAt <= fullUntil) {
        throw new RangeError('Expected 0 <= fullUntil < zeroAt <= 120');
    }
    return age <= fullUntil ? 1 : Math.max(0, 1 - (age - fullUntil) / (zeroAt - fullUntil));
}

function applyLegacyCorrection(remainingYears, age, rawCorrection, options = {}) {
    if (!Number.isFinite(remainingYears) || remainingYears <= 0 || !Number.isFinite(rawCorrection)) {
        throw new RangeError('Expected positive base remaining years and a finite correction');
    }
    const {positiveCap = 12, minimumFraction = .25} = options;
    if (!Number.isFinite(positiveCap) || positiveCap < 0 || !Number.isFinite(minimumFraction) || minimumFraction < 0 || minimumFraction > 1) {
        throw new RangeError('Expected nonnegative positive cap and minimum fraction 0-1');
    }
    const ageMultiplier = ageDiscount(age, options);
    const discountedCorrection = rawCorrection * ageMultiplier;
    const cappedCorrection = Math.min(positiveCap, discountedCorrection);
    const result = Math.max(remainingYears * minimumFraction, remainingYears + cappedCorrection);
    return {remainingYears: result, ageMultiplier, discountedCorrection, cappedCorrection,
        appliedCorrection: result - remainingYears,
        positiveCapApplied: discountedCorrection > positiveCap,
        floorApplied: remainingYears + cappedCorrection < remainingYears * minimumFraction};
}

module.exports = {ageDiscount, applyLegacyCorrection};

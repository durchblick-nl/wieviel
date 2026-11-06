'use strict';

// Historical additive correction for development only, gesundheit.inc:549-558.
// The pure age factor is shared with the current lifestyle/reference curve blend.
const {ageDiscount} = require('../../static/js/longevity-age-discount.js');

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

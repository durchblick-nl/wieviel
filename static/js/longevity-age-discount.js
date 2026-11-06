(function (root) {
    'use strict';
    // Historical linear factor, gesundheit.inc:550. The current calculator uses
    // it for lifestyle/reference survival blending, not for an extra BMI penalty.
    function ageDiscount(age, {fullUntil = 50, zeroAt = 100} = {}) {
        if (!Number.isFinite(age) || age < 0 || age > 120) throw new RangeError('Expected age 0-120');
        if (!Number.isFinite(fullUntil) || !Number.isFinite(zeroAt) || fullUntil < 0 || zeroAt > 120 || zeroAt <= fullUntil) {
            throw new RangeError('Expected 0 <= fullUntil < zeroAt <= 120');
        }
        return age <= fullUntil ? 1 : Math.max(0, 1 - (age - fullUntil) / (zeroAt - fullUntil));
    }
    const api = {ageDiscount};
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.LongevityAgeDiscount = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

(function (root) {
    'use strict';

    // Numeric adult subset of Christian Bachmann et al.'s SBMIC 2.7.
    // See data/longevity-smart-bmi.json for table provenance and docs for limits.
    // This index deliberately provides no conversion to mortality or life years.
    const round = (value, places = 0) => Math.round((value + Number.EPSILON) * 10 ** places) / 10 ** places;

    function calculate(data, {age, sex, height, weight}) {
        if (!Number.isInteger(age) || age < 18 || age > 99 || !['male', 'female'].includes(sex) ||
            !Number.isFinite(height) || height < 100 || height > 230 ||
            !Number.isFinite(weight) || weight < 30 || weight > 300) return null;
        const referenceAge = Math.min(age, 95);
        const offset = sex === 'male' ? 0 : 6;
        const limits = data.thresholds[referenceAge].slice(offset, offset + 6);
        const roundedWeight = round(weight * 2) / 2;
        const metres = round(height / 100, 3);
        const bmi = round(roundedWeight / (metres * metres), 1);
        limits.push(limits[5] * 1.33);
        let segment = limits.findIndex(limit => bmi <= limit);
        if (segment < 0) segment = 6;
        const upper = Math.max(limits[segment], bmi);
        const lower = segment === 0 ? (20 + limits[0]) / 3 : limits[segment - 1];
        const fraction = upper === lower ? 0 : Math.max(0, Math.min(1, round((bmi - lower) / (upper - lower), 2)));
        const band = round(segment + fraction, 2);
        const sbmi = round(10 * band);
        return {bmi, sbmi, band, referenceAge, ageClamped: age > 95,
            category: sbmi < 30 ? 'below' : sbmi < 40 ? 'central' : 'above'};
    }

    if (typeof module !== 'undefined' && module.exports) module.exports = {calculate};
    else root.LongevitySmartBmi = {calculate};
})(typeof globalThis !== 'undefined' ? globalThis : this);

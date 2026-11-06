'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {assessCandidates} = require('../scripts/lib/longevity-predictor-review.cjs');

test('candidate review distinguishes unknown teeth from edentulism and untested from failed balance', () => {
    const unknown = assessCandidates({age: 60});
    assert.equal(unknown.teeth.status, 'unknown');
    assert.equal(unknown.balance.status, 'unknown');
    assert.equal(unknown.balance.sourceCohortContrast, null);
    const measured = assessCandidates({age: 60, teeth: 0, balance: 'failed', protocol: 'clinimex-10s', stableGait: true});
    assert.equal(measured.teeth.status, 'exposure_mapping_unverified');
    assert.equal(measured.teeth.hazardRatio, null);
    assert.equal(measured.balance.sourceCohortContrast.hazardRatio, 1.84);
    // Neither available study contrast nor measured teeth authorize combining studies.
    assert.equal(measured.combinedHazardRatio, null);
    assert.equal(measured.extendedRemainingYears, null);
    assert.equal(measured.productionEligible, false);
});

test('study contrast requires matching age, protocol and eligibility, with no extrapolation', () => {
    const base = {age: 60, balance: 'failed', protocol: 'clinimex-10s', stableGait: true};
    for (const [input, expected] of [
        [{age: 50}, 'outside_studied_age'], [{age: 76}, 'outside_studied_age'],
        [{protocol: 'nhanes-romberg'}, 'protocol_mismatch'],
        [{stableGait: false}, 'excluded'], [{balance: 'unsafe'}, 'excluded'],
        [{stableGait: null}, 'eligibility_unknown']
    ]) {
        const result = assessCandidates({...base, ...input});
        assert.equal(result.balance.status, expected);
        assert.equal(result.balance.sourceCohortContrast, null);
    }
    for (const age of [51, 75]) assert.equal(assessCandidates({...base, age}).balance.sourceCohortContrast.hazardRatio, 1.84);
    assert.equal(assessCandidates({...base, balance: 'passed'}).balance.sourceCohortContrast.reference, true);
});

test('candidate review rejects malformed measurements rather than treating them as valid risk groups', () => {
    for (const teeth of [-1, 29, 12.5, '20', NaN]) assert.throws(() => assessCandidates({age: 60, teeth}), RangeError);
    assert.throws(() => assessCandidates({age: 60, balance: 'maybe'}), TypeError);
    assert.throws(() => assessCandidates({age: 60, stableGait: 'yes'}), TypeError);
    assert.throws(() => assessCandidates({age: 60.5}), RangeError);
});

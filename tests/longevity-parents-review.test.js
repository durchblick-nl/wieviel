'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {assessParents, normalizeParent, publishedDecadeContrast} = require('../scripts/lib/longevity-parents-review.cjs');
const deceased = age => ({status: 'deceased', age, cause: 'illness'});
const profile = {age: 60, biologicalParents: true, mother: deceased(80), father: deceased(80)};

test('living parent age is censored, never a completed lifespan or a failed longevity result', () => {
    const alive = assessParents({...profile, mother: {status: 'alive', age: 80}});
    const dead = assessParents({...profile, mother: deceased(80)});
    assert.equal(alive.parents.mother.eventObserved, false);
    assert.equal(dead.parents.mother.eventObserved, true);
    assert.equal(alive.sourceStatus, 'living_parent_censored');
    assert.equal(dead.sourceStatus, 'source_context_only');
    assert.equal(assessParents({age: 60}).parents.mother.attainedAge, null);
});

test('external deaths, unverified relationship and source age exclusions cannot produce annual adjustments', () => {
    for (const [changes, status] of [
        [{mother: {status: 'deceased', age: 55, cause: 'external'}}, 'external_death_not_modelled'],
        [{mother: deceased(55)}, 'premature_parental_death_excluded'],
        [{father: deceased(45)}, 'premature_parental_death_excluded'],
        [{age: 54}, 'outside_studied_offspring_age'],
        [{age: 74}, 'outside_studied_offspring_age'],
        [{biologicalParents: null}, 'biological_relationship_unverified'],
        [{mother: {status: 'unknown'}}, 'unknown_parent'],
        [{}, 'source_context_only']
    ]) {
        const result = assessParents({...profile, ...changes});
        assert.equal(result.sourceStatus, status);
        assert.equal(result.extendedRemainingYears, null);
        assert.equal(result.combinedHazardRatio, null);
        assert.equal(result.productionEligible, false);
    }
    for (const age of [55, 73]) assert.equal(assessParents({...profile, age}).sourceStatus, 'source_context_only');
});

test('invalid or contradictory parent records are rejected, not silently counted as healthy', () => {
    for (const age of [-1, 126, '80', 80.5, NaN, null]) assert.throws(() => normalizeParent({status: 'alive', age}), RangeError);
    for (const input of [null, [], {status: 'missing'}, {status: 'unknown', age: 80},
        {status: 'alive', age: 80, cause: 'illness'}, {status: 'deceased', age: 80, cause: 'cancer'}]) {
        assert.throws(() => normalizeParent(input), TypeError);
    }
    assert.throws(() => assessParents({...profile, biologicalParents: 'yes'}), TypeError);
    assert.throws(() => assessParents({...profile, mother: {status: 'alive', age: 60}}), RangeError);
});

test('fixed maternal and paternal contrasts remain separate source results', () => {
    assert.equal(publishedDecadeContrast('mother').hazardRatio, 0.84);
    assert.equal(publishedDecadeContrast('father').hazardRatio, 0.83);
    assert.throws(() => publishedDecadeContrast('both'), TypeError);
    const contrast = publishedDecadeContrast('mother');
    contrast.ci95[0] = 0;
    assert.deepEqual(publishedDecadeContrast('mother').ci95, [0.79, 0.89]);
});

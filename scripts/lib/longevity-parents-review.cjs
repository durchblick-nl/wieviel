'use strict';

// Internal research adapter. Never used by the public calculator.
const evidence = require('../data/longevity-parental-evidence.json');
const roles = ['mother', 'father'];

function normalizeParent(input = {status: 'unknown'}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Expected parent record');
    const {status, age = null, cause = 'unknown'} = input;
    if (!['unknown', 'alive', 'deceased'].includes(status)) throw new TypeError('Invalid parent status');
    if (!['unknown', 'illness', 'external'].includes(cause)) throw new TypeError('Invalid cause category');
    if (status === 'unknown') {
        if (age !== null || cause !== 'unknown') throw new TypeError('Unknown parent cannot carry age or cause');
        return {status, attainedAge: null, eventObserved: null, cause};
    }
    // Input bounds are data-quality bounds, NOT the study applicability range.
    if (!Number.isInteger(age) || age < 0 || age > 125) throw new RangeError('Expected whole parent age 0-125');
    if (status === 'alive' && cause !== 'unknown') throw new TypeError('Living parent cannot carry death cause');
    return {status, attainedAge: age, eventObserved: status === 'deceased', cause};
}

function assessParents({age, biologicalParents = null, mother, father}) {
    if (!Number.isInteger(age) || age < 18 || age > 99) throw new RangeError('Expected offspring age 18-99');
    if (![true, false, null].includes(biologicalParents)) throw new TypeError('Expected biologicalParents true/false/null');
    const parents = {mother: normalizeParent(mother), father: normalizeParent(father)};
    if (biologicalParents === true && roles.some(role => parents[role].status === 'alive' && parents[role].attainedAge <= age)) {
        throw new RangeError('Living biological parent must be older than offspring');
    }
    const study = evidence.source;
    let sourceStatus = 'source_context_only';
    if (roles.some(role => parents[role].status === 'unknown')) sourceStatus = 'unknown_parent';
    else if (biologicalParents !== true) sourceStatus = 'biological_relationship_unverified';
    else if (roles.some(role => !parents[role].eventObserved)) sourceStatus = 'living_parent_censored';
    else if (roles.some(role => parents[role].cause === 'external')) sourceStatus = 'external_death_not_modelled';
    else if (age < study.offspringAgeRange[0] || age > study.offspringAgeRange[1]) sourceStatus = 'outside_studied_offspring_age';
    else if (roles.some(role => parents[role].attainedAge < study.excludedParentalDeathBelow[role])) sourceStatus = 'premature_parental_death_excluded';
    else if (roles.some(role => parents[role].attainedAge < study.perDecadeContrastAppliesFromParentalAge)) sourceStatus = 'outside_reported_linear_contrast';
    return {parents, sourceStatus, combinedHazardRatio: null, extendedRemainingYears: null,
        productionEligible: false, blockers: [...evidence.releaseBlockers]};
}

// Report only the published fixed +10-year source contrast. No arbitrary choice
// of an "average" parent's death age, no extrapolation to a living parent, and
// no multiplication of separate maternal/paternal estimates.
function publishedDecadeContrast(role) {
    if (!roles.includes(role)) throw new TypeError('Expected mother or father');
    return {...evidence.source.perDecadeAllCauseHazardRatio[role],
        ci95: [...evidence.source.perDecadeAllCauseHazardRatio[role].ci95],
        parentalAgeIncreaseYears: 10, sourceCohortOnly: true};
}

module.exports = {normalizeParent, assessParents, publishedDecadeContrast, evidence};

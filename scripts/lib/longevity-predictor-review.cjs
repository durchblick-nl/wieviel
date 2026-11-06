'use strict';

// Research only. Never imported by layouts or static calculator code.
const evidence = require('../data/longevity-predictor-evidence.json');

function assessCandidates({age, teeth = null, balance = 'not_tested', protocol = null, stableGait = null}) {
    if (!Number.isInteger(age) || age < 18 || age > 99) throw new RangeError('Expected age 18-99');
    if (teeth !== null && (!Number.isInteger(teeth) || teeth < 0 || teeth > 28)) throw new RangeError('Expected 0-28 natural teeth or null');
    if (!['passed', 'failed', 'not_tested', 'unsafe'].includes(balance)) throw new TypeError('Unknown balance response');
    if (![true, false, null].includes(stableGait)) throw new TypeError('Expected stableGait true, false or null');

    const study = evidence.sources.balance2022;
    let status = 'source_contrast_available';
    if (balance === 'not_tested') status = 'unknown';
    else if (balance === 'unsafe' || stableGait === false) status = 'excluded';
    else if (age < study.ageMin || age > study.ageMax) status = 'outside_studied_age';
    else if (protocol !== study.protocol) status = 'protocol_mismatch';
    else if (stableGait === null) status = 'eligibility_unknown';

    // This is a contrast within the source cohort, NOT a multiplier for MPoRT/BFS.
    const contrast = status === 'source_contrast_available'
        ? balance === 'passed' ? {hazardRatio: 1, ci95: null, reference: true}
            : {...study.failedVsPassed, reference: false}
        : null;
    return {
        // No conversion from present teeth to loss categories until ascertainment
        // (agenesis, orthodontics, implants, third molars) is verified in full methods.
        teeth: {status: teeth === null ? 'unknown' : 'exposure_mapping_unverified', hazardRatio: null},
        balance: {status, sourceCohortContrast: contrast},
        combinedHazardRatio: null,
        extendedRemainingYears: null,
        productionEligible: false,
        blockers: [...evidence.releaseBlockers]
    };
}

module.exports = {assessCandidates, evidence};

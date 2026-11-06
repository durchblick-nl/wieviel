"""Exploratory weighted ten-year mortality comparison; NOT a life-years model.

Requires numpy, pandas, Node. Usage: python3 scripts/review_longevity_waist.py
--data-dir /tmp/wieviel-nhanes-public --node /absolute/path/to/node
Only aggregate output; no person records are written. See the analysis plan.
"""
import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import subprocess
from profile_public_nhanes import indexed, parse_mortality, valid_mortality

ROOT = Path(__file__).resolve().parents[1]


def normalize_sas_zero(value):
    # pandas' IBM XPORT conversion can decode SAS zero as about 5.4e-79.
    # None of the selected questionnaire/body/design fields has meaningful
    # magnitudes below 1e-30. Preserve missing NaN, not zero-fill.
    if isinstance(value, (int, float)) and math.isfinite(value) and abs(value) < 1e-30:
        return 0.0
    return value


def read_xpt(path):
    import pandas as pd
    frame = pd.read_sas(path, format='xport')
    for column in frame.select_dtypes(include='number').columns:
        frame[column] = frame[column].map(normalize_sas_zero)
    return frame


def ten_year_outcome(row):
    if not valid_mortality(row):
        return None
    months = row['PERMTH_EXM']
    if row['MORTSTAT'] == 1:
        return int(months <= 120)
    return 0 if months >= 120 else None


def smoking(row):
    if row.get('SMQ020') == 2:
        return 'never'
    if row.get('SMQ020') == 1:
        return {1: 'current', 2: 'current', 3: 'former'}.get(row.get('SMQ040'))
    return None


def activity(row):
    a, b = row.get('PAD200'), row.get('PAD320')
    if a not in (1, 2, 3) or b not in (1, 2, 3):
        return None
    if a == 3 or b == 3:
        return 'unable'
    return 'some' if a == 1 or b == 1 else 'none'


def alcohol(row):
    # Do not confuse skip-pattern non-use with a missing quantity.
    ever_year = row.get('ALD100', row.get('ALQ101'))
    if ever_year not in (1, 2):
        return None
    if ever_year == 2 and row.get('ALQ110') == 2:
        return 'low_lifetime'
    q, unit, drinks = row.get('ALQ120Q'), row.get('ALQ120U'), row.get('ALQ130')
    if q == 0:
        return 'none_current'
    max_q = {1: 7, 2: 31, 3: 366}.get(unit)
    if (max_q is None or not isinstance(q, (int, float)) or not 0 < q <= max_q
            or not isinstance(drinks, (int, float)) or not 1 <= drinks <= 95 or drinks == 77):
        return None
    weekly = q * {1: 1, 2: 12 / 52, 3: 1 / 52}[unit] * drinks
    return 'up_to_7' if weekly <= 7 else 'up_to_14' if weekly <= 14 else 'over_14'


def eligibility(row):
    age, sex = row.get('RIDAGEYR'), row.get('RIAGENDR')
    if not isinstance(age, (int, float)) or not math.isfinite(age) or not 40 <= age <= 79:
        return 'outside_age'
    if sex not in (1, 2):
        return 'unknown_sex'
    preg = row.get('RIDEXPRG')
    if preg == 1 or (sex == 2 and age < 45 and preg != 2):
        return 'pregnant_or_unverified'
    for field, low, high in [('BMXHT', 100, 230), ('BMXWT', 30, 300), ('BMXWAIST', 30, 200), ('BMXBMI', 10, 100)]:
        x = row.get(field)
        if not isinstance(x, (int, float)) or not math.isfinite(x) or not low <= x <= high:
            return 'missing_or_invalid_body_measure'
    if row['BMXBMI'] >= 35:
        return 'bmi_35plus'
    # Check measurement/derived BMI consistency before trusting the join.
    if abs(row['BMXWT'] / (row['BMXHT'] / 100) ** 2 - row['BMXBMI']) > 0.2:
        raise ValueError('BMI inconsistent with height and weight')
    if ten_year_outcome(row) is None:
        return 'outcome_unavailable_or_censored'
    if not isinstance(row.get('WTMEC2YR'), (int, float)) or not math.isfinite(row['WTMEC2YR']) or row['WTMEC2YR'] <= 0:
        return 'invalid_weight'
    if smoking(row) is None or activity(row) is None or alcohol(row) is None:
        return 'missing_lifestyle'
    if any(not isinstance(row.get(k), (int, float)) or not math.isfinite(row[k]) for k in ('SDMVSTRA', 'SDMVPSU')):
        return 'missing_design'
    return None


def load_cycle(paths):
    import pandas as pd
    demo = read_xpt(paths[0])
    keys = set(indexed(demo.to_dict('records')))
    frame = demo
    for path in paths[1:]:
        records = parse_mortality(path.read_text()) if path.suffix == '.dat' else read_xpt(path).to_dict('records')
        component = indexed(records)
        if set(component) - keys:
            raise ValueError('Orphan component person')
        frame = frame.merge(pd.DataFrame(records), on='SEQN', how='left', validate='one_to_one')
    excluded, kept = Counter(), []
    for row in frame.to_dict('records'):
        reason = eligibility(row)
        if reason:
            excluded[reason] += 1
        else:
            kept.append(row)
    return kept, {'startingRows': len(demo), 'sequentialExclusions': dict(excluded), 'includedRows': len(kept),
                  'tenYearDeaths': sum(ten_year_outcome(r) for r in kept)}


def sbmi_values(rows, node):
    # Use the shipped JS, not a subtly different port of its rounding rules.
    js = "const fs=require('node:fs');const {calculate}=require('./static/js/longevity-smart-bmi.js');const data=require('./data/longevity-smart-bmi.json');process.stdout.write(JSON.stringify(JSON.parse(fs.readFileSync(0,'utf8')).map(x=>calculate(data,x))));"
    inputs = [{'age': int(r['RIDAGEYR']), 'sex': 'male' if r['RIAGENDR'] == 1 else 'female',
               'height': r['BMXHT'], 'weight': r['BMXWT']} for r in rows]
    result = json.loads(subprocess.run([node, '-e', js], cwd=ROOT, input=json.dumps(inputs), text=True,
                                      capture_output=True, check=True).stdout)
    if any(x is None for x in result):
        raise ValueError('SBMI rejected a measurement')
    return [x['sbmi'] for x in result]


def design(rows, scores, variant):
    import numpy as np
    names = ['intercept', 'age_decade_from_60', 'age_hinge_60', 'age_hinge_75', 'female',
             'smoking_former', 'smoking_current', 'activity_some', 'activity_unable',
             'alcohol_none_current', 'alcohol_up_to_7', 'alcohol_up_to_14', 'alcohol_over_14']
    if 'sbmi' in variant:
        names += ['sbmi_below_30_per_10', 'sbmi_above_39_per_10']
    if 'whtr' in variant:
        names += ['whtr_per_0_1', 'whtr_per_0_1_by_female']
    matrix = []
    for row, score in zip(rows, scores, strict=True):
        age, female = row['RIDAGEYR'], int(row['RIAGENDR'] == 2)
        vector = [1, (age - 60) / 10, max(age - 60, 0) / 10, max(age - 75, 0) / 10, female,
                  int(smoking(row) == 'former'), int(smoking(row) == 'current'),
                  int(activity(row) == 'some'), int(activity(row) == 'unable')]
        vector += [int(alcohol(row) == k) for k in ('none_current', 'up_to_7', 'up_to_14', 'over_14')]
        if 'sbmi' in variant:
            vector += [max(30 - score, 0) / 10, max(score - 39, 0) / 10]
        if 'whtr' in variant:
            waist = (row['BMXWAIST'] / row['BMXHT'] - .5) / .1
            vector += [waist, waist * female]
        matrix.append(vector)
    return np.array(matrix, dtype=float), names


def sigmoid(x):
    import numpy as np
    return np.exp(-np.logaddexp(0, -x))


def fit_logistic(x, y, weights):
    import numpy as np
    weights = weights / weights.mean()
    beta = np.zeros(x.shape[1])
    objective = lambda b: np.sum(weights * (np.logaddexp(0, x @ b) - y * (x @ b)))
    for iteration in range(100):
        p = sigmoid(x @ beta)
        hessian = x.T @ ((weights * p * (1 - p))[:, None] * x)
        step = np.linalg.solve(hessian, x.T @ (weights * (y - p)))
        scale = 1
        while objective(beta + scale * step) > objective(beta) + 1e-10:
            scale /= 2
            if scale < 1e-10:
                raise ValueError('Logistic line search failed')
        beta += scale * step
        if np.max(np.abs(scale * step)) < 1e-8:
            return beta
    raise ValueError('Logistic fit did not converge')


def weighted_auc(y, p, weights):
    import numpy as np
    order = np.argsort(p, kind='stable')
    y, p, w = y[order], p[order], weights[order]
    starts = np.r_[0, np.flatnonzero(np.diff(p)) + 1]
    positive = np.add.reduceat(w * y, starts)
    negative = np.add.reduceat(w * (1 - y), starts)
    denominator = positive.sum() * negative.sum()
    if denominator <= 0:
        raise ValueError('AUC needs both outcome classes')
    concordant = np.sum(positive * (np.cumsum(negative) - negative + .5 * negative))
    return float(concordant / denominator)


def metrics(y, p, weights):
    import numpy as np
    observed, predicted = np.average(y, weights=weights), np.average(p, weights=weights)
    z = np.log(np.clip(p, 1e-12, 1-1e-12) / np.clip(1-p, 1e-12, 1))
    calibration = fit_logistic(np.column_stack([np.ones(len(y)), z]), y, weights)
    return {'auc': weighted_auc(y, p, weights), 'brier': float(np.average((p-y)**2, weights=weights)),
            'observedTenYearRisk': float(observed), 'predictedTenYearRisk': float(predicted),
            'observedToExpected': float(observed / predicted),
            'calibrationIntercept': float(calibration[0]), 'calibrationSlope': float(calibration[1])}


def cluster_multipliers(rows, rng):
    import numpy as np
    design_keys = [(int(r['SDMVSTRA']), int(r['SDMVPSU'])) for r in rows]
    strata = {}
    for stratum, psu in design_keys:
        strata.setdefault(stratum, set()).add(psu)
    counts = {}
    for stratum, psus in strata.items():
        if len(psus) < 2:
            raise ValueError('Cannot bootstrap a stratum with only one observed PSU')
        for psu in rng.choice(sorted(psus), size=len(psus), replace=True):
            key = (stratum, int(psu))
            counts[key] = counts.get(key, 0) + 1
    return np.array([counts.get(k, 0) for k in design_keys], dtype=float)


def main():
    import numpy as np
    import pandas as pd
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--node', default='node')
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'scripts/data/nhanes-waist-files.json').read_text())
    cycles = {}
    for source in manifest['files']:
        path = args.data_dir / source['file']
        if hashlib.sha256(path.read_bytes()).hexdigest() != source['sha256']:
            raise ValueError(f'Checksum mismatch: {path.name}')
        cycles.setdefault(source['cycle'], []).append(path)
    train, train_audit = load_cycle(cycles['2001-2002'])
    validation, validation_audit = load_cycle(cycles['2003-2004'])
    if set(r['SEQN'] for r in train) & set(r['SEQN'] for r in validation):
        raise ValueError('Training/validation overlap')
    scores = [sbmi_values(rows, args.node) for rows in (train, validation)]
    ys = [np.array([ten_year_outcome(r) for r in rows], dtype=float) for rows in (train, validation)]
    ws = [np.array([r['WTMEC2YR'] for r in rows], dtype=float) for rows in (train, validation)]
    models, predictions = {}, {}
    for variant in ['controls', 'controls_sbmi', 'controls_whtr', 'controls_sbmi_whtr']:
        x, names = design(train, scores[0], variant)
        xv, _ = design(validation, scores[1], variant)
        beta = fit_logistic(x, ys[0], ws[0])
        predictions[variant] = sigmoid(xv @ beta)
        models[variant] = {'coefficients': dict(zip(names, map(float, beta))),
                           'validation': metrics(ys[1], predictions[variant], ws[1])}
    a, b = 'controls_sbmi', 'controls_sbmi_whtr'
    delta = lambda w: [weighted_auc(ys[1], predictions[b], w) - weighted_auc(ys[1], predictions[a], w),
                       float(np.average((predictions[b]-ys[1])**2 - (predictions[a]-ys[1])**2, weights=w))]
    rng = np.random.default_rng(20261106)
    samples = np.array([delta(ws[1] * cluster_multipliers(validation, rng)) for _ in range(200)])
    changes = delta(ws[1])
    report = {'version': 'waist-sbmi-ten-year-review-1', 'checkedOn': '2026-11-06',
              'productionEligible': False, 'target': 'Death within 120 months of examination, age 40-79, BMI below 35',
              'trainingCycle': '2001-2002', 'validationCycle': '2003-2004',
              'cohorts': {'training': train_audit, 'validation': validation_audit}, 'models': models,
              'addedWaistOnValidation': {'aucDifference': changes[0], 'brierDifference': changes[1],
                  'aucDifferenceConditionalBootstrap95': list(map(float, np.quantile(samples[:, 0], [.025, .975]))),
                  'brierDifferenceConditionalBootstrap95': list(map(float, np.quantile(samples[:, 1], [.025, .975]))),
                  'bootstrapReplicates': 200, 'seed': 20261106},
              'limitations': ['Exploratory US temporal evaluation, not independent Swiss validation.',
                  'Conditional validation intervals exclude training coefficient uncertainty.',
                  'No diet, disease, income, education or ethnicity adjustment; no causal interpretation.',
                  'Complete-case selection and limited follow-up horizon; no lifetime extrapolation.',
                  'Public follow-up times may be perturbed; weights are MEC weights without a mortality-linkage nonresponse correction.',
                  'No conversion to remaining life years or combination with current production coefficients.'],
              'software': {'numpy': np.__version__, 'pandas': pd.__version__,
                  'node': subprocess.check_output([args.node, '--version'], text=True).strip()},
              'sbmiInputHashes': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
                  for name in ['static/js/longevity-smart-bmi.js', 'data/longevity-smart-bmi.json']},
              'sources': manifest}
    print(json.dumps(report, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()

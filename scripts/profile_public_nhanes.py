"""Audit public NHANES overlap; no association estimates or life-year predictions.

Requires pandas to read XPT. Raw files remain outside the repository. Download the
four URLs in scripts/data/nhanes-public-files.json into --data-dir first.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOTH_COLUMNS = [f'OHD{i:02}TC' for i in range(1, 33) if i not in (1, 16, 17, 32)]


def tooth_counts(row):
    values = [row.get(key) for key in TOOTH_COLUMNS]
    if any(value not in (1, 2, 3, 4) for value in values):
        return None
    return {'permanent': values.count(2), 'primary': values.count(1),
            'implants': values.count(3), 'absent': values.count(4)}


def indexed(rows):
    result = {}
    for row in rows:
        key = row.get('SEQN')
        if key is None or not math.isfinite(float(key)) or key in result:
            raise ValueError('Missing, non-finite or duplicate person key')
        result[key] = row
    return result


def valid_mortality(row):
    return (row.get('ELIGSTAT') == 1 and row.get('MORTSTAT') in (0, 1)
            and row.get('PERMTH_EXM') is not None
            and math.isfinite(row['PERMTH_EXM']) and row['PERMTH_EXM'] > 0)


def parse_mortality(text):
    # Official R reader: SEQN 1:6, ELIGSTAT 15, MORTSTAT 16, PERMTH_EXM 46:48.
    # Death-certificate diabetes/hypertension flags are deliberately NOT imported.
    rows = []
    for line in text.splitlines():
        if len(line) < 46:
            raise ValueError('Truncated mortality record')
        row = {}
        for name, start, end in [('SEQN', 0, 6), ('ELIGSTAT', 14, 15),
                                 ('MORTSTAT', 15, 16), ('PERMTH_EXM', 45, 48)]:
            value = line[start:end].strip()
            row[name] = None if value in ('', '.') else int(value)
        rows.append(row)
    return rows


def profile(demographics, oral, balance, mortality):
    tables = [indexed(rows) for rows in (demographics, oral, balance, mortality)]
    demo, teeth, romberg, deaths = tables
    if any(set(table) - set(demo) for table in tables[1:]):
        raise ValueError('Component contains a person absent from demographics')
    counts = dict.fromkeys(['age40plus', 'oralExamCompleteOrPartial',
                            'all28ToothSlotsKnown', 'firstRombergTrialKnown',
                            'bothToothAndFirstRombergKnown', 'mortalityUsable',
                            'toothAndMortalityUsable', 'allThreeUsable',
                            'deathsAmongAllThree', 'deathsAmongToothAndMortality'], 0)
    for key, person in demo.items():
        age = person.get('RIDAGEYR')
        if age is None or not math.isfinite(age) or age < 40:
            continue
        counts['age40plus'] += 1
        oral_row = teeth.get(key, {})
        exam = oral_row.get('OHAEXSTS') in (1, 2)
        tooth = exam and tooth_counts(oral_row) is not None
        bal = romberg.get(key, {}).get('BAXPFC11') in (1, 2)
        mort_row = deaths.get(key, {})
        mort = valid_mortality(mort_row)
        dead = mort and mort_row['MORTSTAT'] == 1
        for name, condition in [('oralExamCompleteOrPartial', exam),
                               ('all28ToothSlotsKnown', tooth),
                               ('firstRombergTrialKnown', bal),
                               ('bothToothAndFirstRombergKnown', tooth and bal),
                               ('mortalityUsable', mort),
                               ('toothAndMortalityUsable', tooth and mort),
                               ('allThreeUsable', tooth and bal and mort),
                               ('deathsAmongAllThree', tooth and bal and dead),
                               ('deathsAmongToothAndMortality', tooth and dead)]:
            counts[name] += int(condition)
    return {'rowsByFile': dict(zip(['demographics', 'oral', 'balance', 'mortality'],
                                  map(len, tables))), 'unweightedCounts': counts}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, required=True)
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'scripts/data/nhanes-public-files.json').read_text())
    paths = []
    for source in manifest['files']:
        path = args.data_dir / source['file']
        if hashlib.sha256(path.read_bytes()).hexdigest() != source['sha256']:
            raise ValueError(f'Checksum mismatch: {path.name}')
        paths.append(path)
    import pandas as pd
    records = [pd.read_sas(path, format='xport').to_dict('records') for path in paths[:3]]
    records.append(parse_mortality(paths[3].read_text()))
    result = profile(*records)
    result.update({'sources': manifest, 'scope': 'Public NHANES 2001-2002; age 40+; mortality through 2019',
                   'interpretation': 'Unweighted data availability only; not population estimates or predictive validation.',
                   'balanceDefinition': 'First condition, first modified-Romberg trial only; not an overall balance classification or a one-leg test.',
                   'mortalityDefinition': 'Eligible, alive/dead status available, positive examination follow-up months. Public times may be perturbed for confidentiality.',
                   'productionEligible': False})
    print(json.dumps(result, indent=2) + '\n', end='')


if __name__ == '__main__':
    main()

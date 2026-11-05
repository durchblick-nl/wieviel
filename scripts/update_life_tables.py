"""Import a complete BFS period life table (both sexes), without extrapolation."""
import argparse
import csv
from datetime import date
import hashlib
import io
import json
import math
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ASSETS = {'male': '36837789', 'female': '36837788'}
FIELDS = {'E(X)': 'remainingYears', 'Q(X)': 'deathProbability',
          'S(X)': 'survivors', 'D(X)': 'deaths'}


def convert(raw, year):
    reader = csv.DictReader(io.StringIO(raw.decode('utf-8-sig')))
    if reader.fieldnames != ['AGE (X)', 'INDICATOR', 'PERIOD', 'VALUE']:
        raise ValueError('Unexpected BFS CSV schema')
    ages = {}
    for row in reader:
        row = {k: v.strip() for k, v in row.items()}
        if int(row['PERIOD']) != year:
            continue
        age, indicator, value = int(row['AGE (X)']), row['INDICATOR'], float(row['VALUE'])
        if indicator not in FIELDS or not math.isfinite(value) or value < 0:
            raise ValueError('Unknown indicator or invalid value')
        values = ages.setdefault(age, {})
        field = FIELDS[indicator]
        if field in values:
            raise ValueError('Duplicate age/indicator')
        values[field] = value
    # These releases publish ages 0–99; age 99 is NOT a terminal death interval.
    if set(ages) != set(range(100)):
        raise ValueError('Expected every age 0–99 for selected year')
    for age, values in ages.items():
        if set(values) != set(FIELDS.values()):
            raise ValueError(f'Incomplete indicators at age {age}')
        q, survivors, deaths = (values[k] for k in ('deathProbability', 'survivors', 'deaths'))
        if not 0 <= q <= 1 or survivors <= 0 or deaths > survivors or values['remainingYears'] <= 0:
            raise ValueError(f'Invalid life table at age {age}')
        if not survivors.is_integer() or not deaths.is_integer():
            raise ValueError('Noninteger survivor/death counts')
        if abs(survivors * q - deaths) > 1.1:
            raise ValueError(f'Deaths do not reconcile at age {age}')
        if age < 99 and abs(survivors - deaths - ages[age + 1]['survivors']) > 1:
            raise ValueError(f'Survivors do not reconcile at age {age}')
        values['survivors'], values['deaths'] = int(survivors), int(deaths)
    if ages[0]['survivors'] != 100000:
        raise ValueError('Unexpected life table radix')
    return [dict(age=age, **ages[age]) for age in range(100)]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--year', type=int, required=True)
    parser.add_argument('--male-asset', default=ASSETS['male'])
    parser.add_argument('--female-asset', default=ASSETS['female'])
    parser.add_argument('--csv-dir', type=Path, help='Offline male.csv and female.csv')
    parser.add_argument('--output', type=Path, default=ROOT / 'static/data/life-tables.json')
    args = parser.parse_args()
    if not 2013 <= args.year < date.today().year:
        parser.error('Select a completed year from 2013 onwards')
    tables, sources = {}, {}
    for sex, asset in [('male', args.male_asset), ('female', args.female_asset)]:
        if not asset.isdigit():
            parser.error('BFS asset IDs must be numeric')
        url = f'https://dam-api.bfs.admin.ch/hub/api/dam/assets/{asset}/master'
        raw = (args.csv_dir / f'{sex}.csv').read_bytes() if args.csv_dir else subprocess.run(
            ['curl', '--fail', '--silent', '--show-error', '--location', '--max-time', '45', url],
            check=True, capture_output=True).stdout
        tables[sex] = convert(raw, args.year)
        sources[sex] = {'url': url, 'pageUrl': f'https://statistik.admin.ch/fr/asset/{asset}',
                        'csvSha256': hashlib.sha256(raw).hexdigest()}
    data = {'_meta': {'schemaVersion': 1, 'year': args.year,
                     'type': 'period', 'country': 'CH', 'license': 'OPEN-BY',
                     'attribution': 'Bundesamt für Statistik / Office fédéral de la statistique',
                     'importedOn': date.today().isoformat(), 'minAge': 0, 'maxAge': 99,
                     'sources': sources,
                     'tail': 'Not extrapolated. remainingYears uses the published E(X), including its tail.'},
            'tables': tables}
    # Validate BOTH sources before replacing an existing dataset.
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=args.output.parent,
                                     delete=False) as target:
        json.dump(data, target, ensure_ascii=False, indent=2)
        target.write('\n')
        temporary = Path(target.name)
    temporary.chmod(0o644)
    temporary.replace(args.output)
    print(f'Imported BFS {args.year}: 100 ages per sex → {args.output}')


if __name__ == '__main__':
    main()

"""Extract ONLY anonymous reference table `lebenserwartung.le` from a local dump."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re


def extract(path):
    database, rows = '', []
    # Old dump includes Latin-1 text; only ASCII database/table markers and numbers are used.
    with gzip.open(path, 'rt', encoding='latin-1') as source:
        for line in source:
            match = re.match(r'-- Current Database: `([^`]+)`', line)
            if match:
                database = match[1]
            if database == 'lebenserwartung' and line.startswith('INSERT INTO `le` VALUES '):
                for record in re.findall(r'\(([^()]*)\)', line):
                    age, male, female = record.split(',')
                    rows.append({'age': int(age), 'male': float(male), 'female': float(female)})
    rows.sort(key=lambda row: row['age'])
    if len(rows) != 101 or [row['age'] for row in rows] != list(range(101)):
        raise ValueError('Expected exactly 101 unique reference ages')
    if any(not 0 < row[sex] < 120 for row in rows for sex in ('male', 'female')):
        raise ValueError('Invalid reference value')
    return {'_meta': {'source': 'Local legacy dump: lebenserwartung.le only',
                      'referencePeriod': None,
                      'note': 'Reference period unknown; backup table name is not a data date.',
                      'rowsSha256': hashlib.sha256(json.dumps(rows, sort_keys=True).encode()).hexdigest()},
            'rows': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dump', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    data = extract(args.dump)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
    print('Extracted 101 reference rows; no user logs or database credentials exported')


if __name__ == '__main__':
    main()

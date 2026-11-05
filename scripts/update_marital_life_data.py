"""Import the official BFS age-65 marital-status chart as a separate comparison."""
import csv
from datetime import date
import hashlib
import io
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://datawrapper.dwcdn.net/f538c2a666f6905e9f79b71d2a4dc630/4/dataset.csv'
PAGE = 'https://statistik.admin.ch/de/asset/36854184'
STATUSES = {'Total': 'total', 'Ledig': 'single', 'Verheiratet': 'married',
            'Verwitwet': 'widowed', 'Geschieden': 'divorced'}


def convert(raw):
    reader = csv.DictReader(io.StringIO(raw.decode('utf-8-sig')), delimiter='\t')
    if reader.fieldnames != ['État civil', 'Männer', 'Frauen', 'Groupe']:
        raise ValueError('Unexpected official chart columns')
    periods = {}
    for row in reader:
        period, status = row['Groupe'], STATUSES.get(row['État civil'])
        if period not in ('2008/2013', '2018/2023') or status is None:
            raise ValueError('Unexpected period or civil status')
        values = periods.setdefault(period, {})
        if status in values:
            raise ValueError('Duplicate chart row')
        male, female = float(row['Männer']), float(row['Frauen'])
        if not 0 < male < 50 or not 0 < female < 50:
            raise ValueError('Invalid remaining lifetime at 65')
        values[status] = {'male': male, 'female': female}
    if len(periods) != 2 or any(set(rows) != set(STATUSES.values()) for rows in periods.values()):
        raise ValueError('Incomplete marital-status comparison')
    return {'_meta': {'age': 65, 'period': '2018/2023', 'sourceUrl': PAGE,
                     'downloadUrl': URL, 'license': 'OPEN-BY',
                     'attribution': 'Bundesamt für Statistik / Office fédéral de la statistique',
                     'publishedOn': '2026-10-13', 'importedOn': date.today().isoformat(),
                     'csvSha256': hashlib.sha256(raw).hexdigest(),
                     'meaning': 'Published group comparison at age 65; not a causal marriage bonus.'},
            'periods': periods}


def main():
    raw = subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location',
                          '--max-time', '45', URL], check=True, capture_output=True).stdout
    data = convert(raw)
    target = ROOT / 'static/data/life-marital-comparison.json'
    temporary = target.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    temporary.replace(target)
    print('Imported official BFS age-65 comparison for both periods and sexes')


if __name__ == '__main__':
    main()

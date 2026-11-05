"""Import complete BFS BEVNAT years; reconcile every day against annual totals."""
import argparse
from collections import defaultdict
from datetime import date, timedelta
import hashlib
import json
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://disseminate.stats.swiss/rest/data/CH1.BEVNAT,DF_BEVNAT_EVENEMENTS_1/2.8100.0.'
NS = {'g': 'http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic'}
SOURCE = 'https://statistik.admin.ch/de/asset/36649551'


def observations(raw, frequency):
    result = {}
    for obs in ET.fromstring(raw).findall('.//g:Obs', NS):
        key = {v.attrib['id']: v.attrib['value'] for v in obs.findall('g:ObsKey/g:Value', NS)}
        if any(key.get(k) != v for k, v in {
            'BEVNAT_EVENT': '2', 'CANTON': '8100', 'LATE_REG': '0', 'FREQ': frequency
        }.items()):
            raise ValueError('Unexpected BFS series')
        stamp = key['TIME_PERIOD']
        value = float(obs.find('g:ObsValue', NS).attrib['value'])
        status = obs.find('g:Attributes/g:Value[@id="OBS_STATUS"]', NS)
        if status is None or status.attrib['value'] != 'A':
            raise ValueError(f'Non-final or missing observation: {stamp}')
        if stamp in result or not value.is_integer() or value < 0:
            raise ValueError(f'Invalid or duplicate observation: {stamp}')
        result[stamp] = int(value)
    return result


def convert(daily_raw, annual_raw, end_year):
    daily = observations(daily_raw, 'D')
    annual = observations(annual_raw, 'A')
    expected = set()
    cursor, end = date(1969, 1, 1), date(end_year, 12, 31)
    while cursor <= end:
        expected.add(cursor.isoformat())
        cursor += timedelta(days=1)
    if set(daily) != expected or set(annual) != {str(y) for y in range(1969, end_year + 1)}:
        raise ValueError('Incomplete period; existing dataset is unchanged')
    totals, days, occurrences = defaultdict(int), defaultdict(int), defaultdict(int)
    for stamp, count in daily.items():
        totals[stamp[:4]] += count
        days[stamp[5:]] += count
        occurrences[stamp[5:]] += 1
    if dict(totals) != annual or len(days) != 366:
        raise ValueError('Daily/annual reconciliation failed')
    return {
        '_meta': {
            'startYear': 1969, 'endYear': end_year, 'verifiedOn': date.today().isoformat(),
            'sourceUrl': SOURCE, 'license': 'OPEN-BY',
            'series': 'BEVNAT_EVENT=2,CANTON=8100,LATE_REG=0,FREQ=D',
            'totalBirths': sum(days.values()), 'observationCount': len(daily),
            'dailySha256': hashlib.sha256(daily_raw).hexdigest(),
            'annualSha256': hashlib.sha256(annual_raw).hexdigest(),
            'annualTotals': dict(sorted(annual.items())),
        },
        'days': {k: {'births': days[k], 'occurrences': occurrences[k]} for k in sorted(days)},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--end-year', type=int, required=True, help='Last complete, published year')
    args = parser.parse_args()
    if not 1969 <= args.end_year < date.today().year:
        parser.error('Choose a complete past year')
    payloads = []
    for freq in ['D', 'A']:
        url = f'{BASE}{freq}?startPeriod=1969&endPeriod={args.end_year}&dimensionAtObservation=AllDimensions'
        payloads.append(subprocess.run(
            ['curl', '--fail', '--silent', '--show-error', '--location', '--max-time', '90', url],
            check=True, capture_output=True).stdout)
    data = convert(*payloads, args.end_year)
    target = ROOT / 'static/data/birthdays.json'
    temporary = target.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(target)
    print(f"Imported {data['_meta']['observationCount']} days, {data['_meta']['totalBirths']} births")


if __name__ == '__main__':
    main()

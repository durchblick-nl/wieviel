import importlib.util
from datetime import date, timedelta
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('birthday_import', Path(__file__).resolve().parents[1] / 'scripts/update_birthday_data.py')
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


def xml(rows, frequency):
    namespace = importer.NS['g']
    body = ''
    for stamp, value in rows:
        key = {'TIME_PERIOD': stamp, 'BEVNAT_EVENT': '2', 'CANTON': '8100', 'LATE_REG': '0', 'FREQ': frequency}
        fields = ''.join(f'<g:Value id="{k}" value="{v}"/>' for k, v in key.items())
        body += f'<g:Obs><g:ObsKey>{fields}</g:ObsKey><g:ObsValue value="{value}"/><g:Attributes><g:Value id="OBS_STATUS" value="A"/></g:Attributes></g:Obs>'
    return f'<root xmlns:g="{namespace}">{body}</root>'.encode()


class BirthdayImportTest(unittest.TestCase):
    def fixture(self):
        # Include 1972 so the fixture has all 366 month/day combinations.
        start, end = date(1969, 1, 1), date(1972, 12, 31)
        return [((start + timedelta(days=i)).isoformat(), 200) for i in range((end - start).days + 1)]

    def convert(self, rows, annual=None):
        annual = annual or [('1969', 73000), ('1970', 73000), ('1971', 73000), ('1972', 73200)]
        return importer.convert(xml(rows, 'D'), xml(annual, 'A'), 1972)

    def test_complete_period_reconciles_and_counts_actual_leap_dates(self):
        data = self.convert(self.fixture())
        self.assertEqual(data['days']['02-29'], {'births': 200, 'occurrences': 1})
        self.assertEqual(data['days']['12-31']['occurrences'], 4)
        self.assertEqual(data['_meta']['totalBirths'], 292200)

    def test_missing_day_and_duplicate_day_are_rejected(self):
        rows = self.fixture()
        for invalid in [rows[:-1], rows + [rows[0]]]:
            with self.assertRaises(ValueError):
                self.convert(invalid)

    def test_annual_mismatch_is_rejected(self):
        rows = self.fixture()
        rows[0] = (rows[0][0], 201)
        with self.assertRaisesRegex(ValueError, 'reconciliation'):
            self.convert(rows)

    def test_missing_provisional_and_wrong_series_are_rejected(self):
        raw = xml([('1969-01-01', 200)], 'D')
        for invalid in [raw.replace(b'value="A"', b'value="P"'), raw.replace(b'id="LATE_REG" value="0"', b'id="LATE_REG" value="1"'), raw.replace(b'value="200"', b'value="NaN"')]:
            with self.assertRaises(ValueError):
                importer.observations(invalid, 'D')


if __name__ == '__main__':
    unittest.main()

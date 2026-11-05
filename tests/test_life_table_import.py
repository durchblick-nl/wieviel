"""Reject incomplete or contradictory official data before publication."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('life_import', ROOT / 'scripts/update_life_tables.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
marital_spec = importlib.util.spec_from_file_location('marital_import', ROOT / 'scripts/update_marital_life_data.py')
marital_module = importlib.util.module_from_spec(marital_spec)
marital_spec.loader.exec_module(marital_module)


class LifeImportTests(unittest.TestCase):
    def setUp(self):
        self.dataset = json.loads((ROOT / 'static/data/life-tables.json').read_text())
        self.lines = ['"AGE (X)","INDICATOR","PERIOD","VALUE"']
        for row in self.dataset['tables']['male']:
            for indicator, field in module.FIELDS.items():
                self.lines.append(f'"{row["age"]} ","{indicator} ","2025 ","{row[field]} "')

    def convert(self, lines):
        return module.convert(('\ufeff' + '\r\n'.join(lines)).encode(), 2025)

    def test_round_trip(self):
        self.assertEqual(self.convert(self.lines), self.dataset['tables']['male'])

    def test_missing_duplicate_wrong_year(self):
        for lines in [self.lines[:-1], self.lines + [self.lines[1]],
                      [line.replace('2025', '2024') for line in self.lines]]:
            with self.assertRaises(ValueError):
                self.convert(lines)

    def test_corrupt_probability_and_counts(self):
        for line in ['"0","Q(X)","2025","NaN"',
                     '"0","Q(X)","2025","1.1"',
                     '"0","Q(X)","2025","0.8"']:
            lines = self.lines.copy()
            lines[2] = line  # first age Q(X), after E(X)
            with self.assertRaises(ValueError):
                self.convert(lines)


class MaritalImportTests(unittest.TestCase):
    RAW = ('État civil\tMänner\tFrauen\tGroupe\n'
           'Total\t18.9\t22\t2008/2013\nLedig\t15.8\t20.7\t2008/2013\n'
           'Verheiratet\t19.8\t23.6\t2008/2013\nVerwitwet\t17.1\t21.4\t2008/2013\n'
           'Geschieden\t17.1\t20.8\t2008/2013\nTotal\t19.8\t22.6\t2018/2023\n'
           'Ledig\t16.4\t20.4\t2018/2023\nVerheiratet\t20.8\t24.1\t2018/2023\n'
           'Verwitwet\t18.4\t22\t2018/2023\nGeschieden\t18.2\t21.6\t2018/2023\n')

    def test_official_chart_reference(self):
        result = marital_module.convert(self.RAW.encode())
        self.assertEqual(result['periods']['2018/2023']['married'], {'male': 20.8, 'female': 24.1})
        self.assertEqual(result['_meta']['age'], 65)

    def test_reject_partial_duplicate_unknown_period_and_nan(self):
        for raw in [self.RAW.replace('Geschieden\t18.2\t21.6\t2018/2023\n', ''),
                    self.RAW + 'Ledig\t16.4\t20.4\t2018/2023\n',
                    self.RAW.replace('2018/2023', '2025'), self.RAW.replace('24.1', 'NaN')]:
            with self.assertRaises(ValueError):
                marital_module.convert(raw.encode())


if __name__ == '__main__':
    unittest.main()

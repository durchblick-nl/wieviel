"""Protect public-data cohort construction from silent recoding and join errors."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('nhanes', Path(__file__).resolve().parents[1] / 'scripts/profile_public_nhanes.py')
nhanes = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nhanes)


class NhanesFeasibilityTests(unittest.TestCase):
    def test_tooth_missing_implant_primary_and_wisdom(self):
        row = dict.fromkeys(nhanes.TOOTH_COLUMNS, 2)
        row.update(OHD01TC=4, OHD16TC=4, OHD17TC=4, OHD32TC=4)
        self.assertEqual(nhanes.tooth_counts(row)['permanent'], 28)
        row.update(OHD02TC=3, OHD03TC=1, OHD04TC=4)
        self.assertEqual(nhanes.tooth_counts(row), {'permanent': 25, 'primary': 1, 'implants': 1, 'absent': 1})
        row['OHD02TC'] = float('nan')
        self.assertIsNone(nhanes.tooth_counts(row))
        self.assertEqual(nhanes.tooth_counts(dict.fromkeys(nhanes.TOOTH_COLUMNS, 4))['permanent'], 0)

    def test_duplicate_and_orphan_person_rejected(self):
        with self.assertRaises(ValueError):
            nhanes.indexed([{'SEQN': 1}, {'SEQN': 1}])
        with self.assertRaises(ValueError):
            nhanes.profile([{'SEQN': 1}], [{'SEQN': 2}], [], [])

    def test_missing_balance_or_mortality_is_not_failure_or_alive(self):
        demo = [{'SEQN': 1, 'RIDAGEYR': 60}]
        teeth = [{'SEQN': 1, 'OHAEXSTS': 1, **dict.fromkeys(nhanes.TOOTH_COLUMNS, 2)}]
        counts = nhanes.profile(demo, teeth, [{'SEQN': 1, 'BAXPFC11': float('nan')}],
                                [{'SEQN': 1, 'ELIGSTAT': 3, 'MORTSTAT': None}])['unweightedCounts']
        self.assertEqual(counts['all28ToothSlotsKnown'], 1)
        self.assertEqual(counts['firstRombergTrialKnown'], 0)
        self.assertEqual(counts['mortalityUsable'], 0)
        for followup in [None, 0, float('nan')]:
            self.assertFalse(nhanes.valid_mortality({'ELIGSTAT': 1, 'MORTSTAT': 0, 'PERMTH_EXM': followup}))

    def test_official_fixed_width_missing_and_short_final_field(self):
        line = list(' ' * 48)
        line[0:6] = '099700'
        line[14:16] = '11'
        line[45:48] = '123'
        row = nhanes.parse_mortality(''.join(line))[0]
        self.assertEqual(row, {'SEQN': 99700, 'ELIGSTAT': 1, 'MORTSTAT': 1, 'PERMTH_EXM': 123})
        line[14:16] = '2.'
        line[45:48] = '.  '
        row = nhanes.parse_mortality(''.join(line).rstrip())[0]
        self.assertIsNone(row['MORTSTAT'])
        self.assertIsNone(row['PERMTH_EXM'])
        self.assertFalse(nhanes.valid_mortality(row))
        with self.assertRaises(ValueError):
            nhanes.parse_mortality('099700')


if __name__ == '__main__':
    unittest.main()

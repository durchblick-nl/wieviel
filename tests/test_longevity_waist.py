"""Data coding and independent arithmetic checks for the exploratory waist model."""
import importlib.util
import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import review_longevity_waist as waist


class WaistCodingTests(unittest.TestCase):
    def test_horizon_censoring_and_future_death(self):
        base = {'ELIGSTAT': 1, 'PERMTH_EXM': 120, 'MORTSTAT': 1}
        self.assertEqual(waist.ten_year_outcome(base), 1)
        self.assertEqual(waist.ten_year_outcome({**base, 'PERMTH_EXM': 121}), 0)
        self.assertEqual(waist.ten_year_outcome({**base, 'MORTSTAT': 0}), 0)
        self.assertIsNone(waist.ten_year_outcome({**base, 'MORTSTAT': 0, 'PERMTH_EXM': 119}))
        for changes in [{'ELIGSTAT': 3}, {'MORTSTAT': None}, {'PERMTH_EXM': 0}]:
            self.assertIsNone(waist.ten_year_outcome({**base, **changes}))

    def test_sas_zero_is_not_missing(self):
        self.assertEqual(waist.normalize_sas_zero(5.397605346934028e-79), 0)
        self.assertTrue(math.isnan(waist.normalize_sas_zero(float('nan'))))
        self.assertIsNone(waist.normalize_sas_zero(None))
        self.assertEqual(waist.normalize_sas_zero(0.05), .05)

    def test_skip_patterns_and_refusal_codes_do_not_become_healthy_answers(self):
        self.assertIsNone(waist.smoking({'SMQ020': 7}))
        self.assertEqual(waist.smoking({'SMQ020': 2, 'SMQ040': float('nan')}), 'never')
        self.assertEqual(waist.smoking({'SMQ020': 1, 'SMQ040': 3}), 'former')
        self.assertIsNone(waist.activity({'PAD200': 9, 'PAD320': 2}))
        self.assertEqual(waist.activity({'PAD200': 3, 'PAD320': 2}), 'unable')
        self.assertEqual(waist.alcohol({'ALD100': 2, 'ALQ110': 2}), 'low_lifetime')
        self.assertEqual(waist.alcohol({'ALQ101': 1, 'ALQ120Q': 0}), 'none_current')
        for changes in [{'ALQ120Q': 999}, {'ALQ130': 77}, {'ALQ120U': 9}, {'ALQ120Q': 8}]:
            self.assertIsNone(waist.alcohol({'ALD100': 1, 'ALQ120Q': 2, 'ALQ120U': 1, 'ALQ130': 2, **changes}))
        self.assertEqual(waist.alcohol({'ALD100': 1, 'ALQ120Q': 2, 'ALQ120U': 1, 'ALQ130': 4}), 'up_to_14')

    def test_eligibility_rejects_unverified_pregnancy_and_outside_scope(self):
        row = {'RIDAGEYR': 60, 'RIAGENDR': 2, 'BMXBMI': 25, 'BMXHT': 160, 'BMXWT': 64,
               'BMXWAIST': 90, 'ELIGSTAT': 1, 'PERMTH_EXM': 150, 'MORTSTAT': 0,
               'WTMEC2YR': 1, 'SDMVSTRA': 1, 'SDMVPSU': 1, 'SMQ020': 2,
               'PAD200': 2, 'PAD320': 2, 'ALD100': 2, 'ALQ110': 2}
        self.assertIsNone(waist.eligibility(row))
        for changes, expected in [({'RIDAGEYR': 80}, 'outside_age'),
                                  ({'RIDAGEYR': 40}, 'pregnant_or_unverified'),
                                  ({'BMXBMI': 35}, 'bmi_35plus'),
                                  ({'WTMEC2YR': 0}, 'invalid_weight')]:
            self.assertEqual(waist.eligibility({**row, **changes}), expected)
        with self.assertRaises(ValueError):
            waist.eligibility({**row, 'BMXBMI': 30})


@unittest.skipUnless(importlib.util.find_spec('numpy'), 'Research numerical checks require numpy')
class WaistArithmeticTests(unittest.TestCase):
    def test_weighted_auc_ties_and_reverse_order(self):
        import numpy as np
        y, w = np.array([0, 1, 0, 1]), np.array([1., 2., 3., 4.])
        self.assertEqual(waist.weighted_auc(y, np.array([0., 1., 0., 1.]), w), 1)
        self.assertEqual(waist.weighted_auc(y, np.array([1., 0., 1., 0.]), w), 0)
        self.assertEqual(waist.weighted_auc(y, np.ones(4), w), .5)
        # Explicit pairwise result with unequal weights and tied mixed outcomes.
        p = np.array([.1, .1, .3, .4])
        manual = sum(w[i]*w[j]*(int(p[i]>p[j])+.5*int(p[i]==p[j]))
                     for i in [1, 3] for j in [0, 2]) / 24
        self.assertAlmostEqual(waist.weighted_auc(y, p, w), manual)

    def test_newton_fit_matches_closed_form_two_group_binomial(self):
        import numpy as np
        # Group 0: one event / four; group 1: three / four. Exact logits known.
        y = np.array([0., 0., 0., 1., 0., 1., 1., 1.])
        x = np.column_stack([np.ones(8), np.repeat([0., 1.], 4)])
        beta = waist.fit_logistic(x, y, np.ones(8))
        self.assertAlmostEqual(beta[0], math.log(1/3), places=8)
        self.assertAlmostEqual(beta[1], math.log(9), places=8)
        p = waist.sigmoid(x @ beta)
        self.assertLess(float(np.max(np.abs(x.T @ (y-p)))), 1e-8)

    def test_bootstrap_keeps_psu_clusters_together(self):
        import numpy as np
        rows = [{'SDMVSTRA': 1, 'SDMVPSU': p} for p in [1, 1, 2, 2]]
        weights = waist.cluster_multipliers(rows, np.random.default_rng(4))
        self.assertEqual(weights[0], weights[1])
        self.assertEqual(weights[2], weights[3])
        self.assertEqual(weights[0] + weights[2], 2)
        with self.assertRaises(ValueError):
            waist.cluster_multipliers(rows[:2], np.random.default_rng(4))


if __name__ == '__main__':
    unittest.main()

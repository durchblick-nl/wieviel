# Interne Prüfung: Elternalter

Generiert mit `node scripts/review_longevity_parents.cjs`.

| Beispiel | Einordnung | Erweiterte Restjahre |
|---|---|---|
| Mutter lebt, 65 (Person 40) | living_parent_censored | nicht berechenbar |
| Mutter verstorben, 65 | outside_reported_linear_contrast | nicht berechenbar |
| Mutter verstorben, 80 | source_context_only | nicht berechenbar |
| Mutter verstorben, 90 | source_context_only | nicht berechenbar |
| Mutter Unfalltod, 55 | external_death_not_modelled | nicht berechenbar |
| Eltern unbekannt | unknown_parent | nicht berechenbar |

Die veröffentlichte +10-Jahre-Assoziation bleibt separat: Mutter HR 0,84 (0,79–0,89),
Vater HR 0,83 (0,78–0,89). Keine Multiplikation, keine Lebensjahresumrechnung.

[Originalquelle](https://pmc.ncbi.nlm.nih.gov/articles/PMC12159424/). Nicht im öffentlichen Rechner verwendet.

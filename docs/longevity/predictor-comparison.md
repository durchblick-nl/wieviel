# Interne Prüfung: Zähne und Einbeinstand

Generiert mit `node scripts/review_longevity_predictors.cjs`.

Bestehendes experimentelles Modell; keine neue Individualprognose. Referenzprofil: Nichtraucher,
150 mässige Bewegungsminuten/Woche, 0 intensive Minuten, Obst/Gemüse 3-mal/Tag, kein Saft,
Karotten ja, Kartoffeln 2-mal/Woche, kein Alkohol, kein Rauschtrinken, 175 cm, 75 kg.

| Alter | Geschlecht | Eigene Zähne | 10-s-Test | Bisherige Restjahre | Studien-HR Balance* | Erweiterte Restjahre |
|---|---|---|---|---:|---|---|
| 40 | male | 28 | passed | 45.36 | outside_studied_age | nicht berechenbar |
| 40 | male | 0 | failed | 45.36 | outside_studied_age | nicht berechenbar |
| 40 | male | unbekannt | not_tested | 45.36 | unknown | nicht berechenbar |
| 40 | female | 28 | passed | 47.91 | outside_studied_age | nicht berechenbar |
| 40 | female | 0 | failed | 47.91 | outside_studied_age | nicht berechenbar |
| 40 | female | unbekannt | not_tested | 47.91 | unknown | nicht berechenbar |
| 60 | male | 28 | passed | 26.58 | 1 (Studienreferenz) | nicht berechenbar |
| 60 | male | 0 | failed | 26.58 | 1.84 (1.22-2.77) | nicht berechenbar |
| 60 | male | unbekannt | not_tested | 26.58 | unknown | nicht berechenbar |
| 60 | female | 28 | passed | 28.79 | 1 (Studienreferenz) | nicht berechenbar |
| 60 | female | 0 | failed | 28.79 | 1.84 (1.22-2.77) | nicht berechenbar |
| 60 | female | unbekannt | not_tested | 28.79 | unknown | nicht berechenbar |
| 80 | male | 28 | passed | 10.63 | outside_studied_age | nicht berechenbar |
| 80 | male | 0 | failed | 10.63 | outside_studied_age | nicht berechenbar |
| 80 | male | unbekannt | not_tested | 10.63 | unknown | nicht berechenbar |
| 80 | female | 28 | passed | 11.71 | outside_studied_age | nicht berechenbar |
| 80 | female | 0 | failed | 11.71 | outside_studied_age | nicht berechenbar |
| 80 | female | unbekannt | not_tested | 11.71 | unknown | nicht berechenbar |

*Nur Kontrast in der Originalkohorte, kein Faktor für die bestehende Jahreszahl.
Zahnzahl unbekannt ist nicht null Zähne; ein nicht durchgeführter Test ist kein Nichtbestehen.
Fehlende neue Jahreszahlen sind nicht als null Jahre oder als unveränderte Prognose zu interpretieren.

## Offene Voraussetzungen

- teeth_primary_model_methods_and_tooth_loss_definition_unverified
- no_verified_joint_teeth_balance_lifestyle_fit
- no_verified_joint_reference_distribution
- no_swiss_calibration_or_external_validation_for_extension
- balance_follow_up_does_not_establish_lifetime_effect
- study_protocol_not_validated_as_unsupervised_home_test

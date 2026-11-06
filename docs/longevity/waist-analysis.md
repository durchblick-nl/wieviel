# Ergebnis: gemeinsame SBMI-/Taillenprüfung

6. November 2026. **Die untersuchte Ergänzung verbessert die Vorhersage im zeitlich getrennten Prüfsatz nicht. Keine Freigabe für den öffentlichen Rechner.**

Schätzung: 2'128 vollständige Fälle aus NHANES 2001–2002, 300 Todesfälle innerhalb von zehn Jahren.
Prüfung: 2'016 andere Personen aus 2003–2004, 315 Todesfälle. Alter 40–79 und BMI unter 35.
Die Fall-/Ereigniszahlen sind ungewichtet; die folgenden Kennzahlen verwenden Untersuchungsgewichte.

| Modell | AUC, höher besser | Brier-Fehler, niedriger besser | Vorhergesagtes Zehnjahresrisiko |
|---|---:|---:|---:|
| Kontrollen | 0.8270 | 0.07847 | 12.19 % |
| Kontrollen + SBMI | 0.8287 | 0.07817 | 12.13 % |
| Kontrollen + Taille/Grösse | 0.8205 | 0.07947 | 12.29 % |
| Kontrollen + SBMI + Taille/Grösse | 0.8203 | 0.07956 | 12.23 % |

Das gewichtete beobachtete Zehnjahresrisiko beträgt 10,45 %. Alle Modelle überschätzen es in diesem Prüfsatz.

Durch die zusätzliche Taille gegenüber SBMI: AUC-Differenz -0.0084 (bedingtes 95-%-Bootstrapintervall -0.0137 bis -0.0044); Brier-Differenz 0.00139 (0.00092 bis 0.00206). Beide Änderungen weisen hier auf schlechtere Vorhersage hin.

Die Intervalle berücksichtigen nur die Unsicherheit der Prüfdaten bei festgehaltenen Trainingskoeffizienten. Es sind keine vollständigen Konfidenzintervalle für die gesamte Entwicklung des Modells.

## Bedeutung für die Umsetzung

Dies widerlegt weder die publizierten Zusammenhänge des Bauchumfangs noch seinen klinischen Nutzen. Es zeigt, dass dieses kleine, vorab festgelegte Modell keine tragfähige Ergänzung unseres Rechners liefert. Insbesondere werden inverse oder instabile Körpermass-Koeffizienten nicht als gesundheitlicher Vorteil ausgegeben.

Die Analyse passt keine Formel an, um einen gewünschten Vorteil zu erzeugen. Sie liefert keine Lebensjahreskorrektur. Es fehlen unter anderem Ernährungs-/Erkrankungsadjustierung, Schweizer Kalibrierung, langfristige Altersverläufe sowie eine Prüfung der Übertragbarkeit auf Selbstmessungen.

## Reproduktion und Quellen

[Vorab festgelegte Methode und Grenzen](waist-analysis-plan.md). [Aggregierte Ergebnisse samt Koeffizienten und Quellenmanifest](waist-analysis.json). Keine individuellen Datensätze im Repository.

```sh
python3 -m venv /tmp/wieviel-research-env
/tmp/wieviel-research-env/bin/pip install -r scripts/requirements-longevity-research.txt
# Die zwölf öffentlichen Dateien aus scripts/data/nhanes-waist-files.json herunterladen.
/tmp/wieviel-research-env/bin/python scripts/review_longevity_waist.py --data-dir /tmp/wieviel-nhanes-public --node /absolute/path/to/node
/tmp/wieviel-research-env/bin/python -m unittest discover -s tests -p test_longevity_waist.py
```

Öffentliche Daten bis zum Mortalitätsstand 2019, keine restriktiven Zugänge. Die SHA-256-Prüfung erfolgt vor jeder Datenlesung; SBMI wird mit der vorhandenen JavaScript-Implementierung berechnet. Softwareversionen und SBMI-Eingangsdateien sind im Bericht dokumentiert.

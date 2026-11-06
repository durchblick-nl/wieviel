# Gemeinsame Prüfung von Smart BMI und Taille

Festgelegt vor der ersten Schätzung am 6. November 2026. Ausschliesslich öffentliche
NHANES-Dateien; Rohdaten bleiben ausserhalb des Repositorys.

## Frage und vorab festgelegte Auswertung

Verbessert das Taille-Grösse-Verhältnis (WHtR) eine Prognose zusätzlich zum Smart BMI?
Vier logistische Modelle werden auf **identischen vollständigen Fällen** geschätzt:
Kontrollvariablen; Kontrollen + SBMI; Kontrollen + WHtR; Kontrollen + beide.
Die Daten von 2001–2002 dienen der Schätzung, 2003–2004 bleiben bis zur Auswertung
unabhängige zeitliche Prüfdaten. Keine Auswahl des besten Modells auf den Prüfdaten.

- Population: Erwachsene 40–79, gemessener BMI unter 35, keine dokumentierte
  Schwangerschaft. Fehlende Schwangerschaftsangabe bei Frauen unter 45 ausschliessen.
  Keine Aussage für 20-Jährige, über 79-Jährige, BMI ab 35 oder Schwangerschaft.
- Ziel: Tod innerhalb von 120 Monaten nach Untersuchung. Verstorben nach 120 Monaten
  zählt als Überleben bis zum Horizont; früher ohne Todesereignis zensierte Fälle
  werden ausgeschlossen. Tod genau im Monat 120 zählt als Ereignis.
- Nur vor Beginn der Nachbeobachtung erhobene Merkmale; keine Diagnosen aus der
  Todesbescheinigung. Veröffentlichte Zeiten können zum Datenschutz verändert sein.
- Kontrollen: Alter als lineare Segmente mit festen Knoten 60/75, Geschlecht,
  Rauchen (nie/früher/aktuell), Freizeitaktivität (keine/etwas/nicht möglich),
  Alkohol (unter 12 Getränke lebenslang/kein aktueller Konsum/aktuell bis 7,
  bis 14 oder über 14 US-Standardgetränke pro Woche).
- Ernährung, Erkrankungen, Einkommen, Bildung und ethnische Zugehörigkeit werden
  **nicht** adjustiert. Kein vollständiges MPoRT und keine kausale Effektschätzung.
- SBMI: vorhandene Original-JavaScript-Berechnung mit denselben Rundungen;
  zwei feste Terme, Abstand unter 30 und über 39, je zehn Punkte.
- WHtR: `(Taille_cm / Grösse_cm − 0.5) / 0.1`, plus Interaktion mit Geschlecht.
  Kein aus einem Einzelwert erfundener Lebensjahresabzug und kein BMI-Bonus.
- Schätzung mit Untersuchungsgewichten WTMEC2YR; keine automatische Variableauswahl,
  keine nachträgliche Wahl der Altersgrenzen oder Schwellen anhand der Ergebnisse.
- Prüfung: gewichtete AUC, Brier-Fehler, beobachtetes und vorhergesagtes
  Zehnjahresrisiko, Kalibrierung auf Prüfdaten. Positive AUC-Differenz und negative
  Brier-Differenz sprechen für bessere Vorhersage, beweisen aber keinen Nutzen.
- Unsicherheit der gepaarten Prüfdaten-Differenzen: 200 Wiederholungen eines
  innerhalb der veröffentlichten Schichten gezogenen PSU-Cluster-Bootstraps,
  fester Seed. Die Intervalle konditionieren auf das geschätzte Modell;
  Schätzunsicherheit der Trainingskoeffizienten ist darin nicht enthalten.

## Freigabegrenze

Diese Auswertung ist ein explorativer Vergleich einer festen Zehnjahresprognose,
keine unabhängige Schweizer Validierung und keine Berechnung mittlerer Restlebensjahre.
Sie wird nicht mit den MPoRT- oder experimentellen SBMI-Gewichten multipliziert.
Es gibt keine individuelle Rechenfunktion im öffentlichen Frontend. Vor einer
Integration wären Altersverlauf, Ernährung/Erkrankungen, Referenzverteilung,
Schweizer Kalibrierung sowie externer Prognosenutzen zu klären.

## Quellen

- [NHANES Körpermasse 2001–2002](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2001/DataFiles/BMX_B.htm),
  entsprechende DEMO-, SMQ-, PAQ- und ALQ-Dateien für 2001 und 2003; genaue URLs
  und SHA-256 in `scripts/data/nhanes-waist-files.json`.
- [Öffentliche Mortalitätsverknüpfung](https://www.cdc.gov/nchs/linked-data/mortality-files/),
  Follow-up 2019; Spalten gemäss offiziellem R-Reader im bestehenden Datenmanifest.
- [NICE NG246](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity):
  WHtR als Ergänzung zum BMI, Anwendung unter BMI 35.
- [Smart-BMI-Provenienz](../../data/longevity-smart-bmi.json).


## Korrektur der technischen Datenlesung vor der ersten erfolgreichen Schätzung

Die SAS-XPORT-Lesung mit pandas lieferte für kodierte Nullwerte teilweise ungefähr
5,4e-79. Das machte die Kategorie «kein aktueller Alkoholkonsum» fälschlich leer und
die erste Schätzung brach wegen einer singulären Matrix ab. Die Lesung normalisiert
nun endliche Beträge unter 1e-30 auf null; echte fehlende Werte bleiben fehlend.
Für die verwendeten Mess-/Fragebogenfelder gibt es keine sinnvollen Messungen dieser
Grössenordnung. Dies ändert keine inhaltliche Schwelle oder Modellauswahl. Ein
Regressionstest sichert ausdrücklich null gegen fehlend ab.

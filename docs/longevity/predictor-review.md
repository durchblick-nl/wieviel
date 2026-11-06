# Modellprüfung: Zähne und Einbeinstand

Stand: 6. November 2026. Status: **nicht für die öffentliche Jahresrechnung geeignet**.
Die Prüfung ist umgesetzt; die gemeinsame Modellschätzung und Validierung sind offen.
Das Zahnformular ohne Rechenwirkung wurde mit `3a34e54` entfernt.

## Nachvollziehbare Ergebnisse

`node scripts/review_longevity_predictors.cjs` erzeugt
[die interne Vergleichstabelle](predictor-comparison.md). `--json` liefert dieselben
Prüfergebnisse strukturiert. Das bestehende Modell wird tatsächlich ausgeführt.
Erweiterte Restjahre bleiben `null`, solange keine geeignete gemeinsame Rechnung
vorliegt. Das bedeutet nicht null Lebensjahre und nicht eine bestätigte Nullwirkung.

Quellen, Zahlen, Definitionen und offene Voraussetzungen stehen in
`scripts/data/longevity-predictor-evidence.json`. Diese Forschungsdatei liegt bewusst
ausserhalb von Hugo-Daten, Templates und öffentlich ausgeliefertem JavaScript.

### Zahnstatus

Zhou et al., 2026, DOI [10.1093/aje/kwag109](https://doi.org/10.1093/aje/kwag109).
Der Haupttext ist zugangsbeschränkt. Browser Use konnte den öffentlich verlinkten
Anhang lesen; ein lokaler Download scheiterte mit HTTP 403. Es liegt kein lokal
unabhängig überprüftes Exemplar des Anhangs vor.

Tabelle S1 enthält eine Sensitivitätsanalyse mit zusätzlicher Zuckeradjustierung:

| Fehlende Zähne | Adjustierte Hazard Ratio | 95-%-Intervall |
|---|---:|---|
| 0–1 | 1,00 | Referenz |
| 2–6 | 1,25 | 1,07–1,45 |
| 7–14 | 1,53 | 1,29–1,82 |
| 15–21 | 1,79 | 1,47–2,18 |
| 22–28 | 1,90 | 1,58–2,28 |

Diese Werte sind **nicht** als verifizierte Hauptmodellkoeffizienten erfasst.
Die Kategorien beruhen auf Zahnverlust, während das entfernte Formular vorhandene
eigene Zähne abfragte. Die Gleichsetzung `fehlend = 28 − vorhanden` bleibt gesperrt,
bis die Behandlung von Nichtanlagen, kieferorthopädischen Extraktionen, Implantaten
und Weisheitszähnen im Erhebungsverfahren geklärt ist. Tabellenwerte allein liefern
weder die absolute Ausgangskurve noch die vollständige Lebenstafelmethode.

### Einbeinstand

Araujo et al., 2022, DOI [10.1136/bjsports-2021-105360](https://doi.org/10.1136/bjsports-2021-105360).
Der lokale Volltext wurde extrahiert und die Tabelle 2 visuell geprüft. Der SHA-256
steht im Quellenregister; das geschützte Manuskript wird nicht im Repository verteilt.
Modell 3 berichtet HR 1,84 mit Intervall 1,22–2,77 und p=0,003. Die abweichenden
Abstractangaben (1,23–2,78; p<0,001) bleiben ausdrücklich dokumentiert.

Altersbereich 51–75, selbstständig gehfähige Personen; ungetestet und unsicher sind
keine negativen Testergebnisse. Rauchen, Aktivität, Ernährung und relevante
Medikation fehlen in der Adjustierung. Ein Studienkontrast darf deshalb nicht
ungeprüft mit unseren Lebensstilkoeffizienten kombiniert oder lebenslang fortgesetzt
werden. Die Tests sperren andere Altersbereiche und abweichende Protokolle.

## Gemeinsame Daten: geprüfte Wege

| Quelle | Prüfung | Ergebnis für unser Vorhaben |
|---|---|---|
| [NHANES 2001–2002](https://wwwn.cdc.gov/nchs/nhanes/search/datapage.aspx?Component=Examination&Cycle=2001-2002) | OHXDEN_B und BAX_B, Personen-ID SEQN | Zähne und Balance vorhanden, aber anderer Test |
| [NHANES-Balanceprotokoll](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2001/DataFiles/BAX_B.htm) | Modifizierter Romberg, beide Füsse | Keine Gleichsetzung mit dem 10-s-Einbeinstand |
| [ELSA-Nurse-Guide](https://www.ucl.ac.uk/population-health-sciences/sites/population_health_sciences/files/5050_elsa_waves_2-4-6-8-9_nurse_data_user_guide.pdf) | Abschnitte 4.6–4.7 | Einbeinstand 30 s, nur berechtigte Personen bis 69; anderes Protokoll |
| [ELSA-Zugang](https://www.elsa-project.ac.uk/accessing-elsa-data) | UKDS-Lizenz und verknüpfte Mortalitätsdaten | UKDS-Zugang benötigt; verknüpfte Mortalität zusätzlich eingeschränkt |
| CLINIMEX-Originalstudie | Datenverfügbarkeitserklärung | Individualdaten nur auf begründete Anfrage; Zahnstatus nicht belegt |

Auf Wunsch ausschliesslich öffentliche Quellen: Die vier anonymisierten öffentlichen
NHANES-Dateien (Demografie, Zahnstatus, Romberg und Mortalität bis 2019) wurden
heruntergeladen, mit SHA-256 geprüft und über eindeutige SEQN verknüpft.
Der [reproduzierbare Prüfbericht](nhanes-public-feasibility.json) enthält nur
aggregierte, **ungewichtete Verfügbarkeitszahlen**, keine individuellen Datensätze.
Die Rohdateien bleiben ausserhalb des Repositorys.

Von 3'486 Personen ab 40 haben 2'942 vollständig bekannte Zahnpositionen ohne
Weisheitszähne. Bei 2'939 sind zusätzlich Mortalitätsstatus und positive
Nachbeobachtungszeit ab Untersuchung verfügbar (1'190 Todesfälle). Mit bekanntem
erstem Romberg-Versuch verbleiben 2'461 Personen (921 Todesfälle). Das sind noch
keine nach Lebensstilvariablen bereinigten Modellstichproben und keine Nachweise
zusätzlichen Prognosenutzens. Der erste Romberg-Versuch wird nur zur Abdeckung
gezählt; er ist weder ein Gesamt-Balanceergebnis noch ein Einbeinstand.

Reproduktion mit Python und pandas, nach Download der vier im Manifest genannten
Dateien in ein Verzeichnis ausserhalb des Repositorys:

```sh
python3 scripts/profile_public_nhanes.py --data-dir /tmp/wieviel-nhanes-public
python3 -m unittest discover -s tests -p 'test_nhanes_feasibility.py'
```

Fehlende Zahnpositionen liefern keinen Zahnzählwert; Implantate, bleibende und
Milchzähne werden getrennt gezählt. Fehlende Versuche werden nicht als Scheitern
interpretiert. Die Mortalitätsdatei enthält Todesbescheinigungsmerkmale für Diabetes
und Hypertonie: Diese sind ausdrücklich **keine Ausgangsdiagnosen** und werden
nicht importiert. Öffentliche Nachbeobachtungszeiten können zum Datenschutz
verändert sein; dies muss eine spätere Analyse berücksichtigen.
Stichprobendesign, Gewichte (einschliesslich Balance-Teilgewichten), weitere
Ausgangsvariablen und Auswahlverzerrung sind vor einer Modellschätzung zu prüfen.

Ein passender gemeinsamer Datensatz für den **10-Sekunden-Einbeinstand** ist weiterhin
nicht nachgewiesen. Bei ELSA sind zusätzlich Zahnvariablen,
Erhebungszeitpunkte, Endpunktabdeckung und Protokollübertragbarkeit zu klären.
Keine synthetische Verbindung nicht identischer Personen aus verschiedenen Kohorten.

## Konkrete Fortsetzung mit öffentlichen Quellen

1. Haupttext und Anhang der Zahn-Studie unabhängig prüfen; Definition und Modell
   dokumentieren. Vorbereitete Anfragen bleiben gemäss Nutzerwunsch zurückgestellt.
2. Den öffentlichen NHANES-Weg zunächst für Zahnstatus weiter prüfen; passende
   Lebensstilvariablen und weitere Zyklen dokumentieren. ELSA-Zugang und
   Autorenanfragen sind zurückgestellt. Romberg nicht als Einbeinstand einsetzen.
3. Vor Berechnung ein gemeinsames Ausgangsdatum, Altersintervall und Studienprotokoll
   festlegen. Nur Angaben vor Beginn der Nachbeobachtung verwenden. Nichtteilnahme,
   Ausschluss und Messfehler getrennt von einem negativen Ergebnis halten.
4. Personen-ID-Eindeutigkeit, Wellenverknüpfung, Stichprobengewichte, fehlende Angaben,
   Todesdatum/Zensierung und Ereigniszahl pro Modellkomplexität prüfen.
5. Auf denselben Personen Basismodell, plus Zähne, plus Balance, plus beide schätzen.
   Keine separaten Studien-HRs multiplizieren. Altersabhängigkeit, Interaktionen und
   Proportional-Hazards-Annahme prüfen; Modellkomplexität nach vorhandenen Ereignissen
   begrenzen. Fehlende Variablen nicht durch erfundene Werte ersetzen.
6. Kalibrierung und zusätzlichen Prognosenutzen auf zurückgehaltenen Daten bewerten,
   Unsicherheit und Auswahlverzerrung berichten. Nicht nur statistische Signifikanz
   eines Koeffizienten prüfen. Gemeinsame Expositionsverteilung zur BFS-Verankerung
   bestimmen; externe Schweizer Übertragbarkeit gesondert prüfen.
7. Erst nach tragfähigem Ergebnis eine vollständige interne Vergleichsrechnung mit
   neuen Restjahren erstellen und David die Gleichungen, Beispiele und Grenzen vorlegen.
   Die fachliche Prüfung ersetzt keine statistische Validierung. Anschliessend nur
   tatsächlich verwendete Fragen synchron auf DE/FR veröffentlichen.

## Nicht umgesetzt

Keine neue öffentliche Zahn-/Balancefrage, keine Lebensjahreskorrektur, keine
biologische Alterszahl und kein Trainingsbonus. Keine Autorenmail wurde versandt,
kein Zugang beantragt und kein Artikel gekauft. Die Entwürfe bleiben zurückgestellt; es werden zunächst nur öffentliche Quellen genutzt.

## Verifikation

- `node --test tests/*.test.js`: Kandidatenstatus, Grenzalter, unbekannt versus null,
  unsicher versus fehlgeschlagen, Protokollunterschiede und Sperre kombinierter Werte.
- `node --test --test-name-pattern='DE/FR longevity' tests/browser.cjs`: keine
  Forschungsfragen öffentlich; bestehender Rechner und Tastaturkorrektur funktionieren.
- Hugo-Produktionsbuild: erfolgreich. Keine Forschungsdatei wird im Frontend geladen.

- Öffentliche Datenprüfung: vier Python-Tests für Fehlwerte, Zahnkodierung,
  Personenverknüpfung und feste Mortalitätsspalten; Rohdaten-Prüfsummen vor Import.

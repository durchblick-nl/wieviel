# Wartungsplan wieviel.ch / calcule.ch

Dieser Plan dokumentiert alle Datenquellen und wann sie aktualisiert werden müssen.

**Letzte Aktualisierung:** 8. Oktober 2026

---


## Sichtbarer Datenstand auf allen Rechnern

`data/calculatorStatus.json` enthält pro Hugo-Rechnertyp Hinweise, redaktionellen Stand, nächsten Prüftermin und Quellenlinks in DE/FR. Gemeinsame Angaben werden mit `use` referenziert (z.B. `parttime` → `salary`). `page-header.html` rendert die Datenbox vor den Eingaben. `calculator-status.html` leitet LIK-Monat, Index, Basis und Prüftag aus `lik_index.json`, den Bankdatenstand aus `bank_master.json._meta.validOn` und Tarifjahre/Prüftag aus `site.yaml.electricity` ab. Diese Angaben nicht zusätzlich als Freitext pflegen. Fehlende Statusangaben stoppen den Hugo-Build.

- Ein neuer Build aktualisiert diese Daten nicht automatisch.
- `reviewed` ist der redaktionelle Bearbeitungstag, keine Garantie für eine Vollprüfung sämtlicher Rechts- oder Gesundheitshinweise.
- Nur ausdrücklich mit einer Quelle abgeglichene Zahlen als «abgeglichen» oder «bestätigt» kennzeichnen.
- Tarifjahr, Datenmonat und Publikationsdatum nicht mit dem Prüftag verwechseln.
- Bei Modellrechnern und Marktpreisannahmen ausdrücklich Richtwerte nennen; keine angeblich tagesaktuellen Marktpreise ausweisen.
- Neue Rechner benötigen einen eigenen Eintrag. Beide Sprachseiten müssen genau eine sichtbare Datenbox erhalten.

## Datenabgleich vom 16. September 2026, aktualisiert am 8. Oktober 2026

| Bereich | Ergebnis und Quelle |
|---|---|
| Strom | ElCom-Median H4: 2026 **27,7**, 2027 **26,5 Rp./kWh**. Veröffentlichungen [2026](https://www.elcom.admin.ch/de/newnsb/8nuE_fvwnfqCu8OHNOwKu) / [2027](https://www.elcom.admin.ch/de/newnsb/1miE201yRzoA). LINDAS bestätigt beide Jahre: 2’294 / 2’268 Beobachtungen, Min/Max 9,643–43,613 / 10,559–45,883. Min/Max sind Einzelbeobachtungen, keine Gemeinde-Mediane. |
| Miete | [BWO](https://www.bwo.admin.ch/de/referenzzinssatz): weiterhin 1,25 %, gültig ab 02.09.2026. |
| LIK | [BFS-Originaltabelle](https://www.bfs.admin.ch/bfsstatic/dam/assets/orderNr:cc-d-05.02.08/master), Blatt `Index_m`, Basis Dezember 2020 (Spalte L): September 2026 **108,5**. Keine Mischung mit der neuen Basis Dezember 2025. Nächste Publikation: 03.11.2026. |
| Banken | SIX JSON, `validOn=2026-10-08`, 1’164 Einträge; gegenüber 16.09.2026 genau vier geänderte IIDs (08571, 30231, 08827, 30299). IID-Nachfolgeverweise nach Fusionen werden vor der Ausgabe auf die aktuelle Bank aufgelöst. |
| Sozialversicherung | [AHV-Beiträge](https://www.ahv-iv.ch/p/2.01.d), [ALV](https://www.ahv-iv.ch/p/2.08.d), [BSV-Masszahlen 2026](https://www.bsv.admin.ch/dam/de/sd-web/3jZGqTLgADbl/BPP_Zahlen_85_2026.pdf): 2026er AHV/ALV/BVG/3a-Rechenwerte bleiben aktiv. [13. AHV-Altersrente](https://www.bsv.admin.ch/de/umsetzung-13-ahv-rente) gilt bereits ab 2026; [beschlossene Grenzwerte 2027](https://www.admin.ch/de/newnsb/BqB41FVYi5FB) werden vorab nur erläutert. Der Teilzeitrechner berechnet keine individuelle AHV-Renteneinbusse, weil die nötigen Angaben fehlen. |
| EO | [Mutterschaft](https://www.ahv-iv.ch/p/6.02.d), [anderer Elternteil](https://www.ahv-iv.ch/p/6.04.d): 80 %, maximal CHF 220/Tag bestätigt. |
| Familienzulagen | [BSV](https://www.bsv.admin.ch/de/familienzulagen-leistungen-und-voraussetzungen): allgemeine Mindestwerte auf CHF 215/268 korrigiert; Alimenterechner hatte bereits CHF 215. |
| MWST | [ESTV](https://www.estv.admin.ch/estv/de/home/mehrwertsteuer.html): 8,1 / 2,6 / 3,8 % bestätigt. |
| Fleisch | [Proviande](https://www.proviande.ch/de/der-fleischmarkt-in-zahlen), Angebot pro Person 2025: Schwein 19,3731, Geflügel 16,5384, Rind 11,5469 kg/Jahr. Wochenvorgaben gerundet: 373 / 318 / 222 g. Angebot ausdrücklich vom Verzehr unterschieden. |
| Rauchen | [BFS, SGB 2022](https://dam-api.bfs.admin.ch/hub/api/dam/assets/32028271/master): 24 % der Bevölkerung ab 15 Jahren, nicht 27 %. Preisbeispiele bleiben editierbare Budgetannahmen. |
| Ferien | [SECO Militärdienst-Merkblatt](https://www.seco.admin.ch/dam/de/sd-web/TejaFZhsBOpW/Merkblatt_Arbeitsverhaeltnis_Militaer_SECO_2022_DE.pdf), Abschnitt 6: ein Schonmonat für obligatorischen Militär-/Zivil-/Schutzdienst; ab zwei vollen Monaten 1/12 Kürzung. Fehler in Logik und DE/FR-Texten behoben. |
| Promille | Pauschale «mindestens zwei Jahre Entzug ab 1,6 ‰» entfernt: Schwelle für Fahreignungsabklärung, keine fixe Entzugsdauer. [ASTRA-Leitfaden](https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/mobilitaet/fuehrerausweis-fahren-lernen/ASTRA_Leitfaden_Fahreignung.pdf). |

## Übersicht Datenquellen

| Datenquelle | Typ | Datei/API | Frequenz |
|-------------|-----|-----------|----------|
| Sozialversicherungen (AHV/BVG/3a) | Manuell | `data/site.yaml` | Jährlich |
| MWST-Sätze | Manuell | `data/site.yaml` | Bei Änderung |
| Referenzzinssatz | Manuell | `data/site.yaml` | Quartalsweise |
| Strompreise | Live-API | ElCom SPARQL | Jährlich |
| Bankdaten (IBAN) | Manuell | `static/data/bank_master.json` | Bei Bedarf |
| LIK (Kaufkraft) | Manuell | `static/data/lik_index.json` | Monatlich |
| Kinderunterhalt (Grundbeträge/Zulagen/Rechtsprechung) | Manuell | `data/site.yaml`, Rechnerlogik | Jährlich und bei Änderungen |

---

## 1. Sozialversicherungen (BSV)

**Quelle:** [Bundesamt für Sozialversicherungen](https://www.bsv.admin.ch)

**Publikation:** Jährlich im Herbst (Oktober/November) für das Folgejahr

### Zu prüfende Werte

| Parameter | Datei | Pfad |
|-----------|-------|------|
| AHV-Beitragssatz | `data/site.yaml` | `socialInsurance.ahvRate` |
| ALV-Beitragssatz | `data/site.yaml` | `socialInsurance.alvRate` |
| ALV-Höchstlohn | `data/site.yaml` | `socialInsurance.alvMaxSalary` |
| BVG-Koordinationsabzug | `data/site.yaml` | `bvg.coordinationDeduction` |
| BVG-Eintrittsschwelle | `data/site.yaml` | `bvg.entryThreshold` |
| BVG-Mindestzins | `data/site.yaml` | `bvg.minimumInterestRate` |
| Säule 3a Maximum (mit PK) | `data/site.yaml` | `pillar3a.maxWithPensionFund` |
| Säule 3a Maximum (ohne PK) | `data/site.yaml` | `pillar3a.maxWithoutPensionFund` |
| EOG-Tagessatz Maximum | `data/site.yaml` | `parentalLeave.maxDailyRate` |

### Hilfreiche Links

- [Penso Änderungen](https://www.penso.ch/rubriken/sozialversicherungen/)
- [AHV/IV Merkblätter](https://www.ahv-iv.ch/de/Merkbl%C3%A4tter)

---

## 2. MWST-Sätze (ESTV)

**Quelle:** [Eidgenössische Steuerverwaltung](https://www.estv.admin.ch/estv/de/home/mehrwertsteuer.html)

**Publikation:** Bei Gesetzesänderung (selten, zuletzt 2024)

### Zu prüfende Werte

| Parameter | Datei | Pfad |
|-----------|-------|------|
| Normalsatz | `data/site.yaml` | `vat.normal` |
| Reduzierter Satz | `data/site.yaml` | `vat.reduced` |
| Sondersatz (Hotel) | `data/site.yaml` | `vat.accommodation` |

### Hinweis

Angekündigte Änderungen erst nach Bestätigung von Satz und Inkrafttreten übernehmen. Die geltenden Sätze sind bei der ESTV zu prüfen.

---

## 3. Referenzzinssatz (BWO)

**Quelle:** [Bundesamt für Wohnungswesen](https://www.bwo.admin.ch/de/referenzzinssatz)

**Publikation:** Quartalsweise. 2026: 2. März, 1. Juni, 1. September, 1. Dezember. Wirksamkeit separat prüfen (zuletzt 2. September).

### Zu prüfende Werte

| Parameter | Datei | Pfad |
|-----------|-------|------|
| Referenzzinssatz | `data/site.yaml` | `referenceRate` |
| Datum DE | `data/site.yaml` | `referenceRateDate` |
| Datum FR | `data/site.yaml` | `referenceRateDateFr` |

---

## 4. Strompreise (ElCom)

**Quelle:** [ElCom Strompreise](https://www.strompreis.elcom.admin.ch/)

**API:** SPARQL-Endpoint `https://lindas.admin.ch/query`

**Publikation:** Jährlich im September für das Folgejahr

### Zu aktualisierende Stellen

| Was | Datei | Zeile/Pfad |
|-----|-------|------------|
| Verfügbare Tarifjahre | `data/site.yaml` | `electricity.tariffs` (Auswahl und Abfrage werden daraus erzeugt) |
| Median-Preis | `data/site.yaml` | `electricity.tariffs.YYYY.medianPrice` |
| Min-Preis | `data/site.yaml` | `electricity.tariffs.YYYY.minPrice` |
| Max-Preis | `data/site.yaml` | `electricity.tariffs.YYYY.maxPrice` |
| Publikation und Quelle | `data/site.yaml` | `electricity.tariffs.YYYY.publishedOn`, `.source` |
| Datenstand DE/FR | `data/calculatorStatus.json` | `electricity` |
| Standardjahr | `data/site.yaml` | `electricity.defaultYear` (laufendes Jahr) |

### API-Dokumentation

```sparql
PREFIX elcom: <https://energy.ld.admin.ch/elcom/electricityprice/dimension/>
SELECT ?municipalityName ?total WHERE {
  ?obs elcom:period "2026"^^<http://www.w3.org/2001/XMLSchema#gYear> .
  ?obs elcom:category <https://energy.ld.admin.ch/elcom/electricityprice/category/H4> .
  ?obs elcom:product <https://energy.ld.admin.ch/elcom/electricityprice/product/standard> .
}
```

---

## 5. Bankdaten (SIX)

**Quelle:** [SIX Bank Master](https://www.six-group.com/en/products-services/banking-services/interbank-clearing/online-services/download-bank-master.html)

**API:** `https://api.six-group.com/api/epcd/bankmaster/v3/bankmaster.json`

**Publikation:** Täglich aktualisiert (Update bei Bedarf, z.B. bei Bankfusionen)

### Update-Befehl

```bash
python3 scripts/update_bank_data.py
```

Der Import benötigt Python 3 und curl, keine zusätzlichen Python-Pakete. Er prüft Datum, Vollständigkeit, IID-Schlüssel und Nachfolgeverweise vor dem atomaren Schreiben. Die IID-Schlüssel bleiben erhalten; der reservierte Schlüssel `_meta` enthält `validOn`, `importedOn`, `sourceUrl` und `recordCount`. Der sichtbare Bankdatenstand folgt automatisch `validOn`. Eine Datenaktualisierung verändert nicht das Datum einer redaktionellen Prüfung. Browser-Abfragen von Bank- und LIK-Daten werden mit dem SHA-256-Inhaltshash versioniert, auch bei mehreren Updates am selben Tag.

---

## 6. LIK / Landesindex der Konsumentenpreise (BFS)

**Quelle:** [BFS - Bundesamt für Statistik](https://www.bfs.admin.ch/bfs/de/home/statistiken/preise/landesindex-konsumentenpreise.html)

**Datei:** [cc-d-05.02.08.xlsx](https://www.bfs.admin.ch/asset/de/cc-d-05.02.08)

**Publikation:** Monatlich, in der Regel Anfang des Folgemonats. Aktuelle BFS-Termine beachten.

### Zu aktualisierende Datei

| Was | Datei | Format |
|-----|-------|--------|
| LIK-Index (monatlich) | `static/data/lik_index.json` | JSON |

### Option A: Manuelles Update (empfohlen für einzelne Monate)

1. Neuen LIK-Wert von BFS abrufen (Basis Dezember 2020 = 100)
2. JSON-Datei öffnen: `static/data/lik_index.json`
3. Neuen Monat hinzufügen:

```json
"2026": {
  "01": 107.5,  // ← Neuen Wert hier eintragen
  "02": null,
  ...
}
```

4. `lastUpdated` aktualisieren:
```json
"lastUpdated": "2026-01"
```

5. `verifiedOn` in `lik_index.json` nach dem Quellenabgleich setzen. Die Basis ist maschinenlesbar als `baseMonth: "2020-12"` und `baseValue: 100` hinterlegt; die historische Serie darf nicht mit einer anderen Basis vermischt werden.
6. Nur den nächsten Prüftermin unter `data/calculatorStatus.json` → `purchasing` nachführen. Sichtbarer Monat, Index, Basis und Prüftag folgen automatisch der Datendatei.

### Option B: Excel-Import (bei grösseren Updates)

Falls Claude Code eine neue BFS-Excel-Datei erhält:

1. Neue Excel-Datei herunterladen von: https://www.bfs.admin.ch/asset/de/cc-d-05.02.08
2. Excel-Datei an Claude Code übergeben
3. Claude Code extrahiert die Daten und aktualisiert `lik_index.json`

**Wichtig:** Die Excel-Datei enthält verschiedene Basisperioden. Wir verwenden **Dezember 2020 = 100**.

### Datenstruktur in lik_index.json

```json
{
  "basePeriod": "Dezember 2020",
  "baseMonth": "2020-12",
  "verifiedOn": "2026-09-16",
  "baseValue": 100,
  "lastUpdated": "2026-08",
  "source": "BFS - Bundesamt für Statistik",
  "sourceUrl": "https://www.bfs.admin.ch/asset/de/cc-d-05.02.08",
  "monthly": {
    "1921": { "01": 20.9, "02": 20.7, ... },
    "2026": { "01": 106.9, ..., "08": 108.6 }
  }
}
```

### Formel für Kaufkraftberechnung

```
Kaufkraft_neu = Betrag × (LIK_Ende / LIK_Start)
Inflation_% = ((LIK_Ende - LIK_Start) / LIK_Start) × 100
```

---

## 7. Kinderunterhalt

**Quellen:** [Bundesamt für Justiz](https://www.bj.admin.ch/de/unterhalt-des-kindes), [Bundesgericht](https://www.bger.ch), kantonale Richtlinien zum betreibungsrechtlichen Existenzminimum und [BSV Familienzulagen](https://www.bsv.admin.ch/de/familienzulagen-leistungen-und-voraussetzungen)

Mindestens jährlich sowie bei neuer höchstrichterlicher Rechtsprechung prüfen:

- zweistufig-konkrete Methode und Überschussverteilung in `static/js/child-support-calculator.js`
- Grundbeträge und Familienzulage unter `childSupport` in `data/site.yaml`
- Abgrenzung alleinige/alternierende Obhut und Hinweise in beiden Sprachversionen
- laufende Gesetzgebungsarbeiten zum Kindesunterhalt

Die Grundbeträge sind bewusst editierbare Richtwerte. Kantonale Abweichungen werden nicht zentral überschrieben.

---

## Wartungskalender

| Monat | Aufgaben |
|-------|----------|
| **Januar** | `currentYear` in `site.yaml` aktualisieren, alle Content-Titel prüfen, LIK Dezember |
| **Februar** | LIK Januar |
| **März** | Referenzzinssatz prüfen (BWO-Publikation 2. März), LIK Februar |
| **April** | LIK März |
| **Mai** | LIK April |
| **Juni** | Referenzzinssatz prüfen (BWO-Publikation 1. Juni), LIK Mai |
| **Juli** | LIK Juni |
| **August** | LIK Juli |
| **September** | Referenzzinssatz + ElCom Strompreise für Folgejahr ergänzen (laufendes Jahr behalten), LIK August |
| **Oktober** | LIK September |
| **November** | BSV-Grenzwerte (AHV, BVG, 3a), BVG-Mindestzins, LIK Oktober |
| **Dezember** | Jahreswechsel vorbereiten, alle Werte final prüfen, LIK November |

---

## Checkliste Jahreswechsel

- [ ] `data/site.yaml`: `currentYear` aktualisieren
- [ ] `data/site.yaml`: Alle Jahreskommentare aktualisieren
- [ ] `data/site.yaml`: Neue Sozialversicherungswerte eintragen
- [ ] `data/calculatorStatus.json`: Datenbasis, geprüfte Quellen, redaktioneller Stand und nächste Prüfung je Rechner aktualisieren
- [ ] `data/site.yaml`: neues `electricity.tariffs`-Jahr ergänzen; `defaultYear` erst für das laufende Jahr ändern
- [ ] `static/data/lik_index.json`: Dezember-Wert ergänzen, neues Jahr vorbereiten
- [ ] `i18n/*.yaml`: Jahresreferenzen aktualisieren
- [ ] Content-Dateien: Titel und Beschreibungen auf neues Jahr
- [ ] Bankdaten: Bei Bedarf SIX-Daten aktualisieren
- [ ] Hugo build testen: `hugo server`
- [ ] Commit und Deploy

---

## Kontakt Quellen

| Quelle | URL |
|--------|-----|
| BFS Landesindex (LIK) | https://www.bfs.admin.ch/bfs/de/home/statistiken/preise/landesindex-konsumentenpreise.html |
| BSV Sozialversicherungen | https://www.bsv.admin.ch |
| BWO Referenzzinssatz | https://www.bwo.admin.ch/de/referenzzinssatz |
| ElCom Strompreise | https://www.strompreis.elcom.admin.ch |
| ESTV Mehrwertsteuer | https://www.estv.admin.ch |
| SIX Bank Master | https://www.six-group.com |


## Regressionstests

Voraussetzungen: Node.js 24, npm, Python 3 und Hugo gemäss `.hugo-version`.

```bash
npm ci
npx playwright install chromium
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
hugo --environment production
npm run test:browser
```

Die Browsertests starten selbst einen lokalen HTTP-Server für `public/`. Alternativ kann `BASE_URL=http://127.0.0.1:1313` gegen einen laufenden Hugo-Server verwendet werden. `BUILD_DIR` erlaubt einen anderen Build-Ordner, `CHROMIUM_PATH` ein vorhandenes Chromium. ElCom-Antworten werden für reproduzierbare Fehler- und Konkurrenzfälle simuliert; die Tests sind keine Live-Verfügbarkeitsprüfung des Dienstes.

Abdeckung: Datenbox auf allen 46 Sprachseiten, Mietzins-Tabelle und Mehrschritt-Senkung in DE/FR, fehlende LIK-Monate und Wiederherstellung, HTTP-Ausfall, übersetzte IBAN-Fehler und Bankzuordnung, Stromtarifwechsel/manuelle Preise/veraltete Antworten/fehlender Tarif. Importtests sichern Nachfolgeverweise, Metadaten und Erhalt des alten Datenbestands bei fehlerhaften SIX-Antworten. GitHub Actions führt diese Prüfungen bei Push und Pull Request aus.

Mietzins: Die gemeinsame Funktion `static/js/rent-calculator.js` verwendet für die angebotenen Zinssätze unter 5 % die umgekehrte Gesamterhöhung. Bei n Viertelprozent-Schritten lautet die Senkung `100 × 3n / (100 + 3n)`, nicht `n × 2,91`. Prozentsätze werden wie in der [Referenztabelle](https://www.mietrecht.ch/fileadmin/files/Hypothekarzins/ueberwaelzungssaetze.pdf) auf zwei Dezimalstellen gerundet; Geldbeträge verwenden denselben Prozentsatz wie die Anzeige. Beispiel: 1,75 → 1,25 % ergibt 5,66 %, bei CHF 1’500 somit CHF 84.90.

## 404-Seiten

`layouts/404.html` erzeugt `de/404.html` und `fr/404.html` mit gemeinsamem Design, Dunkelmodus und Homepage-Link. Die Sprache steht bereits im HTML und benötigt kein JavaScript. Die Fehlerseiten enthalten `noindex, follow` und keine Canonical-/WebApplication-Metadaten.

nginx bindet diese Dateien je Domain über `error_page 404 /404.html` und eine interne Location ein. Die angefragte URL und der HTTP-Status 404 bleiben erhalten, auch für `/de/` auf wieviel.ch bzw. `/fr/` auf calcule.ch. Der frühere Cloudflare-Worker verwendet dieselben Dateien. Gemeinsame JavaScript-Dateien werden wie CSS direkt unter `/js/` ausgeliefert.

Nach dem Hugo-Build prüft `NGINX_BIN=/pfad/zu/nginx python3 tests/test_nginx_routing.py` echte HTTP-Antworten, Sprachwahl, Homepage-/Asset-Routen und bestehende Weiterleitungen. `BUILD_DIR` und `NGINX_MIME_TYPES` erlauben abweichende lokale Pfade. Die CI führt diesen Test mit nginx aus; Worker-Tests laufen mit `npm test`.

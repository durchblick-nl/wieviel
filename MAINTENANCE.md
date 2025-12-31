# Wartungsplan wieviel.ch / calcule.ch

Dieser Plan dokumentiert alle Datenquellen und wann sie aktualisiert werden müssen.

**Letzte Aktualisierung:** 31. Dezember 2025

---

## Übersicht Datenquellen

| Datenquelle | Typ | Datei/API | Frequenz |
|-------------|-----|-----------|----------|
| Sozialversicherungen (AHV/BVG/3a) | Manuell | `data/site.yaml` | Jährlich |
| MWST-Sätze | Manuell | `data/site.yaml` | Bei Änderung |
| Referenzzinssatz | Manuell | `data/site.yaml` | Quartalsweise |
| Strompreise | Live-API | ElCom SPARQL | Jährlich |
| Bankdaten (IBAN) | Manuell | `static/data/bank_master.json` | Bei Bedarf |

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
- [Smolio Vorsorgekennzahlen](https://www.smolio.ch/wissen/)
- [AHV/IV Merkblätter](https://www.ahv-iv.ch/de/Merkblaetter-Formulare)

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

Eine MWST-Erhöhung zur Finanzierung der 13. AHV-Rente ist geplant (voraussichtlich 2028 nach Volksabstimmung).

---

## 3. Referenzzinssatz (BWO)

**Quelle:** [Bundesamt für Wohnungswesen](https://www.bwo.admin.ch/de/referenzzinssatz)

**Publikation:** Quartalsweise (2. März, 2. Juni, 2. September, 2. Dezember)

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
| Jahr in SPARQL-Query | `layouts/electricity/single.html` | `elcom:period "YYYY"` |
| Median-Preis | `data/site.yaml` | `electricity.medianPrice` |
| Min-Preis | `data/site.yaml` | `electricity.minPrice` |
| Max-Preis | `data/site.yaml` | `electricity.maxPrice` |
| i18n Key DE | `i18n/de.yaml` | `electricity.standardProduct20XX` |
| i18n Key FR | `i18n/fr.yaml` | `electricity.standardProduct20XX` |

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
curl -s "https://api.six-group.com/api/epcd/bankmaster/v3/bankmaster.json" | python3 -c "
import json
import sys

data = json.load(sys.stdin)
result = {}

for entry in data['entries']:
    iid = str(entry['iid']).zfill(5)
    address = entry.get('streetName', '')
    if 'buildingNumber' in entry:
        address += ' ' + entry['buildingNumber']

    result[iid] = {
        'name': entry.get('bankOrInstitutionName', ''),
        'city': entry.get('townName', ''),
        'zip': entry.get('postCode', ''),
        'address': address,
        'bic': entry.get('bic', ''),
        'clearing': iid
    }

print(json.dumps(result, ensure_ascii=False, indent=2))
" > static/data/bank_master.json
```

---

## Wartungskalender

| Monat | Aufgaben |
|-------|----------|
| **Januar** | `currentYear` in `site.yaml` aktualisieren, alle Content-Titel prüfen |
| **März** | Referenzzinssatz prüfen (BWO-Publikation 2. März) |
| **Juni** | Referenzzinssatz prüfen (BWO-Publikation 2. Juni) |
| **September** | Referenzzinssatz + ElCom Strompreise für Folgejahr |
| **November** | BSV-Grenzwerte (AHV, BVG, 3a), BVG-Mindestzins |
| **Dezember** | Jahreswechsel vorbereiten, alle Werte final prüfen |

---

## Checkliste Jahreswechsel

- [ ] `data/site.yaml`: `currentYear` aktualisieren
- [ ] `data/site.yaml`: Alle Jahreskommentare aktualisieren
- [ ] `data/site.yaml`: Neue Sozialversicherungswerte eintragen
- [ ] `data/site.yaml`: `dataStatus` Abschnitt aktualisieren (lastVerified, nextCheck)
- [ ] `layouts/electricity/single.html`: SPARQL-Query Jahr aktualisieren
- [ ] `i18n/*.yaml`: Jahresreferenzen aktualisieren
- [ ] Content-Dateien: Titel und Beschreibungen auf neues Jahr
- [ ] Bankdaten: Bei Bedarf SIX-Daten aktualisieren
- [ ] Hugo build testen: `hugo server`
- [ ] Commit und Deploy

---

## Kontakt Quellen

| Quelle | URL |
|--------|-----|
| BSV Sozialversicherungen | https://www.bsv.admin.ch |
| BWO Referenzzinssatz | https://www.bwo.admin.ch/de/referenzzinssatz |
| ElCom Strompreise | https://www.strompreis.elcom.admin.ch |
| ESTV Mehrwertsteuer | https://www.estv.admin.ch |
| SIX Bank Master | https://www.six-group.com |

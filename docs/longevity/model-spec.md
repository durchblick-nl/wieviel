# Lebenserwartungsrechner: Modell- und Umsetzungsspezifikation

Stand: 5. November 2026. Lokale Rechnerseiten implementiert; Veröffentlichung noch ausstehend.

## Ziel und Ton

Ein verständlicher, neugierig machender Rechner für wieviel.ch und calcule.ch. Er zeigt
statistische Orientierung ab dem bereits erreichten Alter und erklärt, welche Faktoren
mit unterschiedlichen Lebensverläufen verbunden sind. Keine individuelle Diagnose oder
Vorhersage eines Todesdatums. Ein freundlicher Ton und gerundete Ergebnisse sollen die
Unsicherheit sichtbar machen. Ein Schätzungshinweis ersetzt keine nachvollziehbare Methode.

## Was bereits ausführbar ist

- BFS-Periodensterbetafeln 2025: beide Geschlechter, Alter 0–99, amtliche Restlebenserwartung,
  Sterbewahrscheinlichkeit, Überlebende und Todesfälle. Lizenz und Download-Prüfsummen gespeichert.
- Bedingte Überlebenskurve: `S(targetAge) / S(currentAge)`. Mit 60 beginnt die Kurve bei 100 %;
  Todesfälle vor 60 gehen nicht erneut in die Rechnung ein.
- Erwartetes Alter: erreichtes Alter + publiziertes `E(X)`. Der Mittelwert ist kein Median.
- Median als Altersintervall, falls die publizierte Kurve die 50-%-Schwelle erreicht.
- Amtlicher Zivilstandsvergleich für 65-Jährige aus der Periode 2018/2023, getrennt von 2025.
- Historischer Vergleich mit ursprünglicher Basistabelle und mit BFS 2025.
- Relative Studienvergleiche aus einem gemeinsam geschätzten Lebensstilmodell als internes Forschungswerkzeug.
- Eine persönliche experimentelle Jahreszahl nach angepassten historischen Regeln. Sie reagiert live
  auf Rauchen/Dosis/Rauchstopp, Aktivität, tägliches Obst/Gemüse, Alkohol, Zivilstand und BMI.

Die Tabellen enden bei 99; dort leben noch Personen. Wir erfinden weder eine letzte Todeswahrscheinlichkeit
von 100 % noch extrapolieren wir die Kurve. Das publizierte `E(X)` schliesst die BFS-Behandlung höherer
Alter ein. Eingabe zunächst in vollendeten Jahren; kein exaktes Geburtsdatum erforderlich.

## Persönlicher Prototyp: historische Heuristik

`data/longevity-heuristic.json` versioniert die Rechengewichte und Anpassungen. Die Funktion
`personalEstimate` in `static/js/longevity-core.js` beginnt beim amtlichen Restjahreswert,
summiert die berücksichtigten historischen Korrekturen, dämpft diese nach Alter und wendet
den historischen positiven Deckel sowie die Untergrenze an. Unbekannte Angaben werden
ausgelassen und ausdrücklich benannt. Über 95 bleibt nur der amtliche Grundwert.

Anpassungen: kein positiver Alkoholbonus, kein zusätzlicher Verheirateten-Abschlag bei Frauen,
BMI 20,0 und 20,1 gehören zur gleichen Kategorie. Aktuelles Rauchen benötigt eine Tagesmenge;
der Bonus für ehemalige Raucher benötigt mehr als fünf Jahre seit dem Rauchstopp. Grösse und
Gewicht werden gemeinsam berücksichtigt; die historische BMI-Korrektur ist auf 15–40 begrenzt.
Die Faktoren werden nach den ursprünglichen Fragen abgefragt, nicht als Kategorien der Studie 2014.

Der Nutzer sieht zuerst die persönliche Rechenzahl und den Vergleich zwischen Ausgangsprofil
und einem veränderbaren Szenario. Die Abweichung vom BFS-Grundwert und die nach Altersdämpfung
berechneten Einzelbeiträge stehen unter «Statistik & Quellen». Ein Begrenzungshinweis erscheint,
falls deren Summe durch eine Modellgrenze verändert wurde. Die Dezimalstelle dient dem
Szenarienvergleich, nicht als Behauptung medizinischer Präzision. Das Modell ist nicht validiert.

Diese Rechenzahl ist keine Umrechnung der Studien-Hazard-Ratios in Lebensjahre. Die weiter
unten genannten Anforderungen an ein statistisch kalibriertes Modell bleiben offen.

## Was der alte Rechner lehrt

Die alte PHP-Rechnung addiert Jahreskorrekturen für BMI, Familie, soziales Umfeld,
Gesundheitswerte/Ernährung, Substanzen und Bewegung. Ab 50 multipliziert sie die Gesamtkorrektur
mit `(100 − Alter) / 50`. Anschliessend folgen ein positiver Deckel von zwölf Jahren und eine
Untergrenze von einem Viertel der unmodifizierten Restlebenszeit.

Der historische Vergleich bildet nur die Zahlenrechnung für ganzzahlige Alter 13–95 nach.
Fraktionale Alter haben im Original ein umgekehrtes Interpolationsgewicht; unter 13 und über 95
werden Ergebnisse später überschrieben. Diese Sonderfälle und die alten Ausgabetexte sind nicht portiert.
Die Bezugsperiode der alten Tabelle ist unbekannt. Der Name einer Backup-Tabelle belegt sie nicht.

Weitere Auffälligkeiten:

- BMI 20,0 ergibt −1, BMI 20,1 dagegen +1 Jahr vor Dämpfung.
- Verheiratete Frauen erhalten im Original zusätzlich zum Bonus einen Abschlag aus einem zweiten
  Bedingungszweig; dieser ist im Vergleich bewusst erhalten, ohne ihn fachlich zu rechtfertigen.
- Gruppenbildung verhindert keine Doppelzählung korrelierter Merkmale.
- Unbekannte Antworten werden historisch häufig wie null behandelt. Im neuen Modell muss
  «unbekannt» erkennbar bleiben und darf nicht mit der günstigsten Referenz gleichgesetzt werden.
- Der historische Text verwechselt Mittelwert und Median und kann beim Überschreiten der
  Lebenserwartung bei Geburt den falschen Eindruck erwecken, man habe den Altersdurchschnitt überlebt.

Die Referenztabelle wurde separat extrahiert. Keine Nutzungsprotokolle, Kontaktdaten,
Datenbankzugänge oder vollständigen Dumps gehören in das Projekt.

## Kombination von Faktoren: aktuelle Entscheidung

Die experimentelle Studienfunktion verwendet ausschließlich die gemeinsam adjustierten,
geschlechtsspezifischen Haupteffekte aus Tabelle 2 von Martin-Diener et al. 2014.
Die Multiplikation dieser Hazard Ratios entspricht einer Addition auf der Log-Hazard-Skala.
Das ist eine Modellannahme ohne zusätzliche Interaktionsterme, kein Beweis unabhängiger Ursachen.
Der separat publizierte Vergleich aller vier Risiken ist nicht exakt das Produkt dieser Haupteffekte.

Ein Hazard Ratio ist weder eine Todeswahrscheinlichkeit noch ein prozentualer Verlust an Lebenszeit.
Die Studienfunktion gibt deshalb ausdrücklich keine absolute Lebenserwartung zurück. Die Cox-Werte
ersetzen auch nicht die Weibull-Gleichung für die absoluten Studienrisiken.

Für eine wissenschaftlich begründete und kalibrierte persönliche Schätzung fehlen noch:

1. Eine gewählte absolute Modellgleichung einschließlich Ausgangsrisiko und belegtem Altersbereich.
2. Eine passende Schweizer Kalibrierung. Die Bevölkerungstafel ist bereits ein Risikogemisch;
   sie darf nicht als Ausgangsrisiko der günstigsten Studiengruppe eingesetzt werden.
3. Verwendbare gemeinsame Expositionsverteilungen oder eine andere dokumentierte Kalibrierung.
   Bei Mischung von Gruppen verändert Überleben deren Zusammensetzung mit zunehmendem Alter.
4. Regeln für Szenarien ab heute, insbesondere Zeit seit Rauchstopp; Querschnittsprofile sind
   keine kausalen Schätzungen einer sofortigen Verhaltensänderung.
5. Eine begründete Behandlung der Unsicherheit. Die unabhängige Multiplikation einzelner
   Konfidenzgrenzen ergibt kein gültiges gemeinsames Konfidenzintervall.

Grundwert und amtlicher Gruppenvergleich bleiben getrennt von der persönlichen historischen
Heuristik. Zusätzliche Studienkoeffizienten werden nicht an deren Jahresgewichte angehängt.

## Zivilstand und Partnerschaft: durch Nutzerquellen ergänzt

Ausgangspunkt: [roger.tips: Leben Verheiratete länger?](https://www.roger.tips/de/tips/leben-verheiratete-langer-so-liest-du-die-zahlen),
mit Verweisen auf die [BFS-Veröffentlichung 2018/2023](https://statistik.admin.ch/de/news/2026-0658)
und die [BSV/CHSS-Einordnung](https://sozialesicherheit.ch/de/verheiratete-leben-laenger/).

Der amtliche [BFS-Gruppenvergleich ab 65](https://statistik.admin.ch/de/asset/36854184) ist importiert.
Er liefert einen besseren Vergleich als erfundene Ehe-Jahresboni. Die Differenz verheiratet–ledig
ist nicht die Differenz verheiratet–Gesamtbevölkerung. Die Periode bleibt ausdrücklich 2018/2023.
Diese Werte werden nicht auf die Tabelle 2025 aufgeschlagen und nicht auf Alter 60 interpoliert.

Auch nach Zivilstand differenzierte [Sterbe- und Übergangswahrscheinlichkeiten](https://statistik.admin.ch/de/asset/36854273)
und eine [Überlebensordnung](https://statistik.admin.ch/de/asset/36854272) sind verfügbar.
Die XML-Daten und Metadaten wurden gesichtet: Alterswerte 18–100; das technische Zeitlabel lautet
2020, während die offizielle Bezugsperiode 2018–2023 ist. Es ist keine Jahresreihe 2020.
Eine Überlebensordnung mit Zu- und Abgängen durch Zivilstandswechsel darf nicht wie eine
unveränderliche Teilgruppe mit einfachem Quotienten interpretiert werden. Vor Nutzung sind die
Tabellendefinitionen und die Mehrzustandsmethode der BFS-Publikation zu prüfen.

Fragenentwurf, alle optional:

- Zivilstand: ledig / verheiratet oder eingetragene Partnerschaft / verwitwet / geschieden / keine Angabe.
- Lebst du mit einer Partnerin oder einem Partner zusammen? ja / nein / keine Angabe.
- Hast du verlässliche soziale Unterstützung? Eine spätere ergänzende Frage, keine weitere
  automatisch addierte Risikokorrektur.

Die [Swiss National Cohort, Staehelin et al. 2012](https://pubmed.ncbi.nlm.nih.gov/22012962/)
unterscheidet Zivilstand und Wohnform und zeigt altersabhängige Zusammenhänge.
Eine [schwedische Registerstudie von 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11732825/)
untersucht Partnerschaft und frühere Ehen getrennt. Beide sprechen für sorgfältige Kategorien;
sie belegen keinen persönlichen Lebenszeitgewinn durch eine Heirat.

Eine [Metaanalyse von 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12612516/) ist als zusätzliche
Recherchequelle erfasst. Ihre numerischen Ergebnisse widersprechen sich teilweise zwischen Abstract,
Haupttext und Abbildungsbeschriftungen. Daraus werden keine Koeffizienten übernommen.

## Quellenregister und Verwendungsstatus

| Quelle | Verwendung / nächste Prüfung |
|---|---|
| [BFS Männer 2025](https://statistik.admin.ch/fr/asset/36837789), [Frauen 2025](https://statistik.admin.ch/fr/asset/36837788) | CSV importiert; publiziert am 24.09.2026; OPEN-BY, BFS/OFS. |
| [BFS Zivilstand ab 65](https://statistik.admin.ch/de/asset/36854184) | Diagrammdaten importiert; publiziert am 13.10.2026; OPEN-BY, BFS/OFS. |
| [Martin-Diener 2014](https://doi.org/10.1016/j.ypmed.2014.05.023) | Volltext/Tabelle 2 geprüft; Parameter in `data/longevity-study.json`; nur relative Forschungsrechnung. |
| [Rauchstopp, NEJM Evidence 2024](https://evidence.nejm.org/doi/full/10.1056/EVIDoa2300272) | Kandidat für zeitabhängige Szenarien; keine isolierten Jahresgewinne übernommen. |
| [Bewegung, BJSM 2024](https://bjsm.bmj.com/content/bjsports/early/2024/10/07/bjsports-2024-108125.full.pdf) | Kandidat; US-Modell und Kategorien vor einer Übertragung prüfen. |
| [BMI, Lancet 2016](https://doi.org/10.1016/S0140-6736(16)30175-1) | Kandidat; Altersabhängigkeit, Erkrankungen und Doppelzählung prüfen. |
| [Ernährung, Nature Food 2023](https://www.nature.com/articles/s43016-023-00868-w) | Kandidat; Detailmodell und Anpassungen prüfen. |
| [Alkohol, JAMA Network Open 2023](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2802963) | Einordnung für die Überarbeitung des historischen Alkoholbonus. |
| [Isolation/Einsamkeit, Nature Human Behaviour 2023](https://www.nature.com/articles/s41562-023-01617-6) | Kandidat für begleitende Einsichten, kein separater Jahresabschlag. |

## Implementierte gemeinsame Oberfläche DE/FR

- Rechnerseiten `/de/leben/` und `/fr/esperance-de-vie/` mit gemeinsamer Hugo-Vorlage.
- Erster Schritt Alter/statistische Geschlechtskategorie, sofortiger BFS-Grundwert.
- Lebensstilfragen optional; nur tatsächlich vom gewählten Modell unterstützte Kategorien.
- Ergebnis und Vergleichsgrafik mit dauerhaft sichtbaren Datenperioden und Schätzungshinweis.
- Zivilstand als amtlicher Vergleich ab 65; für andere Alter zunächst passende Einordnung.
- Quellen direkt an Faktoren, zusätzlich Methodenseite/FAQ mit Mittelwert, Median, Periodenannahme
  und Unterschied zwischen Zusammenhang und Ursache.
- Bestehende Datenstandsbox, `calculatorStatus.json`, Wartungsplan, Sprachwechsel,
  Homepagekarten, SEO und OG-Bilder gemeinsam auf DE/FR ergänzen.
- Berechnung lokal; keine Gesundheitsangaben in Analytics, URL, Sharing oder automatischem Speicher.
- Mobile Bedienung, Tastatur, Screenreader-Alternative zur Grafik und Dark Mode prüfen.

Die Oberfläche zeigt beide bedingten Überlebenskurven, einen Zielalter-Regler, eine Wertetabelle
und ein Punktdiagramm für den Zivilstandsvergleich. Diagramme passen ihre Achsen/Anordnung an
schmale Bildschirme an. Die persönliche Heuristik und die amtlichen Vergleichswerte sind deutlich bezeichnet.
Das Interface startet als «Was wäre, wenn …?»-Spielbereich. «Dein Profil» öffnet einen
fünfstufigen Editor (Ausgangspunkt, Körper, Rauchen, Bewegung, Ernährung). Optionale Schritte
lassen sich überspringen. Die Navigation bleibt am unteren Rand sichtbar; Zahlenfelder verwenden
passende mobile Tastaturen und mindestens 44 px hohe Touchziele. Die Eingaben bleiben lokal.

Ein separates Szenario-Objekt überschreibt einzelne Werte des Ausgangsprofils. Die vier Flächen
kombinieren einen länger zurückliegenden Rauchstopp, häufigere Bewegung, tägliches Obst/Gemüse
oder ein anderes Gewicht. Der Rauchstopp setzt die Modellkategorie «mehr als fünf Jahre aufgehört»;
bei einem Profil, das nie geraucht hat oder seit mehr als fünf Jahren aufgehört hat, wird dieses Szenario ausgeblendet. Bereits erfüllte Bewegungs- und Ernährungsoptionen werden ebenfalls ausgeblendet. Der Hinweis erklärt, dass
keine sofortige Wirkung eines heutigen Rauchstopps berechnet wird.

Beim Gewicht öffnet sich derselbe Körper-Editor mit zusätzlichem Regler und Live-Jahreszahl.
Abbrechen stellt die vorherigen Szenariowerte wieder her; Übernehmen verändert nur das Szenario.
«Szenario zurücksetzen» entfernt sämtliche Überschreibungen und stellt das Ausgangsergebnis
exakt wieder her. Zwei beschriftete Punkte visualisieren den Zahlenvergleich; sie sind keine
Überlebenskurve. Die amtliche Überlebenskurve mit Regler steht direkt unter den Szenarien. Quellen und FAQ-Fragen sowie der Datenstand sind ohne Aufklappen sichtbar. Einzelbeiträge und weitere Vergleiche stehen unter «Statistik & Modell».

Rahmen: gemeinsamer Header mit Seitentitel, Sprachwahl, Theme-Schalter, Tool-Navigation und Datenstand; drei nummerierte Schritte wie bei den übrigen Rechnern. Quellen stehen in der gemeinsamen Link-Karte.

Rechnerdesign: Slate-Teal #3f606f, Akzent #cc5c53, Systemschrift für Bedienelemente,
Economica für Ergebniszahlen, 20-px-Ergebniskarte, 10-px-Formelemente und 54-px-Navigation.
Dark Mode verwendet die bestehenden Site-Tokens. Der Editor reagiert auf die Höhe des visuellen
Viewports, sodass mobile Tastaturen die Navigation nicht verdecken sollen; physische Geräte
müssen dies noch bestätigen. Bei reduzierter Bewegung werden Übergänge deaktiviert.

Die ursprüngliche Idee wird in DE/FR ausdrücklich Christian Bachmann zugeschrieben, mit Link
zum [Smart-BMI-Impressum](https://de.smartbmicalculator.com/impressum.html).

## Reproduzieren und prüfen

```sh
python3 scripts/update_life_tables.py --year 2025
python3 scripts/update_marital_life_data.py
node scripts/compare_longevity.cjs
node --test tests/longevity.test.js
python3 -m unittest discover -s tests -p test_life_table_import.py
```

Ohne Node lokal ausführbar mit Deno:

```sh
deno run --allow-read --allow-write=docs/longevity scripts/compare_longevity.cjs
deno test --unstable-detect-cjs --allow-read tests/longevity.test.js
```

Der Bericht [comparison.md](comparison.md) enthält 24 Profilvergleiche sowie den amtlichen
Zivilstandsvergleich. Acht Referenzfälle wurden mit dem isolierten originalen PHP-Rechenblock
ausgeführt und als Golden-Datei hinterlegt. Es wurde dabei keine Datenbankverbindung und kein
Logging ausgeführt. Das beweist die historische Reproduktion, keine medizinische Validierung.

Wartung: jährlichen BFS-Import separat von der redaktionellen Modellprüfung versionieren.
Neue BFS-Asset-IDs können beim Import angegeben werden; ein unvollständiger Import darf
vorhandene Daten nicht ersetzen. Zivilstandsdaten werden nur bei einer neuen amtlichen Publikation
aktualisiert. Vor öffentlicher Freigabe sind beide Sprachfassungen und die Browserdarstellung zu prüfen.

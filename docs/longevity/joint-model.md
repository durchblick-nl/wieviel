# Gemeinsames Überlebensmodell – Version joint-survival-1

Stand: 5. November 2026. Dies ist eine experimentelle Übertragung und keine validierte
Schweizer Individualprognose. Sie ersetzt die öffentlich verwendeten additiven Jahresregeln.

## Quelle und übernommene Teile

Manuel et al. (2016), MPoRT, PLOS Medicine:
https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1002082

- S8: gemeinsam geschätzte, geschlechtsspezifische Koeffizienten für Rauchen,
  logarithmierte Freizeitaktivität, Ernährungsscore und hohen Alkoholkonsum.
- S7: ehemaliges Rauchen erhält den Faktor exp(−(Jahre seit Rauchstopp + Folgejahre) / σ),
  σ = 15 für Männer und 26 für Frauen. Aktuell Rauchende bleiben im Fortsetzungsprofil
  aktuell rauchend. «Jetzt aufhören» beginnt mit null Jahren Rauchstopp, nicht mit sechs.
- Tabelle 1 und Fussnoten: Kategorien und Ernährungsscore; hohe Kartoffelfrequenz
  ab 7/Woche bei Männern, ab 5/Woche bei Frauen; Rauchen ab 20 Zigaretten täglich «heavy».
- Tabellen 2/3 (Männer/Frauen), Canada Application: Referenzanteile Rauchen und hoher Alkoholkonsum,
  Aktivitätsmedian und Angaben zur Ernährung.
- Koeffizienten, Quellenorte, PDF-Prüfsummen, Referenzannahmen und Version stehen
  in `data/longevity-survival-model.json`. Das Paper ist CC BY.

Keine Kombination separater Raucher-, Ernährungs- und Bewegungs-Hazard-Ratios aus
verschiedenen Studien. Die Studie von Martin-Diener et al. bleibt Hintergrund,
keine zweite Quelle zusätzlicher Risikogewichte. Gemeinsam adjustierte Koeffizienten
sind dennoch keine Garantie kausaler Effekte oder vollständiger Kontrolle aller Einflüsse.

## Bewusste Anpassungen und nicht übernommene Teile

Dies ist **keine vollständige Reproduktion von MPoRT**. Kanadischer absoluter Basis-Hazard,
Altersformel und kanadische Kalibrierfaktoren werden nicht auf die Schweizer Daten kopiert.
Der Schweizer altersabhängige Basiswert wird rechnerisch neu verankert. Krankheits-,
Bildungs-, Deprivations- und Migrationsmerkmale werden nicht individuell erhoben.
Ihre gemeinsame Wirkung wird als in der Altersbasis enthalten angenommen; die
Transportierbarkeit der bedingten Verhaltenskoeffizienten ist damit nicht bewiesen.

Der beobachtete günstigere Koeffizient für moderaten Alkohol wird auf null gesetzt.
Kein Wechsel von null zu wenig Alkohol gibt einen Bonus. Der Koeffizient der höchsten
Kategorie unterscheidet nicht jede weitere Dosis: Diese alte Kategorie ist weder eine
aktuelle Empfehlung noch eine Aussage über sichere Mengen. Verwendet wird die
kanadische Studienmenge pro Getränk (ungefähr 13,5–13,6 g Alkohol), keine ungekennzeichnete
Übernahme von Schweizer 10-g-Portionen.

Aktivität wird durch 3 MET für mässige und 6 MET für intensive Wochenminuten angenähert:
`min(10, (3 × mässige Minuten + 6 × intensive Minuten) / 420)`.
Der Studienfragebogen erfragte einzelne Aktivitäten ausführlicher. Ernährung fragt
vereinfachend die tägliche Gesamthäufigkeit statt alle Einzelgruppen separat ab.
Es werden Essanlässe, nicht Portionen, Gramm oder ein vollständiger Qualitätsscore erhoben.
Die Summe ohne Saft wird auf 8 begrenzt, plus 2 Ausgangspunkte, minus je 2 für
hohe Kartoffelfrequenz und keine Karotten, minus 2 je Saftfrequenz über 1 pro Tag
(maximal 10 Saftabzug). Gesamtscore 0–10. Dies ist eine Annäherung an die Erhebung,
keine individuelle Ernährungsberatung.

## Referenz und verbleibende Korrelationsgrenze

Eine echte gemeinsame, aktuelle Schweizer Verteilung dieser Angaben liegt uns nicht vor.
Wir erfinden deshalb keine Schweizer Korrelationen oder pauschalen Korrelationsabschläge.
Die synthetische Referenz hat zehn Zellen: fünf Raucherkategorien × hoher/nicht hoher
Alkoholkonsum, mit konstanten repräsentativen Aktivitäts-/Ernährungswerten.

- Männer (Tabelle 2): Rauchen 8,2 % aktuell stark, 16,4 % aktuell leicht,
  14,7 % früher stark, 16,0 % früher leicht, 44,7 % Referenz; hoher Alkohol 20,3 %;
  Aktivitätsmedian 1,6; Ernährungsreferenz 4,552.
- Frauen (Tabelle 3): Rauchen 4,0 % aktuell stark, 14,7 % aktuell leicht,
  7,6 % früher stark, 17,6 % früher leicht, 56,1 % Referenz; hoher Alkohol 7,3 %;
  Aktivitätsmedian 1,3; Ernährungsreferenz 5,604.
- Rauch-/Alkoholanteile werden unabhängig kombiniert, innerhalb jeder Geschlechtsgruppe.
- Frühere Raucher: 15 Jahre Rauchstopp **angenommen**, kein publizierter Mittelwert.
- Aktivität: jeweiliger publizierter Median, keine volle Aktivitätsverteilung.
- Ernährung: synthetische Repräsentanten:
  Männer `2 + 3,3 − 2 × (0,109 + 0,109 + 0,156) = 4,552`,
  Frauen `2 + 4,2 − 2 × (0,096 + 0,086 + 0,116) = 5,604`.
  Der publizierte Median der Gesamtfrequenz wird mit mittleren binären Abzügen
  kombiniert; bei hohem Saftkonsum wird ein zusätzlicher täglicher Anlass angenommen.
  Dies sind ausdrücklich **keine publizierten mittleren Ernährungsscores**.

Die Referenz ist weder Schweizer alters-/geschlechtsspezifische Prävalenz noch ein
beobachteter gemeinsamer Datensatz. Unbekannte Angaben werden durch diese Referenz
ersetzt, nicht durch «gesund». Bei bekannten Angaben bleibt die Verteilung der anderen
Merkmale unverändert: unbekannte Faktoren werden also nicht empirisch bedingt imputiert.
Das begrenzt die Gültigkeit auch dann, wenn die übernommenen Koeffizienten gemeinsam
adjustiert geschätzt wurden. Ein reales Schweizer Expositionsdatenset wäre der nächste
entscheidende Datenbaustein; technische Tests ersetzen es nicht.

## Jährliche Rechnung und BFS-Verankerung

Für jedes erreichte Ausgangsalter a und Geschlecht wird separat gerechnet.
Die Startgewichte der synthetischen Referenz summieren sich auf 1. In Jahr t hat
jede Zelle den relativen Hazard `r_i(t) = exp(β × Merkmale_i(t))`.

Ein positiver jährlicher Basis-Hazard h(t) wird per Intervallsuche so bestimmt, dass
`Σ w_i(t) × exp(−h(t) × r_i(t)) = 1 − Q_BFS(a+t)`.
Anschliessend werden die Zellgewichte unter den Überlebenden fortgeschrieben.
Damit entspricht die **Mischung**, nicht ein gesundes Referenzprofil, der BFS-Tafel.
Die Ausgangsmischung bleibt eine Annahme; diese Gleichheit ist eine mathematische
Verankerung und keine empirische Schweizer Validierung.

Bekannte Profilangaben ersetzen entsprechende Merkmale in allen Zellen. Abgesehen von der Zeit seit Rauchstopp bleiben die angegebenen Gewohnheiten für die Zukunft konstant; individuelle Krankheits-, Behandlungs- und Gewichtsverläufe werden nicht prognostiziert. Der
Überlebensverlauf ist die gewichtete Mischung der resultierenden Verläufe.
Die unterjährliche Integration ist exponentiell mit stückweise konstantem Hazard;
Wahrscheinlichkeiten bleiben dadurch zwischen 0 und 1. Es gibt keine alten
Jahresboni, keinen willkürlichen +12-Jahre-Deckel und keine Viertel-Restzeit-Untergrenze.

Die veröffentlichte Tafel endet bei 99. Es wird keine künstliche Todesgrenze bei 99
gesetzt. Für alle Profile wird ab dort derselbe veröffentlichte Wert E(99) als
Restzeit verwendet, gewichtet mit der jeweiligen Wahrscheinlichkeit, 99 zu erreichen.
Das ist eine gemeinsame Tail-Annahme, keine personalisierte Hochaltrigenprognose.
Um die Rundungen der publizierten E(x) und die Integrationskonvention auszugleichen,
werden integrierte Jahre mit `E_BFS(a) / E_integrierte_Referenz(a)` normalisiert.
Ohne auswertbare numerische Faktoren werden exakt der publizierte E(x)-Wert und
die offizielle Überlebenskurve angezeigt. Modellbereich 20–95, ausserhalb nur BFS.

## Smart BMI und Zivilstand

Die ausdrücklich gewünschte Smart-BMI-Jahreswirkung bleibt eine **eigene experimentelle
Ergänzung**, kein MPoRT-Koeffizient. Der originale BMI>35-Spline aus MPoRT wird nicht
zusätzlich verwendet. SBMI 30–39 ist neutral. Sonst wird die persönliche Modellrestzeit
um `E_BFS(a) × min(0,08, 0,004 × Abstand)` reduziert, ohne weitere Altersdämpfung.
Ein gemeinsamer Hazard-Multiplikator für das persönliche Profil wird numerisch so
bestimmt, dass die Kurve zur angestrebten Restzeit passt. Diese zusätzliche Gewichtung
ist nicht gemeinsam mit den Studienkoeffizienten geschätzt und kann verbleibende
Abhängigkeiten nicht ausschliessen. Siehe `smart-bmi.md`.

Zivilstand hat keine Wirkung auf die persönliche Zahl. Die amtlichen beobachteten
Gruppenwerte bleiben sichtbar. Keine Heirats- oder Ledigkeits-Jahresregel.

## Darstellung und Prüfumfang

Die korallrote Kurve zeigt das Szenario; BFS-Kurven und offizieller Regler bleiben
unverändert. Die Tabelle enthält BFS und Szenario. «Mit Angabe gegenüber ohne Angabe»
vergleicht die vollständige Rechnung mit einer Rechnung, die genau diesen Faktor durch
die Modellreferenz ersetzt. Solche Vergleiche sind **nicht addierbar** und keine
kausalen Interventionseffekte. Die Szenarien sind dagegen explizite Profiländerungen.

Tests prüfen Quellenkoeffizienten, Transformationen, den Beginn des Rauchstopps,
Altersverlauf, exakten BFS-Anker bei unbekannten Angaben, monotone begrenzte Kurven,
Smart-BMI-Proportionalität und Wirkungslosigkeit des Zivilstands. Browserprüfungen
prüfen DE/FR, Eingabeschritte, unmittelbare Altersänderungen, reversible Szenarien,
Grafik und unveränderte BFS-Referenz. Diese Prüfungen belegen die Implementierung,
keine medizinische oder externe epidemiologische Validierung.

## Zahlenbeispiel zur Regression, keine medizinische Validierung

Männlich; 20 Zigaretten täglich; 150 Minuten mässige Bewegung und 0 intensive Minuten
pro Woche; Obst/Gemüse/Kartoffeln dreimal täglich; Karotten mindestens wöchentlich;
Kartoffeln zweimal pro Woche; Saft einmal täglich; 0 alkoholische Getränke und keine
Rauschtrink-Episoden. Ohne zusätzliche Gewichtskorrektur. Gerundete Restjahre:

| Erreichtes Alter | BFS-Durchschnitt | Weiterrauchen | Rauchstopp heute | Nie geraucht |
|---|---:|---:|---:|---:|
| 30 | 53,4 | 46,3 | 54,2 | 55,1 |
| 60 | 25,0 | 19,3 | 23,7 | 26,6 |
| 80 | 9,5 | 6,3 | 7,3 | 10,6 |

Der BFS-Durchschnitt ist die amtliche Vergleichszahl. Die übrigen Spalten sind
Ausgaben unserer Übertragung mit der beschriebenen synthetischen Referenz. Ihre
Unterschiede dürfen nicht als nachgewiesener persönlicher Gewinn durch einen
Rauchstopp gelesen werden. Sie zeigen, dass die Altersabhängigkeit aus der
Überlebensrechnung entsteht und der Rauchstopp nicht mit einem sofortigen
historischen Jahresbonus verwechselt wird.


## Getrennte Ernährungseingaben (6. November 2026)

Die öffentliche tägliche Obst-/Gemüsefrage schliesst Kartoffeln und Saft jetzt aus.
`produceFrequency` bezeichnet diese neue Eingabe. Für den unveränderten Studienindex
wird `produceFrequency + potatoFrequency / 7` als tägliche Gesamthäufigkeit verwendet;
Kartoffeln werden nur einmal abgefragt. Der separate geschlechtsspezifische
Kartoffelterm des Index bleibt bestehen. Bestehende interne Profile mit
`fruitFrequency` behalten ihre Bedeutung als Gesamthäufigkeit einschliesslich
Kartoffeln. Bei explizit unbekannter neuer Eingabe wird nicht darauf zurückgegriffen.
Szenarien, Wiederöffnen und Beitragsvergleiche verwenden ebenfalls die neue Eingabe.

Die Hauptfrage zum hohen Alkoholkonsum ist kürzer. Der sichtbare, zugänglich
verknüpfte Hinweis erhält die zweite Studienbedingung: auch normalerweise mindestens
wöchentlicher Konsum von fünf oder mehr Getränken bei einem Anlass zählt, selbst wenn
es in der letzten Woche nicht vorkam. Die binäre Rechenregel ändert sich nicht.

Der Saft-Hinweis verweist auf freie Zucker und geringere Nahrungsfasern. Er verändert
keinen Studienkoeffizienten und führt keinen erfundenen Limonaden-Koeffizienten ein.
WHO und NHS inform sind auf beiden Sprachseiten als Ernährungskontext verlinkt.

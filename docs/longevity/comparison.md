# Lebenserwartung: Vergleichsrechnungen

Generiert mit `node scripts/compare_longevity.cjs`. Interne Modellprüfung, keine persönliche Prognose.

Die ersten beiden Varianten ändern nur die Basistabelle. Die dritte zeigt ausschließlich relative
Hazards aus einem gemeinsam geschätzten Studienmodell; ohne aktuelle Kalibrierung gibt es dafür keine Jahreszahl.

Die Lebensstilkategorien sind nur näherungsweise gegenübergestellt: «20 Zigaretten» entspricht in der Studie
nur «aktuell rauchend». Der alte Alkoholwert −3 steht für sechs damalige Standardportionen täglich,
die Studie erfasst hohen Konsum am Vortag. Das ist kein identischer Expositionsvergleich.

| Alter | Geschlecht | Profil | Alter Grundwert: Restjahre | BFS 2025: Restjahre | Alt + alte Regeln | BFS + alte Regeln | Studien-HR vs. Referenz |
|---|---|---|---:|---:|---:|---:|---:|
| 40 | M | Nur Grundwert / Lebensstil unbekannt | 40,50 | 43,70 | 40,50 | 43,70 | unbekannt |
| 40 | M | 20 Zigaretten/Tag, sonst wie Referenz | 40,50 | 43,70 | 39,50 | 42,70 | 1,63 |
| 40 | M | 20 Zigaretten/Tag + wenig Bewegung + kein Obst + viel Alkohol | 40,50 | 43,70 | 31,50 | 34,70 | 2,43 |
| 40 | M | Nichtraucher, aktiv, Obst, kein Alkohol | 40,50 | 43,70 | 45,50 | 48,70 | 1,00 |
| 40 | F | Nur Grundwert / Lebensstil unbekannt | 44,90 | 46,90 | 44,90 | 46,90 | unbekannt |
| 40 | F | 20 Zigaretten/Tag, sonst wie Referenz | 44,90 | 46,90 | 43,90 | 45,90 | 1,52 |
| 40 | F | 20 Zigaretten/Tag + wenig Bewegung + kein Obst + viel Alkohol | 44,90 | 46,90 | 35,90 | 37,90 | 2,45 |
| 40 | F | Nichtraucher, aktiv, Obst, kein Alkohol | 44,90 | 46,90 | 49,90 | 51,90 | 1,00 |
| 60 | M | Nur Grundwert / Lebensstil unbekannt | 22,40 | 25,00 | 22,40 | 25,00 | unbekannt |
| 60 | M | 20 Zigaretten/Tag, sonst wie Referenz | 22,40 | 25,00 | 21,60 | 24,20 | 1,63 |
| 60 | M | 20 Zigaretten/Tag + wenig Bewegung + kein Obst + viel Alkohol | 22,40 | 25,00 | 15,20 | 17,80 | 2,43 |
| 60 | M | Nichtraucher, aktiv, Obst, kein Alkohol | 22,40 | 25,00 | 26,40 | 29,00 | 1,00 |
| 60 | F | Nur Grundwert / Lebensstil unbekannt | 26,20 | 27,70 | 26,20 | 27,70 | unbekannt |
| 60 | F | 20 Zigaretten/Tag, sonst wie Referenz | 26,20 | 27,70 | 25,40 | 26,90 | 1,52 |
| 60 | F | 20 Zigaretten/Tag + wenig Bewegung + kein Obst + viel Alkohol | 26,20 | 27,70 | 19,00 | 20,50 | 2,45 |
| 60 | F | Nichtraucher, aktiv, Obst, kein Alkohol | 26,20 | 27,70 | 30,20 | 31,70 | 1,00 |
| 80 | M | Nur Grundwert / Lebensstil unbekannt | 8,10 | 9,50 | 8,10 | 9,50 | unbekannt |
| 80 | M | 20 Zigaretten/Tag, sonst wie Referenz | 8,10 | 9,50 | 7,70 | 9,10 | 1,63 |
| 80 | M | 20 Zigaretten/Tag + wenig Bewegung + kein Obst + viel Alkohol | 8,10 | 9,50 | 4,50 | 5,90 | 2,43 |
| 80 | M | Nichtraucher, aktiv, Obst, kein Alkohol | 8,10 | 9,50 | 10,10 | 11,50 | 1,00 |
| 80 | F | Nur Grundwert / Lebensstil unbekannt | 10,00 | 10,80 | 10,00 | 10,80 | unbekannt |
| 80 | F | 20 Zigaretten/Tag, sonst wie Referenz | 10,00 | 10,80 | 9,60 | 10,40 | 1,52 |
| 80 | F | 20 Zigaretten/Tag + wenig Bewegung + kein Obst + viel Alkohol | 10,00 | 10,80 | 6,40 | 7,20 | 2,45 |
| 80 | F | Nichtraucher, aktiv, Obst, kein Alkohol | 10,00 | 10,80 | 12,00 | 12,80 | 1,00 |

## Bedingtes Überleben ab Alter 60

| Geschlecht | Restjahre laut BFS E(X) | Durchschnittsalter | Wahrscheinlichkeit 80 zu erreichen | Wahrscheinlichkeit 90 zu erreichen | Median-Altersintervall |
|---|---:|---:|---:|---:|---|
| M | 25,00 | 85,00 | 73,01 % | 33,56 % | 86–87 |
| F | 27,70 | 87,70 | 82,49 % | 45,73 % | 89–90 |

## Amtlicher Gruppenvergleich nach Zivilstand, Alter 65

BFS 2018/2023, separat vom Grundwert 2025. Restlebensjahre, kein Heiratseffekt.

| Zivilstand | Männer | Frauen |
|---|---:|---:|
| Gesamt | 19,80 | 22,60 |
| Ledig | 16,40 | 20,40 |
| Verheiratet | 20,80 | 24,10 |
| Verwitwet | 18,40 | 22,00 |
| Geschieden | 18,20 | 21,60 |

Verheiratet versus ledig: +4,4 Jahre (M) / +3,7 Jahre (F). Gegenüber der Gesamtbevölkerung
derselben Periode sind es +1,0 / +1,5 Jahre. Diese unterschiedlichen Referenzen dürfen nicht verwechselt werden.

## Erkenntnisse

- Bei unverändertem Profil ist die Differenz der ersten beiden Jahresergebnisse in diesen Fällen allein der Datenwechsel.
- Die alten Lebensstil-Zu-/Abschläge bleiben dabei exakt gleich; aktuellere Basisdaten validieren sie nicht.
- Für unbekannten Lebensstil wird keine günstige Studienreferenz eingesetzt.
- Studien-HR bezeichnet das Verhältnis momentaner Sterberaten, keine Todeswahrscheinlichkeit und keinen Jahresverlust.
- Das Produkt aller vier Haupteffekte ergibt für Männer 2,43, für Frauen 2,45. Die separat berichteten All-vier-Kontraste sind 2,41 bzw. 2,46; sie werden nicht als identische Schätzer behandelt.
- Historische Rechnungen sind auf ganzzahlige Alter 13–95 beschränkt. Keine Reproduktion der alten Texte oder Eingabefehler.
- Die BFS-Kurve endet bei 99 mit positiver Überlebenswahrscheinlichkeit; sie wird nicht künstlich auf null gezogen.

## Quellen

- [BFS Männer, CSV](https://statistik.admin.ch/fr/asset/36837789), [BFS Frauen, CSV](https://statistik.admin.ch/fr/asset/36837788): OPEN-BY, BFS/OFS; Bezugsjahr 2025.
- [BFS Zivilstandsvergleich im Alter 65](https://statistik.admin.ch/de/asset/36854184), OPEN-BY, BFS/OFS; Bezugsperiode 2018/2023.
- [Martin-Diener et al. 2014](https://doi.org/10.1016/j.ypmed.2014.05.023), Tabelle 2; historische Schweizer Kohorten.
- Historisch: lokale gesundheit.inc (Berechnung Zeilen 413–561), anonyme Referenztabelle lebenserwartung.le; Bezugsperiode unbekannt.

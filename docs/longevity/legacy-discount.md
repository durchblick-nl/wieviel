# Extrahierter Diskontierungsterm des alten Rechners

Geprüft am 6. November 2026 an der lokalen Archivdatei `gesundheit.inc`.
SHA-256 der geprüften Gesamtdatei: `e43ad848d5f070d78a3625522bd109c64a3ee84b8abce520d091a7256ad108ba`.
Fundstelle: Zeilen 549–558; Altersausnahmen Zeilen 741–763.
Die Datei belegt die Umsetzung, nicht die genannte historische Urheberschaft.

## Originalterm und mathematische Form

Die entscheidende Originalzeile 550 lautet:

```php
if ($age > 50) { $lec *= 1.0 - ($age - 50.0)/50.0; }
```

Für das Alter a lautet der Faktor innerhalb des ursprünglich verwendeten Altersbereichs:

- bis einschliesslich 50: `d(a) = 1`
- über 50: `d(a) = (100 − a) / 50`

Es ist eine lineare Altersdämpfung der **gesamten additiven Korrektur**, keine
finanzmathematische Abzinsung zukünftiger Jahre. Derselbe Faktor wirkt auf positive
und negative Korrekturen. Er hängt hier vom aktuellen Alter ab, nicht direkt von der
verbleibenden Lebenserwartung oder der Anzahl zukünftiger Jahre.

| Alter | Faktor | Aus +5 Jahren wird | Aus −5 Jahren wird |
|---|---:|---:|---:|
| 20 | 1,0 | +5,0 | −5,0 |
| 40 | 1,0 | +5,0 | −5,0 |
| 50 | 1,0 | +5,0 | −5,0 |
| 60 | 0,8 | +4,0 | −4,0 |
| 70 | 0,6 | +3,0 | −3,0 |
| 80 | 0,4 | +2,0 | −2,0 |
| 90 | 0,2 | +1,0 | −1,0 |
| 95 | 0,1 | +0,5 | −0,5 |

Die Beispiele zeigen ausschliesslich die Dämpfung, vor Anwendung der folgenden Grenzen.

## Reihenfolge und weitere Grenzen

1. Die historischen Gruppenwerte werden zu einer Korrektur C in Jahren addiert.
2. Diese Gesamtkorrektur wird mit `d(a)` multipliziert.
3. Positive Ergebnisse werden auf höchstens +12 Jahre begrenzt. Es gibt an dieser
   Stelle keine spiegelbildliche Begrenzung auf −12 Jahre.
4. Zu den amtlichen beziehungsweise damaligen Grund-Restjahren B kommt diese
   Korrektur hinzu. Das Ergebnis beträgt mindestens `B / 4`.

Zusammen: `R = max(B / 4, B + min(12, C × d(a)))` für den alten Erwachsenenpfad.
Bei B = 25, Alter 60 und C = −2 entstehen 23,4 Restjahre. Bei C = +30 greift
statt +24 die Obergrenze +12; bei C = −80 greift die Untergrenze 6,25 Restjahre.
Die separate Begrenzung der genetischen Gruppe und die frühere Berechnung der
Gruppenwerte liegen **vor** diesem Term und sind nicht Teil der Diskontfunktion.

Unter 13 und über 95 setzt der alte Rechner die personalisierten Restjahre später
wieder auf den Grundwert. Eine Fortsetzung der Geraden bis null bei 100 ist daher
keine im Original veröffentlichte Individualrechnung für Hundertjährige.

## Extraktion für Entwicklungsarbeit

`scripts/lib/longevity-legacy-discount.cjs` exportiert `ageDiscount` und
`applyLegacyCorrection`. Die historische Vergleichsrechnung verwendet diese
Extraktion bereits; die bisherigen acht Original-PHP-Referenzfälle bleiben gleich.
Die isolierte Funktion erlaubt einen Prüfbereich von 0–120; das vollständige
historische Vergleichsmodell bleibt auf ganze Alter 13–95 beschränkt.

```js
const {ageDiscount, applyLegacyCorrection} = require('./scripts/lib/longevity-legacy-discount.cjs');
ageDiscount(80); // 0.4 (bis auf normale Gleitkommarundung)
applyLegacyCorrection(25, 60, -2).remainingYears; // 23.4
// Explizites Forschungsszenario: Dämpfung ab 60, null bei 110:
ageDiscount(80, {fullUntil: 60, zeroAt: 110}); // 0.6
```

Parameter `fullUntil`, `zeroAt`, `positiveCap` und `minimumFraction` können für
gekennzeichnete Entwicklungsvergleiche verändert werden. Die historischen
Standardwerte bleiben 50, 100, 12 und 0,25. Eine Modifikation ist dadurch nicht
medizinisch validiert. Seit `joint-survival-2` wird der reine Altersfaktor in der öffentlichen Rechnung
für die **gemeinsame Lebensstil-Abweichung** verwendet. Persönliche und
Referenz-Überlebenskurve werden im Verhältnis `d(a)` zu `1−d(a)` gemischt.
Die SBMI-Korrektur wird danach ohne weitere Dämpfung angewandt. Es werden keine
historischen additiven Gruppenregeln, +12-Jahre-Obergrenze oder Viertel-Untergrenze
auf das heutige Modell übertragen. Diese Anpassung ist eine explizite eigene
Modellannahme, keine medizinisch validierte Übernahme aus MPoRT.

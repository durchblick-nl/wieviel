# Wiederverwendung der originalen Smart-BMI-Berechnung

Stand: 5. November 2026.

Die Erwachsenenberechnung übernimmt die Tabellen und numerischen Regeln aus dem
benachbarten Projekt `smart-bmi` (SBMIC 2.7). Die Quellrevision und SHA-256-Prüfsumme
der vollständigen Originaltabelle stehen in `data/longevity-smart-bmi.json`.
Urheber des Modells: Christian Bachmann, David Fäh und Heinrich von Grünigen.
Öffentliche Erläuterung: https://de.smartbmicalculator.com/ und
https://fr.smartbmicalculator.com/.

## Bewusst begrenzter Umfang

- Alter 18–99, cm/kg, beide im ursprünglichen Modell verfügbaren Geschlechtskategorien.
- Referenztabelle pro ganzzahligem Alter. Wie im Original wird oberhalb 95 die
  Tabelle für 95-Jährige verwendet; die Oberfläche erklärt diese Begrenzung.
- Keine optionale Herkunftsanpassung, keine historischen Empfehlungstexte und
  keine Kinderberechnung. Diese Angaben werden im Lebenserwartungsrechner nicht erhoben.
- Originale Rundung: Gewicht auf 0,5 kg, Körpergrösse auf 0,001 m, BMI auf eine
  Dezimalstelle, Interpolation auf zwei Dezimalstellen, SBMI auf ganze Punkte.
- Der daneben angezeigte klassische BMI verwendet die eingegebenen Werte ohne
  vorherige Rundung; kleine Abweichungen zum intern gerundeten BMI sind möglich.
- 30–39 Punkte bezeichnen den mittleren Modellbereich, keine Diagnose oder
  individuell gemessene Gesundheitswahrscheinlichkeit.

133 unveränderte metrische Erwachsenenfälle aus den ursprünglichen PHP-Referenzfällen
prüfen BMI, SBMI und interpoliertes Band. Die vollständigen 474 historischen Fälle
bleiben im Ursprungsprojekt unverändert. In wieviel werden zusätzlich Eingabegrenzen,
Altersabhängigkeit und die Begrenzung auf die 95er-Tabelle geprüft. Browserchecks
prüfen beide Sprachfassungen und den Gewichtsregler.

## Lebenserwartung ist eine eigene Rechnung

Smart BMI liefert keine Rechengewichte für eine Sterbetafel. Auf ausdrücklichen
Nutzerwunsch bestimmt der SBMI trotzdem den Gewichtseinfluss in der experimentellen
Jahresheuristik. Das ist unsere eigene Verknüpfung, kein publizierter Mortalitätskoeffizient:

- SBMI 30–39 ist neutral, ohne automatischen Jahresbonus.
- Abstand = max(30 − SBMI, SBMI − 39, 0), auf Basis des angezeigten ganzzahligen SBMI.
- Korrektur = −BFS-Restlebenserwartung × min(0,08, Abstand × 0,004).
- Derselbe Abstand bedeutet denselben prozentualen Anteil am amtlichen Restjahreswert.
- Keine zusätzliche Altersdämpfung für das Gewicht; die übrigen Faktoren behalten ihre bisherige Altersdämpfung.
- Die Korrektur ersetzt die alten BMI-Zuschläge und -Abschläge vollständig. Kein Doppelzählen.
- Auch sehr niedrige und sehr hohe Werte bleiben auf maximal 8 % des BFS-Restjahreswerts begrenzt;
  oberhalb BMI 40 wird der Abschlag nicht mehr versehentlich als unbekannt ausgelassen.
- Unvollständige oder ungültige Körperdaten bleiben unbekannt; über 95 bleibt nur der BFS-Grundwert.

Bei einem BFS-Grundwert von 25 Restjahren entspricht die Begrenzung 2 Jahren.
Bei 10 Restjahren entspricht sie 0,8 Jahren. Die lineare Abstufung und die Neutralität des mittleren Bereichs
sind Gestaltungsentscheidungen dieses Rechenexperiments. Sie sind weder auf die
Schweizer Bevölkerung kalibriert noch als persönliche oder kausale Jahresverluste
validiert. Die Symmetrie bedeutet keine nachgewiesene gleiche Mortalität von
Unter- und Übergewicht. Der BFS-Vergleich bleibt unverändert. Ein gemeinsames
Überlebensmodell für die Lebensstilfaktoren ist weiterhin nicht implementiert.

Die Forschung von David Fäh zur Bestimmung eines biologischen Alters
(https://www.davidfaeh.ch/fileadmin/documents/Person/Diss130301.pdf) ist historischer
Kontext. Sie ist keine prospektive Validierung dieses Lebenserwartungsrechners.
Die Präsentation zur Verbreitung von Übergewicht von 2010 und der vom Nutzer genannte
Blick-Artikel über Smart BMI liefern ebenfalls keine direkt übernehmbaren jährlichen
Sterberaten. Sie rechtfertigen keine zusätzliche SBMI-zu-Lebensjahre-Formel.

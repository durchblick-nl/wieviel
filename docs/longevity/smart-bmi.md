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

Smart BMI liefert keine Rechengewichte für eine Sterbetafel. Deshalb wird der
SBMI weder in Lebensjahre umgerechnet noch zusätzlich auf die bisherige BMI-Korrektur
aufgeschlagen. Die bestehende experimentelle Jahresheuristik reagiert weiterhin auf
Gewicht. Ein gemeinsames Überlebensmodell für die Lebensstilfaktoren ist damit noch
nicht implementiert oder wissenschaftlich validiert.

Die Forschung von David Fäh zur Bestimmung eines biologischen Alters
(https://www.davidfaeh.ch/fileadmin/documents/Person/Diss130301.pdf) ist historischer
Kontext. Sie ist keine prospektive Validierung dieses Lebenserwartungsrechners.
Die Präsentation zur Verbreitung von Übergewicht von 2010 und der vom Nutzer genannte
Blick-Artikel über Smart BMI liefern ebenfalls keine direkt übernehmbaren jährlichen
Sterberaten. Sie rechtfertigen keine zusätzliche SBMI-zu-Lebensjahre-Formel.

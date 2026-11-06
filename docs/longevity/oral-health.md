# Optionales Mundgesundheitsprofil

Stand: 6. November 2026.

Der ausklappbare Bereich auf der Ergebnis-Seite erhebt freiwillig eigene Zähne
(0–28, ohne Weisheitszähne), Zahnersatz, Kauprobleme und eine zahnärztlich
festgestellte Parodontitis. Kronen auf eigenen Zahnwurzeln zählen als eigene
Zähne; Implantate, Brückenglieder und Prothesenzähne nicht.

Die Werte bleiben ausschließlich in den Formularfeldern des aktuellen Fensters.
Sie werden weder gespeichert noch in URLs, Analyseereignisse oder das
Überlebensmodell übernommen. Ein eigener Reset löscht nur diese Angaben.
Die Ergebnis-Zusammenfassung gibt ausschließlich die Selbstauskunft wieder,
ohne Risikokategorie, Diagnose, biologisches Alter oder Jahreskorrektur.

## Statistischer Kontext

Quelle: *Tooth loss and denture status: results of the 6th German Oral Health
Study (DMS • 6)*, 2025: <https://pubmed.ncbi.nlm.nih.gov/40091723/>.

- Alter 35–44: durchschnittlich 26,6 vorhandene eigene Zähne.
- Alter 65–74: durchschnittlich 19,3 vorhandene eigene Zähne; 5 % zahnlos.

Nur innerhalb der jeweiligen Altersgruppe wird der Vergleich angezeigt. Es gibt
keine Interpolation oder Extrapolation. Deutsche Gruppendurchschnitte sind keine
gesundheitlichen Sollwerte, Schweizer Referenzen oder biologische Altersnormen.
Ältere DMS-V-Ergebnisse und Durchschnitte ausschließlich bezahnter Personen
werden nicht mit diesen Angaben vermischt.

## Voraussetzung für eine spätere Modellverknüpfung

Erforderlich wären eine geeignete gemeinsame Modellgleichung, dokumentierte
Adjustierung für bereits berücksichtigte Faktoren und eine Prüfung der
Übertragbarkeit auf die Zielgruppe. Eine beobachtete Assoziation zwischen
Zahnverlust und Mortalität allein begründet keine zusätzliche Jahreskorrektur.

## Verifikation

Der Browser-Regressionsfall in `tests/browser.cjs` prüft beide Sprachen, null
Zähne gegenüber fehlenden Angaben, Eingabegrenzen, unveränderte Szenarien und
Überlebenskurven, Altersgruppenwechsel, Reset und das Leeren nach Neuladen.

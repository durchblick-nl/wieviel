# Elternalter: implementierter Forschungsadapter

Stand: 6. November 2026. Die öffentliche Jahresrechnung ist noch nicht erweitert.

Die interne Eingabe unterscheidet Mutter und Vater, lebend, verstorben und unbekannt.
Ein aktuelles Alter ist eine rechtszensierte Beobachtung, kein endgültiges Sterbealter.
Todesursachen bleiben grob: Krankheit, äussere Ursache, unbekannt. Das sind technische
Kategorien ohne krankheitsspezifische Koeffizienten. Biologische Verwandtschaft wird
explizit bestätigt; Adoptiveltern werden nicht als genetischer Prädiktor ausgewertet.

Der Adapter `scripts/lib/longevity-parents-review.cjs` ist in der internen CLI
`scripts/review_longevity_parents.cjs` ausführbar; `--json` gibt strukturierte Fälle aus.
[Beispielausgabe](parental-comparison.md). Ungültige oder widersprüchliche Angaben
lösen Fehler aus. Unbekannt erhält weder einen Bonus noch einen Malus. Noch lebende
Eltern werden als zensiert erhalten, aber es wird keine zukünftige Lebensdauer erfunden.

## Öffentliche Originalquelle und Grenzen

[Atkins et al., 2016, JACC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12159424/),
DOI 10.1016/j.jacc.2016.05.072. Das Quellenregister enthält die geprüften Grenzen,
Koeffizienten und Adjustierungsvariablen. Es wurden 55- bis 73-Jährige mit verstorbenen
Eltern untersucht; die berichteten linearen Dekadenkontraste betreffen elterliche
Sterbealter ab 70. Sie werden separat wiedergegeben, nicht miteinander multipliziert.

Eine Modellierung noch lebender Eltern, ein krankheitsspezifischer Jahresabzug,
eine gemeinsame Eltern-/Lebensstilverteilung und eine kalibrierte absolute
Überlebensrechnung sind damit nicht verfügbar. `source_context_only` bedeutet
nur, dass keine der geprüften Quellenausschlüsse greift, **nicht** dass ein verwendbarer
Prädiktor geschätzt ist. Der Bericht gibt deshalb keine erweiterten Restjahre aus.
Sehr frühe oder externe Todesfälle erhalten keinen genetischen Standardmalus.

## Noch erforderliche Integration

- Ein gemeinsames Modell mit Lebensstil und Elternstatus aus geeigneten öffentlichen
  Daten schätzen; Datenzugang bleibt auf öffentliche Quellen beschränkt.
- Zensierte Elternalter integrieren, zeitlich spätere Elterninformationen nicht als
  ursprüngliche Ausgangsmerkmale verwenden und fehlende Angaben separat behandeln.
- Zusätzlichen Vorhersagenutzen sowie Alters-/Kohorteneffekte prüfen. Unabhängig
  voneinander publizierte Mutter-/Vater-HRs ersetzen diesen Schritt nicht.
- Nach Kalibrierung die wirksamen Fragen in DE/FR und die Ergebnisbeiträge ergänzen.

Die Quellen zu Elternalter, Zähnen und Einbeinstand stehen bereits im Quellenteil
beider Inhaltsdateien, mit ausdrücklicher Kennzeichnung als noch nicht verwendete
Erweiterungen. Bestehende MPoRT-/BFS-Rechenquellen bleiben unverändert.

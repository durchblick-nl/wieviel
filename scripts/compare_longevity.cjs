'use strict';

// Reproduce the report with: node scripts/compare_longevity.cjs
const fs = require('node:fs');
const path = require('node:path');
const { baseline, survival } = require('../static/js/longevity-core.js');
const { legacy, studyRelativeHazard } = require('./lib/longevity-models.cjs');
const data = require('../static/data/life-tables.json');
const old = require('../tests/fixtures/longevity-legacy-table.json');
const study = require('../data/longevity-study.json');
const marital = require('../static/data/life-marital-comparison.json');
const decimal = value => value.toFixed(2).replace('.', ',');
const profiles = [
    { name: 'Nur Grundwert / Lebensstil unbekannt', legacy: {}, study: null },
    { name: '20 Zigaretten/Tag, sonst wie Referenz', legacy: { df2: -4, ex: 2, bf4: 1 },
        study: { smoker: true, lowActivity: false, noFruitYesterday: false, alcoholYesterday: 'none' } },
    { name: '20 Zigaretten/Tag + wenig Bewegung + kein Obst + viel Alkohol',
        legacy: { df2: -4, ex: -2, df1: -3 },
        study: { smoker: true, lowActivity: true, noFruitYesterday: true, alcoholYesterday: 'high' } },
    { name: 'Nichtraucher, aktiv, Obst, kein Alkohol', legacy: { df2: 2, ex: 2, bf4: 1 },
        study: { smoker: false, lowActivity: false, noFruitYesterday: false, alcoholYesterday: 'none' } }
];
const lines = [
    '# Lebenserwartung: Vergleichsrechnungen', '',
    'Generiert mit `node scripts/compare_longevity.cjs`. Interne Modellprüfung, keine persönliche Prognose.', '',
    'Die ersten beiden Varianten ändern nur die Basistabelle. Die dritte zeigt ausschließlich relative',
    'Hazards aus einem gemeinsam geschätzten Studienmodell; ohne aktuelle Kalibrierung gibt es dafür keine Jahreszahl.', '',
    'Die Lebensstilkategorien sind nur näherungsweise gegenübergestellt: «20 Zigaretten» entspricht in der Studie',
    'nur «aktuell rauchend». Der alte Alkoholwert −3 steht für sechs damalige Standardportionen täglich,',
    'die Studie erfasst hohen Konsum am Vortag. Das ist kein identischer Expositionsvergleich.', '',
    '| Alter | Geschlecht | Profil | Alter Grundwert: Restjahre | BFS 2025: Restjahre | Alt + alte Regeln | BFS + alte Regeln | Studien-HR vs. Referenz |',
    '|---|---|---|---:|---:|---:|---:|---:|'
];
for (const age of [40, 60, 80]) {
    for (const sex of ['male', 'female']) {
        const previous = old.rows[age][sex];
        const current = baseline(data, sex, age);
        for (const profile of profiles) {
            const a = legacy(previous, age, sex, profile.legacy);
            const b = legacy(current.remainingYears, age, sex, profile.legacy);
            const c = profile.study ? decimal(studyRelativeHazard(study, sex, profile.study).relativeHazard) : 'unbekannt';
            lines.push(`| ${age} | ${sex === 'male' ? 'M' : 'F'} | ${profile.name} | ${decimal(previous)} | ${decimal(current.remainingYears)} | ${decimal(a.remainingYears)} | ${decimal(b.remainingYears)} | ${c} |`);
        }
    }
}
lines.push('', '## Bedingtes Überleben ab Alter 60', '',
    '| Geschlecht | Restjahre laut BFS E(X) | Durchschnittsalter | Wahrscheinlichkeit 80 zu erreichen | Wahrscheinlichkeit 90 zu erreichen | Median-Altersintervall |',
    '|---|---:|---:|---:|---:|---|');
for (const sex of ['male', 'female']) {
    const result = baseline(data, sex, 60);
    lines.push(`| ${sex === 'male' ? 'M' : 'F'} | ${decimal(result.remainingYears)} | ${decimal(result.expectedAge)} | ${decimal(100 * survival(data, sex, 60, 80))} % | ${decimal(100 * survival(data, sex, 60, 90))} % | ${result.medianAgeInterval.join('–')} |`);
}
lines.push('', '## Amtlicher Gruppenvergleich nach Zivilstand, Alter 65', '',
    'BFS 2018/2023, separat vom Grundwert 2025. Restlebensjahre, kein Heiratseffekt.', '',
    '| Zivilstand | Männer | Frauen |', '|---|---:|---:|');
for (const [label, status] of [['Gesamt', 'total'], ['Ledig', 'single'], ['Verheiratet', 'married'], ['Verwitwet', 'widowed'], ['Geschieden', 'divorced']]) {
    const row = marital.periods['2018/2023'][status];
    lines.push(`| ${label} | ${decimal(row.male)} | ${decimal(row.female)} |`);
}
lines.push('', 'Verheiratet versus ledig: +4,4 Jahre (M) / +3,7 Jahre (F). Gegenüber der Gesamtbevölkerung',
    'derselben Periode sind es +1,0 / +1,5 Jahre. Diese unterschiedlichen Referenzen dürfen nicht verwechselt werden.', '',
    '## Erkenntnisse', '',
    '- Bei unverändertem Profil ist die Differenz der ersten beiden Jahresergebnisse in diesen Fällen allein der Datenwechsel.',
    '- Die alten Lebensstil-Zu-/Abschläge bleiben dabei exakt gleich; aktuellere Basisdaten validieren sie nicht.',
    '- Für unbekannten Lebensstil wird keine günstige Studienreferenz eingesetzt.',
    '- Studien-HR bezeichnet das Verhältnis momentaner Sterberaten, keine Todeswahrscheinlichkeit und keinen Jahresverlust.',
    '- Das Produkt aller vier Haupteffekte ergibt für Männer ' + decimal(studyRelativeHazard(study, 'male', profiles[2].study).relativeHazard) +
        ', für Frauen ' + decimal(studyRelativeHazard(study, 'female', profiles[2].study).relativeHazard) +
        '. Die separat berichteten All-vier-Kontraste sind 2,41 bzw. 2,46; sie werden nicht als identische Schätzer behandelt.',
    '- Historische Rechnungen sind auf ganzzahlige Alter 13–95 beschränkt. Keine Reproduktion der alten Texte oder Eingabefehler.',
    '- Die BFS-Kurve endet bei 99 mit positiver Überlebenswahrscheinlichkeit; sie wird nicht künstlich auf null gezogen.', '',
    '## Quellen', '',
    '- [BFS Männer, CSV](https://statistik.admin.ch/fr/asset/36837789), [BFS Frauen, CSV](https://statistik.admin.ch/fr/asset/36837788): OPEN-BY, BFS/OFS; Bezugsjahr 2025.',
    '- [BFS Zivilstandsvergleich im Alter 65](https://statistik.admin.ch/de/asset/36854184), OPEN-BY, BFS/OFS; Bezugsperiode 2018/2023.',
    '- [Martin-Diener et al. 2014](https://doi.org/10.1016/j.ypmed.2014.05.023), Tabelle 2; historische Schweizer Kohorten.',
    '- Historisch: lokale gesundheit.inc (Berechnung Zeilen 413–561), anonyme Referenztabelle lebenserwartung.le; Bezugsperiode unbekannt.', '');
const target = path.join(__dirname, '../docs/longevity/comparison.md');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, lines.join('\n'));
console.log(`Generated ${target}`);

'use strict';
// node scripts/review_longevity_parents.cjs [--json]
const {assessParents, publishedDecadeContrast, evidence} = require('./lib/longevity-parents-review.cjs');
const deceased = age => ({status: 'deceased', age, cause: 'illness'});
const base = {age: 60, biologicalParents: true, father: deceased(80)};
const cases = [
    ['Mutter lebt, 65 (Person 40)', {...base, age: 40, mother: {status: 'alive', age: 65}}],
    ['Mutter verstorben, 65', {...base, mother: deceased(65)}],
    ['Mutter verstorben, 80', {...base, mother: deceased(80)}],
    ['Mutter verstorben, 90', {...base, mother: deceased(90)}],
    ['Mutter Unfalltod, 55', {...base, mother: {status: 'deceased', age: 55, cause: 'external'}}],
    ['Eltern unbekannt', {age: 60}]
];
const report = {version: evidence.version, productionEligible: false,
    publishedSeparateDecadeContrasts: {mother: publishedDecadeContrast('mother'), father: publishedDecadeContrast('father')},
    profiles: cases.map(([label, input]) => ({label, input, assessment: assessParents(input)}))};
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
else {
    const lines = ['# Interne Prüfung: Elternalter', '', 'Generiert mit `node scripts/review_longevity_parents.cjs`.', '',
        '| Beispiel | Einordnung | Erweiterte Restjahre |', '|---|---|---|'];
    for (const row of report.profiles) lines.push(`| ${row.label} | ${row.assessment.sourceStatus} | nicht berechenbar |`);
    lines.push('', 'Die veröffentlichte +10-Jahre-Assoziation bleibt separat: Mutter HR 0,84 (0,79–0,89),',
        'Vater HR 0,83 (0,78–0,89). Keine Multiplikation, keine Lebensjahresumrechnung.', '',
        `[Originalquelle](${evidence.source.url}). Nicht im öffentlichen Rechner verwendet.`);
    process.stdout.write(lines.join('\n') + '\n');
}

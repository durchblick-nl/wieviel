'use strict';

// node scripts/review_longevity_predictors.cjs [--json]
// Prints reproducible review results; no downloaded individual records needed.
const {personalEstimate} = require('../static/js/longevity-survival.js');
const {assessCandidates, evidence} = require('./lib/longevity-predictor-review.cjs');
const data = require('../static/data/life-tables.json');
const model = require('../data/longevity-survival-model.json');
const smartBmi = require('../data/longevity-smart-bmi.json');
const answers = {smoking: 'no', moderateMinutes: 150, vigorousMinutes: 0,
    fruitFrequency: 3, juiceFrequency: 0, carrots: 'yes', potatoFrequency: 2,
    drinksWeek: 0, binge: 'no', height: 175, weight: 75};
const profiles = [];
for (const age of [40, 60, 80]) {
    for (const sex of ['male', 'female']) {
        const current = personalEstimate(data, model, sex, age, answers, smartBmi, false);
        for (const [teeth, balance] of [[28, 'passed'], [0, 'failed'], [null, 'not_tested']]) {
            profiles.push({age, sex, teeth, balance, currentRemainingYears: current.remainingYears,
                assessment: assessCandidates({age, teeth, balance, protocol: 'clinimex-10s', stableGait: true})});
        }
    }
}
const report = {version: evidence.version, checkedOn: evidence.checkedOn,
    currentModelVersion: model.version, answers, productionEligible: false, profiles};
if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
    const lines = ['# Interne Prüfung: Zähne und Einbeinstand', '',
        'Generiert mit `node scripts/review_longevity_predictors.cjs`.', '',
        'Bestehendes experimentelles Modell; keine neue Individualprognose. Detailliertes internes Referenzprofil,',
        'nicht die vereinfachte öffentliche Einzelfrage. Referenzprofil: Nichtraucher,',
        '150 mässige Bewegungsminuten/Woche, 0 intensive Minuten, Obst/Gemüse 3-mal/Tag, kein Saft,',
        'Karotten ja, Kartoffeln 2-mal/Woche, kein Alkohol, kein Rauschtrinken, 175 cm, 75 kg.', '',
        '| Alter | Geschlecht | Eigene Zähne | 10-s-Test | Bisherige Restjahre | Studien-HR Balance* | Erweiterte Restjahre |',
        '|---|---|---|---|---:|---|---|'];
    for (const row of profiles) {
        const contrast = row.assessment.balance.sourceCohortContrast;
        const hr = contrast ? contrast.reference ? '1 (Studienreferenz)' : `${contrast.hazardRatio} (${contrast.ci95.join('-')})`
            : row.assessment.balance.status;
        lines.push(`| ${row.age} | ${row.sex} | ${row.teeth ?? 'unbekannt'} | ${row.balance} | ${row.currentRemainingYears.toFixed(2)} | ${hr} | nicht berechenbar |`);
    }
    lines.push('', '*Nur Kontrast in der Originalkohorte, kein Faktor für die bestehende Jahreszahl.',
        'Zahnzahl unbekannt ist nicht null Zähne; ein nicht durchgeführter Test ist kein Nichtbestehen.',
        'Fehlende neue Jahreszahlen sind nicht als null Jahre oder als unveränderte Prognose zu interpretieren.', '',
        '## Offene Voraussetzungen', '', ...evidence.releaseBlockers.map(reason => `- ${reason}`));
    process.stdout.write(lines.join('\n') + '\n');
}

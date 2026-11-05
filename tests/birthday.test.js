const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../static/js/birthday-core');
const data = require('../static/data/birthdays.json');

test('birthday snapshot reconciles to complete annual totals and date occurrences', () => {
    const { days, _meta: meta } = data;
    assert.equal(Object.keys(days).length, 366);
    assert.equal(Object.values(days).reduce((sum, row) => sum + row.births, 0), meta.totalBirths);
    assert.equal(Object.values(meta.annualTotals).reduce((a, b) => a + b, 0), meta.totalBirths);
    let dates = 0, leapDays = 0;
    for (let year = meta.startYear; year <= meta.endYear; year++) {
        dates += core.leap(year) ? 366 : 365;
        if (core.leap(year)) leapDays++;
    }
    assert.equal(meta.observationCount, dates);
    for (const [date, row] of Object.entries(days)) {
        assert.equal(row.occurrences, date === '02-29' ? leapDays : meta.endYear - meta.startYear + 1);
        assert.ok(Number.isInteger(row.births) && row.births > 0);
        const [month, day] = date.split('-').map(Number);
        assert.equal(core.key(month, day), date);
    }
});

test('ranking handles ties and duels compare counts, not rank gaps', () => {
    const rows = core.ranking({ '01-01': { births: 30 }, '01-02': { births: 30 }, '01-03': { births: 10 } });
    assert.deepEqual(rows.map(r => r.rank), [1, 1, 3]);
    assert.equal(core.duel(rows[0], rows[1]).winner, null);
    assert.equal(core.duel(rows[0], rows[2]).winner.date, '01-03');
    assert.equal(core.duel(rows[0], rows[2]).difference, 20);
});

test('Gregorian leap years and invalid month/day input', () => {
    assert.equal(core.leap(2000), true);
    assert.equal(core.leap(2100), false);
    for (const [m, d] of [[0, 1], [13, 1], [4, 31], [2, 30], [1, 0], [1, 1.2]]) assert.equal(core.key(m, d), null);
    assert.equal(core.key(2, 29), '02-29');
});

test('weekend forecast includes today, excludes past dates and skips 2100 leap day', () => {
    assert.equal(core.upcoming(11, 5, new Date(2026, 10, 5), 1)[0].toISOString().slice(0, 10), '2026-11-05');
    assert.equal(core.upcoming(11, 4, new Date(2026, 10, 5), 1)[0].getUTCFullYear(), 2027);
    const years = core.upcoming(2, 29, new Date(2096, 2, 1), 8).map(d => d.getUTCFullYear());
    assert.equal(years[0], 2104);
    assert.ok(!years.includes(2100));
});

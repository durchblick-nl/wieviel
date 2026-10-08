const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('every calculator type has complete bilingual status or a valid shared status', () => {
    const statuses = read('data/calculatorStatus.json');
    for (const lang of ['de', 'fr']) {
        for (const entry of fs.readdirSync(path.join(root, 'content', lang), { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            if (entry.name === 'privacy') continue; // Editorial page, not a calculator.
            const directory = path.join(root, 'content', lang, entry.name);
            const file = fs.readdirSync(directory).find(name => /^index\.(html|md)$/.test(name));
            const content = fs.readFileSync(path.join(directory, file), 'utf8');
            const type = content.match(/^type\s*[:=]\s*["']?([\w-]+)/m)?.[1];
            assert.ok(type, entry.name);
            const status = statuses[statuses[type]?.use] || statuses[type];
            assert.ok(status, type);
            assert.ok(status.note[lang], `${type}/${lang}`);
            if (!status.dataset) assert.ok(status.period[lang], `${type}/${lang}`);
        }
    }
});

test('LIK latest month matches the last actual observation', () => {
    const data = read('static/data/lik_index.json');
    const available = Object.entries(data.monthly).flatMap(([year, months]) =>
        Object.entries(months).filter(([, value]) => value !== null).map(([month, value]) => {
            assert.ok(Number.isFinite(value) && value > 0, `${year}-${month}`);
            return `${year}-${month}`;
        })).sort();
    assert.equal(data.lastUpdated, available.at(-1));
    assert.match(data.baseMonth, /^\d{4}-\d{2}$/);
    assert.match(data.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
});

test('bank metadata matches the atomically imported bank records', () => {
    const { _meta, ...banks } = read('static/data/bank_master.json');
    assert.equal(_meta.recordCount, Object.keys(banks).length);
    assert.match(_meta.validOn, /^\d{4}-\d{2}-\d{2}$/);
    for (const [iid, bank] of Object.entries(banks)) {
        assert.match(iid, /^\d{5}$/);
        assert.ok(bank.name);
        assert.equal(bank.clearing, iid);
    }
});

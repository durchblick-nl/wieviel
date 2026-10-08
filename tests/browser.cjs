const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
let browser, server, baseURL = process.env.BASE_URL;
const pageErrors = [];

before(async () => {
    if (!baseURL) {
        const publicDir = path.resolve(process.env.BUILD_DIR || path.join(root, 'public'));
        assert.ok(fs.existsSync(path.join(publicDir, 'de/strom/index.html')), 'Run hugo before browser tests');
        server = http.createServer((req, res) => {
            let pathname = new URL(req.url, 'http://localhost').pathname;
            if (pathname.endsWith('/')) pathname += 'index.html';
            const file = path.join(publicDir, pathname);
            if (!file.startsWith(publicDir + path.sep) || !fs.existsSync(file)) {
                res.writeHead(404); res.end(); return;
            }
            const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
            res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
            fs.createReadStream(file).pipe(res);
        });
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        baseURL = `http://127.0.0.1:${server.address().port}`;
    }
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
});

after(async () => {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    assert.deepEqual(pageErrors, [], 'No uncaught browser errors');
});

async function pageFor(route) {
    const page = await browser.newPage();
    page.on('pageerror', error => pageErrors.push(`${route}: ${error.message}`));
    await page.goto(`${baseURL}/${route}/`);
    return page;
}

test('all 46 language pages render one complete freshness box', async () => {
    const page = await browser.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));
    let checked = 0;
    for (const lang of ['de', 'fr']) {
        for (const dir of fs.readdirSync(path.join(root, 'content', lang), { withFileTypes: true })) {
            if (!dir.isDirectory()) continue;
            if (dir.name === 'privacy') continue; // No calculator freshness box on legal content.
            const response = await page.goto(`${baseURL}/${lang}/${dir.name}/`);
            assert.equal(response.status(), 200);
            assert.ok((await page.title()).length > 0);
            assert.ok((await page.locator('h1').innerText()).length > 3);
            assert.equal(await page.locator('.data-status').count(), 1);
            assert.match(await page.locator('.data-status time').first().getAttribute('datetime'), /^\d{4}-\d{2}-\d{2}$/);
            assert.ok((await page.locator('.data-status strong').innerText()).length > 10);
            checked++;
        }
    }
    assert.equal(checked, 46);
    await page.close();
});

test('DE/FR rent: multiple steps and explanatory table agree', async () => {
    for (const route of ['de/miete', 'fr/loyer']) {
        const page = await pageFor(route);
        await page.locator('#currentRent').fill('1500');
        await page.locator('[data-rate="1.75"]').click();
        assert.match(await page.locator('#mainResult').innerText(), /84.90/);
        assert.match(await page.locator('#resultSub').innerText(), /5.66%/);
        const text = await page.locator('table').innerText();
        assert.match(text, /5.66%/);
        assert.doesNotMatch(text, /5.82%|8.73%|14.55%/);
        await page.locator('[data-rate="1.25"]').click();
        assert.match(await page.locator('#mainResult').innerText(), /0.00/);
        await page.close();
    }
});

test('DE/FR purchasing: unavailable month clears details and blocks sharing, then recovers', async () => {
    const data = JSON.parse(fs.readFileSync(path.join(root, 'static/data/lik_index.json')));
    const [lastYear, lastMonth] = data.lastUpdated.split('-');
    for (const route of ['de/kaufkraft', 'fr/pouvoir-achat']) {
        const page = await pageFor(route);
        await page.waitForFunction(() => document.querySelector('#endYear').value !== '');
        assert.equal(await page.locator('#indexEndDisplay').innerText(), data.monthly[lastYear][lastMonth].toFixed(1));
        // A user can select December in an earlier year, then switch to a year
        // where that month has not yet been published. Keep that choice visible.
        const missing = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))
            .find(month => !data.monthly[lastYear][month]);
        if (missing) {
            await page.selectOption('#endYear', String(Number(lastYear) - 1));
            await page.selectOption('#endMonth', missing);
            await page.selectOption('#endYear', lastYear);
            assert.equal(await page.locator(`#endMonth option[value="${missing}"]`).isDisabled(), true);
            for (const text of await page.locator('#results .value, #mainResult').allTextContents()) assert.equal(text, '—');
            assert.match(await page.locator('#resultSub').innerText(), /fehlen|manquent/);
            assert.equal(await page.locator('#copyBtn').isDisabled(), true);
            await page.locator('.today-btn').click();
            assert.notEqual(await page.locator('#mainResult').innerText(), '—');
            assert.equal(await page.locator('#copyBtn').isDisabled(), false);
        }
        await page.close();
    }
});

test('LIK request failure never displays placeholder calculations', async () => {
    const page = await pageFor('fr/pouvoir-achat');
    await page.route('**/data/lik_index.json?*', route => route.fulfill({ status: 503, body: '{}' }));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#resultSub').textContent.includes('Impossible'));
    assert.equal(await page.locator('#equivalentDisplay').innerText(), '—');
    assert.equal(await page.locator('#copyBtn').isDisabled(), true);
    await page.close();
});

test('IBAN validation messages are translated and valid lookups still work', async () => {
    for (const [lang, checksum, country, length] of [
        ['de', /Prüfsumme falsch/, /Nur Schweizer/, /zu lang/],
        ['fr', /clé de contrôle incorrecte/, /Seuls les IBAN/, /trop long/]
    ]) {
        const page = await pageFor(`${lang}/iban`);
        for (const [value, expected] of [['CH0000700000000000001', checksum], ['DE0000700000000000001', country], ['CH00007000000000000011', length]]) {
            await page.locator('#iban-input').fill(value);
            assert.match(await page.locator('#error-msg').innerText(), expected);
        }
        await page.locator('#iban-input').fill('CH8000700000000000001');
        await page.locator('#result-container').waitFor({ state: 'visible' });
        assert.match(await page.locator('#bank-name').innerText(), /Kantonalbank/);
        await page.close();
    }
});

const sparqlResult = price => JSON.stringify({ results: { bindings: [{ municipalityName: { value: 'Zürich' }, avgPrice: { value: String(price) }, count: { value: '1' } }] } });
test('electricity: year, manual price, stale responses and missing tariff', async () => {
    const page = await pageFor('de/strom');
    assert.match(await page.locator('#priceBasis').innerText(), /2026: 27.70/);
    await page.selectOption('#tariffYear', '2027');
    assert.match(await page.locator('#priceBasis').innerText(), /2027: 26.50/);
    await page.locator('a[onclick*="showManualPrice"]').click();
    await page.locator('#priceSlider').fill('31.4');
    await page.locator('#priceSlider').dispatchEvent('input');
    await page.locator('#customWatts').fill('1000');
    await page.locator('#customHours').fill('1000');
    assert.match(await page.locator('#customResult').innerText(), /314/);
    await page.selectOption('#tariffYear', '2026');
    assert.match(await page.locator('#priceBasis').innerText(), /2026: 31.40/);
    await page.locator('#municipalityMode').click();
    assert.match(await page.locator('#customResult').innerText(), /277/);
    await page.route('https://lindas.admin.ch/query?*', async route => {
        const query = new URL(route.request().url()).searchParams.get('query');
        if (query.includes('"2026"')) await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({ contentType: 'application/sparql-results+json', body: sparqlResult(query.includes('"2026"') ? 99 : 24) }).catch(() => {});
    });
    await page.selectOption('#tariffYear', '2027');
    await page.locator('#municipalityInput').fill('Zürich');
    await page.locator('#municipalityResults button').first().click();
    await page.selectOption('#tariffYear', '2026');
    await page.selectOption('#tariffYear', '2027');
    await page.waitForFunction(() => document.querySelector('#priceBasis').textContent.includes('2027, Zürich: 24.00'));
    await page.waitForTimeout(700);
    assert.doesNotMatch(await page.locator('#priceBasis').innerText(), /99/);
    await page.unroute('https://lindas.admin.ch/query?*');
    await page.route('https://lindas.admin.ch/query?*', route => route.fulfill({ contentType: 'application/sparql-results+json', body: '{"results":{"bindings":[]}}' }));
    await page.selectOption('#tariffYear', '2026');
    await page.waitForFunction(() => document.querySelector('#tariffMessage').textContent.includes('kein Tarif 2026'));
    assert.match(await page.locator('#priceBasis').innerText(), /2026: 27.70/);
    await page.unroute('https://lindas.admin.ch/query?*');
    await page.route('https://lindas.admin.ch/query?*', route => route.fulfill({ status: 503, body: 'Unavailable' }));
    await page.locator('#municipalityInput').fill('Bern');
    await page.waitForFunction(() => document.querySelector('#tariffMessage').textContent.includes('nicht geladen'));
    assert.match(await page.locator('#priceBasis').innerText(), /2026: 27.70/);
    await page.close();
});

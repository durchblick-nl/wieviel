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

test('all 50 language pages render one complete freshness box', async () => {
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
            assert.ok((await page.locator('.data-status strong').innerText()).length > 10, `${lang}/${dir.name}: visible data period`);
            checked++;
        }
    }
    assert.equal(checked, 50);
    await page.close();
});

test('DE/FR longevity: unpublished dental and balance candidates have no public input fields', async () => {
    for (const route of ['de/leben', 'fr/esperance-de-vie']) {
        const page = await pageFor(route);
        assert.equal(await page.locator('#longevity-oral-health, #longevity-teeth, #longevity-oral-form, #longevity-balance').count(), 0);
        await page.close();
    }
});

test('DE/FR longevity: number fields stay visible when the keyboard shrinks and pans the viewport', async () => {
    for (const route of ['de/leben', 'fr/esperance-de-vie']) {
        const page = await pageFor(route);
        await page.setViewportSize({width: 390, height: 844});
        await page.evaluate(() => CookieConsent.acceptCategory('necessary'));
        // Desktop automation has no software keyboard. Model its independent
        // resize and pan before the calculator subscribes to viewport events.
        await page.addInitScript(() => {
            const viewport = new EventTarget();
            Object.assign(viewport, {height: 844, offsetTop: 0});
            Object.defineProperty(window, 'visualViewport', {configurable: true, value: viewport});
        });
        await page.reload();
        await page.locator('.page-header-cta').click();
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-height').focus();
        await page.evaluate(() => {
            Object.assign(visualViewport, {height: 330, offsetTop: 55});
            visualViewport.dispatchEvent(new Event('resize'));
        });
        const assertVisible = async id => {
            await page.waitForFunction(id => {
                const input = document.getElementById(id).getBoundingClientRect();
                const form = document.getElementById('longevity-form').getBoundingClientRect();
                const dialog = document.getElementById('longevity-profile-dialog').getBoundingClientRect();
                return dialog.top >= visualViewport.offsetTop - 1
                    && dialog.bottom <= visualViewport.offsetTop + visualViewport.height + 1
                    && input.top >= form.top && input.bottom <= form.bottom;
            }, id);
        };
        await assertVisible('longevity-height');
        await page.locator('#longevity-height').fill('180');
        await page.locator('#longevity-height').press('Enter');
        await page.locator('#longevity-weight').fill('81.5');
        await assertVisible('longevity-weight');
        assert.equal(await page.locator('#longevity-weight').inputValue(), '81.5');
        await page.evaluate(() => {
            visualViewport.offsetTop = 90;
            visualViewport.dispatchEvent(new Event('scroll'));
        });
        await assertVisible('longevity-weight');
        await page.evaluate(() => {
            Object.assign(visualViewport, {height: 844, offsetTop: 0});
            visualViewport.dispatchEvent(new Event('resize'));
        });
        assert.equal(await page.locator('#longevity-skip-step').isVisible(), true);
        await page.locator('#longevity-next-step').click();
        assert.equal(await page.locator('[data-profile-step="2"]').isVisible(), true);
        await page.close();
    }
});

test('DE/FR longevity: joint survival model, immediate age updates, reversible scenarios and unchanged BFS reference', async () => {
    for (const route of ['de/leben', 'fr/esperance-de-vie']) {
        const page = await pageFor(route);
        await page.setViewportSize({width: 390, height: 844});
        await page.evaluate(() => CookieConsent.acceptCategory('necessary'));
        const years = async () => Number((await page.locator('#longevity-years').innerText()).replace(',', '.'));
        assert.equal(await years(), 25);
        const zeroLabel = route.startsWith('de/') ? '0 Jahre Abweichung' : '0 an d’écart';
        assert.equal(await page.locator('#longevity-scenario-difference').innerText(), zeroLabel);
        assert.equal(await page.locator('.header-row').count(), 1);
        assert.equal(await page.locator('.steps-container .step-card').count(), 3);
        assert.equal(await page.locator('.longevity-links .info-step-card #longevity-sources').count(), 1);
        assert.equal(await page.evaluate(() => document.querySelector('.longevity-links').previousElementSibling.classList.contains('data-status')), true);
        assert.equal(await page.locator('#longevity-result-title').innerText(), route.startsWith('de/') ? 'Dein Szenario' : 'Ton scénario');
        await page.locator('.page-header-cta').click();
        await page.locator('#longevity-age').fill('80');
        assert.equal(await years(), 9.5);
        for (const status of ['married', 'single']) {
            await page.selectOption('#longevity-marital-status', status);
            assert.equal(await years(), 9.5);
            assert.equal(await page.locator('#longevity-scenario-difference').innerText(), zeroLabel);
            assert.match(await page.locator('#longevity-average-plot-value').innerText(), /^9[.,]5/);
        }
        await page.locator('#longevity-age').fill('60');
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-height').fill('180');
        await page.locator('#longevity-height').press('Enter');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'longevity-weight');
        await page.locator('#longevity-weight').fill('81');
        assert.equal(await page.locator('#longevity-sbmi-value').innerText(), '36 / 70');
        assert.equal(await years(), 25);
        await page.locator('#longevity-previous-step').click();
        await page.locator('#longevity-age').evaluate(input => { input.value = '80'; input.dispatchEvent(new Event('input', {bubbles: true})); });
        assert.equal(await page.locator('#longevity-sbmi-value').textContent(), '35 / 70');
        assert.equal(await years(), 9.5);
        await page.locator('#longevity-age').fill('60');
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-next-step').click();
        await page.locator('[data-control="smoking"][data-value="yes"]').click();
        await page.locator('#longevity-cigarettes').fill('20');
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-moderate-minutes').fill('150');
        await page.locator('#longevity-vigorous-minutes').fill('0');
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-fruit-frequency').fill('3');
        await page.locator('[data-control="carrots"][data-value="yes"]').click();
        await page.locator('#longevity-potato-frequency').fill('2');
        await page.locator('#longevity-juice-frequency').fill('1');
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-drinks-week').fill('0');
        await page.locator('[data-control="binge"][data-value="no"]').click();
        await page.locator('#longevity-next-step').click();
        assert.equal(await page.locator('#longevity-profile-dialog').isVisible(), false);
        assert.equal(await years(), 19.3);
        assert.match(await page.locator('#longevity-expected').innerText(), /79[.,]3/);
        const average = await page.locator('#longevity-average-plot-value').innerText();
        assert.match(average, /^25[.,]0/);
        const official = await page.locator('#longevity-line').getAttribute('points');
        const initialPersonal = await page.locator('#longevity-personal-line').getAttribute('points');
        assert.notEqual(initialPersonal, official);
        await page.locator('[data-scenario="activity"]').click();
        const moreActive = await years(); assert.ok(moreActive > 19.3);
        await page.locator('[data-scenario="fruit"]').click();
        assert.ok(await years() > moreActive);
        await page.locator('[data-scenario="smoking"]').click();
        const quitNow = await years(); assert.ok(quitNow > moreActive + 2);
        assert.notEqual(await page.locator('#longevity-personal-line').getAttribute('points'), initialPersonal);
        await page.locator('[data-scenario="weight"]').click();
        await page.locator('#longevity-weight-slider').fill('110');
        assert.equal(await page.locator('#longevity-sbmi-value').innerText(), '48 / 70');
        assert.match(await page.locator('#longevity-sbmi-effect').innerText(), /−0[.,]9/);
        await page.locator('#longevity-next-step').click();
        assert.ok(Math.abs(await years() - (quitNow - .9)) < .11);
        assert.equal(await page.locator('#longevity-average-plot-value').innerText(), average);
        assert.equal(await page.locator('#longevity-line').getAttribute('points'), official);
        await page.locator('#longevity-reset-scenario').click();
        assert.equal(await years(), 19.3);
        assert.equal(await page.locator('#longevity-reset-scenario').isDisabled(), true);
        await page.locator('[data-scenario="weight"]').click();
        await page.locator('#longevity-weight').fill('110');
        await page.locator('#longevity-close-editor').click();
        assert.equal(await years(), 19.3);
        await page.locator('#longevity-edit-profile').click();
        await page.selectOption('#longevity-marital-status', 'married');
        assert.equal(await years(), 19.3);
        await page.selectOption('#longevity-marital-status', 'single');
        assert.equal(await years(), 19.3);
        await page.locator('#longevity-age').fill('60.5');
        await page.locator('#longevity-next-step').click();
        assert.equal(await page.locator('#longevity-error').isVisible(), true);
        await page.locator('#longevity-age').fill('60');
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-next-step').click();
        await page.locator('[data-control="smoking"][data-value="no"]').click();
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-moderate-minutes').fill('300');
        await page.locator('#longevity-next-step').click();
        await page.locator('#longevity-fruit-frequency').fill('5');
        await page.locator('#longevity-close-editor').click();
        for (const key of ['smoking', 'activity', 'fruit']) assert.equal(await page.locator(`[data-scenario="${key}"]`).isVisible(), false);
        assert.equal(await page.locator('#longevity-curve').isVisible(), true);
        assert.equal(await page.locator('#longevity-sources').isVisible(), true);
        assert.equal(await page.locator('#longevity-faq').isVisible(), true);
        assert.equal(await page.locator('#longevity-curve-table tr').first().locator('td').count(), 2);
        await page.locator('#longevity-explanations > summary').click();
        assert.equal(await page.locator('#longevity-contributions li').count(), 5);
        assert.equal(await page.locator('#longevity-marital-plot circle').count(), 10);
        await page.close();
    }
});

test('DE/FR birthdays: ranking, valid dates, calendar, duel, sharing and mobile dark mode', async () => {
    for (const route of ['de/geburtstag', 'fr/anniversaire']) {
        const page = await pageFor(route);
        await page.evaluate(() => CookieConsent.acceptCategory('necessary'));
        assert.equal(await page.locator('.steps-container .step-card').count(), 3);
        assert.equal(await page.locator('.birthday-day').count(), 366);
        await page.selectOption('#birthday-month', '9');
        await page.selectOption('#birthday-day', '25');
        assert.match(await page.locator('#birthday-rank').innerText(), /Rang 1 (von|sur) 366/);
        await page.selectOption('#birthday-day', '30');
        await page.selectOption('#birthday-month', '2');
        assert.equal(await page.locator('#birthday-day').inputValue(), '29');
        assert.equal(await page.locator('#birthday-leap').isVisible(), true);
        const upcoming = await page.locator('#birthday-upcoming li').allTextContents();
        assert.equal(upcoming.length, 8);
        assert.ok(upcoming.every(text => /29/.test(text)));
        await page.selectOption('#duel-month', '2');
        await page.selectOption('#duel-day', '29');
        assert.match(await page.locator('#birthday-duel').innerText(), /Unentschieden|Égalité/);
        await page.locator('[data-date="09-25"]').click();
        assert.equal(await page.locator('#birthday-month').inputValue(), '9');
        assert.equal(await page.locator('[data-date="09-25"]').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('#birthday-leap').isVisible(), false);
        await page.evaluate(() => {
            window.copiedBirthday = '';
            Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedBirthday = text; } } });
        });
        await page.locator('#birthday-copy').click();
        assert.match(await page.evaluate(() => window.copiedBirthday), /#date=09-25/);
        await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.sharedBirthday = data; } }));
        await page.locator('#birthday-share').click();
        assert.match(await page.evaluate(() => window.sharedBirthday.url), /#date=09-25$/);
        await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
        await page.locator('#birthday-copy').click();
        assert.equal(await page.locator('#birthday-copy-fallback').isVisible(), true);
        assert.match(await page.locator('#birthday-copy-fallback').inputValue(), /#date=09-25/);
        await page.locator('[data-date="01-31"]').focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('[data-date="02-01"]').evaluate(el => el === document.activeElement), true);
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#birthday-month').inputValue(), '2');
        assert.equal(await page.locator('#birthday-day').inputValue(), '1');
        await page.goto(`${baseURL}/${route}/#date=02-29`);
        assert.equal(await page.locator('#birthday-day').inputValue(), '29');
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('.dark-mode-toggle').click();
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
        await page.close();
    }
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

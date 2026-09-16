const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workerModule = import('data:text/javascript;base64,' + Buffer.from(
    fs.readFileSync(path.join(__dirname, '../_worker.js'), 'utf8')
).toString('base64'));

test('legacy Pages worker returns localized HTML with status 404 for missing URLs', async () => {
    const { default: worker } = await workerModule;
    for (const [host, lang] of [['wieviel.ch', 'de'], ['calcule.ch', 'fr']]) {
        const env = { ASSETS: { fetch: async request => {
            if (new URL(request.url).pathname === `/${lang}/404.html`) {
                return new Response(`<html lang="${lang}">404</html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }
            return new Response('Missing asset', { status: 404 });
        } } };
        for (const pathname of [`/${lang}/`, '/missing-page/', '/404.html', '/css/missing.css']) {
            const response = await worker.fetch(new Request(`https://${host}${pathname}`), env);
            assert.equal(response.status, 404);
            assert.match(response.headers.get('Content-Type'), /text\/html/);
            assert.equal(await response.text(), `<html lang="${lang}">404</html>`);
        }
        const head = await worker.fetch(new Request(`https://${host}/missing/`, { method: 'HEAD' }), env);
        assert.equal(head.status, 404);
        assert.equal(await head.text(), '');
    }
});

test('legacy Pages worker preserves successful pages and scripts', async () => {
    const { default: worker } = await workerModule;
    const paths = [];
    const env = { ASSETS: { fetch: async request => {
        paths.push(new URL(request.url).pathname);
        return new Response('Existing asset');
    } } };
    for (const pathname of ['/strom/', '/js/rent-calculator.js']) {
        const response = await worker.fetch(new Request(`https://wieviel.ch${pathname}`), env);
        assert.equal(response.status, 200);
        assert.equal(await response.text(), 'Existing asset');
    }
    assert.deepEqual(paths, ['/de/strom/', '/js/rent-calculator.js']);
});

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { percentChange } = require('../static/js/rent-calculator.js');

test('published reference-rate reduction table, including multiple steps', () => {
    // https://www.mietrecht.ch/fileadmin/files/Hypothekarzins/ueberwaelzungssaetze.pdf
    for (const [oldRate, expected] of [[1.25, 0], [1.5, -2.91], [1.75, -5.66],
        [2, -8.26], [2.25, -10.71], [2.5, -13.04], [2.75, -15.25], [3, -17.36]]) {
        assert.equal(percentChange(oldRate, 1.25), expected, String(oldRate));
    }
    assert.equal((1500 * percentChange(1.75, 1.25) / 100).toFixed(2), '-84.90');
});

test('unchanged rates and increases use the corresponding table', () => {
    assert.equal(percentChange(1.75, 1.75), 0);
    assert.equal(percentChange(1.25, 1.5), 3);
    assert.equal(percentChange(1.25, 1.75), 6);
});

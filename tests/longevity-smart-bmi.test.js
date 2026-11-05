'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {calculate} = require('../static/js/longevity-smart-bmi.js');
const data = require('../data/longevity-smart-bmi.json');
const fixtures = require('./fixtures/longevity-smart-bmi.json');

test('adult Smart BMI matches the original PHP reference results', () => {
    assert.equal(fixtures.length, 133);
    for (const {input, expected} of fixtures) {
        const actual = calculate(data, {age: Number(input.ua), sex: input.us === '0' ? 'male' : 'female',
            height: Number(input.hc), weight: Number(input.wk)});
        for (const key of ['bmi', 'sbmi', 'band']) assert.equal(actual[key], expected[key], `${JSON.stringify(input)}: ${key}`);
    }
});

test('Smart BMI rejects missing inputs and preserves the original age-95 ceiling', () => {
    const profile = {age: 60, sex: 'male', height: 180, weight: 90};
    for (const patch of [{age: 17}, {age: 100}, {age: 60.5}, {sex: ''}, {height: null}, {weight: NaN}]) {
        assert.equal(calculate(data, {...profile, ...patch}), null);
    }
    assert.equal(calculate(data, {...profile, age: 99}).sbmi, calculate(data, {...profile, age: 95}).sbmi);
    assert.equal(calculate(data, {...profile, age: 99}).ageClamped, true);
    assert.notEqual(calculate(data, {...profile, age: 30}).sbmi, calculate(data, {...profile, age: 80}).sbmi);
});

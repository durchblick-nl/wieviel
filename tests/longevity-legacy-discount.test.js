'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {ageDiscount, applyLegacyCorrection} = require('../scripts/lib/longevity-legacy-discount.cjs');

test('extracted discount retains the historical boundary and acts symmetrically before caps', () => {
    for (const [age, factor] of [[20,1],[50,1],[60,.8],[80,.4],[95,.1],[100,0],[110,0]]) {
        assert.ok(Math.abs(ageDiscount(age)-factor)<1e-12);
        for (const correction of [-5,5]) {
            assert.ok(Math.abs(applyLegacyCorrection(50,age,correction).appliedCorrection-correction*factor)<1e-12);
        }
    }
    assert.equal(applyLegacyCorrection(25,60,30).remainingYears,37);
    assert.equal(applyLegacyCorrection(25,60,-80).remainingYears,6.25);
});

test('development parameters are explicit and do not alter historical defaults', () => {
    assert.equal(ageDiscount(80,{fullUntil:60,zeroAt:110}),.6);
    assert.ok(Math.abs(ageDiscount(80)-.4)<1e-12);
    assert.equal(applyLegacyCorrection(25,60,30,{positiveCap:5}).remainingYears,30);
    assert.equal(applyLegacyCorrection(25,60,-80,{minimumFraction:.5}).remainingYears,12.5);
    for (const options of [{fullUntil:100,zeroAt:50},{zeroAt:NaN},{fullUntil:-1}]) assert.throws(()=>ageDiscount(60,options),RangeError);
    assert.throws(()=>applyLegacyCorrection(25,60,1,{minimumFraction:2}),RangeError);
    assert.throws(()=>ageDiscount(-1),RangeError);
});

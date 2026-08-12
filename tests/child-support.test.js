const assert = require('node:assert/strict');
const calculator = require('../static/js/child-support-calculator.js');

const adult = (income, basic, extras = {}) => ({
    income, basic, housing: 1500, health: 400, work: 200, other: 0, tax: 0, ...extras
});
const child = (basic = 400) => ({
    basic, housing: 400, health: 120, care: 0, special: 0, allowance: 215, income: 0
});

{
    const result = calculator.calculate({
        maritalStatus: 'unmarried', includeCareSupport: false,
        payer: adult(6000, 1200), carer: adult(3500, 1350), children: [child()]
    });
    assert.equal(result.directTotal, 705);
    assert.equal(result.payerAvailable, 2700);
    assert.equal(Math.round(result.childSurplusTotal), 665);
    assert.equal(Math.round(result.paymentTotal), 1370);
}

{
    const result = calculator.calculate({
        maritalStatus: 'unmarried', includeCareSupport: true,
        payer: adult(4000, 1200), carer: adult(1800, 1350), children: [child(600)]
    });
    assert.equal(result.careShortfall, 1650);
    assert.equal(result.payerAvailable, 700);
    assert.equal(result.paymentTotal, 700);
    assert.equal(result.shortfall, 1855);
}

{
    const result = calculator.calculate({
        maritalStatus: 'married', includeCareSupport: false,
        payer: adult(6500, 1200), carer: adult(4500, 1350), children: [child(), child(600)]
    });
    assert.equal(result.children.length, 2);
    assert.equal(result.allowanceTotal, 430);
    assert.equal(result.childSurplusTotal, 880);
    assert.equal(result.paymentTotal, 2490);
}

console.log('child-support calculator: 3 scenarios passed');

(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.ChildSupportCalculator = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const money = value => Math.max(0, Number(value) || 0);

    function adultNeed(adult) {
        return ['basic', 'housing', 'health', 'work', 'other', 'tax']
            .reduce((sum, key) => sum + money(adult[key]), 0);
    }

    function childNeed(child) {
        const gross = ['basic', 'housing', 'health', 'care', 'special']
            .reduce((sum, key) => sum + money(child[key]), 0);
        const resources = money(child.allowance) + money(child.income);
        return { gross, resources, net: Math.max(0, gross - resources) };
    }

    function allocate(total, weights) {
        const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
        return weights.map(weight => weightTotal ? total * weight / weightTotal : 0);
    }

    function calculate(input) {
        const children = (input.children || []).map(childNeed);
        if (!children.length) throw new Error('At least one child is required.');

        const payerIncome = money(input.payer.income);
        const carerIncome = money(input.carer.income);
        const payerNeed = adultNeed(input.payer);
        const carerNeed = adultNeed(input.carer);
        const payerAvailable = Math.max(0, payerIncome - payerNeed);
        const careShortfall = input.includeCareSupport
            ? Math.max(0, carerNeed - carerIncome)
            : 0;

        const directTotal = children.reduce((sum, child) => sum + child.net, 0);
        const careByChild = allocate(careShortfall, children.map(() => 1));
        const desired = children.map((child, index) => child.net + careByChild[index]);
        const desiredTotal = desired.reduce((sum, value) => sum + value, 0);

        const directFunded = Math.min(payerAvailable, directTotal);
        const directByChild = allocate(directFunded, children.map(child => child.net));
        const afterDirect = Math.max(0, payerAvailable - directFunded);
        const careFunded = Math.min(afterDirect, careShortfall);
        const fundedCareByChild = allocate(careFunded, careByChild);
        const afterMinimum = Math.max(0, payerAvailable - directFunded - careFunded);

        let distributableSurplus = afterMinimum;
        if (input.maritalStatus === 'married') {
            distributableSurplus += Math.max(0, carerIncome - carerNeed);
        }
        const adultShares = input.maritalStatus === 'married' ? 4 : 2;
        const childSurplusTotal = distributableSurplus * children.length / (adultShares + children.length);
        const payableChildSurplus = Math.min(afterMinimum, childSurplusTotal);
        const surplusByChild = allocate(payableChildSurplus, children.map(() => 1));

        const childResults = children.map((child, index) => ({
            grossNeed: child.gross,
            resources: child.resources,
            directNeed: child.net,
            careNeed: careByChild[index],
            minimumDue: desired[index],
            directFunded: directByChild[index],
            careFunded: fundedCareByChild[index],
            surplus: surplusByChild[index],
            payment: directByChild[index] + fundedCareByChild[index] + surplusByChild[index]
        }));

        return {
            payerNeed,
            carerNeed,
            payerAvailable,
            careShortfall,
            directTotal,
            desiredTotal,
            directFunded,
            careFunded,
            childSurplusTotal: payableChildSurplus,
            paymentTotal: childResults.reduce((sum, child) => sum + child.payment, 0),
            allowanceTotal: (input.children || []).reduce((sum, child) => sum + money(child.allowance), 0),
            shortfall: Math.max(0, desiredTotal - directFunded - careFunded),
            children: childResults
        };
    }

    return { calculate, adultNeed, childNeed };
}));

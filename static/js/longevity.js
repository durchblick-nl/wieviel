(function () {
    'use strict';
    const config = JSON.parse(document.getElementById('longevity-config').textContent);
    const core = window.LongevityCore;
    // Keep the local preview bilingual; production keeps its domain-based routing.
    if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
        const alternate = document.querySelector('.language-switcher a');
        if (alternate) alternate.href = config.lang === 'de' ? '/fr/esperance-de-vie/' : '/de/leben/';
        document.querySelector('.tool-nav a').href = `/${config.lang}/`;
    }
    const byId = id => document.getElementById(`longevity-${id}`);
    const number = (value, digits = 1, minimumDigits = digits) => new Intl.NumberFormat(`${config.lang}-CH`, {minimumFractionDigits: minimumDigits, maximumFractionDigits: digits}).format(value);
    const text = (key, values = {}) => config.texts[key].replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
    const svgNS = 'http://www.w3.org/2000/svg';
    const mobile = window.matchMedia('(max-width: 600px)');
    const chart = () => mobile.matches ? {left: 43, right: 345, top: 25, bottom: 180, tickY: 205} : {left: 50, right: 575, top: 30, bottom: 205, tickY: 230};
    const svgNode = (tag, attributes, content) => {
        const node = document.createElementNS(svgNS, tag);
        for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
        if (content !== undefined) node.textContent = content;
        return node;
    };
    let currentResult = null;
    const optionalNumber = id => byId(id).value === '' ? null : Number(byId(id).value);
    function readForm() {
        return {age: optionalNumber('age'), sex: byId('sex').value, smoking: byId('smoking').value,
            cigarettes: optionalNumber('cigarettes'), quitYears: optionalNumber('quit-years'),
            activity: byId('activity').value, fruit: byId('fruit').value, alcohol: byId('alcohol').value,
            marital: byId('marital-status').value, height: optionalNumber('height'), weight: optionalNumber('weight')};
    }
    function validAge() { const age = optionalNumber('age'); return Number.isInteger(age) && age >= 18 && age <= 99 ? age : null; }
    let profile = readForm();
    let overrides = {};
    let step = 0;
    let editorMode = 'profile';
    let previousOverrides = {};
    let editorTrigger = null;
    function drawCurve(result) {
        const dimensions = chart();
        byId('curve').setAttribute('viewBox', mobile.matches ? '0 0 360 225' : '0 0 600 250');
        const x = age => dimensions.left + (dimensions.right - dimensions.left) * (age - result.age) / Math.max(1, 99 - result.age);
        const y = p => dimensions.bottom - (dimensions.bottom - dimensions.top) * p;
        byId('line').setAttribute('points', result.curve.map(row => `${x(row.age)},${y(row.probability)}`).join(' '));
        byId('area').setAttribute('points', `${dimensions.left},${dimensions.bottom} ${byId('line').getAttribute('points')} ${x(99)},${dimensions.bottom}`);
        const otherSex = result.sex === 'male' ? 'female' : 'male';
        const other = core.baseline(config.data, otherSex, result.age);
        byId('comparison-line').setAttribute('points', other.curve.map(row => `${x(row.age)},${y(row.probability)}`).join(' '));
        byId('comparison-line').hidden = !byId('compare').checked;
        byId('comparison-line').style.display = byId('compare').checked ? '' : 'none';
        byId('comparison-legend').hidden = !byId('compare').checked;
        byId('primary-label').textContent = text(result.sex);
        byId('comparison-label').textContent = text(otherSex);
        const grid = byId('grid');
        grid.replaceChildren();
        for (const p of [0, 0.5, 1]) {
            const line = document.createElementNS(svgNS, 'line');
            for (const [key, value] of Object.entries({x1: dimensions.left, x2: dimensions.right, y1: y(p), y2: y(p)})) line.setAttribute(key, value);
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', dimensions.left - 7); label.setAttribute('y', y(p) + 4); label.setAttribute('text-anchor', 'end');
            label.textContent = `${number(p * 100, 0)} %`;
            grid.append(line, label);
        }
        const ticks = [...new Set([result.age, ...[40, 60, 80, 99].filter(age => age > result.age + 4)])];
        for (const age of ticks) {
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', x(age)); label.setAttribute('y', dimensions.tickY); label.setAttribute('text-anchor', 'middle');
            label.textContent = text('chartAge', {age}); grid.append(label);
        }
        if (result.curve.length === 1) {
            // A single published age has no drawable line; do not invent a tail.
            byId('line').setAttribute('points', `${dimensions.left},${dimensions.top} ${dimensions.left + 1},${dimensions.top}`);
        }
        const markers = byId('markers'); markers.replaceChildren();
        for (const row of result.curve.filter(row => [80, 90, 95].includes(row.age) && row.age > result.age)) {
            const circle = svgNode('circle', {cx: x(row.age), cy: y(row.probability), r: 4, fill: 'var(--card-bg)', stroke: 'currentColor', 'stroke-width': 2});
            circle.append(svgNode('title', {}, text('probeValue', {age: row.age, probability: number(row.probability * 100)})));
            markers.append(circle);
        }
        byId('probe').min = result.age;
        byId('probe').value = Math.max(result.age, Number(byId('probe').value));
        byId('probe').disabled = result.age === 99;
        updateProbe();
        const table = byId('curve-table');
        table.replaceChildren();
        for (const row of result.curve) {
            const tr = document.createElement('tr');
            const th = document.createElement('th'); th.scope = 'row'; th.textContent = row.age;
            const td = document.createElement('td'); td.textContent = `${number(row.probability * 100)} %`;
            tr.append(th, td); table.append(tr);
        }
        byId('curve-description').textContent = text('curveDescription', {age: result.age, year: result.year});
        byId('median').textContent = result.medianAgeInterval
            ? text('median', {lower: result.medianAgeInterval[0], upper: result.medianAgeInterval[1]}) : text('noMedian');
    }

    function updateProbe() {
        if (!currentResult) return;
        const target = Number(byId('probe').value);
        const probability = core.survival(config.data, currentResult.sex, currentResult.age, target);
        byId('probe-value').textContent = text('probeValue', {age: target, probability: number(probability * 100)});
        byId('probe').setAttribute('aria-valuetext', byId('probe-value').textContent);
        const dimensions = chart();
        byId('probe-dot').setAttribute('cx', dimensions.left + (dimensions.right - dimensions.left) * (target - currentResult.age) / Math.max(1, 99 - currentResult.age));
        byId('probe-dot').setAttribute('cy', dimensions.bottom - (dimensions.bottom - dimensions.top) * probability);
    }

    function drawMarital() {
        const plot = byId('marital-plot'); plot.replaceChildren();
        const compact = mobile.matches;
        byId('marital-chart').setAttribute('viewBox', compact ? '0 0 360 365' : '0 0 600 270');
        const x = value => compact ? 15 + value / 30 * 330 : 165 + value / 30 * 410;
        for (const years of [0, 10, 20, 30]) {
            plot.append(svgNode('line', {x1: x(years), x2: x(years), y1: 15, y2: compact ? 315 : 220}));
            plot.append(svgNode('text', {x: x(years), y: compact ? 337 : 240, 'text-anchor': 'middle'}, number(years, 0)));
        }
        const rows = [...document.querySelectorAll('#longevity-marital-table tbody tr')];
        const statuses = ['total', 'single', 'married', 'widowed', 'divorced'];
        statuses.forEach((status, index) => {
            const row = config.marital.periods['2018/2023'][status];
            const y = compact ? 45 + index * 62 : 30 + index * 42;
            plot.append(svgNode('text', {x: compact ? 15 : 153, y: compact ? y - 14 : y + 4, 'text-anchor': compact ? 'start' : 'end'}, rows[index].querySelector('th').textContent));
            plot.append(svgNode('line', {x1: x(row.male), x2: x(row.female), y1: y, y2: y, 'stroke-width': 3}));
            for (const sex of ['male', 'female']) {
                const selected = status === byId('marital-status').value && sex === byId('sex').value;
                const dot = svgNode('circle', {cx: x(row[sex]), cy: y, r: selected ? 8 : sex === byId('sex').value ? 5.5 : 4,
                    fill: sex === 'male' ? 'var(--primary-color)' : 'var(--accent-color)'});
                dot.append(svgNode('title', {}, `${text(sex)}: ${number(row[sex])}`)); plot.append(dot);
            }
        });
        plot.append(svgNode('text', {x: compact ? 180 : 370, y: compact ? 360 : 265, 'text-anchor': 'middle'}, text('remainingAxis')));
    }


    function updatePersonal(result, answers) {
        const estimate = core.personalEstimate(config.data, config.heuristic, result.sex, result.age, answers, config.smartBmi);
        byId('years').textContent = number(estimate.remainingYears);
        byId('editor-estimate').textContent = text('appEditorEstimate', {years: number(estimate.remainingYears)});
        byId('expected').textContent = text('expected', {age: number(estimate.expectedAge, 1, 0)});
        byId('personal-context').textContent = !estimate.supported ? text('personalUnsupported')
            : estimate.considered === 0 ? text('personalContext') : text('personalPartial', {count: estimate.considered, total: 6});
        const key = Math.abs(estimate.difference) < 0.05 ? 'relativeNeutral' : estimate.difference > 0 ? 'relativePositive' : 'relativeNegative';
        byId('relative').textContent = text(key, {years: number(Math.abs(estimate.difference)), baseline: number(result.remainingYears)});
        byId('population-value').textContent = text('populationValue', {years: number(result.remainingYears), age: number(result.expectedAge), year: result.year});
        const list = byId('contributions'); list.replaceChildren();
        for (const factor of ['smoking', 'activity', 'fruit', 'alcohol', 'marital', 'bmi']) {
            const li = document.createElement('li');
            const label = document.createElement('span'); label.textContent = text(`factor.${factor}`);
            const value = document.createElement('strong');
            const contribution = estimate.contributions[factor];
            value.textContent = contribution === undefined || !estimate.supported ? text('contributionUnknown')
                : text('contributionValue', {years: `${contribution > 0 ? '+' : contribution < 0 ? '−' : ''}${number(Math.abs(contribution))}`});
            li.append(label, value); list.append(li);
        }
        byId('limits').hidden = !estimate.capApplied && !estimate.floorApplied;
        byId('limits').textContent = text('limitsNote');
        return estimate;
    }

    function render() {
        const result = core.baseline(config.data, profile.sex, profile.age);
        const scenario = updatePersonal(result, {...profile, ...overrides});
        currentResult = result;
        byId('context').textContent = text('context', {age: profile.age, year: result.year});
        byId('profile-label').textContent = text('appProfile', {age: profile.age});
        byId('comparison-note').textContent = text('appComparisonNote', {age: profile.age});
        const delta = scenario.remainingYears - result.remainingYears;
        const deltaKey = Math.abs(delta) < 0.05 ? 'appDifferenceZero' : delta > 0 ? 'appDifference' : 'appDifferenceNegative';
        byId('scenario-difference').textContent = text(deltaKey, {years: number(Math.abs(delta))});
        byId('scenario-difference').classList.toggle('longevity-unchanged', Math.abs(delta) < 0.05);
        const averageText = text('contributionValue', {years: number(result.remainingYears)});
        const scenarioText = text('contributionValue', {years: number(scenario.remainingYears)});
        byId('average-plot-value').textContent = averageText;
        byId('scenario-plot-value').textContent = scenarioText;
        const endY = 21 - Math.max(-15, Math.min(15, delta * 4));
        byId('scenario-dot').setAttribute('cy', endY);
        byId('scenario-connector').setAttribute('y2', endY);
        byId('scenario-chart-title').textContent = text('appScenarioSummary', {average: number(result.remainingYears), scenario: number(scenario.remainingYears)});
        for (const button of document.querySelectorAll('[data-scenario]')) {
            const type = button.dataset.scenario;
            // Suggestions describe changes from the saved profile, not habits already present.
            button.hidden = type === 'smoking' ? profile.smoking === 'no' || (profile.smoking === 'former' && profile.quitYears > 5)
                : type === 'activity' ? profile.activity === 'high' : type === 'fruit' ? profile.fruit === 'yes' : false;
            const active = type === 'smoking' ? Object.hasOwn(overrides, 'smoking') : type === 'activity' ? Object.hasOwn(overrides, 'activity')
                : type === 'fruit' ? Object.hasOwn(overrides, 'fruit') : Object.hasOwn(overrides, 'weight');
            button.setAttribute('aria-pressed', String(active));
        }
        const notes = [];
        if (Object.hasOwn(overrides, 'smoking')) notes.push(text('appSmokeNote'));
        if (Object.hasOwn(overrides, 'weight')) notes.push(text('appSmallChanges'));
        byId('scenario-note').hidden = notes.length === 0;
        byId('scenario-note').textContent = notes.join(' ');
        byId('reset-scenario').disabled = Object.keys(overrides).length === 0;
        byId('marital-context').textContent = profile.age === 65 ? text('maritalAt65') : text('maritalContext');
        for (const cell of document.querySelectorAll('#longevity-marital-table [data-sex]')) cell.classList.toggle('longevity-selected', cell.dataset.sex === profile.sex);
        for (const row of document.querySelectorAll('#longevity-marital-table tr[data-status]')) row.classList.toggle('longevity-selected-status', row.dataset.status === profile.marital);
        byId('selected-marital').hidden = !profile.marital;
        if (profile.marital) {
            const comparison = core.maritalComparison(config.marital, profile.sex, 65, profile.marital);
            const label = byId('marital-status').querySelector(`option[value="${profile.marital}"]`).textContent;
            byId('selected-marital').textContent = text('selectedMarital', {status: label, years: number(comparison.remainingYears)});
        }
        const milestones = byId('milestones'); milestones.replaceChildren();
        const targets = [80, 90, 95].filter(target => target > profile.age);
        for (const target of targets) {
            const box = document.createElement('div');
            const value = document.createElement('strong'); value.textContent = `${number(core.survival(config.data, profile.sex, profile.age, target) * 100, 0)} %`;
            const label = document.createElement('span'); label.textContent = text('milestone', {age: target});
            box.append(value, label); milestones.append(box);
        }
        if (!targets.length) {
            const box = document.createElement('div');
            const value = document.createElement('strong'); value.textContent = `${number((1 - result.nextYearDeathProbability) * 100, 0)} %`;
            const label = document.createElement('span'); label.textContent = text('nextYear');
            box.append(value, label); milestones.append(box);
        }
        byId('milestone-help').textContent = text('milestoneHelp', {age: profile.age});
        drawCurve(result); drawMarital();
    }

    const fieldMap = {age:'age', sex:'sex', smoking:'smoking', cigarettes:'cigarettes', quitYears:'quit-years', activity:'activity', fruit:'fruit', alcohol:'alcohol', marital:'marital-status', height:'height', weight:'weight'};
    function fillForm(values) {
        for (const [key, id] of Object.entries(fieldMap)) byId(id).value = values[key] ?? '';
        syncChoices();
    }
    function syncChoices() {
        for (const button of document.querySelectorAll('[data-control]')) button.setAttribute('aria-pressed', String(byId(button.dataset.control).value === button.dataset.value));
        byId('cigarettes-field').hidden = byId('smoking').value !== 'yes';
        byId('quit-field').hidden = byId('smoking').value !== 'former';
        byId('weight-slider').max = Math.max(200, optionalNumber('weight') || 0);
        byId('weight-slider').value = optionalNumber('weight') || 80;
        const body = core.personalEstimate(config.data, config.heuristic, byId('sex').value, validAge() ?? profile.age, {
            height: optionalNumber('height'), weight: optionalNumber('weight')
        }, config.smartBmi);
        byId('bmi-value').textContent = body.bmi === null ? text('bmiHelp') : text('bmiValue', {bmi: number(body.bmi)});
        const smartBmi = validAge() ? body.smartBmi : null;
        byId('smart-bmi').hidden = smartBmi === null;
        byId('sbmi-value').textContent = smartBmi ? text('sbmiValue', {score: number(smartBmi.sbmi, 0)}) : '';
        byId('sbmi-interpretation').textContent = smartBmi ? text(`sbmi.${smartBmi.category}`)
            + (smartBmi.ageClamped ? ` ${text('sbmiAgeClamped')}` : '') : '';
        const weightEffect = body.contributions.bmi;
        byId('sbmi-effect').textContent = smartBmi ? body.supported
            ? text('sbmiEffect', {years: `${weightEffect <= -0.05 ? '−' : ''}${number(Math.abs(weightEffect))}`})
            : text('sbmiEffectUnsupported') : '';
    }
    function setStep(next) {
        step = Math.max(0, Math.min(4, next));
        for (const section of document.querySelectorAll('[data-profile-step]')) section.hidden = Number(section.dataset.profileStep) !== step;
        byId('progress').value = step + 1;
        byId('step-label').textContent = text('appStep', {step: step + 1, total: 5});
        byId('editor-progress').hidden = editorMode === 'weight';
        byId('skip-step').hidden = step === 0 || editorMode === 'weight';
        byId('next-step').textContent = editorMode === 'weight' ? text('appApplyScenario') : step === 4 ? text('appUseProfile') : text('appNext');
        const heading = document.querySelector(`[data-profile-step="${step}"] h2`);
        heading.tabIndex = -1; heading.focus({preventScroll: true});
        byId('form').scrollTop = 0;
    }
    function resizeEditor() {
        byId('profile-dialog').style.setProperty('--editor-height', `${window.visualViewport ? window.visualViewport.height : window.innerHeight}px`);
    }
    function openEditor(mode, trigger) {
        editorMode = mode; editorTrigger = trigger;
        previousOverrides = {...overrides};
        fillForm(mode === 'weight' ? {...profile, ...overrides} : profile);
        byId('error').hidden = true;
        byId('age').setAttribute('aria-invalid', 'false');
        byId('editor-title').textContent = mode === 'weight' ? text('appScenarioTitle') : text('appEditorTitle');
        byId('weight-slider-field').hidden = mode !== 'weight';
        resizeEditor();
        byId('profile-dialog').showModal();
        setStep(mode === 'weight' ? 1 : 0);
    }
    function validateStep() {
        if (step === 0 && validAge() === null) {
            byId('age').setAttribute('aria-invalid', 'true');
            byId('error').hidden = false; byId('age').focus(); return false;
        }
        byId('age').setAttribute('aria-invalid', 'false');
        byId('error').hidden = true;
        const section = document.querySelector(`[data-profile-step="${step}"]`);
        for (const input of section.querySelectorAll('input')) if (!input.checkValidity()) { input.reportValidity(); return false; }
        if (editorMode === 'weight' && (!optionalNumber('height') || !optionalNumber('weight'))) {
            const missing = !optionalNumber('height') ? byId('height') : byId('weight');
            missing.focus(); return false;
        }
        return true;
    }
    function closeEditor(apply) {
        if (editorMode === 'weight' && !apply) overrides = previousOverrides;
        byId('profile-dialog').close();
        fillForm(profile); render();
        if (editorTrigger) editorTrigger.focus({preventScroll: true});
    }
    function changeForm() {
        syncChoices();
        if (validAge() !== null) { byId('error').hidden = true; byId('age').setAttribute('aria-invalid', 'false'); }
        if (editorMode === 'weight') {
            overrides = {...overrides, height: optionalNumber('height'), weight: optionalNumber('weight')};
        } else if (validAge() !== null) { profile = readForm(); overrides = {}; }
        render();
    }
    for (const button of document.querySelectorAll('[data-control]')) button.addEventListener('click', () => {
        byId(button.dataset.control).value = button.dataset.value; changeForm();
    });
    byId('form').addEventListener('input', changeForm);
    byId('form').addEventListener('change', changeForm);
    byId('height').addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); byId('weight').focus(); }
    });
    byId('form').addEventListener('submit', event => {
        event.preventDefault(); if (!validateStep()) return;
        if (editorMode === 'weight' || step === 4) closeEditor(true); else setStep(step + 1);
    });
    const goBack = () => { if (editorMode === 'weight' || step === 0) closeEditor(false); else setStep(step - 1); };
    byId('previous-step').addEventListener('click', goBack);
    byId('editor-back').addEventListener('click', goBack);
    byId('skip-step').addEventListener('click', () => {
        const fields = step === 1 ? ['height','weight'] : step === 2 ? ['smoking','cigarettes','quit-years'] : step === 3 ? ['activity'] : ['fruit','alcohol'];
        for (const id of fields) byId(id).value = '';
        changeForm(); if (step === 4) closeEditor(true); else setStep(step + 1);
    });
    byId('close-editor').addEventListener('click', () => closeEditor(false));
    byId('profile-dialog').addEventListener('cancel', event => { event.preventDefault(); closeEditor(false); });
    byId('edit-profile').addEventListener('click', event => openEditor('profile', event.currentTarget));
    document.querySelector('.page-header-cta').addEventListener('click', event => { event.preventDefault(); openEditor('profile', event.currentTarget); });
    byId('weight-slider').addEventListener('input', () => { byId('weight').value = byId('weight-slider').value; changeForm(); });
    for (const button of document.querySelectorAll('[data-scenario]')) button.addEventListener('click', () => {
        const type = button.dataset.scenario;
        if (type === 'weight') {
            if (Object.hasOwn(overrides, 'weight')) { delete overrides.weight; delete overrides.height; render(); }
            else openEditor('weight', button);
        } else {
            const key = type === 'smoking' ? 'smoking' : type;
            if (Object.hasOwn(overrides, key)) {
                delete overrides[key];
                if (type === 'smoking') { delete overrides.quitYears; delete overrides.cigarettes; }
            } else if (type === 'smoking') Object.assign(overrides, {smoking: profile.smoking === 'no' ? 'no' : 'former', quitYears: 6, cigarettes: null});
            else overrides[type] = type === 'activity' ? 'high' : 'yes';
            render();
        }
    });
    byId('reset-scenario').addEventListener('click', () => { overrides = {}; render(); });
    byId('compare').addEventListener('change', () => { if (currentResult) drawCurve(currentResult); });
    byId('probe').addEventListener('input', updateProbe);
    mobile.addEventListener('change', render);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeEditor);
    syncChoices(); render();
})();

(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    try {
        const { lang, texts, data } = JSON.parse($('birthday-config').textContent);
        const core = window.BirthdayCore;
        const locale = lang === 'de' ? 'de-CH' : 'fr-CH';
        const number = (value, decimals = 0) => value.toLocaleString(locale, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
        const t = (key, values = {}) => texts[key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
        const rows = core.ranking(data.days);
        const byDate = Object.fromEntries(rows.map(row => [row.date, row]));
        const meta = data._meta;
        const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' });
        const fullFormat = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        const months = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, i, 1))));
        const format = key => dateFormat.format(new Date(`2000-${key}T12:00:00Z`));
        const selected = prefix => byDate[core.key(Number($(prefix + '-month').value), Number($(prefix + '-day').value))];
        const calendarButtons = new Map();
        let previousDate;

        function syncDays(prefix, preferred) {
            const select = $(prefix + '-day');
            const day = preferred ?? (Number(select.value) || 1);
            const count = core.monthDays[Number($(prefix + '-month').value) - 1];
            select.replaceChildren(...Array.from({ length: count }, (_, i) => new Option(String(i + 1), String(i + 1))));
            select.value = String(Math.min(day, count));
        }
        function initializeFields(prefix, month, day) {
            $(prefix + '-month').replaceChildren(...months.map((name, i) => new Option(name, String(i + 1))));
            $(prefix + '-month').value = String(month);
            syncDays(prefix, day);
            $(prefix + '-month').addEventListener('change', () => { syncDays(prefix); render(); });
            $(prefix + '-day').addEventListener('change', render);
        }
        function paragraph(text) {
            const node = document.createElement('p');
            node.textContent = text;
            return node;
        }
        function renderDuel(a) {
            const b = selected('duel');
            const result = core.duel(a, b);
            const lines = [a, b].map(row => paragraph(t('duelRow', { date: format(row.date), rank: row.rank, births: number(row.births) })));
            lines.push(paragraph(result.winner ? t('duelWin', { date: format(result.winner.date), difference: number(result.difference) }) : t('duelTie')));
            if (a.date === '02-29' || b.date === '02-29') lines.push(paragraph(t('duelLeap')));
            $('birthday-duel').replaceChildren(...lines);
        }
        function renderUpcoming(row) {
            const [month, day] = row.date.split('-').map(Number);
            const dates = core.upcoming(month, day, new Date(), 28);
            $('birthday-upcoming').replaceChildren(...dates.slice(0, 8).map(date => {
                const li = document.createElement('li');
                li.textContent = fullFormat.format(date);
                if ([0, 6].includes(date.getUTCDay())) li.className = 'birthday-weekend';
                return li;
            }));
            const weekend = dates.find(date => [0, 6].includes(date.getUTCDay()));
            $('birthday-next-weekend').textContent = weekend ? t('nextWeekend', { date: fullFormat.format(weekend) }) : '';
            $('birthday-weekend-leap').hidden = row.date !== '02-29';
        }
        function render() {
            const row = selected('birthday');
            $('birthday-date').textContent = format(row.date);
            $('birthday-rank').textContent = t('rank', { rank: row.rank });
            $('birthday-badge').textContent = t(row.date === '02-29' ? 'leapBadge' : row.rank <= 122 ? 'common' : row.rank <= 244 ? 'medium' : 'rare');
            $('birthday-count').textContent = number(row.births);
            $('birthday-average').textContent = number(row.births / row.occurrences, 1);
            $('birthday-period').textContent = t('period', { start: meta.startYear, end: meta.endYear });
            const difference = (row.births / (meta.totalBirths / 366) - 1) * 100;
            $('birthday-difference').textContent = Math.abs(difference) < 0.05 ? t('equalAverage') : t('difference', { percent: number(Math.abs(difference), 1), direction: t(difference > 0 ? 'more' : 'less') });
            $('birthday-leap').hidden = row.date !== '02-29';
            $('birthday-leap').textContent = t('leapNote', { occurrences: row.occurrences });
            $('birthday-result').hidden = false;
            $('birthday-feedback').textContent = '';
            $('birthday-copy-fallback').hidden = true;
            if (previousDate) calendarButtons.get(previousDate).setAttribute('aria-pressed', 'false');
            calendarButtons.get(row.date).setAttribute('aria-pressed', 'true');
            previousDate = row.date;
            renderDuel(row);
            renderUpcoming(row);
        }
        function buildCalendar() {
            const sections = months.map((name, index) => {
                const section = document.createElement('section');
                section.className = 'birthday-month';
                const heading = document.createElement('h3');
                heading.textContent = name;
                const grid = document.createElement('div');
                grid.className = 'birthday-days';
                for (let day = 1; day <= core.monthDays[index]; day++) {
                    const row = byDate[core.key(index + 1, day)];
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'birthday-day';
                    button.textContent = String(day);
                    const label = t('calendarDay', { date: format(row.date), rank: row.rank, births: number(row.births) });
                    button.setAttribute('aria-label', label);
                    button.setAttribute('title', label);
                    button.setAttribute('aria-pressed', 'false');
                    button.dataset.date = row.date;
                    const intensity = 1 - (row.rank - 1) / 365;
                    button.style.setProperty('--birthday-heat', `hsl(194 35% ${96 - intensity * 29}%)`);
                    button.style.setProperty('--birthday-dark-heat', `hsl(194 30% ${20 + intensity * 16}%)`);
                    button.addEventListener('click', () => {
                        $('birthday-month').value = String(index + 1);
                        syncDays('birthday', day);
                        render();
                        $('birthday-result').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
                    });
                    // Arrow navigation keeps exploration practical without tabbing through 366 days.
                    button.addEventListener('keydown', event => {
                        const offsets = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
                        if (!(event.key in offsets)) return;
                        event.preventDefault();
                        const date = new Date(`2000-${row.date}T12:00:00Z`);
                        date.setUTCDate(date.getUTCDate() + offsets[event.key]);
                        calendarButtons.get(core.key(date.getUTCMonth() + 1, date.getUTCDate())).focus();
                    });
                    calendarButtons.set(row.date, button);
                    grid.append(button);
                }
                section.append(heading, grid);
                return section;
            });
            $('birthday-calendar').replaceChildren(...sections);
        }
        function shareData() {
            const row = selected('birthday');
            const url = new URL(lang === 'de' ? 'https://wieviel.ch/geburtstag/' : 'https://calcule.ch/anniversaire/');
            url.hash = `date=${row.date}`; // Only explicit sharing exports a date; no input is sent to the server.
            return { title: document.title, text: t('shareText', { date: format(row.date), rank: row.rank, start: meta.startYear, end: meta.endYear }), url: url.href };
        }
        async function copy() {
            const share = shareData();
            const value = `${share.text}\n${share.url}`;
            try {
                await navigator.clipboard.writeText(value);
                $('birthday-feedback').textContent = t('copied');
            } catch (_) {
                $('birthday-feedback').textContent = t('copyError');
                $('birthday-copy-fallback').hidden = false;
                $('birthday-copy-fallback').value = value;
                $('birthday-copy-fallback').focus();
                $('birthday-copy-fallback').select();
            }
        }
        function restoreHash() {
            const value = new URLSearchParams(location.hash.slice(1)).get('date');
            if (!/^\d{2}-\d{2}$/.test(value || '') || !byDate[value]) return;
            const [month, day] = value.split('-').map(Number);
            $('birthday-month').value = String(month);
            syncDays('birthday', day);
        }
        const today = new Date();
        initializeFields('birthday', today.getMonth() + 1, today.getDate());
        initializeFields('duel', 12, 25);
        buildCalendar();
        restoreHash();
        render();
        window.addEventListener('hashchange', () => { restoreHash(); render(); });
        $('birthday-copy').addEventListener('click', copy);
        $('birthday-share').addEventListener('click', async () => {
            if (!navigator.share) return copy();
            try { await navigator.share(shareData()); }
            catch (error) { if (error.name !== 'AbortError') await copy(); }
        });
    } catch (error) {
        $('birthday-error').hidden = false;
        $('birthday-share').disabled = true;
        $('birthday-copy').disabled = true;
        console.error('Birthday calculator:', error);
    }
})();

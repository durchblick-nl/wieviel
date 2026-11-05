(function (root) {
    'use strict';
    const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function key(month, day) {
        if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > monthDays[month - 1]) return null;
        return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    function leap(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    function ranking(days) {
        const rows = Object.entries(days).map(([date, value]) => ({ date, ...value }));
        rows.sort((a, b) => b.births - a.births || a.date.localeCompare(b.date));
        let rank = 0;
        return rows.map((row, index) => {
            if (!index || row.births !== rows[index - 1].births) rank = index + 1;
            return { ...row, rank };
        });
    }
    function upcoming(month, day, today, amount = 8) {
        if (!key(month, day)) return [];
        const result = [];
        const startYear = today.getFullYear();
        const todayUTC = Date.UTC(startYear, today.getMonth(), today.getDate());
        for (let year = startYear; result.length < amount && year < startYear + 100; year++) {
            if (month === 2 && day === 29 && !leap(year)) continue;
            const date = new Date(Date.UTC(year, month - 1, day));
            if (date.getTime() >= todayUTC) result.push(date);
        }
        return result;
    }
    function duel(a, b) {
        return { winner: a.births === b.births ? null : (a.births < b.births ? a : b), difference: Math.abs(a.births - b.births) };
    }
    const api = { monthDays, key, leap, ranking, upcoming, duel };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.BirthdayCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

// Reference-rate changes below 5%: 3% per quarter-point increase.
// Reductions reverse the combined increase, rather than adding rounded steps.
// Source: https://www.mietrecht.ch/fileadmin/files/Hypothekarzins/ueberwaelzungssaetze.pdf
(function (root) {
    function percentChange(oldRate, currentRate) {
        const steps = Math.round((currentRate - oldRate) / 0.25);
        const percent = steps < 0 ? 100 / (1 - steps * 0.03) - 100 : steps * 3;
        // Use the published two-decimal percentage for both amounts and display.
        return Math.round(percent * 100) / 100;
    }
    const calculator = { percentChange };
    if (typeof module !== 'undefined' && module.exports) module.exports = calculator;
    else root.RentCalculator = calculator;
})(typeof globalThis !== 'undefined' ? globalThis : this);

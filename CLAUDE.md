# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wieviel.ch** - Praktische Online-Rechner für den Alltag (Practical online calculators for everyday use)

A collection of useful calculators for the general public in Switzerland.

**Live Site**: https://wieviel.ch

### Current Tools:

| Tool | Path | Description |
|------|------|-------------|
| **Promillerechner** | `/promille/` | Blood alcohol concentration calculator (Widmark formula) |
| **Brutto-Netto-Rechner** | `/lohn/` | Swiss salary calculator with AHV, ALV, NBU, BVG |
| **Trinkgeld-Rechner** | `/trinkgeld/` | Tip calculator with bill splitting |
| **Schlafrechner** | `/schlaf/` | Optimal sleep/wake times based on 90-min cycles |
| **BMI-Rechner** | `/bmi/` | Body Mass Index calculator |
| **Fleisch- & CO2-Rechner** | `/fleisch/` | Meat consumption & CO2 footprint calculator |
| **Bussenrechner** | `/busse/` | Swiss speed fine calculator (OBV) |
| **Tagerechner** | `/tage/` | Date/day calculator (days between dates, weekdays, working days) |

### Planned Tools:
- **Ferienkürzung** (`/ferienkuerzung/`) - Holiday reduction calculator (Art. 329b OR)

## Deployment

Hosted via **Cloudflare Pages** with automatic deployment on push to main branch.

- Build command: (none)
- Build output: (none)
- Build system version: v3

## Project Structure

```
wieviel.ch/
├── index.html              # Landing page with tool overview + SEO
├── css/
│   └── styles.css          # Shared styles (dark mode, responsive)
├── favicon.svg             # Site icon
├── promille/
│   ├── index.html          # Language redirect
│   ├── de/index.html       # German version
│   └── fr/index.html       # French version
├── lohn/
│   ├── index.html          # Language redirect
│   ├── de/index.html       # Brutto-Netto-Rechner (DE)
│   └── fr/index.html       # Calculateur brut-net (FR)
├── trinkgeld/
│   ├── index.html          # Language redirect
│   ├── de/index.html       # Trinkgeld-Rechner (DE)
│   └── fr/index.html       # Calculateur de pourboire (FR)
├── schlaf/
│   ├── index.html          # Language redirect
│   ├── de/index.html       # Schlafrechner (DE)
│   └── fr/index.html       # Calculateur de sommeil (FR)
├── bmi/
│   ├── index.html          # Language redirect
│   ├── de/index.html       # BMI-Rechner (DE)
│   └── fr/index.html       # Calculateur IMC (FR)
├── fleisch/
│   ├── index.html          # Language redirect
│   ├── de/index.html       # Fleisch- & CO2-Rechner (DE)
│   └── fr/index.html       # Calculateur viande & CO2 (FR)
├── busse/
│   ├── index.html          # Language redirect
│   ├── de/index.html       # Bussenrechner (DE)
│   └── fr/index.html       # Calculateur d'amendes (FR)
└── tage/
    ├── index.html          # Language redirect
    ├── de/index.html       # Tagerechner (DE)
    └── fr/index.html       # Calculateur de jours (FR)
```

## Tech Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript (no frameworks)
- **Styling**: CSS Variables for theming, Font Awesome icons
- **Bilingual**: German (DE) and French (FR) with auto-detection
- **Dark Mode**: System preference detection + manual toggle
- **Sharing**: WhatsApp, Copy to clipboard
- **Brand**: Durchblick colors (#3f606f, #cc5c53, #5a8a9d)
- **No backend** - all calculation logic runs client-side

## Common Patterns

### Language Redirect (index.html in each tool folder)
```javascript
const lang = navigator.language || navigator.userLanguage;
const isFrench = lang.toLowerCase().startsWith('fr');
window.location.replace(isFrench ? 'fr/' : 'de/');
```

### Dark Mode
```javascript
const DarkMode = {
    STORAGE_KEY: 'darkMode',
    init() { /* checks localStorage and prefers-color-scheme */ },
    toggle() { /* toggles data-theme attribute */ }
};
```

### Share Functionality
```javascript
function shareWhatsApp() {
    window.open('https://wa.me/?text=' + encodeURIComponent(getShareText()), '_blank');
}
function copyResult() {
    navigator.clipboard.writeText(getShareText()).then(() => { /* feedback */ });
}
```

## Calculation Logic

### Promillerechner - Widmark Formula
```
BAK (‰) = A / (m × r) - (t × β)
```
- A = consumed alcohol in grams
- m = body weight in kg
- r = reduction factor (men: 0.68, women: 0.55)
- β = elimination rate (~0.15‰/hour)

### Lohnrechner - Swiss Deductions
| Deduction | Rate | Notes |
|-----------|------|-------|
| AHV/IV/EO | 5.3% | Employee share |
| ALV | 1.1% | Up to CHF 148'200/year |
| NBU | ~0.5% | Varies by employer |
| BVG | 7-18% | Age-dependent (25-34: 7%, 35-44: 10%, 45-54: 15%, 55-65: 18%) |

### Schlafrechner - Sleep Cycles
- 1 cycle = 90 minutes
- Time to fall asleep = 14 minutes
- Recommended: 5-6 cycles (7.5-9 hours)

### BMI-Rechner
```
BMI = weight (kg) / height² (m)
```
| Category | BMI Range |
|----------|-----------|
| Underweight | < 18.5 |
| Normal | 18.5 - 24.9 |
| Overweight | 25 - 29.9 |
| Obese | ≥ 30 |

### Fleisch- & CO2-Rechner
CO2 emissions per kg of meat (Swiss values):
| Meat Type | CO2 (kg/kg) | Water (L/kg) |
|-----------|-------------|--------------|
| Beef | 25 | 15,400 |
| Pork | 8 | 6,000 |
| Poultry | 5 | 4,300 |

Comparisons:
- 1 flight Zurich-Mallorca = 340 kg CO2
- 1 km car = 0.14 kg CO2
- SGE recommendation: 200-360g meat/week

### Bussenrechner - Swiss Speed Fines
Based on Ordnungsbussenverordnung (OBV).

Safety margin (tolerance):
| Speed | Margin |
|-------|--------|
| ≤100 km/h | 5 km/h |
| 101-150 km/h | 6 km/h |
| >150 km/h | 7 km/h |

Raser thresholds (Via Sicura, Art. 90 SVG):
| Zone | Excess for Raser |
|------|------------------|
| 30 km/h | +40 km/h |
| 50 km/h | +50 km/h |
| 80 km/h | +60 km/h |
| 120 km/h | +80 km/h |

### Tagerechner - Date/Day Calculator
Four calculation modes:
1. **Tage zählen**: Days between two dates (inclusive option)
2. **Datum +/-**: Add or subtract days/weeks/months/years from a date
3. **Wochentag**: Find the weekday for any date
4. **Werktage**: Count working days (Mon-Fri) between dates

Features:
- ISO 8601 calendar week calculation
- Breakdown into years, months, weeks, days
- Color-coded weekday display (weekend = red)

## Related Projects

| Project | Description | URL |
|---------|-------------|-----|
| **frist.ch** | Deadline calculator (ZPO, OR) | [frist.ch](https://frist.ch) |
| **gerichtskostenrechner.ch** | Court fee calculator | [gerichtskostenrechner.ch](https://gerichtskostenrechner.ch) |
| **verzugszinsrechner.ch** | Default interest calculator | [verzugszinsrechner.ch](https://verzugszinsrechner.ch) |
| **wieviel.ch** | Everyday calculators | [wieviel.ch](https://wieviel.ch) |

## Contact

[Durchblick Consultancy BV](https://durchblick.nl)

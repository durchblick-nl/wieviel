# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wieviel.ch + calcule.ch** - Praktische Online-Rechner für den Alltag (Practical online calculators for everyday use)

A collection of useful calculators for the general public in Switzerland.

**Live Sites**:
- https://wieviel.ch (German)
- https://calcule.ch (French)

### Current Tools (wieviel.ch - German):

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
| **Ferienkürzung** | `/ferienkuerzung/` | Holiday reduction calculator (Art. 329b OR) |
| **Teilzeit-Rechner** | `/teilzeit/` | True cost of part-time work (BVG, AHV impact) |
| **MWST-Rechner** | `/mwst/` | Swiss VAT calculator (8.1%, 2.6%, 3.8%) |
| **Mietzinsrechner** | `/miete/` | Rent adjustment calculator (Referenzzinssatz) |
| **Hypothekenrechner** | `/hypothek/` | Mortgage affordability calculator |
| **Zinseszinsrechner** | `/zinseszins/` | Compound interest calculator |

### Current Tools (calcule.ch - French):

| Tool | Path | Description |
|------|------|-------------|
| **Calculateur d'alcoolémie** | `/alcoolemie/` | Blood alcohol concentration calculator |
| **Calculateur de salaire** | `/salaire/` | Swiss salary calculator |
| **Calculateur de pourboire** | `/pourboire/` | Tip calculator |
| **Calculateur de sommeil** | `/sommeil/` | Sleep cycle calculator |
| **Calculateur IMC** | `/imc/` | Body Mass Index calculator |
| **Calculateur viande & CO2** | `/viande/` | Meat & CO2 footprint calculator |
| **Calculateur d'amendes** | `/amende/` | Swiss speed fine calculator |
| **Calculateur de jours** | `/jours/` | Date/day calculator |
| **Réduction vacances** | `/reduction-vacances/` | Holiday reduction calculator |
| **Calculateur temps partiel** | `/temps-partiel/` | Part-time cost calculator |
| **Calculateur TVA** | `/tva/` | Swiss VAT calculator |
| **Calculateur de loyer** | `/loyer/` | Rent adjustment calculator (taux de référence) |
| **Calculateur hypothécaire** | `/hypotheque/` | Mortgage affordability calculator |
| **Calculateur d'intérêts composés** | `/interets-composes/` | Compound interest calculator |

### URL Mapping (DE ↔ FR):

| wieviel.ch | calcule.ch |
|------------|------------|
| `/promille/` | `/alcoolemie/` |
| `/lohn/` | `/salaire/` |
| `/trinkgeld/` | `/pourboire/` |
| `/schlaf/` | `/sommeil/` |
| `/bmi/` | `/imc/` |
| `/fleisch/` | `/viande/` |
| `/busse/` | `/amende/` |
| `/tage/` | `/jours/` |
| `/ferienkuerzung/` | `/reduction-vacances/` |
| `/teilzeit/` | `/temps-partiel/` |
| `/mwst/` | `/tva/` |
| `/miete/` | `/loyer/` |
| `/hypothek/` | `/hypotheque/` |
| `/zinseszins/` | `/interets-composes/` |

### Planned Tools:
- (none currently)

## Deployment

Hosted via **Cloudflare Pages** with automatic deployment on push to main branch.

- **Primary domain**: wieviel.ch (German content)
- **Secondary domain**: calcule.ch (French content)
- **Routing**: `_redirects` file handles domain-based content serving
- Build command: (none)
- Build output: (none)
- Build system version: v3

### Domain Routing (`_redirects`)
- `calcule.ch/` serves `/fr/index.html` (French homepage)
- `calcule.ch/sitemap.xml` serves `/sitemap-fr.xml`
- Cross-domain redirects for wrong-language content
- Legacy redirects for old `/de/` and `/fr/` subfolder URLs

## Project Structure

```
wieviel.ch/
├── index.html              # German homepage (wieviel.ch)
├── _redirects              # Cloudflare Pages routing rules
├── sitemap.xml             # German sitemap
├── sitemap-fr.xml          # French sitemap (served as sitemap.xml on calcule.ch)
├── css/
│   └── styles.css          # Shared styles (dark mode, responsive)
├── favicon.svg             # Site icon
│
├── # German tools (wieviel.ch/[tool]/)
├── promille/index.html     # Promillerechner
├── lohn/index.html         # Brutto-Netto-Rechner
├── trinkgeld/index.html    # Trinkgeld-Rechner
├── schlaf/index.html       # Schlafrechner
├── bmi/index.html          # BMI-Rechner
├── fleisch/index.html      # Fleisch- & CO2-Rechner
├── busse/index.html        # Bussenrechner
├── tage/index.html         # Tagerechner
├── ferienkuerzung/index.html # Ferienkürzung
├── teilzeit/index.html     # Teilzeit-Rechner
├── mwst/index.html         # MWST-Rechner
├── miete/index.html        # Mietzinsrechner
├── hypothek/index.html     # Hypothekenrechner
├── zinseszins/index.html   # Zinseszinsrechner
│
├── # French homepage
├── fr/index.html           # French homepage (calcule.ch)
│
├── # French tools (calcule.ch/[outil]/)
├── alcoolemie/index.html   # Calculateur d'alcoolémie
├── salaire/index.html      # Calculateur de salaire
├── pourboire/index.html    # Calculateur de pourboire
├── sommeil/index.html      # Calculateur de sommeil
├── imc/index.html          # Calculateur IMC
├── viande/index.html       # Calculateur viande & CO2
├── amende/index.html       # Calculateur d'amendes
├── jours/index.html        # Calculateur de jours
├── reduction-vacances/index.html # Réduction vacances
├── temps-partiel/index.html # Calculateur temps partiel
├── tva/index.html          # Calculateur TVA
├── loyer/index.html        # Calculateur de loyer
├── hypotheque/index.html   # Calculateur hypothécaire
└── interets-composes/index.html # Calculateur d'intérêts composés
```

## Tech Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript (no frameworks)
- **Styling**: CSS Variables for theming, Font Awesome icons
- **Dual-Domain**: German (wieviel.ch) and French (calcule.ch) with native URLs
- **Dark Mode**: System preference detection + manual toggle
- **Sharing**: WhatsApp, Copy to clipboard
- **Brand**: Durchblick colors (#3f606f, #cc5c53, #5a8a9d)
- **SEO**: Cross-domain hreflang annotations, separate sitemaps
- **No backend** - all calculation logic runs client-side

## Common Patterns

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

### Ferienkürzung - Holiday Reduction (Art. 329b OR)
```
Reduction = (Absence months - Free months) × (Annual vacation / 12)
```
Free months before reduction applies:
| Absence Type | Free Months | Reduction from |
|--------------|-------------|----------------|
| Illness/Accident | 1 month | 2nd month |
| Pregnancy | 2 months | 3rd month |
| Military/Civil service | 0 months | 1st month |
| Unpaid leave | 0 months | 1st month |

Example: 20 days vacation, 3 months illness
- Free: 1 month → Reducible: 2 months
- Reduction: 2 × (20/12) = 3.33 days
- Remaining: 20 - 3.33 = 16.67 days

### Teilzeit-Rechner - Part-Time Cost Calculator
Calculates the true lifetime cost of working part-time:

**Key Concept - Coordination Deduction (Koordinationsabzug)**
- 2025: CHF 26'460
- Not proportionally reduced for part-time work in many pension plans
- Causes disproportionate reduction in BVG-insured salary

**Calculations:**
1. **Direct Income Loss**: (Current salary - New salary) × Duration
2. **BVG Capital Loss**: Difference in BVG contributions compounded until retirement
3. **AHV Pension Reduction**: Impact on average lifetime income

**BVG Contribution Rates (total):**
| Age Group | Rate |
|-----------|------|
| 25-34 | 7% |
| 35-44 | 10% |
| 45-54 | 15% |
| 55-65 | 18% |

**Example**: CHF 85'000 salary, 100% → 60% for 10 years
- BVG insured at 100%: CHF 58'540 (85'000 - 26'460)
- BVG insured at 60%: CHF 24'540 (51'000 - 26'460) = only 42% of original!

**Gender Pension Gap**: Women in Switzerland receive ~33% less pension than men, primarily due to part-time work and career interruptions.

### MWST-Rechner - Swiss VAT Calculator
Calculates Swiss VAT (Mehrwertsteuer) in both directions:

**Swiss VAT Rates 2025:**
| Rate | Name | Application |
|------|------|-------------|
| 8.1% | Normalsatz | Most goods and services |
| 2.6% | Reduzierter Satz | Food, books, newspapers, medicine |
| 3.8% | Sondersatz | Accommodation/hotels |

**Formulas:**
- Gross to Net: `Net = Gross ÷ (1 + rate)`
- Net to Gross: `Gross = Net × (1 + rate)`
- VAT Amount: `VAT = Gross - Net`

**VAT Obligation**: Businesses with annual turnover > CHF 100'000 must register for VAT.

### Mietzinsrechner - Rent Adjustment (Referenzzinssatz)
Calculates rent adjustments based on the Swiss reference interest rate.

**Current Reference Rate**: 1.25% (as of September 2025)
Published by BWO (Bundesamt für Wohnungswesen) quarterly.

**Adjustment Formula**:
- Per 0.25% decrease in reference rate: **2.91% rent reduction**
- Per 0.25% increase in reference rate: **3.00% rent increase**

Formula for reduction: `(Increase rate × 100) / (100 + Increase rate) = Reduction rate`

**Note**: Landlords can offset with 40% of inflation since last adjustment plus general cost increases (~0.5%/year).

### Hypothekenrechner - Mortgage Affordability
Calculates maximum affordable property price and monthly costs.

**Swiss Mortgage Rules**:
| Criterion | Requirement |
|-----------|-------------|
| Equity | Min. 20% of purchase price |
| Hard equity | Min. 10% (not from pension fund) |
| Affordability | Max. 33% of gross income |
| Imputed interest | 5% (not actual rate) |
| Maintenance costs | 1% of property value/year |
| 2nd mortgage | Amortization within 15 years |

**Mortgage Structure**:
- **1st mortgage** (up to 67%): Does not need to be repaid
- **2nd mortgage** (67-80%): Must be amortized within 15 years or by retirement
- **Equity** (min. 20%): At least 10% must be "hard" equity (savings, pillar 3a)

**Affordability Formula**:
```
(Mortgage × 5% + Property × 1% + 2nd Mortgage ÷ 15) ÷ Gross Income ≤ 33%
```

### Zinseszinsrechner - Compound Interest
Calculates future value with compound interest and regular contributions.

**Formula**:
```
A = P × (1 + r)ⁿ + M × [(1 + r)ⁿ - 1] / r
```
- A = Final amount
- P = Principal (starting capital)
- r = Interest rate per period (monthly = annual/12)
- n = Number of periods (months)
- M = Monthly contribution

**Typical Returns in Switzerland**:
| Investment Type | Expected Return |
|-----------------|-----------------|
| Savings account | 0.5 – 1.5% |
| Pillar 3a account | 0.5 – 1.0% |
| Pillar 3a securities | 3 – 7% |
| World ETF (e.g., MSCI World) | 5 – 8% |

**Pillar 3a Maximum Contributions 2025**:
- Employees with pension fund: CHF 7'056/year (CHF 588/month)
- Self-employed without pension fund: 20% of income, max. CHF 35'280

## Related Projects

| Project | Description | URL |
|---------|-------------|-----|
| **frist.ch** | Deadline calculator (ZPO, OR) | [frist.ch](https://frist.ch) |
| **gerichtskostenrechner.ch** | Court fee calculator | [gerichtskostenrechner.ch](https://gerichtskostenrechner.ch) |
| **verzugszinsrechner.ch** | Default interest calculator | [verzugszinsrechner.ch](https://verzugszinsrechner.ch) |
| **wieviel.ch** | Everyday calculators (DE) | [wieviel.ch](https://wieviel.ch) |
| **calcule.ch** | Everyday calculators (FR) | [calcule.ch](https://calcule.ch) |

## Contact

[Durchblick Consultancy BV](https://durchblick.nl)

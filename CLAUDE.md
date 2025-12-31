# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wieviel.ch + calcule.ch** - Praktische Online-Rechner für den Alltag (Practical online calculators for everyday use)

A collection of useful calculators for the general public in Switzerland, built with **Hugo** static site generator.

**Live Sites**:
- https://wieviel.ch (German)
- https://calcule.ch (French)

### Current Tools (21 calculators, bilingual DE/FR):

| DE (wieviel.ch) | FR (calcule.ch) | Description |
|-----------------|-----------------|-------------|
| `/de/promille/` | `/fr/alcoolemie/` | Blood alcohol calculator (Watson) |
| `/de/lohn/` | `/fr/salaire/` | Salary calculator (AHV, ALV, BVG) |
| `/de/trinkgeld/` | `/fr/pourboire/` | Tip calculator |
| `/de/schlaf/` | `/fr/sommeil/` | Sleep cycle calculator |
| `/de/bmi/` | `/fr/imc/` | BMI calculator |
| `/de/fleisch/` | `/fr/viande/` | Meat & CO2 calculator |
| `/de/busse/` | `/fr/amende/` | Speed fine calculator (OBV) |
| `/de/tage/` | `/fr/jours/` | Date/day calculator |
| `/de/ferienkuerzung/` | `/fr/reduction-vacances/` | Holiday reduction (Art. 329b OR) |
| `/de/teilzeit/` | `/fr/temps-partiel/` | Part-time cost calculator |
| `/de/mwst/` | `/fr/tva/` | VAT calculator (8.1%, 2.6%, 3.8%) |
| `/de/miete/` | `/fr/loyer/` | Rent adjustment calculator |
| `/de/hypothek/` | `/fr/hypotheque/` | Mortgage calculator |
| `/de/zinseszins/` | `/fr/interets-composes/` | Compound interest calculator |
| `/de/wandern/` | `/fr/randonnee/` | Hiking time calculator |
| `/de/stunden/` | `/fr/heures/` | Working hours calculator (ArG) |
| `/de/elternzeit/` | `/fr/conge-parental/` | Parental leave calculator (EOG) |
| `/de/haustier/` | `/fr/animal/` | Pet cost calculator |
| `/de/rauchen/` | `/fr/tabac/` | Smoking cost calculator |
| `/de/strom/` | `/fr/electricite/` | Electricity cost calculator (ElCom) |
| `/de/iban/` | `/fr/iban/` | IBAN checker with bank lookup (SIX) |

## Tech Stack

- **Static Site Generator**: Hugo (v0.152.2+)
- **Hosting**: Cloudflare Pages (auto-deploy on push to main)
- **Frontend**: Vanilla HTML5/CSS3/JavaScript
- **Styling**: CSS Variables, Font Awesome icons
- **i18n**: Hugo's built-in multilingual support
- **Dark Mode**: System preference + manual toggle
- **SEO**: hreflang, dynamic sitemaps per language

## Project Structure (Hugo)

```
wieviel.ch/
├── hugo.toml                 # Hugo configuration (multilingual)
├── .hugo-version             # Hugo version for Cloudflare (0.152.2)
│
├── content/
│   ├── de/                   # German content
│   │   ├── _index.html       # German homepage
│   │   ├── promille/index.html
│   │   ├── lohn/index.html
│   │   └── ...               # 20 calculator content files
│   └── fr/                   # French content
│       ├── _index.html       # French homepage
│       ├── alcoolemie/index.html
│       ├── salaire/index.html
│       └── ...               # 20 calculator content files
│
├── layouts/
│   ├── index.html            # Homepage layout
│   ├── _default/
│   │   └── sitemap.xml       # Dynamic sitemap (domain per language)
│   ├── partials/
│   │   ├── head.html         # <head> with SEO, fonts, CSS, JSON-LD
│   │   ├── header.html       # Dark mode + language switcher
│   │   ├── footer.html       # Footer with disclaimers
│   │   ├── page-header.html  # Calculator header (icon, title, nav)
│   │   ├── darkmode.html     # Dark mode JavaScript
│   │   └── data-status.html  # Data verification date display
│   │
│   └── [type]/single.html    # Calculator layouts by type:
│       ├── bac/              # Promillerechner / Alcoolémie
│       ├── salary/           # Lohnrechner / Salaire
│       ├── tip/              # Trinkgeld / Pourboire
│       ├── sleep/            # Schlafrechner / Sommeil
│       ├── bmi/              # BMI / IMC
│       ├── meat/             # Fleisch / Viande
│       ├── fine/             # Bussenrechner / Amende
│       ├── days/             # Tagerechner / Jours
│       ├── vacation/         # Ferienkürzung / Réduction vacances
│       ├── parttime/         # Teilzeit / Temps partiel
│       ├── vat/              # MWST / TVA
│       ├── rent/             # Miete (DE layout)
│       ├── loyer/            # Loyer (FR layout)
│       ├── miete/            # Miete (alternate)
│       ├── mortgage/         # Hypothek / Hypothèque
│       ├── compound/         # Zinseszins / Intérêts composés
│       ├── hiking/           # Wandern / Randonnée
│       ├── hours/            # Stunden / Heures
│       ├── parental/         # Elternzeit / Congé parental
│       ├── pet/              # Haustier / Animal
│       ├── smoking/          # Rauchen / Tabac
│       ├── electricity/      # Strom / Électricité
│       └── iban/             # IBAN-Prüfer
│
├── i18n/
│   ├── de.yaml               # German translations (FLAT format)
│   └── fr.yaml               # French translations (FLAT format)
│
├── data/
│   └── site.yaml             # Shared data (rates, limits, etc.)
│
├── static/
│   ├── css/
│   │   └── styles.css        # Global styles (dark mode, FAQ, etc.)
│   ├── data/
│   │   └── bank_master.json  # SIX bank data for IBAN checker
│   └── robots.txt            # Search engine directives
│
├── og/                       # Open Graph images (1200x630)
│   ├── emoji/                # Twemoji PNGs (100x100)
│   └── [tool].png            # Per-calculator OG images
│
├── favicon.svg               # Site icon
├── MAINTENANCE.md            # Data update schedule and sources
└── public/                   # Hugo build output (gitignored)
```

## Hugo Commands

```bash
# Development server
hugo server

# Build for production
hugo

# Build with specific environment
hugo --environment production
```

## Content File Structure

Each calculator has a content file with frontmatter:

```yaml
---
title: "Calculator Title"
description: "Meta description for SEO"
keywords: "comma, separated, keywords"
translationKey: "unique-key"      # Links DE ↔ FR versions
type: "layoutname"                # Selects layout from layouts/[type]/
icon: "🔢"                        # Emoji for header
ogImage: "/og/toolname.png"       # Open Graph image
---

<section class="seo-content">
    <!-- SEO text, tables, FAQ -->
</section>
```

## i18n Translation Keys (FLAT format)

Translations use flat keys in `i18n/de.yaml` and `i18n/fr.yaml`:

```yaml
# Calculator-specific keys
"bac.title": "Promillerechner"
"bac.subtitle": "Blutalkohol nach Watson-Formel"
"bac.step1.title": "Persönliche Daten"

# Shared keys
"shared.calculate": "Berechnen"
"shared.result": "Ergebnis"
"shared.share": "Teilen"
```

Access in templates:
```html
{{ i18n "bac.title" }}
{{ i18n "shared.calculate" }}
```

## Data File (data/site.yaml)

Centralized data for all calculators:

```yaml
currentYear: 2026
referenceRate: 1.25              # Mietzins
vat:
  normal: 8.1
  reduced: 2.6
  accommodation: 3.8
socialInsurance:
  ahvRate: 5.3
  alvRate: 1.1
bvg:
  coordinationDeduction: 26460
  # ... more
dataStatus:                      # For data-status.html partial
  socialInsurance:
    lastVerifiedDe: "Dezember 2025"
    nextCheckDe: "November 2026"
```

Access in templates:
```html
{{ site.Data.site.vat.normal }}%
{{ site.Data.site.referenceRate }}%
```

## Adding a New Calculator

1. **Create content files**:
   - `content/de/[slug]/index.html` (German)
   - `content/fr/[slug]/index.html` (French)
   - Use same `translationKey` in both

2. **Create layout** (if new type):
   - `layouts/[type]/single.html`
   - Include partials: head, header, page-header, footer, darkmode

3. **Add i18n keys**:
   - Add to `i18n/de.yaml` and `i18n/fr.yaml`

4. **Add to homepage**:
   - Edit `content/de/_index.html` and `content/fr/_index.html`

5. **Create OG image**:
   - `og/[toolname].png` (1200x630)

## Deployment

- **Auto-deploy**: Push to `main` branch triggers Cloudflare Pages build
- **Preview**: Push to any other branch creates preview URL
- **Build command**: `hugo`
- **Output directory**: `public`
- **Hugo version**: Set via `.hugo-version` file or `HUGO_VERSION` env var

### Domain Routing

Hugo builds to `/de/` and `/fr/` prefixes. Cloudflare Pages serves:
- `wieviel.ch/*` → German content (`/de/*`)
- `calcule.ch/*` → French content (`/fr/*`)

Sitemaps are generated per language with correct domains.

## Swiss Quotation Marks (Guillemets)

| Language | Format | Example |
|----------|--------|---------|
| **German** | «text» (no spaces) | «Das ist ein Beispiel» |
| **French** | « text » (with spaces) | « Ceci est un exemple » |

## CSS Variables

Defined in `static/css/styles.css`:

```css
:root {
    --primary-color: #3f606f;
    --secondary-color: #5a8a9d;
    --accent-color: #cc5c53;
    --text-color: #5a5a5a;
    --light-bg: #f8fafc;
    --card-bg: white;
    --border-color: #dfe5e8;
}

[data-theme="dark"] {
    --primary-color: #5a8a9d;
    --text-color: #e0e0e0;
    --light-bg: #1a1a2e;
    --card-bg: #252542;
    /* ... */
}
```

## FAQ Accordion (Global CSS)

All calculators use the same FAQ styling from `css/styles.css`:

```html
<div class="faq-section">
    <details class="faq-item">
        <summary>Question here?</summary>
        <p>Answer here.</p>
    </details>
</div>
```

## Calculator Logic Reference

### Key Formulas

- **BAC (Watson)**: `BAC = A / (TBW × 0.8) - (t × β)`
- **BMI**: `weight / height²`
- **Compound Interest**: `A = P × (1 + r)ⁿ + M × [(1 + r)ⁿ - 1] / r`
- **Rent Adjustment**: 2.91% reduction per 0.25% rate decrease

### Swiss-Specific Values (2026)

| Parameter | Value |
|-----------|-------|
| AHV rate | 5.3% |
| ALV rate | 1.1% (up to CHF 148'200) |
| BVG coordination deduction | CHF 26'460 |
| VAT normal | 8.1% |
| Reference rate (rent) | 1.25% |
| Pillar 3a max (employed) | CHF 7'258 |
| Pillar 3a max (self-employed) | CHF 36'288 |

## Related Projects

| Project | URL |
|---------|-----|
| frist.ch | Deadline calculator |
| gerichtskostenrechner.ch | Court fee calculator |
| verzugszinsrechner.ch | Default interest calculator |

## Contact

[Durchblick Consultancy BV](https://durchblick.nl)

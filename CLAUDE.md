# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wieviel.ch** - Praktische Online-Rechner für den Alltag (Practical online calculators for everyday use)

A collection of useful calculators for the general public (not just lawyers).

**Live Site**: https://wieviel.ch

### Current Tools:
- **Promillerechner** (`/promille/`) - Blood alcohol concentration calculator

## Deployment

Hosted via **Cloudflare Pages** with automatic deployment on push to main branch.

- Build command: (none)
- Build output: (none)
- Build system version: v3

## Project Structure

```
wieviel.ch/
├── index.html              # Landing page with tool overview
├── promille/
│   ├── index.html          # Language redirect (auto-detects DE/FR)
│   ├── de/index.html       # Promillerechner (German)
│   └── fr/index.html       # Calculateur d'alcoolémie (French)
├── css/
│   └── styles.css          # Shared styles (Durchblick brand colors)
├── scripts/                # Shared scripts (if needed)
├── images/                 # Images and OG images
└── favicon.svg             # Site icon
```

### Future Tools (planned):
- **Ferienkürzung** (`/ferienkuerzung/`) - Holiday reduction calculator (Art. 329b OR)

## Tech Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript
- **Styling**: CSS Variables, Font Awesome icons
- **Bilingual**: German (DE) and French (FR) versions
- **Brand**: Durchblick Consultancy BV colors (#3f606f, #cc5c53, #5a8a9d)
- **No backend** - all calculation logic runs client-side

## Commands

```bash
# Run tests
node test.js
```

## Calculation Logic

### Widmark Formula (1932)

```
BAK (‰) = A / (m × r) - (t × β)
```

Where:
- **A** = consumed alcohol in grams
- **m** = body weight in kg
- **r** = reduction factor (men: 0.68-0.70, women: 0.55-0.60)
- **t** = time since drinking started (hours)
- **β** = alcohol elimination rate (~0.1-0.15‰ per hour)

### Alcohol Content by Drink Type

| Drink | Volume | Alcohol % | Pure Alcohol (g) |
|-------|--------|-----------|------------------|
| Beer (Stange) | 300ml | 5% | ~12g |
| Beer (gross) | 500ml | 5% | ~20g |
| Wine | 100ml | 12% | ~10g |
| Wine (glass) | 150ml | 12% | ~15g |
| Spirits | 20ml | 40% | ~6g |
| Spirits (double) | 40ml | 40% | ~12g |

### Swiss Legal Limits

| Category | BAC Limit | Breath Alcohol |
|----------|-----------|----------------|
| Standard drivers | 0.5‰ | 0.25 mg/l |
| New drivers (< 3 years) | 0.1‰ | 0.05 mg/l |
| Professional drivers | 0.1‰ | 0.05 mg/l |
| Driving instructors | 0.1‰ | 0.05 mg/l |

### Legal Consequences (Switzerland)

| BAC Level | Consequence |
|-----------|-------------|
| 0.5-0.79‰ | Warning + fine |
| 0.8‰+ | License suspension (min. 3 months) + fine |
| 1.6‰+ | License suspension (min. 2 years) + criminal record |

## Key Functions

### scripts/calculations.js

| Function | Purpose |
|----------|---------|
| `calculateBAC()` | Main Widmark formula calculation |
| `getReductionFactor()` | Get r factor based on gender/weight/height |
| `alcoholInGrams()` | Convert drink to pure alcohol grams |
| `timeToSober()` | Calculate time until BAC reaches target |
| `formatTime()` | Format time for display |

## Zusammengehörige Projekte

Dieses Projekt ist Teil einer Suite von Schweizer Rechtstools:

| Projekt | Beschreibung | URL |
|---------|--------------|-----|
| **frist.ch** | Fristenrechner (ZPO, OR, etc.) | [frist.ch](https://frist.ch) |
| **gerichtskostenrechner.ch** | Gerichtskosten für Zivilverfahren | [gerichtskostenrechner.ch](https://gerichtskostenrechner.ch) |
| **verzugszinsrechner.ch** | Verzugszinsen nach OR 104 | [verzugszinsrechner.ch](https://verzugszinsrechner.ch) |
| **wieviel.ch** | Promillerechner | [wieviel.ch](https://wieviel.ch) |

## Kontakt

[Durchblick Consultancy BV](https://durchblick.nl)

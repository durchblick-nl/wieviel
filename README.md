# wieviel.ch + calcule.ch

Praktische Online-Rechner für den Alltag in der Schweiz.

**Live:**
- 🇩🇪 https://wieviel.ch (Deutsch)
- 🇫🇷 https://calcule.ch (Français)

## Alle 23 Tools

### Arbeit & Ferien

| Tool | DE | FR | Beschreibung |
|------|----|----|--------------|
| Brutto-Netto-Rechner | `/lohn/` | `/salaire/` | Schweizer Lohn mit AHV, ALV, BVG |
| Teilzeit-Rechner | `/teilzeit/` | `/temps-partiel/` | Wahre Kosten von Teilzeit (BVG, AHV, Pension Gap) |
| Tagerechner | `/tage/` | `/jours/` | Tage zwischen Daten, Wochentag, Werktage |
| Ferienkürzung | `/ferienkuerzung/` | `/reduction-vacances/` | Art. 329b OR |
| Stundenrechner | `/stunden/` | `/heures/` | Arbeitszeit nach ArG |
| Elternzeit-Rechner | `/elternzeit/` | `/conge-parental/` | Mutterschafts- & Vaterschaftsentschädigung |

### Geld & Finanzen

| Tool | DE | FR | Beschreibung |
|------|----|----|--------------|
| Alimentenrechner | `/alimente/` | `/pension-alimentaire/` | Kinderunterhalt bei alleiniger Obhut schätzen |
| MWST-Rechner | `/mwst/` | `/tva/` | Mehrwertsteuer (8.1%, 2.6%, 3.8%) |
| Trinkgeld-Rechner | `/trinkgeld/` | `/pourboire/` | Trinkgeld & Rechnung aufteilen |
| Hypothekenrechner | `/hypothek/` | `/hypotheque/` | Tragbarkeit & max. Kaufpreis |
| Mietzinsrechner | `/miete/` | `/loyer/` | Referenzzinssatz-Anpassung (1.25%) |
| Zinseszinsrechner | `/zinseszins/` | `/interets-composes/` | Vermögensaufbau & Säule 3a |
| Stromkosten-Rechner | `/strom/` | `/electricite/` | Live ElCom-Tarife |
| Kaufkraftrechner | `/kaufkraft/` | `/pouvoir-achat/` | Inflation & Teuerung nach LIK |
| IBAN-Prüfer | `/iban/` | `/iban/` | IBAN validieren & Bank finden |

### Gesundheit & Lifestyle

| Tool | DE | FR | Beschreibung |
|------|----|----|--------------|
| BMI-Rechner | `/bmi/` | `/imc/` | Body Mass Index berechnen |
| Schlafrechner | `/schlaf/` | `/sommeil/` | Optimale Schlafzeiten (90-Min-Zyklen) |
| CO2-Rechner | `/fleisch/` | `/viande/` | Fleischkonsum & CO2-Fussabdruck |
| Wanderzeit-Rechner | `/wandern/` | `/randonnee/` | Gehzeit mit Schweizer Formel |
| Haustier-Kosten | `/haustier/` | `/animal/` | Hund/Katze Kosten pro Jahr/Lebenszeit |
| Rauchkosten-Rechner | `/rauchen/` | `/tabac/` | Kosten & Sparpotenzial |

### Verkehr

| Tool | DE | FR | Beschreibung |
|------|----|----|--------------|
| Bussenrechner | `/busse/` | `/amende/` | Geschwindigkeitsbusse (OBV) |
| Promillerechner | `/promille/` | `/alcoolemie/` | Blutalkohol berechnen (Watson-Formel) |

## Features

- 🌐 **Bilingual**: Deutsch (wieviel.ch) + Französisch (calcule.ch)
- 🌙 **Dark Mode**: System-Erkennung + manueller Toggle
- 📱 **Responsive**: Optimiert für Mobile
- 🔒 **Datenschutz**: 100% client-side, keine Cookies, kein Tracking
- 📤 **Teilen**: WhatsApp & Kopieren
- 🔍 **SEO**: Open Graph & Twitter Cards
- 💡 **Tooltips**: Erklärungen für alle Features

## Tech Stack

- **Hugo** - Static Site Generator
- **Vanilla HTML5/CSS3/JavaScript** - Keine Frameworks
- **CSS Variables** - Dark Mode & Theming
- **Font Awesome** - Icons
- **Cloudflare Pages** - Hosting mit Worker-basiertem Routing

## Projektstruktur

```
wieviel.ch/
├── content/
│   ├── de/           # Deutsche Inhalte
│   │   ├── _index.html
│   │   ├── lohn/index.html
│   │   └── ...
│   └── fr/           # Französische Inhalte
│       ├── _index.html
│       ├── salaire/index.html
│       └── ...
├── layouts/
│   ├── _default/
│   ├── partials/
│   └── [tool]/single.html
├── static/
│   ├── css/styles.css
│   ├── 404.html
│   └── og/           # Open Graph Bilder
├── _worker.js        # Cloudflare Worker (Routing)
├── hugo.toml         # Hugo Konfiguration
└── build.sh          # Build Script
```

## Lokale Entwicklung

```bash
# Hugo Server starten
hugo server

# Build für Production
./build.sh
```

## Deployment

Automatisches Deployment via [Cloudflare Pages](https://pages.cloudflare.com/) bei Push auf `main`.

- **Build command**: `./build.sh`
- **Output directory**: `public`

## Verwandte Projekte

- [frist.ch](https://frist.ch) - Fristenrechner (ZPO, OR)
- [gerichtskostenrechner.ch](https://gerichtskostenrechner.ch) - Gerichtskosten berechnen
- [verzugszinsrechner.ch](https://verzugszinsrechner.ch) - Verzugszins berechnen

## Lizenz

MIT License

## Kontakt

[Durchblick Consultancy BV](https://durchblick.nl)

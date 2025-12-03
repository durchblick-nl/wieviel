# Hugo Migration Status

**Stand: 3. Dezember 2024, 23:00**

## Was fertig ist ✅

### 1. Hugo-Projektstruktur
- `hugo.toml` - Konfiguration für DE/FR
- `data/site.yaml` - Zentrale Daten (Referenzzinssatz, MWST, etc.)
- `build.sh` - Build-Script

### 2. Layouts (in `/layouts/`)
- `_default/baseof.html` - Basis-Template
- `_default/single.html` - Standard-Seiten
- `miete/single.html` - Mietzinsrechner-spezifisches Layout
- `partials/head.html` - Meta-Tags, SEO, CSS
- `partials/header.html` - Sprachswitch, Dark Mode
- `partials/page-header.html` - Titel mit Icon
- `partials/footer.html` - Einheitlicher Footer
- `partials/darkmode.html` - Dark Mode JS
- `shortcodes/data.html` - Zugriff auf zentrale Daten

### 3. Content (in `/content/`)
- `content/de/miete/index.html` - Mietzinsrechner (Beispiel)

### 4. Static Files (in `/static/`)
- `css/styles.css`
- `favicon.svg`
- `og/` - Open Graph Bilder

## URL-Struktur (neu)

```
wieviel.ch/           → Redirect zu /de/
wieviel.ch/de/        → Deutsche Homepage
wieviel.ch/de/miete/  → Mietzinsrechner
wieviel.ch/de/strom/  → Stromkosten-Rechner
...

calcule.ch/           → Redirect zu /fr/
calcule.ch/fr/        → Französische Homepage
calcule.ch/fr/loyer/  → Calculateur de loyer
calcule.ch/fr/electricite/ → Calculateur électricité
...
```

## Nächste Schritte 🔜

### 1. Cloudflare Pages konfigurieren
- Build command: `./build.sh`
- Output directory: `public`
- Hugo Version in Environment Variable setzen

### 2. _redirects anpassen
Für die neue URL-Struktur:
```
# calcule.ch
https://calcule.ch/ /fr/ 302
https://calcule.ch/fr/* /fr/:splat 200

# wieviel.ch
https://wieviel.ch/ /de/ 302
```

### 3. Alle Seiten migrieren (40+)
Für jede Seite:
1. Content-Datei in `content/de/[tool]/index.html` erstellen
2. Falls tool-spezifisches Layout nötig: `layouts/[tool]/single.html`
3. Französische Version in `content/fr/[tool]/index.html`

### Seiten-Migration Checkliste

**Deutsch (wieviel.ch):**
- [x] miete
- [ ] strom
- [ ] promille
- [ ] lohn
- [ ] trinkgeld
- [ ] schlaf
- [ ] bmi
- [ ] fleisch
- [ ] busse
- [ ] tage
- [ ] ferienkuerzung
- [ ] teilzeit
- [ ] mwst
- [ ] hypothek
- [ ] zinseszins
- [ ] wandern
- [ ] stunden
- [ ] elternzeit
- [ ] haustier
- [ ] rauchen
- [ ] Homepage (index)

**Französisch (calcule.ch):**
- [ ] loyer
- [ ] electricite
- [ ] alcoolemie
- [ ] salaire
- [ ] pourboire
- [ ] sommeil
- [ ] imc
- [ ] viande
- [ ] amende
- [ ] jours
- [ ] reduction-vacances
- [ ] temps-partiel
- [ ] tva
- [ ] hypotheque
- [ ] interets-composes
- [ ] randonnee
- [ ] heures
- [ ] conge-parental
- [ ] animal
- [ ] tabac
- [ ] Homepage (index)

## Wichtige Befehle

```bash
# Lokal entwickeln
hugo server

# Build für Production
./build.sh

# Output prüfen
ls -la public/
```

## Zentrale Daten (data/site.yaml)

Bei Änderungen an diesen Werten wird automatisch alles aktualisiert:
- `referenceRate: 1.25` - Referenzzinssatz
- `vatNormal: 8.1` - MWST Normalsatz
- `electricityMedianPrice: 29` - Strom Median
- etc.

## Entscheidung

Die neue URL-Struktur ist:
- `wieviel.ch/de/[tool]/` statt `wieviel.ch/[tool]/`
- `calcule.ch/fr/[tool]/` statt `calcule.ch/[tool]/`

Dies vereinfacht das Hugo-Setup erheblich.

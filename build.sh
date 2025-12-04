#!/bin/bash
# Hugo build script for wieviel.ch/calcule.ch

# Build Hugo site
hugo

# Copy static files to root of public (shared between languages)
cp -r public/de/css public/css 2>/dev/null || true
cp -r public/de/og public/og 2>/dev/null || true
cp public/de/favicon.svg public/favicon.svg 2>/dev/null || true

# Remove Hugo's auto-generated root index.html redirect
# The _worker.js handles homepage routing based on domain
rm -f public/index.html

# Copy _worker.js to public directory for Cloudflare Pages
cp _worker.js public/_worker.js

echo "Build complete!"

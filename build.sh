#!/bin/bash
# Hugo build script for wieviel.ch/calcule.ch

# Build Hugo site
hugo

# Copy static files to root of public (shared between languages)
cp -r public/de/css public/css 2>/dev/null || true
cp -r public/de/js public/js 2>/dev/null || true
cp -r public/de/og public/og 2>/dev/null || true
cp public/de/favicon.svg public/favicon.svg 2>/dev/null || true

# Remove Hugo's auto-generated root index.html redirect
# The active nginx deployment handles homepage routing based on domain;
# this script retains the former Cloudflare Pages build behavior.
rm -f public/index.html

# Keep the legacy Worker artifact for optional Pages compatibility.
cp _worker.js public/_worker.js

echo "Build complete!"

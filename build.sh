#!/bin/bash
# Hugo build script for wieviel.ch/calcule.ch

# Build Hugo site
hugo

# Copy static files to root of public (shared between languages)
cp -r public/de/css public/css 2>/dev/null || true
cp -r public/de/og public/og 2>/dev/null || true
cp public/de/favicon.svg public/favicon.svg 2>/dev/null || true

# Create root redirect to /de/ for wieviel.ch
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/de/">
    <link rel="canonical" href="https://wieviel.ch/de/">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="/de/">wieviel.ch</a>...</p>
</body>
</html>
EOF

echo "Build complete!"

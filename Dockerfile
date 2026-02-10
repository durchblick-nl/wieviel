# Stage 1: Hugo Build
FROM hugomods/hugo:exts-0.152.2 AS builder
WORKDIR /src
COPY . .
RUN hugo

# Post-build: copy shared assets to root (replicates build.sh)
RUN cp -r public/de/css public/css 2>/dev/null || true && \
    cp -r public/de/og public/og 2>/dev/null || true && \
    cp public/de/favicon.svg public/favicon.svg 2>/dev/null || true && \
    rm -f public/index.html && \
    cp manifest.json public/manifest.json 2>/dev/null || true && \
    cp manifest-fr.json public/manifest-fr.json 2>/dev/null || true

# Stage 2: nginx
FROM nginx:alpine
COPY --from=builder /src/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

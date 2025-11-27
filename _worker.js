/**
 * Cloudflare Pages Worker for wieviel.ch + calcule.ch dual-domain setup
 *
 * Handles:
 * - Homepage routing based on domain
 * - Cross-domain redirects (German content on calcule.ch → wieviel.ch, vice versa)
 * - Sitemap routing for calcule.ch
 * - Legacy /de/ and /fr/ subfolder redirects
 */

// German tool paths (served on wieviel.ch)
const GERMAN_PATHS = ['/promille', '/lohn', '/trinkgeld', '/schlaf', '/bmi', '/fleisch', '/busse', '/tage', '/ferienkuerzung', '/teilzeit', '/mwst', '/miete', '/hypothek', '/zinseszins', '/wandern', '/stunden'];

// French tool paths (served on calcule.ch)
const FRENCH_PATHS = ['/viande', '/amende', '/jours', '/tva', '/salaire', '/alcoolemie', '/pourboire', '/sommeil', '/imc', '/reduction-vacances', '/temps-partiel', '/loyer', '/hypotheque', '/interets-composes', '/randonnee', '/heures'];

// Path mapping for legacy /fr/ redirects (German path → French path)
const DE_TO_FR_PATH = {
    '/promille': '/alcoolemie',
    '/lohn': '/salaire',
    '/trinkgeld': '/pourboire',
    '/schlaf': '/sommeil',
    '/bmi': '/imc',
    '/fleisch': '/viande',
    '/busse': '/amende',
    '/tage': '/jours',
    '/ferienkuerzung': '/reduction-vacances',
    '/teilzeit': '/temps-partiel',
    '/mwst': '/tva',
    '/miete': '/loyer',
    '/hypothek': '/hypotheque',
    '/zinseszins': '/interets-composes',
    '/wandern': '/randonnee',
    '/stunden': '/heures'
};

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const host = url.hostname;
        const path = url.pathname;
        const isFrenchDomain = host.includes('calcule');
        const hasWww = host.startsWith('www.');

        // Helper: get target host preserving www prefix
        const getGermanHost = () => hasWww ? 'www.wieviel.ch' : 'wieviel.ch';
        const getFrenchHost = () => hasWww ? 'www.calcule.ch' : 'calcule.ch';

        // =================================================================
        // Homepage: serve correct language version
        // =================================================================
        if (path === '/') {
            const assetPath = isFrenchDomain ? '/fr/index.html' : '/de/index.html';
            const assetUrl = new URL(assetPath, url.origin);
            return env.ASSETS.fetch(new Request(assetUrl, request));
        }

        // =================================================================
        // Sitemap: serve French sitemap on calcule.ch
        // =================================================================
        if (path === '/sitemap.xml' && isFrenchDomain) {
            const assetUrl = new URL('/sitemap-fr.xml', url.origin);
            return env.ASSETS.fetch(new Request(assetUrl, request));
        }

        // =================================================================
        // Cross-domain redirects: French paths on wieviel.ch → calcule.ch
        // =================================================================
        if (!isFrenchDomain && FRENCH_PATHS.some(p => path.startsWith(p))) {
            return Response.redirect(`https://${getFrenchHost()}${path}`, 301);
        }

        // =================================================================
        // Cross-domain redirects: German paths on calcule.ch → wieviel.ch
        // =================================================================
        if (isFrenchDomain && GERMAN_PATHS.some(p => path.startsWith(p))) {
            return Response.redirect(`https://${getGermanHost()}${path}`, 301);
        }

        // =================================================================
        // /fr/ folder on wieviel.ch → calcule.ch
        // =================================================================
        if (!isFrenchDomain && path.startsWith('/fr/')) {
            const newPath = path.replace('/fr/', '/') || '/';
            return Response.redirect(`https://${getFrenchHost()}${newPath}`, 301);
        }
        if (!isFrenchDomain && path === '/fr') {
            return Response.redirect(`https://${getFrenchHost()}/`, 301);
        }

        // =================================================================
        // /de/ folder on calcule.ch → wieviel.ch
        // =================================================================
        if (isFrenchDomain && path.startsWith('/de/')) {
            const newPath = path.replace('/de/', '/') || '/';
            return Response.redirect(`https://${getGermanHost()}${newPath}`, 301);
        }
        if (isFrenchDomain && path === '/de') {
            return Response.redirect(`https://${getGermanHost()}/`, 301);
        }

        // =================================================================
        // Legacy redirects: /tool/de/* → /tool/*
        // =================================================================
        const legacyDeMatch = path.match(/^(\/[^/]+)\/de(\/.*)?$/);
        if (legacyDeMatch) {
            const basePath = legacyDeMatch[1];
            const rest = legacyDeMatch[2] || '/';
            if (GERMAN_PATHS.includes(basePath)) {
                const newPath = basePath + rest;
                return Response.redirect(`https://${getGermanHost()}${newPath}`, 301);
            }
        }

        // =================================================================
        // Legacy redirects: /tool/fr/* → French tool on calcule.ch
        // =================================================================
        const legacyFrMatch = path.match(/^(\/[^/]+)\/fr(\/.*)?$/);
        if (legacyFrMatch) {
            const basePath = legacyFrMatch[1];
            const rest = legacyFrMatch[2] || '/';
            const frenchPath = DE_TO_FR_PATH[basePath];
            if (frenchPath) {
                const newPath = frenchPath + rest;
                return Response.redirect(`https://${getFrenchHost()}${newPath}`, 301);
            }
        }

        // =================================================================
        // Default: pass through to static assets
        // =================================================================
        return env.ASSETS.fetch(request);
    }
};

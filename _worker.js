/**
 * Cloudflare Pages Worker for wieviel.ch + calcule.ch dual-domain setup
 *
 * Hugo generates files under /de/ and /fr/ prefixes.
 * This worker:
 * - Routes requests based on domain (wieviel.ch → /de/, calcule.ch → /fr/)
 * - Handles cross-domain redirects
 * - Serves static assets directly
 */

// German tool paths (served on wieviel.ch)
const GERMAN_PATHS = ['/promille', '/lohn', '/trinkgeld', '/schlaf', '/bmi', '/fleisch', '/busse', '/tage', '/ferienkuerzung', '/teilzeit', '/mwst', '/miete', '/hypothek', '/zinseszins', '/wandern', '/stunden', '/elternzeit', '/haustier', '/rauchen', '/strom'];

// French tool paths (served on calcule.ch)
const FRENCH_PATHS = ['/viande', '/amende', '/jours', '/tva', '/salaire', '/alcoolemie', '/pourboire', '/sommeil', '/imc', '/reduction-vacances', '/temps-partiel', '/loyer', '/hypotheque', '/interets-composes', '/randonnee', '/heures', '/conge-parental', '/animal', '/tabac', '/electricite'];

// Path mapping (German path → French path)
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
    '/stunden': '/heures',
    '/elternzeit': '/conge-parental',
    '/haustier': '/animal',
    '/rauchen': '/tabac',
    '/strom': '/electricite'
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
        // Static assets: pass through directly (no prefix needed)
        // =================================================================
        if (path.startsWith('/css/') || path.startsWith('/og/') ||
            path === '/favicon.svg' || path === '/sitemap.xml' ||
            path === '/sitemap-fr.xml' || path === '/_redirects') {
            return env.ASSETS.fetch(request);
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
        // /fr/ URLs on wieviel.ch → redirect to calcule.ch (strip /fr/)
        // =================================================================
        if (!isFrenchDomain && path.startsWith('/fr')) {
            const newPath = path.replace(/^\/fr\/?/, '/') || '/';
            return Response.redirect(`https://${getFrenchHost()}${newPath}`, 301);
        }

        // =================================================================
        // /de/ URLs on calcule.ch → redirect to wieviel.ch (strip /de/)
        // =================================================================
        if (isFrenchDomain && path.startsWith('/de')) {
            const newPath = path.replace(/^\/de\/?/, '/') || '/';
            return Response.redirect(`https://${getGermanHost()}${newPath}`, 301);
        }

        // =================================================================
        // Legacy redirects: /tool/de/* → /tool/* on wieviel.ch
        // =================================================================
        const legacyDeMatch = path.match(/^(\/[^/]+)\/de(\/.*)?$/);
        if (legacyDeMatch) {
            const basePath = legacyDeMatch[1];
            const rest = legacyDeMatch[2] || '/';
            if (GERMAN_PATHS.includes(basePath)) {
                return Response.redirect(`https://${getGermanHost()}${basePath}${rest}`, 301);
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
                return Response.redirect(`https://${getFrenchHost()}${frenchPath}${rest}`, 301);
            }
        }

        // =================================================================
        // Sitemap: serve French sitemap on calcule.ch
        // =================================================================
        if (path === '/sitemap.xml' && isFrenchDomain) {
            const assetUrl = new URL('/sitemap-fr.xml', url.origin);
            return env.ASSETS.fetch(new Request(assetUrl, request));
        }

        // =================================================================
        // Main routing: prefix path with language folder
        // calcule.ch/salaire/ → serve /fr/salaire/index.html
        // wieviel.ch/lohn/ → serve /de/lohn/index.html
        // =================================================================
        const langPrefix = isFrenchDomain ? '/fr' : '/de';
        let assetPath = langPrefix + path;

        // If path doesn't end with / or a file extension, add /
        if (!path.endsWith('/') && !path.match(/\.[a-z]+$/i)) {
            assetPath += '/';
        }

        const assetUrl = new URL(assetPath, url.origin);
        return env.ASSETS.fetch(new Request(assetUrl, request));
    }
};

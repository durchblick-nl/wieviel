/* OpenPanel is created only after optional analytics consent. */
(() => {
  'use strict';

  const currentScript = document.currentScript;
  const language = currentScript?.dataset.lang === 'fr' ? 'fr' : 'de';
  const calculator = currentScript?.dataset.calculator || 'homepage';
  const clientId = currentScript?.dataset.clientId || '';
  const productionHost = ['wieviel.ch', 'www.wieviel.ch', 'calcule.ch', 'www.calcule.ch'].includes(location.hostname);
  let analyticsStarted = false;

  function startAnalytics() {
    if (analyticsStarted || !productionHost || !clientId) return;
    analyticsStarted = true;

    window.op = window.op || function () {
      const queue = [];
      return new Proxy(function () {
        if (arguments.length) queue.push([].slice.call(arguments));
      }, {
        get(_target, property) {
          return property === 'q' ? queue : function () {
            queue.push([property].concat([].slice.call(arguments)));
          };
        },
        has(_target, property) { return property === 'q'; }
      });
    }();
    window.op('init', {
      apiUrl: 'https://opapi.treehouse.ch',
      clientId,
      trackScreenViews: true,
      trackOutgoingLinks: true,
      trackAttributes: true
    });
    window.op('setGlobalProperties', { language, calculator });

    const tracker = document.createElement('script');
    tracker.src = 'https://openpanel.dev/op1.js';
    tracker.async = true;
    document.head.appendChild(tracker);
  }

  CookieConsent.run({
    mode: 'opt-in',
    revision: 1,
    cookie: { name: 'wv_consent', expiresAfterDays: 180, sameSite: 'Lax' },
    guiOptions: {
      consentModal: { layout: 'box inline', position: 'bottom center', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true }
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {}
    },
    language: {
      default: language,
      translations: {
        de: {
          consentModal: {
            title: 'Deine Privatsphäre zählt',
            description: 'Alle Rechner funktionieren ohne Nutzungsanalyse. Mit deiner Zustimmung hilft uns OpenPanel zu verstehen, welche Tools genutzt werden. <a href="/privacy/">Mehr zum Datenschutz</a>',
            acceptAllBtn: 'Analyse erlauben',
            acceptNecessaryBtn: 'Nur Notwendiges',
            showPreferencesBtn: 'Auswahl ansehen'
          },
          preferencesModal: {
            title: 'Deine Privatsphäre',
            acceptAllBtn: 'Analyse erlauben',
            acceptNecessaryBtn: 'Nur Notwendiges',
            savePreferencesBtn: 'Auswahl speichern',
            closeIconLabel: 'Schliessen',
            sections: [
              { title: 'Notwendig', description: 'Deine Einwilligungsentscheidung wird für 180 Tage gespeichert. Der Dunkelmodus bleibt lokal im Browser. Die Rechner funktionieren ohne Analyse.', linkedCategory: 'necessary' },
              { title: 'Nutzungsanalyse', description: 'OpenPanel misst Seitenaufrufe und Interaktionen nur, wenn du zustimmst. Du kannst diese Zustimmung jederzeit hier widerrufen.', linkedCategory: 'analytics' },
              { title: 'Mehr erfahren', description: '<a href="/privacy/">Datenschutz und Cookies ansehen</a>' }
            ]
          }
        },
        fr: {
          consentModal: {
            title: 'Votre vie privée compte',
            description: 'Tous les calculateurs fonctionnent sans analyse d’utilisation. Avec votre accord, OpenPanel nous aide à comprendre quels outils sont utilisés. <a href="/privacy/">En savoir plus</a>',
            acceptAllBtn: 'Autoriser l’analyse',
            acceptNecessaryBtn: 'Uniquement l’essentiel',
            showPreferencesBtn: 'Voir les options'
          },
          preferencesModal: {
            title: 'Votre vie privée',
            acceptAllBtn: 'Autoriser l’analyse',
            acceptNecessaryBtn: 'Uniquement l’essentiel',
            savePreferencesBtn: 'Enregistrer mon choix',
            closeIconLabel: 'Fermer',
            sections: [
              { title: 'Essentiel', description: 'Votre choix est enregistré pendant 180 jours. Le mode sombre reste local dans votre navigateur. Les calculateurs fonctionnent sans analyse.', linkedCategory: 'necessary' },
              { title: 'Analyse d’utilisation', description: 'OpenPanel mesure les visites et les interactions uniquement avec votre accord. Vous pouvez le retirer ici à tout moment.', linkedCategory: 'analytics' },
              { title: 'En savoir plus', description: '<a href="/privacy/">Confidentialité et cookies</a>' }
            ]
          }
        }
      }
    },
    onConsent: () => {
      if (CookieConsent.acceptedCategory('analytics')) startAnalytics();
    },
    onChange: ({ changedCategories }) => {
      if (!changedCategories.includes('analytics')) return;
      if (CookieConsent.acceptedCategory('analytics')) {
        startAnalytics();
      } else if (analyticsStarted) {
        // A reload drops the already active tracker and its event listeners.
        location.reload();
      }
    }
  });
})();

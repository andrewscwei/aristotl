import Polyglot from 'node-polyglot';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:i18n') : () => {};
const locales = __I18N_CONFIG__.locales;
const dict = __I18N_CONFIG__.dict;
const polyglots: { [locale: string]: Polyglot } = {};

// In development, require context for all locale translation files and add them
// to Polyglot so that they can be watched by Webpack.
if (process.env.NODE_ENV === 'development') {
  const localeReq = require.context('../../config/locales', true, /^.*\.json$/);
  localeReq.keys().forEach((path) => {
    const locale = path.replace('./', '').replace('.json', '');
    if (!~locales.indexOf(locale)) { return; }
    dict[locale] = localeReq(path) as TranslationData;
  });
}

// Instantiate one polyglot instance per locale.
for (const locale in dict) {
  if (!dict.hasOwnProperty(locale)) continue;

  polyglots[locale] = new Polyglot({
    locale,
    phrases: dict[locale],
  });
}

debug('Initializing locale translations...', 'OK', locales);

export function getLocaleFromPath(path: string): string {
  const locales = __I18N_CONFIG__.locales;
  const normalizedPath = path.replace(/\/*$/, '') + '/';
  const possibleLocale = normalizedPath.split('/')[1];

  if (~locales.indexOf(possibleLocale)) {
    return possibleLocale;
  }
  else {
    return locales[0];
  }
}

export function getLocalizedPath(path: string, locale: string = __I18N_CONFIG__.defaultLocale): string {
  const t = path.split('/').filter((v) => v);

  if (t.length > 0 && __I18N_CONFIG__.locales.indexOf(t[0]) >= 0) {
    t.shift();
  }

  switch (locale) {
  case __I18N_CONFIG__.defaultLocale:
    return `/${t.join('/')}`;
  default:
    return `/${locale}/${t.join('/')}`;
  }
}

export function getPolyglotByLocale(locale: string): Polyglot {
  const polyglot = polyglots[locale];

  if (!polyglot) throw new Error(`No Polyglot found for locale "${locale}"`);

  return polyglot;
}

export default polyglots;

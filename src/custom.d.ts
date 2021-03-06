declare const __APP_CONFIG__: Readonly<{ [key: string]: any }>;

declare const __I18N_CONFIG__: Readonly<{
  defaultLocale: string;
  locales: string;
  dict: TranslationDataDict;
}>;

interface TranslationData {
  [key: string]: TranslationData | string;
}

interface TranslationDataDict {
  [locale: string]: TranslationData;
}

interface RouteData {
  component: string;
  exact?: boolean;
  path: string;
}

interface Window {
  __INITIAL_STATE__: any;
  __PRISMIC_REF__: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  prismic: { endpoint: any; };
  snapSaveState: () => {};
}

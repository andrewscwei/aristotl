declare const __APP_CONFIG__: typeof import('./app.conf').default

declare const __I18N_CONFIG__: Readonly<{
  defaultLocale: string
  locales: string
  dict: TranslationDataDict
}>

type TranslationData = { [key: string]: TranslationData | string }
type TranslationDataDict = Record<string, TranslationData>

interface Window {
  __INITIAL_STATE__: any
  __PRISMIC_REF__: any
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
  prismic: { endpoint: any }
}

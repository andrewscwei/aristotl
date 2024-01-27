import Polyglot from 'node-polyglot'
import React, { ComponentType, createContext, Dispatch, ProviderProps, useContext, useReducer } from 'react'
import { useLocation } from 'react-router'

export type I18nState = {
  locale: string
  ltxt: typeof Polyglot.prototype.t
}

export enum I18nActionType {
  CHANGE_LOCALE = 'i18n/CHANGE_LOCALE'
}

export type I18nAction = {
  type: I18nActionType
  payload: Partial<I18nState>
}

export type I18nContextProps = {
  state: I18nState
  dispatch: Dispatch<I18nAction>
}

export type I18nComponentProps = I18nState

export type I18nProviderProps = Pick<ProviderProps<never>, 'children'>

export type I18nRouterProviderProps = I18nProviderProps

export const I18nContext = createContext({} as I18nContextProps)

const defaultLocale = __I18N_CONFIG__.defaultLocale
const locales = __I18N_CONFIG__.locales
const dict = __I18N_CONFIG__.dict
const polyglots: { [locale: string]: Polyglot } = {}

const initialState: I18nState = {
  locale: defaultLocale,
  ltxt: (...args) => getPolyglotByLocale(defaultLocale).t(...args),
}

export function actionChangeLocale(locale: string): I18nAction {
  return {
    type: I18nActionType.CHANGE_LOCALE,
    payload: {
      locale,
      ltxt: (...args) => getPolyglotByLocale(locale).t(...args),
    },
  }
}

const reducer = (state: I18nState = initialState, action: I18nAction): I18nState => {
  switch (action.type) {
  case I18nActionType.CHANGE_LOCALE:
    return {
      ...state,
      ...action.payload,
    }
  default:
    return state
  }
}

// In development, require context for all locale translation files and add them
// to Polyglot so that they can be watched by Webpack.
if (process.env.NODE_ENV === 'development') {
  const localeReq = require.context('../../config/locales', true, /^.*\.json$/)
  localeReq.keys().forEach(path => {
    const locale = path.replace('./', '').replace('.json', '')
    if (!~locales.indexOf(locale)) { return }
    dict[locale] = localeReq(path) as TranslationData
  })
}

// Instantiate one polyglot instance per locale.
for (const locale in dict) {
  if (!dict.hasOwnProperty(locale)) continue

  polyglots[locale] = new Polyglot({
    locale,
    phrases: dict[locale],
  })
}

/**
 * Gets the default locale of this app.
 *
 * @returns The default locale.
 */
export function getDefaultLocale(): string {
  return defaultLocale
}

/**
 * Infers the current locale from a URL.
 *
 * @param path The URL path.
 *
 * @returns The inferred locale if it exists.
 */
export function getLocaleFromPath(path: string): string | null {
  const locales = __I18N_CONFIG__.locales
  const normalizedPath = path.replace(/\/*$/, '') + '/'
  const possibleLocale = normalizedPath.split('/')[1]

  if (~locales.indexOf(possibleLocale)) {
    return possibleLocale
  }
  else {
    return null
  }
}

/**
 * Returns the localized version of a URL.
 *
 * @param path The URL path.
 * @param locale The locale to use for the conversion.
 *
 * @returns The localized URL.
 */
export function getLocalizedPath(path: string, locale: string = defaultLocale): string {
  const t = path.split('/').filter(v => v)

  if (t.length > 0 && __I18N_CONFIG__.locales.indexOf(t[0]) >= 0) {
    t.shift()
  }

  switch (locale) {
  case defaultLocale:
    return `/${t.join('/')}`
  default:
    return `/${locale}/${t.join('/')}`
  }
}

/**
 * Returns the unlocalized version of a URL.
 *
 * @param path The URL path.
 *
 * @returns The unlocalized path.
 */
export function getUnlocalizedPath(path: string): string {
  const locale = getLocaleFromPath(path)

  if (locale) {
    return path.replace(new RegExp(`^\\/${locale}\\b`, 'i'), '/')
  }
  else {
    return path
  }
}

/**
 * Returns the Polyglot instance associated to a locale.
 *
 * @param locale The locale.
 *
 * @returns The Polyglot instance.
 */
export function getPolyglotByLocale(locale: string): Polyglot {
  const polyglot = polyglots[locale]

  if (!polyglot) throw new Error(`No Polyglot found for locale "${locale}"`)

  return polyglot
}

/**
 * Provider of localization features.
 *
 * @param props @see I18nProviderProps
 *
 * @returns The provider.
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <I18nContext.Provider value={{ state, dispatch }}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * Provider of localization features that automatically infers the current
 * locale from the router route.
 *
 * @param props @see I18nRouterProviderProps
 *
 * @returns The provider.
 */
export function I18nRouterProvider({ children }: I18nRouterProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const location = useLocation()
  const locale = getLocaleFromPath(location.pathname) ?? locales[0]

  return (
    <I18nContext.Provider value={{
      state: {
        ...state,
        locale,
        ltxt: (...args) => getPolyglotByLocale(locale).t(...args),
      },
      dispatch,
    }}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * HOC for injecting localization properties into a component.
 *
 * @param Component The component to inject localization properties into.
 *
 * @returns The wrapper component.
 */
export function withI18n<P>(Component: ComponentType<P & I18nComponentProps>) {
  function WithI18n(props: P) {
    return (
      <I18nContext.Consumer>
        {({ state, dispatch }) => (
          <Component locale={state.locale} ltxt={state.ltxt} {...props}/>
        )}
      </I18nContext.Consumer>
    )
  }

  return WithI18n
}

/**
 * Hook for retrieving the change locale function.
 *
 * @returns The change locale function.
 */
export function useChangeLocale() {
  const dispatch = useContext(I18nContext).dispatch

  return (locale: string) => {
    dispatch(actionChangeLocale(locale))
  }
}

/**
 * Hook for retrieving the current locale.
 *
 * @returns Current locale.
 */
export function useLocale() {
  return useContext(I18nContext).state.locale
}

/**
 * Hook for retrieving the string localizing function for the current locale.
 *
 * @returns The string localizing function.
 */
export function useLtxt() {
  return useContext(I18nContext).state.ltxt
}

/**
 * Hook for retrieving the path localizing function for the current locale.
 *
 * @returns The path localizing function.
 */
export function useLpath() {
  const currentLocale = useContext(I18nContext).state.locale
  return (path: string, locale?: string) => getLocalizedPath(path, locale ?? currentLocale)
}

import Polyglot from 'node-polyglot';
import { Action } from 'redux';
import { getPolyglotByLocale } from '../utils/i18n';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:i18n') : () => {};

export enum I18nActionType {
  LOCALE_CHANGED = 'locale-changed',
}

export interface I18nAction extends Action<I18nActionType> {
  payload: Partial<I18nState>;
}

export interface I18nState {
  locale: string;
  ltxt: typeof Polyglot.prototype.t;
}

const initialState: I18nState = {
  locale: __I18N_CONFIG__.defaultLocale,
  ltxt: (...args) => getPolyglotByLocale(__I18N_CONFIG__.defaultLocale).t(...args),
};

export function changeLocale(locale: string): I18nAction {
  debug('Changing locale...', 'OK', locale);

  return {
    type: I18nActionType.LOCALE_CHANGED,
    payload: {
      locale,
      ltxt: (...args) => getPolyglotByLocale(locale).t(...args),
    },
  };
}

export default function reducer(state = initialState, action: I18nAction): I18nState {
  switch (action.type) {
  case I18nActionType.LOCALE_CHANGED:
    return {
      ...state,
      ...action.payload,
    };
  default:
    return state;
  }
}

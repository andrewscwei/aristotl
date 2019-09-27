import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

export enum CopyrightActionType {
  LOADED = 'copyright/LOADED',
}

export interface CopyrightState {
  [locale: string]: Readonly<Document> | undefined;
}

export interface CopyrightAction extends Action<CopyrightActionType> {
  payload: { [key: string]: any };
}

const initialState: CopyrightState = {

};

export default function reducer(state = initialState, action: CopyrightAction): CopyrightState {
  switch (action.type) {
    case CopyrightActionType.LOADED: {
      const { locale, doc: newDoc } = action.payload;

      return {
        ...state,
        [locale]: newDoc,
      };
    }
  }

  return state;
}

export function fetchCopyright() {
  return async (dispatch: Dispatch<CopyrightAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
    };

    const docs = await fetchDocsByType('copyright');

    dispatch({
      type: CopyrightActionType.LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        doc: docs[0],
      },
    });
  };
}

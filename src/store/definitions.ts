import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:definitions') : () => {};

export enum DefinitionsActionType {
  PRESENTED = 'definitions/PRESENTED',
  DISMISSED = 'definitions/DISMISSED',
  DISMISSED_ALL = 'definitions/DISMISSED_ALL',
  LOADED = 'definitions/LOADED',
}

export interface DefinitionsState {
  activeDocIds: Array<string>;
  lastActiveDocId?: string;
  docs: {
    [locale: string]: ReadonlyArray<Document>;
  };
}

export interface DefinitionsAction extends Action<DefinitionsActionType> {
  payload: { [key: string]: any };
}

const initialState: DefinitionsState = {
  activeDocIds: [],
  lastActiveDocId: undefined,
  docs: {},
};

export default function reducer(state = initialState, action: DefinitionsAction): DefinitionsState {
  switch (action.type) {
    case DefinitionsActionType.LOADED: {
      const { locale, docs: newDocs } = action.payload;
      const dict = {
        ...state.docs,
        [locale]: newDocs,
      };

      return {
        ...state,
        docs: dict,
      };
    }

    case DefinitionsActionType.PRESENTED: {
      const { docId } = action.payload;
      const activeDocIds = [...state.activeDocIds];
      const docIdx = activeDocIds.indexOf(docId);

      if (docIdx >= 0) activeDocIds.splice(docIdx, 1);
      activeDocIds.push(docId);

      return {
        ...state,
        activeDocIds,
        lastActiveDocId: _.last(activeDocIds),
      };
    }

    case DefinitionsActionType.DISMISSED: {
      const { docId } = action.payload;
      const activeDocIds = [...state.activeDocIds];
      const docIdx = activeDocIds.indexOf(docId);

      if (docIdx >= 0) activeDocIds.splice(docIdx, 1);

      return {
        ...state,
        activeDocIds,
        lastActiveDocId: _.last(activeDocIds),
      };
    }

    case DefinitionsActionType.DISMISSED_ALL: {
      return {
        ...state,
        activeDocIds: [],
        lastActiveDocId: undefined,
      };
    }
  }

  return state;
}

export function fetchDefinitions(options: Partial<QueryOptions> = {}, pages: number = 1) {
  return async (dispatch: Dispatch<DefinitionsAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      orderings: '[my.definition.name]',
      pageSize: 100,
      ...options,
    };

    const docs = await fetchDocsByType('definition', undefined, opts, pages);

    dispatch({
      type: DefinitionsActionType.LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        docs,
      },
    });
  };
}

export function presentDefinitionById(id: string) {
  debug('Presenting definition...', 'OK', id);

  return {
    type: DefinitionsActionType.PRESENTED,
    payload: {
      docId: id,
    },
  };
}

export function dismissDefinitionById(id: string) {
  debug('Dismissing definition...', 'OK', id);

  return {
    type: DefinitionsActionType.DISMISSED,
    payload: {
      docId: id,
    },
  };
}

export function dismissDefinitions() {
  debug('Dismissing all definitions...', 'OK');

  return {
    type: DefinitionsActionType.DISMISSED_ALL,
    payload: {},
  };
}

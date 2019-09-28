import Fuse from 'fuse.js';
import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:fallacies') : () => {};

export interface FallaciesFilters {
  formal: boolean;
  informal: boolean;
  alpha: boolean;
  beta: boolean;
  gamma: boolean;
}

export enum FallaciesActionType {
  DISMISSED = 'fallacies/DISMISSED',
  DISMISSED_ALL = 'fallacies/DISMISSED_ALL',
  FILTERED = 'fallacies/FILTERED',
  LOADED = 'fallacies/LOADED',
  PAGE_CHANGED = 'fallacies/PAGE_CHANGED',
  PRESENTED = 'fallacies/PRESENTED',
  SEARCHED = 'fallacies/SEARCHED',
}

export interface FallaciesState {
  activeDocIds: Array<string>;
  docs: { [locale: string]: ReadonlyArray<Document> };
  filters: FallaciesFilters;
  fuses: { [locale: string]: Readonly<Fuse<Document>> };
  lastActiveDocId?: string;
  pageIndex: number;
  pageSize: number;
  searchInput: string;
}

export interface FallaciesAction extends Action<FallaciesActionType> {
  payload: { [key: string]: any };
}

const initialState: FallaciesState = {
  activeDocIds: [],
  docs: {},
  fuses: {},
  filters: {
    formal: true,
    informal: true,
    alpha: true,
    beta: true,
    gamma: true,
  },
  lastActiveDocId: undefined,
  pageSize: 20,
  pageIndex: 0,
  searchInput: '',
};

export default function reducer(state = initialState, action: FallaciesAction): FallaciesState {
  switch (action.type) {
    case FallaciesActionType.LOADED: {
      const { locale, docs } = action.payload;

      const newDocs = {
        ...state.docs,
        [locale]: docs,
      };

      const newFuses = {
        ...state.fuses,
        [locale]: new Fuse(docs, {
          matchAllTokens: true,
          maxPatternLength: 24,
          minMatchCharLength: 0,
          shouldSort: true,
          tokenize: true,
          keys: [
            'data.abbreviation',
            'data.name',
            'data.aliases.name',
            'data.summary.text',
            'data.description.text',
            'tags',
          ],
        }),
      };

      return {
        ...state,
        docs: newDocs,
        fuses: newFuses,
      };
    }

    case FallaciesActionType.PRESENTED: {
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

    case FallaciesActionType.DISMISSED: {
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

    case FallaciesActionType.DISMISSED_ALL: {
      return {
        ...state,
        activeDocIds: [],
        lastActiveDocId: undefined,
      };
    }

    case FallaciesActionType.SEARCHED: {
      const { searchInput } = action.payload;

      return {
        ...state,
        searchInput,
        pageIndex: 0,
      };
    }

    case FallaciesActionType.PAGE_CHANGED: {
      const { pageIndex } = action.payload;

      return {
        ...state,
        pageIndex,
      };
    }

    case FallaciesActionType.FILTERED: {
      const { filters } = action.payload;

      return {
        ...state,
        filters,
        pageIndex: 0,
      };
    }
  }

  return state;
}

export function fetchFallacies(options: Partial<QueryOptions> = {}, pages: number = 1) {
  return async (dispatch: Dispatch<FallaciesAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      orderings: '[my.fallacy.abbreviation]',
      pageSize: 100,
      ...options,
    };

    const docs = await fetchDocsByType('fallacy', undefined, opts, pages);

    dispatch({
      type: FallaciesActionType.LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        docs,
      },
    });
  };
}

export function presentFallacyById(id: string) {
  debug('Presenting fallacy...', 'OK', id);

  return {
    type: FallaciesActionType.PRESENTED,
    payload: {
      docId: id,
    },
  };
}

export function dismissFallacyById(id: string) {
  debug('Dismissing fallacy...', 'OK', id);

  return {
    type: FallaciesActionType.DISMISSED,
    payload: {
      docId: id,
    },
  };
}

export function dismissAllFallacies() {
  debug('Dismissing all fallacies...', 'OK');

  return {
    type: FallaciesActionType.DISMISSED_ALL,
    payload: {},
  };
}

export function changeFallaciesSearchInput(searchInput: string) {
  debug('Searching fallacies...', 'OK', searchInput);

  return {
    type: FallaciesActionType.SEARCHED,
    payload: {
      searchInput,
    },
  };
}

export function changeFallaciesFilters(filters: FallaciesFilters) {
  debug('Filtering fallacies...', 'OK', filters);

  return {
    type: FallaciesActionType.FILTERED,
    payload: {
      filters,
    },
  };
}

export function changeFallaciesPage(pageIndex: number) {
  debug('Changing page index...', 'OK', pageIndex);

  return {
    type: FallaciesActionType.PAGE_CHANGED,
    payload: {
      pageIndex,
    },
  };
}

import Fuse from 'fuse.js';
import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { createSelector } from 'reselect';
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
  PRESENTED = 'fallacies/PRESENTED',
  SEARCHED = 'fallacies/SEARCHED',
}

export interface FallaciesState {
  activeDocIds: Array<string>;
  lastActiveDocId?: string;
  docs: { [locale: string]: ReadonlyArray<Document> };
  fdocs: { [locale: string]: Readonly<Fuse<Document>> };
  filters: FallaciesFilters;
  sdocs: ReadonlyArray<Document>;
  searchInput: string;
}

export interface FallaciesAction extends Action<FallaciesActionType> {
  payload: { [key: string]: any };
}

const initialState: FallaciesState = {
  activeDocIds: [],
  lastActiveDocId: undefined,
  docs: {},
  fdocs: {},
  filters: {
    formal: true,
    informal: true,
    alpha: true,
    beta: true,
    gamma: true,
  },
  sdocs: [],
  searchInput: '',
};

export default function reducer(state = initialState, action: FallaciesAction): FallaciesState {
  switch (action.type) {
    case FallaciesActionType.LOADED: {
      const { locale, docs: newDocs } = action.payload;

      const dict = {
        ...state.docs,
        [locale]: newDocs,
      };

      const fdict = {
        ...state.fdocs,
        [locale]: new Fuse(newDocs, {
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
        docs: dict,
        fdocs: fdict,
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
      };
    }

    case FallaciesActionType.FILTERED: {
      const { filters } = action.payload;

      return {
        ...state,
        filters,
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

export function dismissFallacies() {
  debug('Dismissing all fallacies...', 'OK');

  return {
    type: FallaciesActionType.DISMISSED_ALL,
    payload: {},
  };
}

export function searchFallacies(searchInput: string) {
  debug('Searching fallacies...', 'OK', searchInput);

  return {
    type: FallaciesActionType.SEARCHED,
    payload: {
      searchInput,
    },
  };
}

export function filterFallacies(filters: FallaciesFilters) {
  debug('Filtering fallacies...', 'OK', filters);

  return {
    type: FallaciesActionType.FILTERED,
    payload: {
      filters,
    },
  };
}

export const getFilteredFallacies = createSelector([
  (state: FallaciesState) => state.docs[__I18N_CONFIG__.defaultLocale] || [],
  (state: FallaciesState) => state.fdocs[__I18N_CONFIG__.defaultLocale] || [],
  (state: FallaciesState) => state.searchInput,
  (state: FallaciesState) => state.filters,
], (docs, fdocs, searchInput, filters) => {
  const res = _.isEmpty(searchInput) ? docs : fdocs.search(searchInput);
  const fres = _.filter(res, (v) => {
    const types = _.get(v, 'data.types');
    const inheritance = _.get(v, 'data.inheritance');
    const isFormal = _.find(types, (v) => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined;
    const isInformal = _.find(types, (v) => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined;
    const isAlpha = inheritance.length === 0;
    const isBeta = inheritance.length === 1;
    const isGamma = inheritance.length >= 2;

    if (isFormal && !filters.formal) return false;
    if (isInformal && !filters.informal) return false;
    if (isAlpha && !filters.alpha) return false;
    if (isBeta && !filters.beta) return false;
    if (isGamma && !filters.gamma) return false;

    return true;
  });

  debug('Getting filtered fallacies...', 'OK', fres);

  return fres;
});

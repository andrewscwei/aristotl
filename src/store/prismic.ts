import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

export enum PrismicActionType {
  DOC_LOADED = 'doc-loaded',
}

export interface PrismicState {
  docs: {
    [type: string]: {
      [locale: string]: ReadonlyArray<Document>;
    };
  };
}

export interface PrismicAction extends Action<PrismicActionType> {
  payload: { [key: string]: any };
}

const initialState: PrismicState = {
  docs: {},
};

/**
 * Reducer of the Prismic state.
 *
 * @param state - State to reduce.
 * @param action - Action to reduce.
 *
 * @returns Reduced state.
 */
export default function reducer(state = initialState, action: PrismicAction): PrismicState {
  switch (action.type) {
  case PrismicActionType.DOC_LOADED:
    const newState: PrismicState = _.cloneDeep(state);
    const { type, locale, docs: newDocs } = action.payload;

    if (!newState.docs[type]) newState.docs[type] = {};
    if (!newState.docs[type][locale]) newState.docs[type][locale] = [];

    const oldDocs = newState.docs[type][locale];
    const mergedDocs = _.unionWith([...newDocs, ...oldDocs], (doc1, doc2) => (doc1.id === doc2.id));

    newState.docs[type][locale] = mergedDocs;

    return newState;
  default:
    return state;
  }
}

export function reduceDoc(state: PrismicState, type: string, uidOrIndex?: string | number, locale: string = __I18N_CONFIG__.defaultLocale): Document | undefined {
  const docs = reduceDocs(state, type, locale);

  if (!docs) return undefined;

  if (typeof uidOrIndex === 'string') {
    return _.find(docs, (doc) => doc.uid === uidOrIndex);
  }
  else if (typeof uidOrIndex === 'number') {
    if (uidOrIndex >= docs.length) return undefined;
    return docs[uidOrIndex];
  }
  else {
    if (docs.length < 1) return undefined;
    return docs[0];
  }
}

export function reduceDocs(state: PrismicState, type: string, locale: string = __I18N_CONFIG__.defaultLocale): ReadonlyArray<Document> | undefined {
  const docs = state.docs[type];

  if (!docs) return undefined;

  const localizedDocs = docs[locale];

  if (!localizedDocs) return undefined;

  return localizedDocs;
}

export function fetchDocs(type: string, uid?: string, options: Partial<QueryOptions> = {}, pages: number = 1) {
  return async (dispatch: Dispatch<PrismicAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      ...options,
    };

    const docs = await fetchDocsByType(type, uid, opts, pages);

    dispatch({
      type: PrismicActionType.DOC_LOADED,
      payload: {
        type,
        locale: localeResolver(opts.lang, true),
        docs,
      },
    });
  };
}

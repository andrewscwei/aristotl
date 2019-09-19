import _ from 'lodash';
import Prismic from 'prismic-javascript';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { getAPI, loadPreviewToken, localeResolver } from '../utils/prismic';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:prismic') : () => {};

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

/**
 * Fetches Prismic docs by doc type and optional UID, then stores the results.
 * This operation uses the default locale and automatically accounts for
 * existing preview tokens in browser cookies.
 *
 * @param type - Prismic doc type.
 * @param uid - Prismic doc UID.
 * @param options - Customizable options for the API query. @see QueryOptions
 *
 * @returns Async action.
 */
export function fetchDocs(type: string, uid?: string, options: Partial<QueryOptions> = {}, pages: number = 1) {
  return async (dispatch: Dispatch<PrismicAction>) => {
    const api = await getAPI();
    const previewToken = loadPreviewToken();
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      orderings : '[document.first_publication_date desc]',
      ref: previewToken || api.master(),
      ...options,
    };

    let docs: Array<Document> = [];
    const startingPage = opts.page || 1;

    for (let i = 0; i < pages; i++) {
      const res = uid
        ? await api.query(Prismic.Predicates.at(`my.${type}.uid`, uid), { ...opts, page: Number(startingPage) + i })
        : await api.query(Prismic.Predicates.at('document.type', type), { ...opts, page: Number(startingPage) + i });

      docs = docs.concat(res.results);
    }

    if (opts.ref === previewToken) {
      debug(`Previewing docs from Prismic for type "${type}" and language "${opts.lang}"...`, 'OK', docs);
    }
    else {
      debug(`Fetching docs from Prismic for type "${type}" and language "${opts.lang}"...`, 'OK', docs);
    }

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

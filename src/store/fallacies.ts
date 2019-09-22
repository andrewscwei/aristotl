import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

export enum FallaciesActionType {
  DOC_LOADED = 'fallacies-loaded',
}

export interface FallaciesState {
  [locale: string]: ReadonlyArray<Document>;
}

export interface FallaciesAction extends Action<FallaciesActionType> {
  payload: { [key: string]: any };
}

const initialState: FallaciesState = {
};

export default function reducer(state = initialState, action: FallaciesAction): FallaciesState {
  switch (action.type) {
  case FallaciesActionType.DOC_LOADED:
    const newState: FallaciesState = _.cloneDeep(state);
    const { locale, docs: newDocs } = action.payload;

    if (!newState[locale]) newState[locale] = [];

    const oldDocs = newState[locale];
    const mergedDocs = _.unionWith([...newDocs, ...oldDocs], (doc1, doc2) => (doc1.id === doc2.id));

    newState[locale] = mergedDocs;

    return newState;
  default:
    return state;
  }
}

export function fetchAll(options: Partial<QueryOptions> = {}, pages: number = 2) {
  return async (dispatch: Dispatch<FallaciesAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      orderings: '[my.fallacy.abbreviation]',
      pageSize: 100,
      ...options,
    };

    const docs = await fetchDocsByType('fallacy', undefined, opts, pages);

    dispatch({
      type: FallaciesActionType.DOC_LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        docs,
      },
    });
  };
}

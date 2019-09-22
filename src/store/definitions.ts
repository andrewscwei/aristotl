import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

export enum DefinitionsActionType {
  DOC_LOADED = 'definitions-loaded',
}

export interface DefinitionsState {
  [locale: string]: ReadonlyArray<Document>;
}

export interface DefinitionsAction extends Action<DefinitionsActionType> {
  payload: { [key: string]: any };
}

const initialState: DefinitionsState = {

};

export default function reducer(state = initialState, action: DefinitionsAction): DefinitionsState {
  switch (action.type) {
  case DefinitionsActionType.DOC_LOADED:
    const newState: DefinitionsState = _.cloneDeep(state);
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

export function fetchAll(options: Partial<QueryOptions> = {}, pages: number = 1) {
  return async (dispatch: Dispatch<DefinitionsAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      orderings: '[my.definition.name]',
      pageSize: 100,
      ...options,
    };

    const docs = await fetchDocsByType('definition', undefined, opts, pages);

    dispatch({
      type: DefinitionsActionType.DOC_LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        docs,
      },
    });
  };
}

import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

export enum FallaciesActionType {
  DOC_PRESENTED = 'fallacies-presented',
  DOC_DISMISSED = 'fallacies-dismissed',
  DOC_LOADED = 'fallacies-loaded',
}

export interface FallaciesState {
  activeDocIds: Array<string>;
  docs: {
    [locale: string]: ReadonlyArray<Document>;
  };
}

export interface FallaciesAction extends Action<FallaciesActionType> {
  payload: { [key: string]: any };
}

const initialState: FallaciesState = {
  activeDocIds: [],
  docs: {},
};

export default function reducer(state = initialState, action: FallaciesAction): FallaciesState {
  const newState: FallaciesState = _.cloneDeep(state);

  switch (action.type) {
    case FallaciesActionType.DOC_LOADED: {
      const { locale, docs: newDocs } = action.payload;

      if (!newState.docs) newState.docs = {};
      if (!newState.docs[locale]) newState.docs[locale] = [];

      const oldDocs = newState.docs[locale];
      const mergedDocs = _.unionWith([...newDocs, ...oldDocs], (doc1, doc2) => (doc1.id === doc2.id));

      newState.docs[locale] = mergedDocs;

      break;
    }
    case FallaciesActionType.DOC_PRESENTED: {
      const { docId } = action.payload;

      const i = newState.activeDocIds.indexOf(docId);
      if (i >= 0) newState.activeDocIds.slice(i, 1);

      newState.activeDocIds.push(docId);

      break;
    }
    case FallaciesActionType.DOC_DISMISSED: {
      const { docId } = action.payload;
      const i = newState.activeDocIds.indexOf(docId);
      if (i >= 0) newState.activeDocIds.slice(i, 1);

      break;
    }
  }

  return newState;
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

export function presentFallacyById(id: string) {
  return (dispatch: Dispatch<FallaciesAction>) => {
    dispatch({
      type: FallaciesActionType.DOC_PRESENTED,
      payload: {
        docId: id,
      },
    });
  };
}

export function dismissFallacyById(id: string) {
  return (dispatch: Dispatch<FallaciesAction>) => {
    dispatch({
      type: FallaciesActionType.DOC_DISMISSED,
      payload: {
        docId: id,
      },
    });
  };
}

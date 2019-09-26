import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi';
import { Action, Dispatch } from 'redux';
import { fetchDocsByType, localeResolver } from '../utils/prismic';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:definitions') : () => {};

export enum DefinitionsActionType {
  DOC_PRESENTED = 'definitions-presented',
  DOC_DISMISSED = 'definitions-dismissed',
  DOC_DISMISSED_ALL = 'definitions-dismissed-all',
  DOC_LOADED = 'definitions-loaded',
}

export interface DefinitionsState {
  activeDocIds: Array<string>;
  docs: {
    [locale: string]: ReadonlyArray<Document>;
  };
}

export interface DefinitionsAction extends Action<DefinitionsActionType> {
  payload: { [key: string]: any };
}

const initialState: DefinitionsState = {
  activeDocIds: [],
  docs: {},
};

export default function reducer(state = initialState, action: DefinitionsAction): DefinitionsState {
  const newState: DefinitionsState = _.cloneDeep(state);
  switch (action.type) {
    case DefinitionsActionType.DOC_LOADED: {
      const { locale, docs: newDocs } = action.payload;

      if (!newState.docs) newState.docs = {};
      if (!newState.docs[locale]) newState.docs[locale] = [];

      const oldDocs = newState.docs[locale];
      const mergedDocs = _.unionWith([...newDocs, ...oldDocs], (doc1, doc2) => (doc1.id === doc2.id));

      newState.docs[locale] = mergedDocs;

      break;
    }
    case DefinitionsActionType.DOC_PRESENTED: {
      const { docId } = action.payload;
      const i = newState.activeDocIds.indexOf(docId);
      if (i >= 0) newState.activeDocIds.splice(i, 1);

      newState.activeDocIds.push(docId);

      break;
    }
    case DefinitionsActionType.DOC_DISMISSED: {
      const { docId } = action.payload;
      const i = newState.activeDocIds.indexOf(docId);
      if (i >= 0) newState.activeDocIds.splice(i, 1);

      break;
    }
    case DefinitionsActionType.DOC_DISMISSED_ALL: {
      newState.activeDocIds = [];

      break;
    }
  }

  return newState;
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
      type: DefinitionsActionType.DOC_LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        docs,
      },
    });
  };
}

export function presentDefinitionById(id: string) {
  debug('Presenting definition...', 'OK', id);

  return (dispatch: Dispatch<DefinitionsAction>) => {
    dispatch({
      type: DefinitionsActionType.DOC_PRESENTED,
      payload: {
        docId: id,
      },
    });
  };
}

export function dismissDefinitionById(id: string) {
  debug('Dismissing definition...', 'OK', id);

  return (dispatch: Dispatch<DefinitionsAction>) => {
    dispatch({
      type: DefinitionsActionType.DOC_DISMISSED,
      payload: {
        docId: id,
      },
    });
  };
}

export function dismissAllDefinitions() {
  debug('Dismissing all definitions...', 'OK');

  return (dispatch: Dispatch<DefinitionsAction>) => {
    dispatch({
      type: DefinitionsActionType.DOC_DISMISSED_ALL,
      payload: {
      },
    });
  };
}

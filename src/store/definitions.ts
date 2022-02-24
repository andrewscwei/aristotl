import { QueryParams } from '@prismicio/client'
import { PrismicDocument } from '@prismicio/types'
import { Action, Dispatch } from 'redux'
import { fetchDocsByType, localeResolver } from '../utils/prismic'

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:definitions') : () => {}

export enum DefinitionsActionType {
  PRESENTED = 'definitions/PRESENTED',
  DISMISSED = 'definitions/DISMISSED',
  DISMISSED_ALL = 'definitions/DISMISSED_ALL',
  LOADED = 'definitions/LOADED',
}

export type DefinitionsState = {
  activeDocIds: string[]
  docs: {
    [locale: string]: readonly PrismicDocument[]
  }
}

export type DefinitionsAction = Action<DefinitionsActionType> & {
  payload: { [key: string]: any }
}

const initialState: DefinitionsState = {
  activeDocIds: [],
  docs: {},
}

export default function reducer(state = initialState, action: DefinitionsAction): DefinitionsState {
  switch (action.type) {
  case DefinitionsActionType.LOADED: {
    const { locale, docs: newDocs } = action.payload
    const dict = {
      ...state.docs,
      [locale]: newDocs,
    }

    return {
      ...state,
      docs: dict,
    }
  }

  case DefinitionsActionType.PRESENTED: {
    const { docId } = action.payload
    const activeDocIds = [...state.activeDocIds]
    const docIdx = activeDocIds.indexOf(docId)

    if (docIdx >= 0) activeDocIds.splice(docIdx, 1)
    activeDocIds.push(docId)

    return {
      ...state,
      activeDocIds,
    }
  }

  case DefinitionsActionType.DISMISSED: {
    const { docId } = action.payload
    const activeDocIds = [...state.activeDocIds]
    const docIdx = activeDocIds.indexOf(docId)

    if (docIdx >= 0) activeDocIds.splice(docIdx, 1)

    return {
      ...state,
      activeDocIds,
    }
  }

  case DefinitionsActionType.DISMISSED_ALL: {
    return {
      ...state,
      activeDocIds: [],
    }
  }
  }

  return state
}

export function fetchDefinitionsAction(options: Partial<QueryParams> = {}, pages = 1) {
  return async (dispatch: Dispatch<DefinitionsAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      orderings: {
        field: 'my.definition.name',
      },
      pageSize: 100,
      ...options,
    }

    const docs = await fetchDocsByType('definition', undefined, opts, pages)

    dispatch({
      type: DefinitionsActionType.LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        docs,
      },
    })
  }
}

export function presentDefinitionByIdAction(id: string) {
  debug('Presenting definition...', 'OK', id)

  return {
    type: DefinitionsActionType.PRESENTED,
    payload: {
      docId: id,
    },
  }
}

export function dismissDefinitionByIdAction(id: string) {
  debug('Dismissing definition...', 'OK', id)

  return {
    type: DefinitionsActionType.DISMISSED,
    payload: {
      docId: id,
    },
  }
}

export function dismissDefinitionsAction() {
  debug('Dismissing all definitions...', 'OK')

  return {
    type: DefinitionsActionType.DISMISSED_ALL,
    payload: {},
  }
}

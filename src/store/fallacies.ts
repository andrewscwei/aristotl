import { QueryParams } from '@prismicio/client'
import { PrismicDocument } from '@prismicio/types'
import { Action, Dispatch } from 'redux'
import { fetchDocsByType, localeResolver } from '../utils/prismic'

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:fallacies') : () => {}

export type FallaciesFilters = {
  formal: boolean
  informal: boolean
  alpha: boolean
  beta: boolean
  gamma: boolean
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

export type FallaciesState = {
  activeDocIds: string[]
  docs: { [locale: string]: readonly PrismicDocument[] }
  filters: FallaciesFilters
  pageIndex: number
  pageSize: number
  searchInput: string
}

export type FallaciesAction = Action<FallaciesActionType> & {
  payload: { [key: string]: any }
}

const initialState: FallaciesState = {
  activeDocIds: [],
  docs: {},
  filters: {
    formal: true,
    informal: true,
    alpha: true,
    beta: true,
    gamma: true,
  },
  pageSize: 20,
  pageIndex: 0,
  searchInput: '',
}

export default function reducer(state = initialState, action: FallaciesAction): FallaciesState {
  switch (action.type) {
  case FallaciesActionType.LOADED: {
    const { locale, docs } = action.payload

    const newDocs = {
      ...state.docs,
      [locale]: docs,
    }

    return {
      ...state,
      docs: newDocs,
    }
  }

  case FallaciesActionType.PRESENTED: {
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

  case FallaciesActionType.DISMISSED: {
    const { docId } = action.payload
    const activeDocIds = [...state.activeDocIds]
    const docIdx = activeDocIds.indexOf(docId)

    if (docIdx >= 0) activeDocIds.splice(docIdx, 1)

    return {
      ...state,
      activeDocIds,
    }
  }

  case FallaciesActionType.DISMISSED_ALL: {
    return {
      ...state,
      activeDocIds: [],
    }
  }

  case FallaciesActionType.SEARCHED: {
    const { searchInput } = action.payload

    return {
      ...state,
      searchInput,
      pageIndex: 0,
    }
  }

  case FallaciesActionType.PAGE_CHANGED: {
    const { pageIndex } = action.payload

    return {
      ...state,
      pageIndex,
    }
  }

  case FallaciesActionType.FILTERED: {
    const { filters } = action.payload

    return {
      ...state,
      filters,
      pageIndex: 0,
    }
  }
  default:
    return state
  }
}

export function fetchFallaciesAction(options: Partial<QueryParams> = {}, pages = 1) {
  return async (dispatch: Dispatch<FallaciesAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
      orderings: {
        field: 'my.fallacy.abbreviation',
      },
      pageSize: 100,
      ...options,
    }

    const docs = await fetchDocsByType('fallacy', undefined, opts, pages)

    dispatch({
      type: FallaciesActionType.LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        docs,
      },
    })
  }
}

export function presentFallacyByIdAction(id: string) {
  debug('Presenting fallacy...', 'OK', id)

  return {
    type: FallaciesActionType.PRESENTED,
    payload: {
      docId: id,
    },
  }
}

export function dismissFallacyByIdAction(id: string) {
  debug('Dismissing fallacy...', 'OK', id)

  return {
    type: FallaciesActionType.DISMISSED,
    payload: {
      docId: id,
    },
  }
}

export function dismissAllFallaciesAction() {
  debug('Dismissing all fallacies...', 'OK')

  return {
    type: FallaciesActionType.DISMISSED_ALL,
    payload: {},
  }
}

export function changeFallaciesSearchInputAction(searchInput: string) {
  debug('Searching fallacies...', 'OK', searchInput)

  return {
    type: FallaciesActionType.SEARCHED,
    payload: {
      searchInput,
    },
  }
}

export function changeFallaciesFiltersAction(filters: FallaciesFilters) {
  debug('Filtering fallacies...', 'OK', filters)

  return {
    type: FallaciesActionType.FILTERED,
    payload: {
      filters,
    },
  }
}

export function changeFallaciesPageAction(pageIndex: number) {
  debug('Changing page index...', 'OK', pageIndex)

  return {
    type: FallaciesActionType.PAGE_CHANGED,
    payload: {
      pageIndex,
    },
  }
}

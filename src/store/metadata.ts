import { Document } from 'prismic-javascript/types/documents'
import { Action, Dispatch } from 'redux'
import { fetchDocsByType, localeResolver } from '../utils/prismic'

export enum MetadataActionType {
  LOADED = 'metadata/LOADED',
}

export type MetadataState = {
  [locale: string]: Readonly<Document> | undefined
}

export type MetadataAction = Action<MetadataActionType> & {
  payload: { [key: string]: any }
}

const initialState: MetadataState = {

}

export default function reducer(state = initialState, action: MetadataAction): MetadataState {
  switch (action.type) {
  case MetadataActionType.LOADED: {
    const { locale, doc: newDoc } = action.payload

    return {
      ...state,
      [locale]: newDoc,
    }
  }
  }

  return state
}

export function fetchMetadata() {
  return async (dispatch: Dispatch<MetadataAction>) => {
    const opts: any = {
      lang: localeResolver(__I18N_CONFIG__.defaultLocale),
    }

    const docs = await fetchDocsByType('metadata')

    dispatch({
      type: MetadataActionType.LOADED,
      payload: {
        locale: localeResolver(opts.lang, true),
        doc: docs[0],
      },
    })
  }
}

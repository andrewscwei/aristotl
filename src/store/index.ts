import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import definitions, { DefinitionsState } from './definitions'
import fallacies, { FallaciesState } from './fallacies'
import metadata, { MetadataState } from './metadata'

const composeEnhancers = process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export interface AppState {
  metadata: MetadataState
  definitions: DefinitionsState
  fallacies: FallaciesState
}

export const reducer = combineReducers({
  metadata,
  definitions,
  fallacies,
})

export default function() {
  const store = createStore(reducer, {}, composeEnhancers(applyMiddleware(thunk)))
  return store
}

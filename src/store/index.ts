import _ from 'lodash';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import copyright, { CopyrightState } from './copyright';
import definitions, { DefinitionsState } from './definitions';
import fallacies, { FallaciesState } from './fallacies';
import i18n, { I18nState } from './i18n';

const composeEnhancers = process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export interface AppState {
  copyright: CopyrightState;
  definitions: DefinitionsState;
  fallacies: FallaciesState;
  i18n: I18nState;
}

export const reducer = combineReducers({
  copyright,
  definitions,
  fallacies,
  i18n,
});

const initialState = window.__INITIAL_STATE__;
delete window.__INITIAL_STATE__;

const store = createStore(reducer, initialState || {}, composeEnhancers(applyMiddleware(thunk)));

window.snapSaveState = () => ({
  __INITIAL_STATE__: _.omit(store.getState(), [
    'i18n',
    'fallacies.fdocs',
  ]),
});

export default store;

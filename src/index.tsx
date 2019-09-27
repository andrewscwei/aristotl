/**
 * @file Entry file.
 */

import isTouchDevice from 'is-touch-device';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, RouteComponentProps } from 'react-router-dom';
import App from './containers/App';
import store from './store';

if (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) {
  window.localStorage.debug = 'app*';
}

// Detect touch device.
if (isTouchDevice()) {
  document.documentElement.classList.add('touch');
}

// Generator for base markup.
const markup = () => (
  <Provider store={store}>
    <Router>
      <Route render={(routeProps: RouteComponentProps<any>) => (
        <App route={routeProps}/>
      )}/>
    </Router>
  </Provider>
);

// Render the app.
const root = document.getElementById('app');

if (root!.hasChildNodes() && process.env.NODE_ENV !== 'development') {
  hydrate(markup(), root);
}
else {
  render(markup(), root);
}

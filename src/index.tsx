/**
 * @file Entry file.
 */

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, RouteComponentProps } from 'react-router-dom';
import Worker from 'worker-loader!./workers/web';
import App from './containers/App';
import store from './store';

if (process.env.NODE_ENV === 'development') {
  window.localStorage.debug = 'app*,worker*';
}

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app') : () => {};
const worker = new Worker();

worker.postMessage({ message: 'Hello, world!' });
worker.addEventListener('message', (event) => {
  debug(event.data.message);
});

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

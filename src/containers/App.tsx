/**
 * @file Client app root.
 */

import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Action, bindActionCreators, Dispatch } from 'redux';
import { ThemeProvider } from 'styled-components';
import routes from '../routes';
import { AppState } from '../store';
import { changeLocale, I18nState } from '../store/i18n';
import GlobalStyles from '../styles/global';
import * as theme from '../styles/theme';
import { getLocaleFromPath } from '../utils/i18n';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app') : () => {};

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {
  changeLocale: typeof changeLocale;
}

interface Props extends StateProps, DispatchProps {
  route: RouteComponentProps<{}>;
}

interface State {}

class App extends PureComponent<Props, State> {
  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
  }

  syncLocaleWithUrl() {
    const { route, changeLocale, i18n } = this.props;
    const newLocale = getLocaleFromPath(route.location.pathname);

    if (newLocale === i18n.locale) {
      debug(`Syncing locale with URL path "${route.location.pathname}"...`, 'SKIPPED');
      return;
    }

    changeLocale(newLocale);
  }

  generateRoutes() {
    this.syncLocaleWithUrl();

    return routes.map((route, index) => (
      <Route exact={route.exact} path={route.path} key={`route-${index}`} component={route.component}/>
    ));
  }

  onKeyUp = (event: KeyboardEvent) => {
    const searchBar = document.querySelector('#search input[type="text"]');

    switch (event.keyCode) {
    case 37:
    case 38:
    case 39:
    case 40: return;
    }

    if (!searchBar || !(searchBar instanceof HTMLInputElement)) return;
    if (searchBar === document.activeElement) return;

    searchBar.focus();
  }

  render() {
    const { route } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <Fragment>
          <GlobalStyles/>
          <Switch location={route.location}>{this.generateRoutes()}</Switch>
        </Fragment>
      </ThemeProvider>
    );
  }
}

export default hot(connect((state: AppState): StateProps => ({
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    changeLocale,
  }, dispatch),
)(App));

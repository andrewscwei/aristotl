/**
 * @file Client app root.
 */

import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import Footer from '../components/Footer';
import routes, { getLocaleFromPath } from '../routes';
import { AppState } from '../store';
import { changeLocale, I18nState } from '../store/i18n';
import globalStyles from '../styles/global';
import theme from '../styles/theme';

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
  constructor(props: Props) {
    super(props);

    debug('Initializing...', 'OK');
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

  render() {
    const { route } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <Fragment>
          <GlobalStyles/>
          <StyledBody>
            <CSSTransition key={route.location.key} timeout={300} classNames='route-transition'>
              <Switch location={route.location}>{this.generateRoutes()}</Switch>
            </CSSTransition>
          </StyledBody>
          <Footer/>
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

const GlobalStyles = createGlobalStyle<any>`
  ${globalStyles}
`;

const StyledBody = styled(TransitionGroup)`
  height: 100%;
  position: absolute;
  width: 100%;

  .route-transition-enter {
    opacity: 0;
  }

  .route-transition-enter.route-transition-enter-active {
    opacity: 1;
    transition: all .3s;
  }

  .route-transition-exit {
    opacity: 1;
  }

  .route-transition-exit.route-transition-exit-active {
    opacity: 0;
    transition: all .3s;
  }
`;

import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, media } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import Datasheet from '../components/Datasheet';
import Grid from '../components/Grid';
import SearchBar from '../components/SearchBar';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs } from '../store/prismic';
import { valueByTransitionStatus } from '../styles/utils';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:home') : () => {};

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {}

interface State {
  searchInput?: string;
  activeDoc?: Document;
}

class Home extends PureComponent<Props, State> {
  state = {
    searchInput: undefined,
    activeDoc: undefined,
  };

  onSearchInputChange(input: string) {
    this.setState({ searchInput: input });
  }

  onPresentDatasheet(doc?: Document) {
    debug('Presenting doc...', 'OK', doc);

    this.setState({
      activeDoc: doc,
    });
  }

  onDismissDatasheet() {
    debug('Dismissing doc...', 'OK');

    this.setState({
      activeDoc: undefined,
    });
  }

  render() {
    return (
      <StyledRoot>
        <Transition in={this.state.activeDoc === undefined} timeout={300} mountOnEnter={false}>
          {(state) => (
            <StyledMain transitionState={state}>
              <StyledSearchBar id='search' onChange={(input: string) => this.onSearchInputChange(input)}/>
              <StyledGrid searchInput={this.state.searchInput} onActivate={(doc) => this.onPresentDatasheet(doc)}/>
            </StyledMain>
          )}
        </Transition>
        <Transition in={this.state.activeDoc !== undefined} timeout={300}>
          {(state) => (
            <StyledDatasheetModal transitionState={state}>
              <StyledDatasheetModalBackground transitionState={state}/>
              <StyledDatasheet transitionState={state} doc={this.state.activeDoc} onExit={() => this.onDismissDatasheet()}/>
            </StyledDatasheetModal>
          )}
        </Transition>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchDocs,
  }, dispatch),
)(Home);

const StyledDatasheetModalBackground = styled.div<{
  transitionState: TransitionStatus;
}>`
  ${align.ftl}
  ${animations.transition('opacity', 300, 'ease-out')}
  background: ${(props) => props.theme.colors.black};
  height: 100%;
  opacity: ${(props) => valueByTransitionStatus(props.transitionState, [0, 0.4])};
  width: 100%;
  `;

const StyledDatasheet = styled(Datasheet)<{
  transitionState: TransitionStatus;
}>`
  ${align.tr}
  ${animations.transition(['opacity', 'transform'], 300, 'ease-out')}
  width: 100%;
  max-width: 90rem;
  height: 100%;
  transform: ${(props) => valueByTransitionStatus(props.transitionState, ['translate3d(100%, 0, 0)', 'translate3d(0, 0, 0)'])};
`;

const StyledDatasheetModal = styled.div<{
  transitionState: TransitionStatus;
}>`
  ${align.ftl}
  height: 100%;
  pointer-events: ${(props) => valueByTransitionStatus(props.transitionState, ['none', 'auto'])};
  width: 100%;
`;

const StyledSearchBar = styled(SearchBar)`
  margin-bottom: 5rem;
`;

const StyledGrid = styled(Grid)`
  margin-left: -1rem;
  max-width: 100rem;

  > * {
    margin: 1rem;
  }
`;

const StyledMain = styled.div<{
  transitionState: TransitionStatus;
}>`
  ${animations.transition(['opacity', 'transform'], 300)}
  padding: 5rem 3rem;
  background: ${(props) => props.theme.colors.offBlack};
  height: auto;
  min-height: 100%;
  opacity: ${(props) => valueByTransitionStatus(props.transitionState, [0.4, 1])};
  perspective: 80rem;
  pointer-events: ${(props) => valueByTransitionStatus(props.transitionState, ['none', 'auto'])};
  transform-origin: center;
  transform: ${(props) => valueByTransitionStatus(props.transitionState, ['translate3d(0, 0, 0) scale(.8)', 'translate3d(0, 0, 0) scale(1)'])};
  width: 100%;
`;

const StyledRoot = styled.div`
  height: 100%;
  width: 100%;
`;

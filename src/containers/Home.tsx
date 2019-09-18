import { Document } from 'prismic-javascript/d.ts/documents';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Transition } from 'react-transition-group';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import Datasheet from '../components/Datasheet';
import Grid from '../components/Grid';
import SearchBar from '../components/SearchBar';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs } from '../store/prismic';

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
        <StyledSearchBar id='search' onChange={(input: string) => this.onSearchInputChange(input)}/>
        <StyledGrid searchInput={this.state.searchInput} onActivate={(doc) => this.onPresentDatasheet(doc)}/>
        <Transition in={this.state.activeDoc !== undefined} timeout={300} mountOnEnter={true} unmountOnExit={true}>
          <Datasheet doc={this.state.activeDoc} onExit={() => this.onDismissDatasheet()}/>
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

const StyledSearchBar = styled(SearchBar)`
`;

const StyledGrid = styled(Grid)`
`;

const StyledRoot = styled.div`
  width: 100%;
  height: auto;
  min-height: 100%;
`;


import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import Grid from '../components/Grid';
import SearchBar from '../components/SearchBar';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs } from '../store/prismic';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {}

interface State {
  searchInput?: string;
}

class Home extends PureComponent<Props, State> {
  state = {
    searchInput: undefined,
  };

  onSearchInputChange(input: string) {
    this.setState({ searchInput: input });
  }

  render() {
    return (
      <StyledRoot>
        <SearchBar id='search' onChange={(input: string) => this.onSearchInputChange(input)}/>
        <Grid searchInput={this.state.searchInput}/>
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

const StyledRoot = styled.div`
  width: 100%;
  height: 100%;
`;

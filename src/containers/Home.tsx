import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import SearchBar from '../components/SearchBar';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs } from '../store/prismic';
import { localeResolver } from '../utils/prismic';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {}

interface State {

}

class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.props.fetchDocs('fallacy', undefined, {
      lang: localeResolver(this.props.i18n.locale),
    });
  }

  render() {
    return (
      <StyledRoot>
        <StyledSearchBar id='search'/>
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

const StyledRoot = styled.div`
  width: 100%;
  min-height: 100%;
`;

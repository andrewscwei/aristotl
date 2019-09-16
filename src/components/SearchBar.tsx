import { container } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {

}

interface Props extends StateProps, DispatchProps {
  className?: string;
  id?: string;
}

interface State {

}

class SearchBar extends PureComponent<Props, State> {
  render() {
    const { ltxt } = this.props.i18n;

    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        <StyledInput type='text' placeholder={ltxt('search-placeholder')}/>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(SearchBar);

const StyledInput = styled.input`
  ${container.box}
  ${(props) => props.theme.fonts.p1}
  background: transparent;
  height: 100%;
  width: 100%;
`;

const StyledRoot = styled.div`
  ${container.box}
  background: ${(props) => props.theme.colors.darkBlue};
  height: 7rem;
  padding: 0 2rem;
  width: 100%;
`;

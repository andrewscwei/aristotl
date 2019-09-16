import { animations, container, selectors } from 'promptu';
import React, { PropsWithChildren, SFC } from 'react';
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

interface Props extends StateProps, DispatchProps, PropsWithChildren<{}> {

}

const Footer: SFC<Props> = ({ i18n }) => (
  <StyledRoot>
    <nav>
      <StyledGitHubButton href='https://github.com/andrewscwei/aristotl'/>
    </nav>
  </StyledRoot>
);

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(Footer);

const StyledGitHubButton = styled.a`
  ${animations.transition('all', 200, 'ease-out')}
  ${container.fvcc}
  background: url(${require('../assets/images/github-icon.svg')}) center / 100% no-repeat;
  height: 2rem;
  width: 2rem;

  ${selectors.hwot} {
    opacity: .6;
  }
`;

const StyledRoot = styled.footer`
  ${container.fhcr}
  height: 5rem;
  padding: 0 2rem;
  width: 100%;
  z-index: 10;
`;

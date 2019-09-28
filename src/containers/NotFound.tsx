import { container, media } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps } from 'react-router-dom';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {

}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {

}

class NotFound extends PureComponent<Props> {
  componentDidMount() {
    document.title = this.props.i18n.ltxt('not-found');
  }

  render() {
    const { ltxt } = this.props.i18n;

    return (
      <Route render={(route: RouteComponentProps<any>) => {
        if (route.staticContext) {
          route.staticContext.statusCode = 404;
        }

        return (
          <StyledRoot>
            <StyledTitle>{ltxt('not-found-title')}</StyledTitle>
          </StyledRoot>
        );
      }}/>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(NotFound);

const StyledTitle = styled.h1`
  color: ${(props) => props.theme.colors.white};
  font-size: 2.4em;
  font-weight: 400;
  margin: 0;
  max-width: 550px;
  text-align: center;
  text-transform: uppercase;
`;

const StyledRoot = styled.div`
  ${container.fvcc}
  background: ${(props) => props.theme.colors.black};
  height: 100%;
  padding: 5rem 2rem 3rem;
  width: 100%;

  @media ${media.gtw(500)} {
    padding: 5rem 5rem 3rem;
  }
`;

import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { getCopyright } from '../selectors';
import { AppState } from '../store';
import { fetchCopyright } from '../store/copyright';
import { getMarkup } from '../utils/prismic';

interface StateProps {
  copyrightDoc?: Readonly<Document>;
}

interface DispatchProps {
  fetchCopyright: typeof fetchCopyright;
}

interface Props extends StateProps, DispatchProps {

}

class Footer extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    if (!this.props.copyrightDoc) {
      this.props.fetchCopyright();
    }
  }

  render() {
    const markup = getMarkup(this.props.copyrightDoc, 'data.description');

    return (
      <StyledRoot dangerouslySetInnerHTML={{ __html: markup || '' }}/>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    copyrightDoc: getCopyright(state),
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchCopyright,
  }, dispatch),
)(Footer);

const StyledRoot = styled.footer`
  color: ${(props) => props.theme.colors.grey};
  font-family: 'RobotoMono';
  font-size: 1.2rem;
  font-weight: 400;
  margin-top: 10rem;
  max-width: 120rem;
  user-select: text;
  width: 100%;

  p {
    line-height: 130%;
  }

  a {
    ${animations.transition(['color', 'opacity'], 200, 'ease-out')}
    color: ${(props) => props.theme.colors.red};

    ${selectors.hwot} {
      text-decoration: underline;
    }
  }
`;

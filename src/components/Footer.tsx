import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, selectors } from 'promptu';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { fetch as fetchCopyright } from '../store/copyright';
import { getMarkup, shallowEqualDoc } from '../utils/prismic';

interface StateProps {
  copyrightDoc?: Readonly<Document>;
}

interface DispatchProps {
  fetchCopyright: typeof fetchCopyright;
}

interface Props extends StateProps, DispatchProps {

}

class Footer extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.props.fetchCopyright();
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    if (!shallowEqualDoc(this.props.copyrightDoc, nextProps.copyrightDoc)) return true;
    return false;
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
    copyrightDoc: state.copyright[__I18N_CONFIG__.defaultLocale],
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
      color: inherit;
      text-transform: uppercase;
    }
  }
`;

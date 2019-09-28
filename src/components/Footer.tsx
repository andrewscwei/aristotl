import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, selectors, container } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { getMetadata } from '../selectors';
import { AppState } from '../store';
import { fetchMetadata } from '../store/metadata';
import { getMarkup, getUrls } from '../utils/prismic';

interface StateProps {
  metadataDoc?: Readonly<Document>;
}

interface DispatchProps {
  fetchMetadata: typeof fetchMetadata;
}

interface Props extends StateProps, DispatchProps {

}

class Footer extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.props.fetchMetadata();
  }

  render() {
    const markup = getMarkup(this.props.metadataDoc, 'data.copyright');
    const imageUrls = getUrls(this.props.metadataDoc, 'data.connect', 'icon');
    const links = getUrls(this.props.metadataDoc, 'data.connect', 'url');

    return (
      <StyledRoot>
        <div dangerouslySetInnerHTML={{ __html: markup || '' }}/>
        {imageUrls && imageUrls.length > 0 && links && links.length > 0 &&
          <StyledConnect>
            {imageUrls.map((v, i) => (
              <a key={`connect-${i}`} href={links[i]}>
                <img src={v}/>
              </a>
            ))}
          </StyledConnect>
        }
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    metadataDoc: getMetadata(state),
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchMetadata,
  }, dispatch),
)(Footer);

const StyledConnect = styled.div`
  ${container.fhcl}
  margin-top: 1rem;
  width: 100%;

  ${selectors.eblc} {
    margin-right: 1rem;
  }

  a {
    ${animations.transition('opacity', 200, 'ease-out')}
    height: 1.6rem;
    width: 1.6rem;
    opacity: .6;

    img {
      width: 100%;
      height: 100%;
    }

    ${selectors.hwot} {
      opacity: .3;
    }
  }
`;

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

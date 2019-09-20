import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, container } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import { linkResolver } from '../utils/prismic';
import ActionButton from './ActionButton';
import Pixel from './Pixel';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {

}

interface Props extends StateProps, DispatchProps {
  className?: string;
  id?: string;
  doc: Document;
  scrollLock: boolean;
  onExit: () => void;
}

class Datasheet extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    scrollLock: false,
    onExit: () => {},
  };

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = _.get(this.props.doc, 'data.abbreviation');
    const name = _.get(this.props.doc, 'data.name');
    const description = _.get(this.props.doc, 'data.description');

    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        <StyledCloseButton
          symbol='-'
          tintColor={colors.black}
          hoverTintColor={colors.red}
          onActivate={() => this.props.onExit()}
        />

        {abbreviation &&
          <StyledAbbreviation>
            <Pixel alignment='tr' tintColor={colors.black}/>
            <Pixel alignment='br' tintColor={colors.black}/>
            <Pixel alignment='cr' tintColor={colors.black}/>
            <Pixel alignment='tc' tintColor={colors.black}/>
            <Pixel alignment='bc' tintColor={colors.black}/>
            <h2>{abbreviation}</h2>
          </StyledAbbreviation>
        }

        {name &&
          <StyledName>{name}</StyledName>
        }

        {description && <StyledDescription dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(description, linkResolver) }}/>}
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
)(Datasheet);

const StyledCloseButton = styled(ActionButton)`
  ${align.tl}
  margin: 3rem;
`;

const StyledDescription = styled.div`
  max-width: 40rem;

  p {
    font-size: 1.4rem;
    font-family: 'RobotoMono';
    font-weight: 400;
  }
`;

const StyledAbbreviation = styled.div`
  ${align.tr}
  ${container.fhcr}
  background: ${(props) => props.theme.colors.black};
  height: 3rem;
  margin: 2.5rem 3rem;
  padding: 0 1rem;
  width: calc(100% - 9rem);

  h2 {
    color: ${(props) => props.theme.colors.white};
    font-family: 'NovaMono';
    font-size: 2.6rem;
    text-align: right;
  }
`;

const StyledName = styled.h1`
  font-family: 'RobotoMono';
  font-weight: 400;
  font-size: 3.6rem;
  text-transform: uppercase;
  line-height: 120%;
  width: 100%;
  max-width: 40rem;
  margin-bottom: 2rem;
`;

const StyledRoot = styled.div`
  -webkit-overflow-scrolling: touch;
  background: #fff;
  color: ${(props) => props.theme.colors.black};
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 8rem 3rem;
`;

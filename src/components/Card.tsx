import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors, utils, media } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import { linkResolver } from '../utils/prismic';
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
  isSummaryEnabled: boolean;
  onActivate: () => void;
}

interface State {

}

class Card extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    isSummaryEnabled: false,
    onActivate: () => {},
  };

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = _.get(this.props.doc, 'data.abbreviation');
    const name = _.get(this.props.doc, 'data.name');
    const summary = _.get(this.props.doc, 'data.summary');
    const type = _.get(this.props.doc, 'data.type.slug');

    return (
      <StyledRoot id={this.props.id} className={this.props.className} onClick={() => this.props.onActivate()}>
        <StyledAbbreviation>
          <Pixel alignment='tl' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='tc' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='tr' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='bl' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='bc' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='br' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <h2>{abbreviation}</h2>
        </StyledAbbreviation>
        {type &&
          <StyledType>
            <Pixel isHollow={type === 'informal-fallacy'}/>
            <span>{ltxt(type)}</span>
            <Pixel isHollow={type === 'informal-fallacy'}/>
          </StyledType>
        }
        {name && <StyledName>{name}</StyledName>}
        {this.props.isSummaryEnabled && summary && <StyledSummary dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(summary, linkResolver) }}/>}
        <StyledDivider/>
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
)(Card);

const StyledSummary = styled.div`
  color: ${(props) => props.theme.colors.grey};
  font-family: 'RobotoMono';
  font-size: 1.4rem;
  font-weight: 300;
  margin-top: 1rem;
  padding: 0 1rem;
  width: 100%;
  max-height: ${1.8 * 4}rem;
  overflow: hidden;

  p {
    line-height: 1.8rem;
  }
`;

const StyledType = styled.div`
  ${container.fhcl}
  height: 2rem;
  font-family: 'RobotoMono';
  font-weight: 400;
  font-size: 1.1rem;
  text-transform: uppercase;
  margin-bottom: 1rem;

  ${selectors.eblc} {
    margin-right: .4rem;
  }
`;

const StyledAbbreviation = styled.div`
  ${container.fvcl}
  background: ${(props) => `rgba(${utils.toRGBString(props.theme.colors.white)}, .04)`};
  border-bottom: 1px solid ${(props) => `rgba(${utils.toRGBString(props.theme.colors.white)}, .1)`};
  border-top: 1px solid ${(props) => `rgba(${utils.toRGBString(props.theme.colors.white)}, .1)`};
  margin-bottom: 1rem;
  padding: 0 1rem;
  width: 100%;
  overflow: visible;
  height: 9rem;

  h2 {
    font-family: 'NovaMono';
    font-size: 6rem;
    font-weight: 400;
  }
`;

const StyledName = styled.h1`
  width: 100%;
  font-size: 1.4rem;
  font-weight: 400;
  color: ${(props) => props.theme.colors.lightGrey};
  font-family: 'RobotoMono';
  padding: 0 1rem;
`;

const StyledDivider = styled.div`
  ${align.bl}
  ${animations.transition('background', 200, 'ease-out')}
  width: 2rem;
  height: .2rem;
  background: ${(props) => props.theme.colors.offBlack};
  margin: 2rem;
`;

const StyledRoot = styled.button`
  ${container.fvts}
  ${animations.transition(['background', 'color'], 100, 'ease-in-out')}
  background: ${(props) => props.theme.colors.black};
  height: 100%;
  overflow: hidden;
  padding: 1rem;
  text-align: left;
  transform: translate3d(0, 0, 0);
  width: 100%;

  ${selectors.hwot} {
    background: ${(props) => props.theme.colors.offBlack};
    color: ${(props) => props.theme.colors.white};

    ${StyledDivider} {
      background: ${(props) => props.theme.colors.white};
    }
  }
`;

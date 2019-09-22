import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors, utils } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import { getDocs, getMarkup, getText } from '../utils/prismic';
import Pixel from './Pixel';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {

}

interface Props extends StateProps, DispatchProps {
  className?: string;
  doc: Document;
  isSummaryEnabled: boolean;
  onActivate: () => void;
}

class Card extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    isSummaryEnabled: false,
    onActivate: () => {},
  };

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = getText(this.props.doc, 'data.abbreviation');
    const name = getText(this.props.doc, 'data.name');
    const summary = getMarkup(this.props.doc, 'data.summary');
    const typeDocs = getDocs(this.props.doc, 'data.types', 'type');

    return (
      <StyledRoot
        className={this.props.className}
        onClick={() => this.props.onActivate()}
      >
        <StyledAbbreviation>
          <Pixel alignment='tl' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='tc' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='tr' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='bl' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='bc' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <Pixel alignment='br' size={4} offset={1} tintColor={`rgba(${utils.toRGBString(colors.white)}, .1)`}/>
          <h2>{abbreviation}</h2>
        </StyledAbbreviation>

        <StyledTypes>
          {typeDocs && typeDocs.map((v: any, i) => (
            <StyledType key={`type-${i}`}>
              <Pixel isHollow={v.slug === 'informal-fallacy'}/>
              <span>{ltxt(v.slug)}</span>
            </StyledType>
          ))}
        </StyledTypes>

        {name &&
          <StyledName>{name}</StyledName>
        }

        {this.props.isSummaryEnabled && summary &&
          <StyledSummary dangerouslySetInnerHTML={{ __html: summary }}/>
        }

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
  margin-top: 1rem;
  max-height: ${1.8 * 6}rem;
  overflow: hidden;
  padding: 0 1rem;
  width: 100%;
  user-select: text;

  p {
    line-height: 1.8rem;
    font-family: 'RobotoMono';
    font-size: 1.4rem;
    font-weight: 400;
  }
`;

const StyledType = styled.div`
  ${container.fhcl}
  font-family: 'RobotoMono';
  font-size: 1.1rem;
  font-weight: 400;
  height: 2rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
  text-transform: uppercase;

  ${selectors.eblc} {
    margin-right: .4rem;
  }
`;

const StyledTypes = styled.div`
  ${container.fhcl}
`;

const StyledAbbreviation = styled.div`
  ${container.fvcl}
  background: ${(props) => `rgba(${utils.toRGBString(props.theme.colors.white)}, .04)`};
  border-bottom: 1px solid ${(props) => `rgba(${utils.toRGBString(props.theme.colors.white)}, .1)`};
  border-top: 1px solid ${(props) => `rgba(${utils.toRGBString(props.theme.colors.white)}, .1)`};
  height: 9rem;
  margin-bottom: 1rem;
  overflow: visible;
  padding: 0 1rem;
  width: 100%;
  user-select: text;

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
  user-select: text;
`;

const StyledDivider = styled.div`
  ${align.bl}
  ${animations.transition('background', 200, 'ease-out')}
  width: 2rem;
  height: .2rem;
  background: ${(props) => props.theme.colors.darkGrey};
  margin: 2rem;
`;

const StyledRoot = styled.button`
  ${container.fvts}
  ${animations.transition(['background', 'color'], 100, 'ease-in-out')}
  background: ${(props) => props.theme.colors.offBlack};
  height: 100%;
  overflow: hidden;
  padding: 1rem;
  text-align: left;
  transform: translate3d(0, 0, 0);
  width: 100%;

  > * {
    flex: 0 0 auto;
  }

  ${selectors.hwot} {
    background: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};

    ${StyledDivider} {
      background: ${(props) => props.theme.colors.white};
    }
  }
`;

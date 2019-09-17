import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors } from 'promptu';
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
  doc: Document;
  isExpanded: boolean;
  onActivate: () => void;
}

interface State {

}

class Card extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    onActivate: () => {},
  };

  state: State = {
    isExpanded: false,
  };

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = _.get(this.props.doc, 'data.abbreviation');
    const name = _.get(this.props.doc, 'data.name');
    const description = _.get(this.props.doc, 'data.description');

    return (
      <StyledRoot id={this.props.id} className={this.props.className} isExpanded={this.props.isExpanded} onClick={() => this.props.onActivate()}>
        <StyledAbbreviation>{abbreviation}</StyledAbbreviation>
        <StyledName>{name}</StyledName>
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

const StyledAbbreviation = styled.h2`
  width: 100%;
  font-size: 7rem;
  font-weight: 400;
  font-family: 'Playfair';
`;

const StyledName = styled.h1`
  width: 100%;
  font-size: 1.6rem;
  font-weight: 400;
`;

const StyledDivider = styled.div`
  ${align.bl}
  ${animations.transition('background', 300, 'ease-out')}
  width: 2rem;
  height: .4rem;
  background: #111;
  margin: 2rem;
`;

const StyledRoot = styled.button<{
  isExpanded: boolean;
}>`
  ${container.fvtl}
  ${animations.transition('all', 300, 'ease-out')}
  text-align: left;
  padding: 1rem 2rem 2rem;
  background: #ccc;
  color: #333;

  ${selectors.hwot} {
    background: #111;
    color: #fff;

    ${StyledDivider} {
      background: #fff;
    }
  }
`;

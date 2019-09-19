import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import { linkResolver } from '../utils/prismic';
import ActionButton from './ActionButton';

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
        {abbreviation && <StyledAbbreviation>{abbreviation}</StyledAbbreviation>}
        {name && <StyledName>{name}</StyledName>}
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
`;

const StyledAbbreviation = styled.h2`
`;

const StyledName = styled.h1`
`;

const StyledRoot = styled.div`
  -webkit-overflow-scrolling: touch;
  background: #fff;
  overflow-x: hidden;
  overflow-y: scroll;
  color: ${(props) => props.theme.colors.black};
`;

import { Document } from 'prismic-javascript/d.ts/documents';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';

interface StateProps {
  definitionDict: ReadonlyArray<Document>;
  i18n: I18nState;
}

interface DispatchProps {

}

interface Props extends StateProps, DispatchProps {
  className?: string;
  docId: string;
}

class Definition extends PureComponent<Props> {
  render() {
    const { ltxt } = this.props.i18n;

    return (
      <StyledRoot className={this.props.className}>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    definitionDict: state.definitions.docs[__I18N_CONFIG__.defaultLocale] || [],
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(Definition);

const StyledRoot = styled.button`

`;

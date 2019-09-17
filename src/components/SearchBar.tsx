import { align, container, media } from 'promptu';
import React, { ChangeEvent, PureComponent } from 'react';
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
  onChange: (input: string) => void;
}

interface State {

}

class SearchBar extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    onChange: () => {},
  };

  onChange(input: string) {
    this.props.onChange(input);
  }

  render() {
    const { ltxt } = this.props.i18n;

    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        <StyledInput placeholder={ltxt('search-placeholder')} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => this.onChange(event.currentTarget.value)}/>
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
)(SearchBar);

const StyledInput = styled.textarea`
  ${container.box}
  ${(props) => props.theme.fonts.search}
  background: transparent;
  height: 100%;
  width: 100%;
  text-align: right;
  color: #999;
  resize: none;
  border-right: 1px solid #ddd;
`;

const StyledRoot = styled.div`
  ${container.fvcc}
  padding: 6rem 0;
  z-index: ${(props) => props.theme.z.foreground};

  @media ${media.gtmobile} {
    ${align.ftl}
    width: ${(props) => props.theme.layout.searchBarWidthRatioAboveMobile}%;
    height: 100%;
  }

  @media ${media.gttablet} {
    width: ${(props) => props.theme.layout.searchBarWidthRatioAboveTablet}%;
  }
`;

import { container, media, selectors } from 'promptu';
import React, { ChangeEvent, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import Pixel from './Pixel';
import { colors } from '../styles/theme';

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
        <StyledPixels>
          <Pixel tintColor={colors.black}/>
          <Pixel tintColor={colors.black}/>
          <Pixel tintColor={colors.black}/>
        </StyledPixels>
        <StyledInput>
          <input
            type='text'
            placeholder={ltxt('search-placeholder')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => this.onChange(event.currentTarget.value)}
          />
        </StyledInput>
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

const StyledPixels = styled.div`
  ${container.fvcc}
  margin-right: .4rem;

  ${selectors.eblc} {
    margin-bottom: .4rem;
  }
`;

const StyledInput = styled.div`
  ${container.fvcl}
  ${(props) => props.theme.fonts.search}
  background: ${(props) => props.theme.colors.black};
  color: ${(props) => props.theme.colors.white};
  font-family: 'RobotoMono';
  font-size: 2rem;
  height: 5rem;
  padding: 0 1rem;
  width: 100%;

  input {
    width: 100%;
    background: transparent;
  }
`;

const StyledRoot = styled.div`
  ${container.fhcl}
  padding: 0;
  max-width: 40rem;
  width: 100%;
  z-index: ${(props) => props.theme.z.foreground};
`;

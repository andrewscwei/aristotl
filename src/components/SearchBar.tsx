import { align, container, selectors } from 'promptu';
import React, { ChangeEvent, createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { changeFallaciesFilters, changeFallaciesSearchInput } from '../store/fallacies';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import ActionButton from './ActionButton';
import Pixel from './Pixel';

interface StateProps {
  i18n: I18nState;
  searchInput: string;
}

interface DispatchProps {
  changeFallaciesFilters: typeof changeFallaciesFilters;
  changeFallaciesSearchInput: typeof changeFallaciesSearchInput;
}

interface Props extends StateProps, DispatchProps {
  autoFocus: boolean;
  className?: string;
  input?: string;
}

class SearchBar extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    autoFocus: true,
  };

  nodeRefs = {
    input: createRef<HTMLInputElement>(),
  };

  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyUp = (event: KeyboardEvent) => {
    if (!this.props.autoFocus) return;
    if (!this.nodeRefs.input.current) return;

    switch (event.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40: return;
    }

    if (this.nodeRefs.input.current === document.activeElement) return;

    this.nodeRefs.input.current.focus();
  }

  onClear() {
    this.props.changeFallaciesSearchInput('');
    this.props.changeFallaciesFilters({
      formal: true,
      informal: true,
      alpha: true,
      beta: true,
      gamma: true,
    });
  }

  render() {
    const { ltxt } = this.props.i18n;

    return (
      <StyledRoot className={this.props.className}>
        <StyledPixels>
          <Pixel tintColor={colors.offBlack}/>
          <Pixel tintColor={colors.offBlack}/>
          <Pixel tintColor={colors.offBlack}/>
        </StyledPixels>
        <StyledInput>
          <input
            type='text'
            value={this.props.searchInput}
            ref={this.nodeRefs.input}
            placeholder={ltxt('search-placeholder')}
            maxLength={24}
            onChange={(event: ChangeEvent<HTMLInputElement>) => this.props.changeFallaciesSearchInput(event.currentTarget.value)}
          />
        </StyledInput>
        <StyledActionButton
          symbol='c'
          isTogglable={true}
          tintColor={colors.white}
          hoverTintColor={colors.red}
          onActivate={() => this.onClear()}
        />
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
    searchInput: state.fallacies.searchInput,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    changeFallaciesFilters,
    changeFallaciesSearchInput,
  }, dispatch),
)(SearchBar);

const StyledPixels = styled.div`
  ${container.fvcc}
  ${align.cl}
  left: -1rem;
  margin-right: .4rem;

  ${selectors.eblc} {
    margin-bottom: .4rem;
  }
`;

const StyledInput = styled.div`
  ${container.fvcl}
  ${(props) => props.theme.fonts.search}
  color: ${(props) => props.theme.colors.white};
  font-size: 2rem;
  height: 5rem;
  width: 100%;

  input {
    width: 100%;
    background: transparent;
  }
`;

const StyledActionButton = styled(ActionButton)`
  margin-left: 1rem;
`;

const StyledRoot = styled.div`
  ${container.fhcl}
  background: ${(props) => props.theme.colors.offBlack};
  max-width: 40rem;
  padding: 0 1rem;
  width: 100%;
  z-index: ${(props) => props.theme.z.foreground};
`;

import { align, container, selectors } from 'promptu';
import React, { ChangeEvent, createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import ActionButton from './ActionButton';
import Pixel from './Pixel';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {

}

interface Props extends StateProps, DispatchProps {
  autoFocus: boolean;
  className?: string;
  id?: string;
  input?: string;
  onChange: (input: string) => void;
  onFocusIn: () => void;
  onFocusOut: () => void;
}

class SearchBar extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    autoFocus: true,
    onChange: () => {},
    onFocusIn: () => {},
    onFocusOut: () => {},
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

  clear() {
    if (!this.nodeRefs.input.current) return;
    this.nodeRefs.input.current.value = '';
    this.props.onChange('');
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
            value={this.props.input || ''}
            ref={this.nodeRefs.input}
            placeholder={ltxt('search-placeholder')}
            onFocus={() => this.props.onFocusIn()}
            onBlur={() => this.props.onFocusOut()}
            onChange={(event: ChangeEvent<HTMLInputElement>) => this.props.onChange(event.currentTarget.value)}
          />
        </StyledInput>
        <StyledActionButton
          symbol='c'
          isTogglable={true}
          tintColor={colors.white}
          hoverTintColor={colors.red}
          onActivate={() => this.clear()}
        />
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
  font-family: 'RobotoMono';
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
  background: ${(props) => props.theme.colors.black};
  max-width: 40rem;
  padding: 0 1rem;
  width: 100%;
  z-index: ${(props) => props.theme.z.foreground};
`;

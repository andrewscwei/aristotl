import { animations, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import styled, { css } from 'styled-components';
import { colors } from '../styles/theme';
import Pixel from './Pixel';

interface Props {
  className?: string;
  symbol: string;
  tintColor?: string;
  activeTintColor?: string;
  hoverTintColor?: string;
  isTogglable: boolean;
  onActivate: () => void;
  onToggleOn: () => void;
  onToggleOff: () => void;
}

interface State {
  isActive: boolean;
}

class ActionButton extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    isTogglable: false,
    onActivate: () => {},
    onToggleOn: () => {},
    onToggleOff: () => {},
  };

  state: State = {
    isActive: false,
  };

  onClick() {
    if (this.props.isTogglable) {
      if (this.state.isActive) {
        this.setState({ isActive: false });
        this.props.onToggleOff();
      }
      else {
        this.setState({ isActive: true });
        this.props.onToggleOn();
      }
    }
    else {
      this.setState({ isActive: false });
    }

    this.props.onActivate();
  }

  render() {
    const tintColor = this.props.tintColor || colors.white;

    return (
      <StyledRoot
        className={this.props.className}
        onClick={() => this.onClick()}
        isActive={this.state.isActive}
        tintColor={tintColor}
        hoverTintColor={this.props.hoverTintColor}
        activeTintColor={this.props.activeTintColor}
      >
        <StyledPixel size={3} alignment='tl'/>
        <StyledPixel size={3} alignment='tr'/>
        <StyledPixel size={3} alignment='bl'/>
        <StyledPixel size={3} alignment='br'/>
        <span>{this.props.symbol}</span>
      </StyledRoot>
    );
  }
}

export default ActionButton;

const StyledPixel = styled(Pixel)`
  ${animations.transition('background', 200, 'ease-out')}
`;

const StyledRoot = styled.button<{
  isActive: boolean;
  tintColor: string;
  hoverTintColor?: string;
  activeTintColor?: string;
}>`
  ${animations.transition(['border-color', 'color'], 200, 'ease-out')}
  border-color: ${(props) => (props.isActive && props.activeTintColor) ? props.activeTintColor : props.tintColor};
  border-style: solid;
  border-width: 1px;
  color: ${(props) => (props.isActive && props.activeTintColor) ? props.activeTintColor : props.tintColor};
  height: 2rem;
  width: 2rem;

  span {
    font-family: 'NovaMono';
    font-size: 1.4rem;
    font-weight: 400;
    line-height: 2rem;
  }

  ${StyledPixel} {
    background: ${(props) => (props.isActive && props.activeTintColor) ? props.activeTintColor : props.tintColor};
  }

  ${selectors.hwot} {
    ${(props) => props.hoverTintColor && css`
      border-color: ${props.hoverTintColor};
      color: ${props.hoverTintColor};

      ${StyledPixel} {
        background: ${props.hoverTintColor};
      }
    `}
  }
`;

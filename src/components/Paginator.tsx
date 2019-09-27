import { animations, container, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';
import Pixel from './Pixel';

interface Props {
  activePageIndex: number;
  className?: string;
  id?: string;
  numPages: number;
  tintColor: string;
  onActivate: (index: number) => void;
}

class Paginator extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    activePageIndex: 0,
    numPages: 1,
    tintColor: colors.white,
    onActivate: (index: number) => {},
  };

  prev() {
    this.props.onActivate((this.props.activePageIndex + this.props.numPages - 1) % this.props.numPages);
  }

  next() {
    this.props.onActivate((this.props.activePageIndex + 1) % this.props.numPages);
  }

  render() {
    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        {[...Array(Math.max(1, this.props.numPages)).keys()].map((v, i) => (
          <StyledButton
            key={i}
            isActive={this.props.activePageIndex === i}
            onClick={() => this.props.onActivate(i)}
          >
            <Pixel
              isHollow={this.props.activePageIndex !== i}
              size={10}
              tintColor={this.props.tintColor}
            />
          </StyledButton>
        ))}
      </StyledRoot>
    );
  }
}

export default Paginator;

const StyledButton = styled.button<{
  isActive: boolean;
}>`
  ${animations.transition('transform', 200, 'ease-out')}
  transform: translate3d(0, 0, 0) ${(props) => props.isActive ? 'scale(1.5)' : 'scale(1)'};
  pointer-events: ${(props) => props.isActive ? 'none' : 'auto'};

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.5);
  }
`;

const StyledRoot = styled.div`
  ${container.fhcc}
  margin: 5rem 0 3rem;
  width: 100%;

  ${selectors.eblc} {
    margin-right: 1rem;
  }
`;

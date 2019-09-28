import { container } from 'promptu';
import React, { SFC } from 'react';
import styled, { css } from 'styled-components';

interface Props {
  alignment?: 'tl' | 'tc' | 'tr' | 'bl' | 'bc' | 'br' | 'cl' | 'cr';
  className?: string;
  isHollow?: boolean;
  offset?: number;
  size?: number;
  tintColor?: string;
}

const Pixel: SFC<Props> = ({ alignment, className, isHollow, offset, size, tintColor }) => (
  <StyledRoot
    alignment={alignment}
    className={className}
    isHollow={isHollow || false}
    offset={offset || 0}
    size={size || 5}
    tintColor={tintColor || '#fff'}
  />
);

export default Pixel;

const StyledRoot = styled.div<{
  alignment: Props['alignment'];
  isHollow: boolean;
  offset: number;
  size: number;
  tintColor: string;
}>`
  ${container.box}
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  pointer-events: none;

  ${(props) => {
    if (props.isHollow) {
      return css`
        border: 1px solid ${props.tintColor}
      `;
    }
    else {
      return css`
        background: ${props.tintColor};
      `;
    }
  }}

  ${(props) => {
    switch (props.alignment) {
    case 'tl': return css`
      left: -${props.size + props.offset}px;
      position: absolute;
      top: -${props.size + props.offset}px;
    `;
    case 'tc': return css`
      position: absolute;
      margin: 0 auto;
      left: 0;
      right: 0;
      top: -${props.size + props.offset}px;
    `;
    case 'tr': return css`
      position: absolute;
      right: -${props.size + props.offset}px;
      top: -${props.size + props.offset}px;
    `;
    case 'bl': return css`
      bottom: -${props.size + props.offset}px;
      left: -${props.size + props.offset}px;
      position: absolute;
    `;
    case 'bc': return css`
      position: absolute;
      margin: 0 auto;
      left: 0;
      right: 0;
      bottom: -${props.size + props.offset}px;
    `;
    case 'br': return css`
      bottom: -${props.size + props.offset}px;
      position: absolute;
      right: -${props.size + props.offset}px;
    `;
    case 'cl': return css`
      position: absolute;
      left: -${props.size + props.offset}px;
      top: 0;
      bottom: 0;
      margin: auto 0;
    `;
    case 'cr': return css`
      position: absolute;
      right: -${props.size + props.offset}px;
      top: 0;
      bottom: 0;
      margin: auto 0;
    `;
    }
  }}
`;

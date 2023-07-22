import { classes } from 'promptu'
import React, { HTMLAttributes } from 'react'
import styled, { CSSProp, css } from 'styled-components'

type Props = HTMLAttributes<HTMLDivElement> & {
  alignment?: 'tl' | 'tc' | 'tr' | 'bl' | 'bc' | 'br' | 'cl' | 'cr'
  isHollow?: boolean
  offset?: number
  size?: number
  tintColor?: string
}

export default function Pixel({
  alignment,
  isHollow = false,
  offset = 0,
  size = 5,
  tintColor = '#fff',
  ...props
}: Props) {
  return (
    <StyledRoot
      {...props}
      alignment={alignment}
      isHollow={isHollow}
      offset={offset}
      size={size}
      tintColor={tintColor}
    />
  )
}

const StyledRoot = styled.div<{
  alignment: Props['alignment']
  isHollow: boolean
  offset: number
  size: number
  tintColor: string
}>`
  ${classes.box}
  background: ${props => props.isHollow ? 'transparent' : props.tintColor};
  border: ${props => props.isHollow ? `1px solid ${props.tintColor}` : 'none'};
  height: ${props => props.size}px;
  pointer-events: none;
  width: ${props => props.size}px;

  ${props => makeAlignmentCSS(props.alignment, props.size, props.offset)}
`

function makeAlignmentCSS(alignment: Props['alignment'], size: number, offset: number): CSSProp {
  switch (alignment) {
  case 'tl': return css`
    left: -${size + offset}px;
    position: absolute;
    top: -${size + offset}px;
  `
  case 'tc': return css`
    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: -${size + offset}px;
  `
  case 'tr': return css`
    position: absolute;
    right: -${size + offset}px;
    top: -${size + offset}px;
  `
  case 'bl': return css`
    bottom: -${size + offset}px;
    left: -${size + offset}px;
    position: absolute;
  `
  case 'bc': return css`
    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    bottom: -${size + offset}px;
  `
  case 'br': return css`
    bottom: -${size + offset}px;
    position: absolute;
    right: -${size + offset}px;
  `
  case 'cl': return css`
    position: absolute;
    left: -${size + offset}px;
    top: 0;
    bottom: 0;
    margin: auto 0;
  `
  case 'cr': return css`
    position: absolute;
    right: -${size + offset}px;
    top: 0;
    bottom: 0;
    margin: auto 0;
  `
  default: return css``
  }
}

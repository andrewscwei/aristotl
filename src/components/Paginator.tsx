import { animations, container, selectors } from 'promptu'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { colors } from '../styles/theme'
import Pixel from './Pixel'

type Props = HTMLAttributes<HTMLDivElement> & {
  numPages?: number
  pageIndex?: number
  tintColor?: string
  onActivate?: (pageIndex: number) => void
}

export default function Paginator({
  numPages = 1,
  pageIndex = 0,
  tintColor = colors.white,
  onActivate,
  ...props
}: Props) {
  return (
    <StyledRoot {...props}>
      {[...Array(Math.max(1, numPages)).keys()].map((v, i) => (
        <StyledButton
          key={i}
          isActive={pageIndex === i}
          onClick={() => onActivate?.(i)}
        >
          <Pixel
            isHollow={pageIndex !== i}
            size={10}
            tintColor={tintColor}
          />
        </StyledButton>
      ))}
    </StyledRoot>
  )
}

const StyledButton = styled.button<{
  isActive: boolean
}>`
  ${animations.transition('transform', 200, 'ease-out')}
  pointer-events: ${props => props.isActive ? 'none' : 'auto'};
  transform: translate3d(0, 0, 0) ${props => props.isActive ? 'scale(1.5)' : 'scale(1)'};
  margin: 0 .5rem;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.5);
  }
`

const StyledRoot = styled.div`
  ${container.fhcc}
  align-self: center;
  margin: 5rem 0 3rem;
`

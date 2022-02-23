import { animations, container, selectors } from 'promptu'
import React, { HTMLAttributes, useState } from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../styles/theme'
import Pixel from './Pixel'

type Props = HTMLAttributes<HTMLButtonElement> & {
  activeTintColor?: string
  hoverTintColor?: string
  isTogglable?: boolean
  symbol: string
  tintColor?: string
  onActivate?: () => void
  onToggleOn?: () => void
  onToggleOff?: () => void
}

export default function ActionButton({
  activeTintColor,
  hoverTintColor = colors.red,
  isTogglable = false,
  symbol,
  tintColor = colors.white,
  onActivate,
  onToggleOff,
  onToggleOn,
  ...props
}: Props) {
  const [isActive, setIsActive] = useState(false)

  const onClick = () => {
    if (isTogglable) {
      if (isActive) {
        setIsActive(false)
        onToggleOff?.()
      }
      else {
        setIsActive(true)
        onToggleOn?.()
      }
    }
    else {
      setIsActive(false)
    }

    onActivate?.()
  }

  return (
    <StyledRoot
      {...props}
      activeTintColor={activeTintColor}
      hoverTintColor={hoverTintColor}
      isActive={isActive}
      tintColor={tintColor}
      onClick={() => onClick()}
    >
      <StyledPixel size={3} alignment='tl'/>
      <StyledPixel size={3} alignment='tr'/>
      <StyledPixel size={3} alignment='bl'/>
      <StyledPixel size={3} alignment='br'/>
      <span>{symbol}</span>
    </StyledRoot>
  )
}

const StyledPixel = styled(Pixel)`
  ${animations.transition('background', 200, 'ease-out')}
`

const StyledRoot = styled.button<{
  isActive: boolean
  tintColor: string
  hoverTintColor?: string
  activeTintColor?: string
}>`
  ${animations.transition(['border-color', 'color'], 200, 'ease-out')}
  ${container.fvcc}
  border-color: ${props => (props.isActive && props.activeTintColor) ? props.activeTintColor : props.tintColor};
  border-style: solid;
  border-width: 1px;
  color: ${props => (props.isActive && props.activeTintColor) ? props.activeTintColor : props.tintColor};
  height: 2rem;
  width: 2rem;
  padding-bottom: .2rem;

  span {
    font-size: 1.4rem;
    font-weight: 400;
  }

  ${StyledPixel} {
    background: ${props => (props.isActive && props.activeTintColor) ? props.activeTintColor : props.tintColor};
  }

  ${selectors.hwot} {
    ${props => props.hoverTintColor && css`
      border-color: ${props.hoverTintColor};
      color: ${props.hoverTintColor};

      ${StyledPixel} {
        background: ${props.hoverTintColor};
      }
    `}
  }
`

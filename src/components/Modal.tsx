import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { align, animations, container } from 'promptu'
import React, { HTMLAttributes, ReactNode, Ref, useEffect, useRef } from 'react'
import { TransitionStatus } from 'react-transition-group/Transition'
import styled from 'styled-components'
import NavControlContainer from './NavControlContainer'
import { valueByTransitionStatus } from '../styles/utils'

type Props = HTMLAttributes<HTMLDivElement> & {
  isFocused?: boolean
  transitionStatus?: TransitionStatus
  children?: (scrollTargetRef: Ref<HTMLDivElement>, onExit?: () => void, onPrev?: () => void, onNext?: () => void) => ReactNode
  onPrev?: () => void
  onNext?: () => void
  onExit?: () => void
}

export default function Modal({
  isFocused = true,
  transitionStatus,
  children,
  onPrev,
  onNext,
  onExit,
  ...props
}: Props) {
  const scrollTargetRef = useRef<HTMLDivElement>(null)
  let scrollTargetElement: HTMLDivElement | undefined

  useEffect(() => {
    scrollTargetElement = scrollTargetRef.current ?? undefined

    if (scrollTargetElement) disableBodyScroll(scrollTargetElement)

    return () => {
      if (scrollTargetElement) enableBodyScroll(scrollTargetElement)
      scrollTargetElement = undefined
    }
  }, [scrollTargetRef])

  return (
    <StyledRoot {...props}
      transitionStatus={transitionStatus}
      isEnabled={isFocused}
      onPrev={() => onPrev?.()}
      onNext={() => onNext?.()}
      onEscape={() => onExit?.()}
    >
      <StyledBackground
        transitionStatus={transitionStatus}
        onClick={() => onExit?.()}
      />
      {children?.(scrollTargetRef, onExit, onPrev, onNext)}
    </StyledRoot>
  )
}

const StyledBackground = styled.div<{
  transitionStatus?: TransitionStatus
}>`
  ${align.tl}
  ${animations.transition('opacity', 200, 'ease-out')}
  height: 100%;
  opacity: 0;
  width: 100%;
`

const StyledRoot = styled(NavControlContainer)<{
  transitionStatus?: TransitionStatus
}>`
  ${align.ftl}
  ${container.fvcc}
  height: 100%;
  pointer-events: ${props => valueByTransitionStatus(['none', 'auto'], props.transitionStatus, true)};
  width: 100%;
`

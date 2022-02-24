import React, { PropsWithChildren, useEffect } from 'react'
// import Hammer from 'react-hammerjs'

type Props = PropsWithChildren<{
  isEnabled?: boolean
  onEscape?: () => void
  onNext?: () => void
  onPrev?: () => void
}>

export default function NavControlManager({
  children,
  isEnabled = false,
  onEscape,
  onNext,
  onPrev,
}: Props) {
  const onKeyUp = (event: KeyboardEvent) => {
    if (!isEnabled) return
    if (document.activeElement instanceof HTMLInputElement) return

    switch (event.keyCode) {
    case 39:
      onNext?.()
      break
    case 37:
      onPrev?.()
      break
    case 27:
      onEscape?.()
      break
    }
  }

  const onSwipe = (direction: number) => {
    if (!isEnabled) return

    switch (direction) {
    case 2: // Left
      onNext?.()
      break
    case 4: // Right
      onPrev?.()
    }
  }

  useEffect(() => {
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onNext, onPrev, onEscape])

  return (
    // <Hammer direction='DIRECTION_HORIZONTAL' onSwipe={event => this.onSwipe(event.direction)}>
    <>
      {children}
    </>
    // </Hammer>
  )
}

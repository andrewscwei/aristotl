import React, { HTMLAttributes, PropsWithChildren, useEffect, useState } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  isEnabled?: boolean
  onEscape?: () => void
  onNext?: () => void
  onPrev?: () => void
}>

const DRAG_VELOCITY_THRESHOLD = 0.5

export default function NavControlContainer({
  children,
  isEnabled = false,
  onEscape,
  onNext,
  onPrev,
  ...props
}: Props) {
  const [dragStartX, setDragStartX] = useState(NaN)
  const [dragEndX, setDragEndX] = useState(NaN)
  const [dragStartTime, setDragStartTime] = useState(NaN)

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

  const onDragStart = (x: number) => {
    if (isNaN(x)) return onDragCancel()
    setDragStartX(x)
  }

  const onDragMove = (x: number) => {
    const startPosition = dragStartX

    if (isNaN(startPosition)) return

    const hasMovement = startPosition !== x
    const hasStartTime = !isNaN(dragStartTime)

    if (!hasMovement) return

    if (!hasStartTime) setDragStartTime(Date.now())
    setDragEndX(x)
  }

  const onDragEnd = () => {
    const time = dragStartTime
    const startX = dragStartX
    const lastX = dragEndX

    if (isNaN(time) || isNaN(startX) || isNaN(lastX)) return

    const dt = Date.now() - time
    const dx = lastX - startX
    const vx = dx / dt

    if (Math.abs(vx) >= DRAG_VELOCITY_THRESHOLD) {
      if (vx > 0) {
        onPrev?.()
      }
      else {
        onNext?.()
      }
    }

    onDragCancel()
  }

  const onDragCancel = () => {
    setDragStartX(NaN)
    setDragEndX(NaN)
    setDragStartTime(NaN)
  }

  useEffect(() => {
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onNext, onPrev, onEscape])

  return (
    <div
      {...props}
      onTouchStart={event => onDragStart(event.targetTouches[0].clientX)}
      onTouchMove={event => onDragMove(event.targetTouches[0].clientX)}
      onTouchEnd={() => onDragEnd()}
      onMouseDown={event => onDragStart(event.clientX)}
      onMouseMove={event => onDragMove(event.clientX)}
      onMouseUp={() => onDragEnd()}
      onMouseLeave={() => onDragCancel()}
    >
      {children}
    </div>
  )
}

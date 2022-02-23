import React, { HTMLAttributes, PropsWithChildren, PureComponent } from 'react'
// import Hammer from 'react-hammerjs'

type Props = PropsWithChildren<HTMLAttributes<HTMLElement>> & {
  isEnabled: boolean
  onPrev: () => void
  onNext: () => void
  onEscape: () => void
}

class NavControlManager extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    isEnabled: false,
    onPrev: () => {},
    onNext: () => {},
    onEscape: () => {},
  }

  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp)
  }

  onKeyUp = (event: KeyboardEvent) => {
    if (!this.props.isEnabled) return
    if (document.activeElement instanceof HTMLInputElement) return

    switch (event.keyCode) {
    case 39:
      this.props.onNext()
      break
    case 37:
      this.props.onPrev()
      break
    case 27:
      this.props.onEscape()
      break
    }
  }

  onSwipe = (direction: number) => {
    if (!this.props.isEnabled) return

    switch (direction) {
    case 2: // Left
      this.props.onNext()
      break
    case 4: // Right
      this.props.onPrev()
    }
  }

  render() {
    return (
      // <Hammer direction='DIRECTION_HORIZONTAL' onSwipe={event => this.onSwipe(event.direction)}>
      <>{this.props.children}</>
      // </Hammer>
    )
  }
}

export default NavControlManager

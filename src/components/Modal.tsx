import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { align, animations, container } from 'promptu'
import React, { createRef, PureComponent, ReactNode, Ref } from 'react'
import { TransitionStatus } from 'react-transition-group/Transition'
import styled from 'styled-components'
import NavControlManager from '../managers/NavControlManager'
import { valueByTransitionStatus } from '../styles/utils'

interface Props {
  isFocused: boolean
  transitionStatus?: TransitionStatus
  children?: (scrollTargetRef: Ref<HTMLDivElement>, onExit?: () => void, onPrev?: () => void, onNext?: () => void) => ReactNode
  onPrev?: () => void
  onNext?: () => void
  onExit?: () => void
}

class Modal extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    isFocused: true,
  }

  nodeRefs = {
    scrollTarget: createRef<HTMLDivElement>(),
  }

  componentDidMount() {
    if (this.nodeRefs.scrollTarget.current) disableBodyScroll(this.nodeRefs.scrollTarget.current)
  }

  componentWillUnmount() {
    if (this.nodeRefs.scrollTarget.current) enableBodyScroll(this.nodeRefs.scrollTarget.current)
  }

  render() {
    return (
      <NavControlManager
        isEnabled={this.props.isFocused}
        onPrev={() => this.props.onPrev && this.props.onPrev()}
        onNext={() => this.props.onNext && this.props.onNext()}
        onEscape={() => this.props.onExit && this.props.onExit()}
      >
        <StyledRoot transitionStatus={this.props.transitionStatus}>
          <StyledBackground
            transitionStatus={this.props.transitionStatus}
            onClick={() => this.props.onExit && this.props.onExit()}
          />
          {this.props.children && this.props.children(this.nodeRefs.scrollTarget, this.props.onExit, this.props.onPrev, this.props.onNext)}
        </StyledRoot>
      </NavControlManager>
    )
  }
}

export default Modal

const StyledBackground = styled.div<{
  transitionStatus?: TransitionStatus
}>`
  ${align.tl}
  ${animations.transition('opacity', 200, 'ease-out')}
  height: 100%;
  opacity: 0;
  width: 100%;
`

const StyledRoot = styled.div<{
  transitionStatus?: TransitionStatus
}>`
  ${align.ftl}
  ${container.fvcc}
  height: 100%;
  pointer-events: ${props => valueByTransitionStatus(['none', 'auto'], props.transitionStatus, true)};
  width: 100%;
`

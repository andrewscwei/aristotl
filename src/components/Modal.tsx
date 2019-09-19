import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { align, animations } from 'promptu';
import React, { createRef, PureComponent, ReactNode } from 'react';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import styled from 'styled-components';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

interface Props {
  in: boolean;
  children: (transitionState: TransitionStatus, onExit: () => void) => ReactNode;
  onExit: () => void;
}

class Modal extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    in: false,
    onExit: () => {},
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
  };

  componentWillMount() {
    if (this.nodeRefs.root.current) enableBodyScroll(this.nodeRefs.root.current);
  }

  componentDidUpdate(prevProps: Props) {
    if ((this.nodeRefs.root.current) && (prevProps.in !== this.props.in)) {
      if (this.props.in) {
        disableBodyScroll(this.nodeRefs.root.current);
      }
      else {
        enableBodyScroll(this.nodeRefs.root.current);
      }
    }
  }

  render() {
    return (
      <Transition in={this.props.in} timeout={timeoutByTransitionStatus(200)}>
        {(state) => (
          <StyledRoot ref={this.nodeRefs.root} transitionState={state}>
            <StyledBackground onClick={() => this.props.onExit()} transitionState={state}/>
            {this.props.children(state, this.props.onExit)}
          </StyledRoot>
        )}
      </Transition>
    );
  }
}

export default Modal;

const StyledBackground = styled.div<{
  transitionState: TransitionStatus;
}>`
  ${animations.transition('opacity', 200, 'ease-out')}
  background: ${(props) => props.theme.colors.black};
  height: 100%;
  opacity: ${(props) => valueByTransitionStatus(props.transitionState, [0, 0.4])};
  width: 100%;
`;

const StyledRoot = styled.div<{
  transitionState: TransitionStatus;
}>`
  ${align.ftl}
  height: 100%;
  pointer-events: ${(props) => valueByTransitionStatus(props.transitionState, ['none', 'auto'])};
  width: 100%;
`;

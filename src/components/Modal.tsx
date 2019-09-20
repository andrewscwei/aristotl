import { align, animations } from 'promptu';
import React, { PureComponent, ReactNode } from 'react';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import styled from 'styled-components';
import NavControlManager from '../managers/NavControlManager';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

interface Props {
  in: boolean;
  children: (transitionStatus: TransitionStatus, onExit: () => void) => ReactNode;
  onExit: () => void;
}

class Modal extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    in: false,
    onExit: () => {},
  };

  render() {
    return (
      <Transition in={this.props.in} timeout={timeoutByTransitionStatus(200)}>
        {(status) => (
          <StyledRoot transitionStatus={status}>
            <NavControlManager isEnabled={this.props.in} onEscape={() => this.props.onExit()} onPrev={() => this.props.onExit()}>
              <div>
                <StyledBackground onClick={() => this.props.onExit()} transitionStatus={status}/>
                {this.props.children(status, this.props.onExit)}
              </div>
            </NavControlManager>
          </StyledRoot>
        )}
      </Transition>
    );
  }
}

export default Modal;

const StyledBackground = styled.div<{
  transitionStatus: TransitionStatus;
}>`
  ${animations.transition('opacity', 200, 'ease-out')}
  background: ${(props) => props.theme.colors.black};
  height: 100%;
  opacity: ${(props) => valueByTransitionStatus(props.transitionStatus, [0, 0.4])};
  width: 100%;
`;

const StyledRoot = styled.div<{
  transitionStatus: TransitionStatus;
}>`
  ${align.ftl}
  height: 100%;
  pointer-events: ${(props) => valueByTransitionStatus(props.transitionStatus, ['none', 'auto'])};
  width: 100%;
`;

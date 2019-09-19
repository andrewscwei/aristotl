import { align, animations } from 'promptu';
import React, { PureComponent, ReactNode } from 'react';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import styled from 'styled-components';
import { valueByTransitionStatus } from '../styles/utils';

interface Props {
  in: boolean;
  children: (transitionState: TransitionStatus) => ReactNode;
}

class Modal extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    in: false,
  };

  render() {
    return (
      <Transition in={this.props.in} timeout={300}>
        {(state) => (
          <StyledRoot transitionState={state}>
            <StyledBackground transitionState={state}/>
            {this.props.children(state)}
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
  ${animations.transition('opacity', 300, 'ease-out')}
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

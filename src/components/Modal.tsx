import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { align, animations } from 'promptu';
import React, { createRef, Fragment, PureComponent, ReactNode, Ref } from 'react';
import { TransitionStatus } from 'react-transition-group/Transition';
import styled from 'styled-components';
import NavControlManager from '../managers/NavControlManager';
import { valueByTransitionStatus } from '../styles/utils';

interface Props {
  transitionStatus?: TransitionStatus;
  children?: (onExit: () => void, ref: Ref<HTMLDivElement>) => ReactNode;
  onExit: () => void;
}

class Modal extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    onExit: () => {},
  };

  nodeRefs = {
    modal: createRef<HTMLDivElement>(),
  };

  componentDidMount() {
    if (this.nodeRefs.modal.current) disableBodyScroll(this.nodeRefs.modal.current);
  }

  componentWillUnmount() {
    if (this.nodeRefs.modal.current) enableBodyScroll(this.nodeRefs.modal.current);
  }

  render() {
    return (
      <StyledRoot transitionStatus={this.props.transitionStatus}>
        <NavControlManager isEnabled={true} onEscape={() => this.props.onExit()}>
          <div>
            <StyledBackground onClick={() => this.props.onExit()} transitionStatus={this.props.transitionStatus}/>
            {this.props.children && this.props.children(this.props.onExit, this.nodeRefs.modal)}
          </div>
        </NavControlManager>
      </StyledRoot>
    );
  }
}

export default Modal;

const StyledBackground = styled.div<{
  transitionStatus?: TransitionStatus;
}>`
  ${animations.transition('opacity', 200, 'ease-out')}
  background: ${(props) => props.theme.colors.black};
  height: 100%;
  opacity: ${(props) => valueByTransitionStatus([0, 0.4], props.transitionStatus, true)};
  width: 100%;
`;

const StyledRoot = styled.div<{
  transitionStatus?: TransitionStatus;
}>`
  ${align.ftl}
  height: 100%;
  pointer-events: ${(props) => valueByTransitionStatus(['none', 'auto'], props.transitionStatus, true)};
  width: 100%;
`;

import { align, animations, utils } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Transition, TransitionGroup } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import Fallacy from '../components/Fallacy';
import Modal from '../components/Modal';
import { AppState } from '../store';
import { dismissFallacyById } from '../store/fallacies';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:fallacy-stack-modal') : () => {};

interface StateProps {
  activeFallacyIds: Array<string>;
  activeDefinitionIds: Array<string>;
}

interface DispatchProps {
  dismissFallacyById: typeof dismissFallacyById;
}

interface Props extends StateProps, DispatchProps {

}

class FallacyStackModal extends PureComponent<Props> {
  render() {
    return (
      <StyledRoot isFocused={this.props.activeFallacyIds.length > 0}>
        <TransitionGroup>
          {(this.props.activeFallacyIds.map((fallacyId, i) => (
            <Transition key={fallacyId} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
              {(status) => (
                <Modal
                  isFocused={i === (this.props.activeFallacyIds.length - 1) && this.props.activeDefinitionIds.length === 0}
                  transitionStatus={status}
                  onExit={() => this.props.dismissFallacyById(fallacyId)}
                >
                  {(onExit, scrollTargetRef) => {
                    return (
                      <StyledFallacy
                        docId={fallacyId}
                        ref={scrollTargetRef}
                        stackIndex={this.props.activeFallacyIds.length - i - 1}
                        transitionStatus={status}
                      />
                    );
                  }}
                </Modal>
              )}
            </Transition>
          )))}
        </TransitionGroup>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    activeFallacyIds: state.fallacies.activeDocIds,
    activeDefinitionIds: state.definitions.activeDocIds,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    dismissFallacyById,
  }, dispatch),
)(FallacyStackModal);

const StyledFallacy = styled(Fallacy)<{
  stackIndex: number;
  transitionStatus?: TransitionStatus;
}>`
  ${align.tr}
  ${animations.transition(['opacity', 'transform'], 200, 'ease-out')}
  height: 100%;
  max-width: 50rem;
  opacity: ${(props) => props.stackIndex === 0 ? 1 : 0.6};
  pointer-events: ${(props) => props.stackIndex === 0 ? 'auto' : 'none'};
  transform: ${(props) => valueByTransitionStatus(['translate3d(100%, 0, 0)', `translate3d(${-props.stackIndex * 2}rem, 0, 0)`], props.transitionStatus, true)};
  width: 90%;
`;

const StyledRoot = styled.div<{
  isFocused: boolean;
}>`
  ${align.ftl}
  ${animations.transition('background', 200, 'ease-out')}
  background: ${(props) => `rgba(${utils.toHexString(props.theme.colors.black)}, ${props.isFocused ? 0.6 : 0})`};
  height: 100%;
  pointer-events: ${(props) => props.isFocused ? 'auto' : 'none'};
  width: 100%;
  z-index: ${(props) => props.theme.z.overlays};
`;

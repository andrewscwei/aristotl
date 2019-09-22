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
import { dismissFallacyById, presentFallacyById } from '../store/fallacies';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

interface StateProps {
  activeFallacyIds: Array<string>;
}

interface DispatchProps {
  presentFallacyById: typeof presentFallacyById;
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
                  isFocused={i === (this.props.activeFallacyIds.length - 1)}
                  transitionStatus={status}
                  onExit={() => this.props.dismissFallacyById(fallacyId)}
                >
                  {(onExit, ref) => {
                    return (
                      <StyledFallacy
                        docId={fallacyId}
                        ref={ref}
                        stackIndex={this.props.activeFallacyIds.length - i - 1}
                        transitionStatus={status}
                        onDocChange={(docId) => this.props.presentFallacyById(docId)}
                        onExit={() => onExit()}
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
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    dismissFallacyById,
    presentFallacyById,
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
  ${animations.transition('background', 200, 'ease-out')}
  background: ${(props) => `rgba(${utils.toHexString(props.theme.colors.black)}, ${props.isFocused ? 0.4 : 0})`};
  pointer-events: ${(props) => props.isFocused ? 'auto' : 'none'};
`;

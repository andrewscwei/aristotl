import _ from 'lodash';
import { align, animations, utils } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Transition, TransitionGroup } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import Definition from '../components/Definition';
import Modal from '../components/Modal';
import { AppState } from '../store';
import { dismissDefinitionById } from '../store/definitions';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:definition-stack-modal') : () => {};

interface StateProps {
  activeDefinitionIds: Array<string>;
}

interface DispatchProps {
  dismissDefinitionById: typeof dismissDefinitionById;
}

interface Props extends StateProps, DispatchProps {

}

const DX = [...Array(10).keys()].map(() => _.random(0, 1) === 0 ? 3 : -3);
const DY = [...Array(10).keys()].map(() => _.random(0, 1) === 0 ? 3 : -3);

class DefinitionStackModal extends PureComponent<Props> {
  render() {
    const r = _.random(0, 20, true);

    return (
      <StyledRoot isFocused={this.props.activeDefinitionIds.length > 0}>
        <TransitionGroup>
          {(this.props.activeDefinitionIds.map((definitionId, i) => (
            <Transition key={definitionId} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
              {(status) => (
                <Modal
                  isFocused={i === (this.props.activeDefinitionIds.length - 1)}
                  transitionStatus={status}
                  onExit={() => this.props.dismissDefinitionById(definitionId)}
                >
                  {(onExit, scrollTargetRef) => {
                    return (
                      <StyledDefinition
                        docId={definitionId}
                        ref={scrollTargetRef}
                        maxStacks={this.props.activeDefinitionIds.length}
                        stackIndex={i}
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
    activeDefinitionIds: state.definitions.activeDocIds,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    dismissDefinitionById,
  }, dispatch),
)(DefinitionStackModal);

const StyledDefinition = styled(Definition)<{
  stackIndex: number;
  maxStacks: number;
  transitionStatus?: TransitionStatus;
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-out')}
  max-width: 50rem;
  opacity: ${(props) => (props.stackIndex === (props.maxStacks - 1)) ? 1 : 0.6};
  pointer-events: ${(props) => (props.stackIndex === (props.maxStacks - 1)) ? 'auto' : 'none'};
  transform: ${(props) => valueByTransitionStatus([
    'translate3d(0, 0, 0) scale(.9)',
    `translate3d(${(props.maxStacks - 1 - props.stackIndex) * DX[props.stackIndex % 10]}rem, ${(props.maxStacks - 1 - props.stackIndex) * DY[props.stackIndex % 10]}rem, 0) scale(1)`,
  ], props.transitionStatus, true)};
  width: 90%;
`;

const StyledRoot = styled.div<{
  isFocused: boolean;
}>`
  ${align.ftl}
  ${animations.transition('background', 200, 'ease-out')}
  background: ${(props) => `rgba(${utils.toRGBString(props.theme.colors.black)}, ${props.isFocused ? 0.6 : 0})`};
  height: 100%;
  pointer-events: ${(props) => props.isFocused ? 'auto' : 'none'};
  width: 100%;
  z-index: ${(props) => props.theme.z.overlays};
`;

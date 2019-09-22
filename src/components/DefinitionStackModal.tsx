import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Transition, TransitionGroup } from 'react-transition-group';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import Definition from '../components/Definition';
import Modal from '../components/Modal';
import { AppState } from '../store';
import { timeoutByTransitionStatus } from '../styles/utils';

interface StateProps {
  activeDefinitionIds: Array<string>;
}

interface DispatchProps {
}

interface Props extends StateProps, DispatchProps {

}

class DefinitionStackModal extends PureComponent<Props> {
  render() {
    return (
      <StyledRoot isFocused={this.props.activeDefinitionIds.length > 0}>
        <TransitionGroup>
          {(this.props.activeDefinitionIds.map((definitionId) => (
            <Transition key={definitionId} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
              {(status) => (
                <Modal transitionStatus={status} onExit={() => {}}>
                  {(onExit, ref) => {
                    return (
                      <StyledDefinition
                        docId={definitionId}
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

  }, dispatch),
)(DefinitionStackModal);

const StyledDefinition = styled(Definition)`

`;

const StyledRoot = styled.div<{
  isFocused: boolean;
}>`

`;

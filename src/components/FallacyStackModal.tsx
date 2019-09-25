import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
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

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:fallacy-stack-modal') : () => {};

interface StateProps {
  activeFallacyIds: Array<string>;
  activeDefinitionIds: Array<string>;
  fallacyDict: ReadonlyArray<Document>;

}

interface DispatchProps {
  presentFallacyById: typeof presentFallacyById;
  dismissFallacyById: typeof dismissFallacyById;
}

interface Props extends StateProps, DispatchProps {

}

class FallacyStackModal extends PureComponent<Props> {
  getPrevDoc(currDocId: string): Document | undefined {
    const currIndex = _.findIndex(this.props.fallacyDict, (v) => v.id === currDocId);
    if (currIndex < 1) return undefined;
    return this.props.fallacyDict[currIndex - 1];
  }

  getNextDoc(currDocId: string): Document | undefined {
    const currIndex = _.findIndex(this.props.fallacyDict, (v) => v.id === currDocId);
    if (currIndex >= (this.props.fallacyDict.length - 1)) return undefined;
    return this.props.fallacyDict[currIndex + 1];
  }

  onPrev(currDocId: string) {
    const doc = this.getPrevDoc(currDocId);
    if (!doc) return;
    this.props.presentFallacyById(doc.id);
    this.props.dismissFallacyById(currDocId);
  }

  onNext(currDocId: string) {
    const doc = this.getNextDoc(currDocId);
    if (!doc) return;
    this.props.presentFallacyById(doc.id);
    this.props.dismissFallacyById(currDocId);
  }

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
                  onPrev={this.getPrevDoc(fallacyId) ? () => this.onPrev(fallacyId) : undefined}
                  onNext={this.getNextDoc(fallacyId) ? () => this.onNext(fallacyId) : undefined}
                  onExit={() => this.props.dismissFallacyById(fallacyId)}
                >
                  {(scrollTargetRef, onExit, onPrev, onNext) => {
                    return (
                      <StyledFallacy
                        docId={fallacyId}
                        ref={scrollTargetRef}
                        stackIndex={this.props.activeFallacyIds.length - i - 1}
                        transitionStatus={status}
                        onPrev={onPrev}
                        onNext={onNext}
                        onExit={onExit}
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
    fallacyDict: state.fallacies.docs[__I18N_CONFIG__.defaultLocale] || [],
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    presentFallacyById,
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
  max-width: 60rem;
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

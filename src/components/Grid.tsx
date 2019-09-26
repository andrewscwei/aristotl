import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container } from 'promptu';
import React, { PureComponent } from 'react';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import styled from 'styled-components';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';
import Card from './Card';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:grid') : () => {};

interface Props {
  className?: string;
  id?: string;
  docs: ReadonlyArray<Document>;
  isSummaryEnabled: boolean;
  onActivate: (doc: Document) => void;
}

class Grid extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    docs: [],
    onActivate: () => {},
  };

  onActivate(cardIndex: number) {
    if (cardIndex >= this.props.docs.length) throw new Error(`Invalid index ${cardIndex} provided`);

    this.props.onActivate(this.props.docs[cardIndex]);
  }

  render() {
    debug('Rendering...', 'OK');

    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        {this.props.docs.map((doc: Document, i: number) => {
          const duration = 150;
          const delay = i * 20;

          return (
            <Transition in={true} key={doc.id} appear={true} timeout={timeoutByTransitionStatus(duration + delay, true)} mountOnEnter={true} unmountOnExit={true}>
              {(status) => (
                <StyledCard
                  delay={delay}
                  duration={duration}
                  isSummaryEnabled={this.props.isSummaryEnabled}
                  transitionStatus={status}
                >
                  <Card doc={doc} isSummaryEnabled={this.props.isSummaryEnabled} onActivate={() => this.onActivate(i)}/>
                </StyledCard>
              )}
            </Transition>
          );
        })}
      </StyledRoot>
    );
  }
}

export default Grid;

const StyledCard = styled.div<{
  delay: number;
  duration: number;
  isSummaryEnabled: boolean;
  transitionStatus: TransitionStatus;
}>`
  ${animations.transition('all', 200, 'ease-out')}
  overflow: hidden;

  &::after {
    ${align.tl}
    ${(props) => animations.transition('transform', props.duration, 'ease-in-out', props.delay)}
    background: ${(props) => props.theme.colors.offBlack};
    content: '';
    height: 100%;
    transform: ${(props) => valueByTransitionStatus(['translate3d(0, 0, 0)', 'translate3d(100%, 0, 0)'], props.transitionStatus, true)};
    width: 100%;
  }
`;

const StyledRoot = styled.div`
  ${animations.transition(['transform'], 150, 'ease-out')}
  ${container.fhtl}
  flex-wrap: wrap;
  transform: translate3d(0, 0, 0);
`;

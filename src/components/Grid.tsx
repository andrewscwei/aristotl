import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, media } from 'promptu';
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
  onActivate: (docId: string) => void;
}

class Grid extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    docs: [],
    onActivate: () => {},
  };

  onActivate(cardIndex: number) {
    if (cardIndex >= this.props.docs.length) throw new Error(`Invalid index ${cardIndex} provided`);
    const doc = this.props.docs[cardIndex];
    if (!doc || !doc.uid) return;
    this.props.onActivate(doc.uid);
  }

  render() {
    return (
      <StyledRoot className={this.props.className}>
        {this.props.docs.map((doc: Document, i: number) => {
          const duration = 150;
          const delay = i * 20;

          return (
            <Transition in={true} key={`${this.props.id}-${doc.id}`} appear={true} timeout={timeoutByTransitionStatus(duration + delay, true)} mountOnEnter={true} unmountOnExit={true}>
              {(status) => (
                <StyledCard
                  delay={delay}
                  duration={duration}
                  isSummaryEnabled={this.props.isSummaryEnabled}
                  transitionStatus={status}
                >
                  <Card
                    doc={doc}
                    isSummaryEnabled={this.props.isSummaryEnabled}
                    onActivate={() => this.onActivate(i)}
                  />
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
  height: ${(props) => props.isSummaryEnabled ? 'auto' : 'auto'};
  margin: 1rem .5rem;
  overflow: hidden;
  width: ${(props) => props.isSummaryEnabled ? '100%' : '100%'};

  &::after {
    ${align.tl}
    ${(props) => animations.transition('transform', props.duration, 'ease-in-out', props.delay)}
    background: ${(props) => props.theme.colors.offBlack};
    content: '';
    height: 100%;
    transform: ${(props) => valueByTransitionStatus(['translate3d(0, 0, 0)', 'translate3d(100%, 0, 0)'], props.transitionStatus, true)};
    width: 100%;
  }

  @media ${media.gtw(400)} {
    height: ${(props) => props.isSummaryEnabled ? 'auto' : '28rem'};
    margin: 1rem;
    width: ${(props) => props.isSummaryEnabled ? '100%' : 'calc(50% - 2rem)'};
  }

  @media ${media.gtw(540)} {
    height: ${(props) => props.isSummaryEnabled ? '40rem' : '30rem'};
    width: calc(50% - 2rem);
  }

  @media ${media.gtw(660)} {
    height: ${(props) => props.isSummaryEnabled ? '33rem' : '30rem'};
    width: ${(props) => props.isSummaryEnabled ? '28rem' : '25rem'};
  }
`;

const StyledRoot = styled.div`
  ${animations.transition(['transform'], 150, 'ease-out')}
  ${container.fhtl}
  flex-wrap: wrap;
  flex: 1 0 auto;
  margin-left: -.5rem;
  max-width: 120rem;
  transform: translate3d(0, 0, 0);
  width: calc(100% + 1rem);

  @media ${media.gtw(400)} {
    margin-left: -1rem;
    width: calc(100% + 2rem);
  }
`;

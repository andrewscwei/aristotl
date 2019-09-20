import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, media } from 'promptu';
import React, { PureComponent } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { timeoutByTransitionStatus } from '../styles/utils';
import Card from './Card';

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
    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        {this.props.docs.map((doc: Document, i: number) => (
          <CSSTransition key={`${Date.now()}-${i}`} timeout={timeoutByTransitionStatus(i * 20 + 150)} classNames='card'>
            <StyledCard index={i} isSummaryEnabled={this.props.isSummaryEnabled}>
              <Card doc={doc} isSummaryEnabled={this.props.isSummaryEnabled} onActivate={() => this.onActivate(i)}/>
            </StyledCard>
          </CSSTransition>
        ))}
      </StyledRoot>
    );
  }
}

export default Grid;

const StyledCard = styled.div<{
  index: number;
  isSummaryEnabled: boolean;
}>`
  ${animations.transition('all', 200, 'ease-out')}
  overflow: hidden;

  &::after {
    ${align.tl}
    background: ${(props) => props.theme.colors.offBlack};
    content: '';
    height: 100%;
    transform: translate3d(100%, 0, 0);
    width: 100%;
  }

  &.card-enter {
    &::after {
      transform: translate3d(0, 0, 0);
    }
  }

  &.card-enter.card-enter-active {
    &::after {
      ${(props) => animations.transition('transform', 150, 'ease-in-out', 20 * props.index)}
      transform: translate3d(100%, 0, 0);
    }
  }

  &.card-exit {
    &::after {
      transform: translate3d(100%, 0, 0);
    }
  }

  &.card-exit.card-exit-active {
    &::after {
      ${(props) => animations.transition('transform', 0, 'ease-out', 0)}
      transform: translate3d(0, 0, 0);
    }
  }
`;

const StyledRoot = styled(TransitionGroup)`
  ${animations.transition(['transform'], 150, 'ease-out')}
  ${container.fhtl}
  flex-wrap: wrap;
  transform: translate3d(0, 0, 0);
`;

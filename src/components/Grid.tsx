import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container } from 'promptu';
import React, { PureComponent } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { timeoutByTransitionStatus } from '../styles/utils';
import Card from './Card';

interface Props {
  className?: string;
  id?: string;
  docs: ReadonlyArray<Document>;
  input?: string;
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
          <CSSTransition key={`${this.props.input}-${i}`} timeout={timeoutByTransitionStatus(i * 20 + 300)} classNames='card'>
            <StyledCard index={i}>
              <Card doc={doc} summaryEnabled={this.props.isSummaryEnabled} onActivate={() => this.onActivate(i)}/>
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
}>`
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
      ${(props) => animations.transition('transform', 300, 'ease-in-out', 20 * props.index)}
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
  ${animations.transition(['transform'], 300, 'ease-out')}
  ${container.fhtl}
  flex-wrap: wrap;
  transform: translate3d(0, 0, 0);
`;


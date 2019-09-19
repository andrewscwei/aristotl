import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors } from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import Hammer from 'react-hammerjs';
import { RouteComponentProps } from 'react-router';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import styled from 'styled-components';
import ActionButton from '../components/ActionButton';
import Datasheet from '../components/Datasheet';
import Grid from '../components/Grid';
import Modal from '../components/Modal';
import Paginator from '../components/Paginator';
import SearchBar from '../components/SearchBar';
import Statistics from '../components/Statistics';
import DocumentManager from '../managers/DocumentManager';
import { colors } from '../styles/theme';
import { valueByTransitionStatus } from '../styles/utils';

interface Props extends RouteComponentProps<{}> {

}

interface State {
  activeDoc?: Document;
  currentPageIndex: number;
  isSummaryEnabled: boolean;
  searchInput?: string;
}

class Home extends PureComponent<Props, State> {
  state = {
    activeDoc: undefined,
    currentPageIndex: 0,
    isSummaryEnabled: false,
    searchInput: undefined,
  };

  nodeRefs = {
    paginator: createRef<Paginator>(),
  };

  onSwipe(direction: number) {
    const paginator = this.nodeRefs.paginator.current;

    if (!paginator) return;

    switch (direction) {
    case 2: // Left
      paginator.next();
      break;
    case 4: // Right
      paginator.prev();
    }
  }

  render() {
    return (
      <Fragment>
        <Transition in={this.state.activeDoc === undefined} timeout={200} mountOnEnter={false}>
          {(status) => (
            <Hammer onSwipe={(event) => this.onSwipe(event.direction)} direction='DIRECTION_HORIZONTAL'>
              <StyledRoot transitionStatus={status}>
                <StyledHeader>
                  <SearchBar
                    id='search'
                    onChange={(input: string) => this.setState({ searchInput: input })}
                  />
                  <ActionButton
                    symbol='i'
                    isTogglable={true}
                    tintColor={colors.white}
                    hoverTintColor={colors.red}
                    activeTintColor={colors.red}
                    onToggleOn={() => this.setState({ isSummaryEnabled: true })}
                    onToggleOff={() => this.setState({ isSummaryEnabled: false })}
                  />
                </StyledHeader>
                <DocumentManager pageIndex={this.state.currentPageIndex} searchInput={this.state.searchInput}>
                  {(docs, totalDocs, maxPages, startIndex, endIndex, numFormals, numInformals) => (
                    <Fragment>
                      <StyledStatistics
                        totalResults={totalDocs}
                        subtotalResultsStart={startIndex + 1}
                        subtotalResultsEnd={endIndex}
                        totalFormal={numFormals}
                        totalInformal={numInformals}
                      />
                      <StyledPaginator
                        ref={this.nodeRefs.paginator}
                        activePageIndex={this.state.currentPageIndex}
                        maxPages={maxPages}
                        onActivate={(index) => this.setState({ currentPageIndex: index })}
                      />
                      <StyledGrid
                        salt={`${this.state.searchInput}-${this.state.currentPageIndex}`}
                        docs={docs}
                        isSummaryEnabled={this.state.isSummaryEnabled}
                        onActivate={(doc) => this.setState({ activeDoc: doc })}
                      />
                    </Fragment>
                  )}
                </DocumentManager>
              </StyledRoot>
            </Hammer>
          )}
        </Transition>
        <Modal in={this.state.activeDoc !== undefined} onExit={() => this.setState({ activeDoc: undefined })}>
          {(status, onExit) => (
            <StyledDatasheet
              transitionStatus={status}
              doc={this.state.activeDoc}
              onExit={() => onExit()}
            />
          )}
        </Modal>
      </Fragment>
    );
  }
}

export default Home;

const StyledDatasheet = styled(Datasheet)<{
  transitionStatus: TransitionStatus;
}>`
  ${align.tr}
  ${animations.transition(['opacity', 'transform'], 200, 'ease-out')}
  width: 90%;
  max-width: 60rem;
  height: 100%;
  transform: ${(props) => valueByTransitionStatus(props.transitionStatus, ['translate3d(100%, 0, 0)', 'translate3d(0, 0, 0)'])};
`;

const StyledHeader = styled.header`
  ${container.fhcl}
  width: 100%;
  margin-bottom: 1rem;
  justify-content: space-between;

  ${selectors.eblc} {
    margin-right: 2rem;
  }
`;

const StyledPaginator = styled(Paginator)`
  width: 100%;
  margin: 2rem 0;
`;

const StyledStatistics = styled(Statistics)`
  margin-left: 1rem;
`;

const StyledGrid = styled(Grid)`
  margin-left: -1rem;
  max-width: 120rem;
  width: calc(100% + 2rem);

  > * {
    margin: 1rem;
  }
`;

const StyledRoot = styled.div<{
  transitionStatus: TransitionStatus;
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-in-out')}
  ${container.fvtl}
  padding: 5rem 3rem;
  background: ${(props) => props.theme.colors.offBlack};
  min-height: 100%;
  opacity: ${(props) => valueByTransitionStatus(props.transitionStatus, [0.4, 1])};
  perspective: 80rem;
  pointer-events: ${(props) => valueByTransitionStatus(props.transitionStatus, ['none', 'auto'])};
  transform-origin: center;
  transform: ${(props) => valueByTransitionStatus(props.transitionStatus, ['translate3d(0, 0, 0) scale(.8)', 'translate3d(0, 0, 0) scale(1)'])};
  width: 100%;
`;

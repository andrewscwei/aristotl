import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, media, selectors } from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
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
import NavControlManager from '../managers/NavControlManager';
import { colors } from '../styles/theme';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

interface Props extends RouteComponentProps<{}> {

}

interface State {
  activeDoc?: Document;
  currentPageIndex: number;
  isSummaryEnabled: boolean;
  isSearching: boolean;
  searchInput?: string;
}

class Home extends PureComponent<Props, State> {
  state = {
    activeDoc: undefined,
    currentPageIndex: 0,
    isSearching: false,
    isSummaryEnabled: false,
    searchInput: undefined,
  };

  nodeRefs = {
    paginator: createRef<Paginator>(),
  };

  next() {
    const paginator = this.nodeRefs.paginator.current;
    if (!paginator) return;
    paginator.next();
  }

  prev() {
    const paginator = this.nodeRefs.paginator.current;
    if (!paginator) return;
    paginator.prev();
  }

  render() {
    return (
      <Fragment>
        <Transition in={this.state.activeDoc === undefined} timeout={timeoutByTransitionStatus(200)} mountOnEnter={false}>
          {(status) => (
            <NavControlManager isEnabled={!this.state.isSearching && !this.state.activeDoc} onPrev={() => this.prev()} onNext={() => this.next()}>
              <StyledRoot transitionStatus={status}>
                <StyledHeader>
                  <SearchBar
                    id='search'
                    autoFocus={!this.state.activeDoc}
                    onFocusIn={() => this.setState({ isSearching: true })}
                    onFocusOut={() => this.setState({ isSearching: false })}
                    onChange={(input: string) => this.setState({ searchInput: input, currentPageIndex: 0 })}
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
                        key={`${this.state.searchInput}-${this.state.currentPageIndex}`}
                        docs={docs}
                        isSummaryEnabled={this.state.isSummaryEnabled}
                        onActivate={(doc) => this.setState({ activeDoc: doc })}
                      />
                    </Fragment>
                  )}
                </DocumentManager>
              </StyledRoot>
            </NavControlManager>
          )}
        </Transition>
        <Transition in={this.state.activeDoc !== undefined} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
          {(status) => (
            <StyledModal transitionStatus={status} onExit={() => this.setState({ activeDoc: undefined })}>
              {(onExit, ref) => {
                return (
                  <StyledDatasheet
                    doc={this.state.activeDoc!}
                    ref={ref}
                    transitionStatus={status}
                    onDocChange={(doc) => this.setState({ activeDoc: doc })}
                    onExit={() => onExit()}
                  />
                );
              }}
            </StyledModal>
          )}
        </Transition>
      </Fragment>
    );
  }
}

export default Home;

const StyledModal = styled(Modal)<{
  transitionStatus?: TransitionStatus;
}>`
`;

const StyledDatasheet = styled(Datasheet)<{
  transitionStatus?: TransitionStatus;
}>`
  ${align.tr}
  ${animations.transition(['opacity', 'transform'], 200, 'ease-out')}
  width: 90%;
  max-width: 50rem;
  height: 100%;
  transform: ${(props) => valueByTransitionStatus(['translate3d(100%, 0, 0)', 'translate3d(0, 0, 0)'], props.transitionStatus, true)};
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
  margin-left: -.5rem;
  max-width: 120rem;
  width: calc(100% + 1rem);

  > * {
    height: ${(props) => props.isSummaryEnabled ? '34rem' : '24rem'};
    margin: 1rem .5rem;
    width: calc(50% - 1rem);
  }

  @media ${media.gtw(400)} {
    margin-left: -1rem;
    width: calc(100% + 2rem);

    > * {
      margin: 1rem;
      width: calc(50% - 2rem);
    }
  }

  @media ${media.gtw(560)} {
    > * {
      height: ${(props) => props.isSummaryEnabled ? '32rem' : '24rem'};
      width: ${(props) => props.isSummaryEnabled ? '26rem' : '20rem'};
    }
  }
`;

const StyledRoot = styled.div<{
  transitionStatus: TransitionStatus;
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-in-out')}
  ${container.fvtl}
  background: ${(props) => props.theme.colors.offBlack};
  min-height: 100%;
  opacity: ${(props) => valueByTransitionStatus([0.4, 1], props.transitionStatus)};
  padding: 5rem 2rem 10rem;
  perspective: 80rem;
  pointer-events: ${(props) => valueByTransitionStatus(['none', 'auto'], props.transitionStatus)};
  transform-origin: center;
  transform: ${(props) => valueByTransitionStatus(['translate3d(0, 0, 0) scale(.9)', 'translate3d(0, 0, 0) scale(1)'], props.transitionStatus)};
  width: 100%;

  @media ${media.gtw(500)} {
    padding: 5rem 5rem 15rem;
  }
`;

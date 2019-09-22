import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, media, selectors, utils } from 'promptu';
import qs from 'query-string';
import React, { createRef, Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Transition, TransitionGroup } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import ActionButton from '../components/ActionButton';
import Fallacy from '../components/Fallacy';
import Definition from '../components/Definition';
import Grid from '../components/Grid';
import Modal from '../components/Modal';
import Paginator from '../components/Paginator';
import SearchBar from '../components/SearchBar';
import Statistics from '../components/Statistics';
import FallacyManager from '../managers/FallacyManager';
import NavControlManager from '../managers/NavControlManager';
import { AppState } from '../store';
import { fetchDefinitions } from '../store/definitions';
import { dismissFallacyById, presentFallacyById } from '../store/fallacies';
import { colors } from '../styles/theme';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:home') : () => {};

interface StateProps {
  activeDefinitionIds: Array<string>;
  activeFallacyIds: Array<string>;
  definitions: ReadonlyArray<Document>;
}

interface DispatchProps {
  presentFallacyById: typeof presentFallacyById;
  fetchDefinitions: typeof fetchDefinitions;
  dismissFallacyById: typeof dismissFallacyById;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {

}

interface State {
  isSearching: boolean;
  isSummaryEnabled: boolean;
  pageIndex: number;
  searchInput?: string;
}

class Home extends PureComponent<Props, State> {
  state: State = {
    isSearching: false,
    isSummaryEnabled: false,
    pageIndex: 0,
    searchInput: undefined,
  };

  nodeRefs = {
    paginator: createRef<Paginator>(),
  };

  constructor(props: Props) {
    super(props);
    this.props.fetchDefinitions();
  }

  componentDidMount() {
    this.mapHashToState();
    this.mapQueryStringToState();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.location.search !== this.props.location.search) {
      this.mapQueryStringToState();
    }

    if (prevProps.location.hash !== this.props.location.hash) {
      this.mapHashToState();
    }
  }

  toNextPage() {
    const paginator = this.nodeRefs.paginator.current;
    if (!paginator) return;
    paginator.next();
  }

  toPreviousPage() {
    const paginator = this.nodeRefs.paginator.current;
    if (!paginator) return;
    paginator.prev();
  }

  mapHashToState() {
    if (!this.props.location.hash.startsWith('#')) return;
    const docId = this.props.location.hash.substring(1);

    this.props.presentFallacyById(docId);
  }

  mapQueryStringToState() {
    const { search, page } = qs.parse(this.props.location.search);
    const searchInput = typeof search === 'string' ? search : undefined;
    const pageIndex = ((typeof page === 'string') && parseInt(page, 10) || 1) - 1;

    this.setState({
      searchInput,
      pageIndex,
    });
  }

  mapStateToQueryString(nextState: { searchInput?: string, pageIndex?: number } = {}): string {
    const searchInput = (nextState.searchInput === undefined) ? this.state.searchInput : nextState.searchInput;
    const pageIndex = (nextState.pageIndex === undefined) ? this.state.pageIndex : nextState.pageIndex;
    const params = [];

    if (searchInput === undefined && searchInput !== '') params.push(`search=${searchInput}`);
    if (pageIndex !== undefined && pageIndex > 0) params.push(`page=${pageIndex + 1}`);

    return (params.length > 0) ? `?${params.join('&')}` : '';
  }

  presentFallacyById(id: string) {
    debug('Presenting fallacy...', 'OK', id);
    // this.props.history.replace(`#${id}`);
    this.props.presentFallacyById(id);
  }

  dismissFallacyById(id: string) {
    debug('Dismissing fallacy...', 'OK', id);
    // this.props.history.replace('/');
    this.props.dismissFallacyById(id);
  }

  onSearchInputChange(input: string, shouldUpdateHistory: boolean = false) {
    if (shouldUpdateHistory) {
      this.props.history.push({
        pathname: '/',
        search: this.mapStateToQueryString({
          searchInput: input,
          pageIndex: 0,
        }),
      });
    }
    else {
      this.setState({
        searchInput: input,
        pageIndex: 0,
      });
    }
  }

  onPageIndexChange(index: number, shouldUpdateHistory: boolean = false) {
    if (shouldUpdateHistory) {
      this.props.history.push({
        pathname: '/',
        search: this.mapStateToQueryString({
          searchInput: this.state.searchInput,
          pageIndex: index,
        }),
      });
    }
    else {
      this.setState({
        pageIndex: index,
      });
    }
  }

  render() {
    return (
      <FallacyManager pageIndex={this.state.pageIndex} searchInput={this.state.searchInput}>
        {(fallacies, results, currResults, maxPages, startIndex, endIndex, numFormals, numInformals) => (
          <Fragment>
            <Transition in={this.props.activeFallacyIds.length === 0} timeout={timeoutByTransitionStatus(200)} mountOnEnter={false}>
              {(status) => (
                <NavControlManager isEnabled={!this.state.isSearching && this.props.activeDefinitionIds.length === 0 && this.props.activeFallacyIds.length === 0} onPrev={() => this.toPreviousPage()} onNext={() => this.toNextPage()}>
                  <StyledRoot transitionStatus={status}>
                    <StyledHeader>
                      <SearchBar
                        id='search'
                        input={this.state.searchInput}
                        autoFocus={this.props.activeFallacyIds.length === 0 && this.props.activeDefinitionIds.length === 0}
                        onFocusIn={() => this.setState({ isSearching: true })}
                        onFocusOut={() => this.setState({ isSearching: false })}
                        onChange={(input: string) => this.onSearchInputChange(input)}
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
                    <StyledStatistics
                      totalResults={results.length}
                      subtotalResultsStart={startIndex + 1}
                      subtotalResultsEnd={endIndex}
                      totalFormal={numFormals}
                      totalInformal={numInformals}
                    />
                    <StyledPaginator
                      ref={this.nodeRefs.paginator}
                      activePageIndex={this.state.pageIndex}
                      maxPages={maxPages}
                      onActivate={(index) => this.onPageIndexChange(index)}
                    />
                    <StyledGrid
                      key={`${this.state.searchInput}-${this.state.pageIndex}`}
                      docs={currResults}
                      isSummaryEnabled={this.state.isSummaryEnabled}
                      onActivate={(doc) => this.presentFallacyById(doc.id)}
                    />
                  </StyledRoot>
                </NavControlManager>
              )}
            </Transition>
            <StyledFallacyStack isFocused={this.props.activeFallacyIds.length > 0}>
              <TransitionGroup>
                {(this.props.activeFallacyIds.map((fallacyId, i) => (
                  <Transition key={fallacyId} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
                    {(status) => (
                      <Modal
                        isFocused={i === (this.props.activeFallacyIds.length - 1)}
                        transitionStatus={status}
                        onExit={() => this.dismissFallacyById(fallacyId)}
                      >
                        {(onExit, ref) => {
                          return (
                            <StyledFallacy
                              definitions={this.props.definitions}
                              docId={fallacyId}
                              fallacies={fallacies}
                              ref={ref}
                              stackIndex={this.props.activeFallacyIds.length - i - 1}
                              transitionStatus={status}
                              onDocChange={(docId) => this.presentFallacyById(docId)}
                              onExit={() => onExit()}
                            />
                          );
                        }}
                      </Modal>
                    )}
                  </Transition>
                )))}
              </TransitionGroup>
            </StyledFallacyStack>
            <StyledDefinitionStack isFocused={this.props.activeFallacyIds.length > 0}>
              <TransitionGroup>
                {(this.props.activeDefinitionIds.map((definitionId) => (
                  <Transition key={definitionId} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
                    {(status) => (
                      <Modal transitionStatus={status} onExit={() => {}}>
                        {(onExit, ref) => {
                          return (
                            <StyledDefinition
                              docId={definitionId}
                              definitions={this.props.definitions}
                            />
                          );
                        }}
                      </Modal>
                    )}
                  </Transition>
                )))}
              </TransitionGroup>
            </StyledDefinitionStack>
          </Fragment>
        )}
      </FallacyManager>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    activeDefinitionIds: state.definitions.activeDocIds,
    activeFallacyIds: state.fallacies.activeDocIds,
    definitions: state.definitions.docs[__I18N_CONFIG__.defaultLocale] || [],
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    dismissFallacyById,
    fetchDefinitions,
    presentFallacyById,
  }, dispatch),
)(Home);

const StyledDefinition = styled(Definition)`

`;

const StyledDefinitionStack = styled.div<{
  isFocused: boolean;
}>`

`;

const StyledFallacyStack = styled.div<{
  isFocused: boolean;
}>`
  ${animations.transition('background', 200, 'ease-out')}
  background: ${(props) => `rgba(${utils.toHexString(props.theme.colors.black)}, ${props.isFocused ? 0.4 : 0})`};
  pointer-events: ${(props) => props.isFocused ? 'auto' : 'none'};
`;

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
  user-select: none;
`;

const StyledGrid = styled(Grid)`
  margin-left: -.5rem;
  max-width: 120rem;
  width: calc(100% + 1rem);

  > * {
    height: ${(props) => props.isSummaryEnabled ? '34rem' : '24rem'};
    margin: 1rem .5rem;
    width: ${(props) => props.isSummaryEnabled ? '100%' : 'calc(50% - 1rem)'};
  }

  @media ${media.gtw(400)} {
    margin-left: -1rem;
    width: calc(100% + 2rem);

    > * {
      height: ${(props) => props.isSummaryEnabled ? '34rem' : '24rem'};
      margin: 1rem;
      width: ${(props) => props.isSummaryEnabled ? '100%' : 'calc(50% - 2rem)'};
    }
  }

  @media ${media.gtw(540)} {
    > * {
      height: ${(props) => props.isSummaryEnabled ? '34rem' : '24rem'};
      width: calc(50% - 2rem);
    }
  }

  @media ${media.gtw(660)} {
    > * {
      height: ${(props) => props.isSummaryEnabled ? '34rem' : '24rem'};
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

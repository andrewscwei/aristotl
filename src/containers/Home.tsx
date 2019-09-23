import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, container, media, selectors } from 'promptu';
import qs from 'query-string';
import React, { createRef, Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import ActionButton from '../components/ActionButton';
import DefinitionStackModal from '../components/DefinitionStackModal';
import FallacyStackModal from '../components/FallacyStackModal';
import Grid from '../components/Grid';
import Paginator from '../components/Paginator';
import SearchBar from '../components/SearchBar';
import Statistics from '../components/Statistics';
import FallacyManager from '../managers/FallacyManager';
import NavControlManager from '../managers/NavControlManager';
import { AppState } from '../store';
import { fetchDefinitions } from '../store/definitions';
import { presentFallacyById } from '../store/fallacies';
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
        {(results, currResults, maxPages, startIndex, endIndex, numFormals, numInformals) => (
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
                        hoverTintColor={colors.brown}
                        activeTintColor={colors.brown}
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
                      onActivate={(doc) => this.props.presentFallacyById(doc.id)}
                    />
                  </StyledRoot>
                </NavControlManager>
              )}
            </Transition>
            <FallacyStackModal/>
            <DefinitionStackModal/>
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
    fetchDefinitions,
    presentFallacyById,
  }, dispatch),
)(Home);

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
  background: ${(props) => props.theme.colors.black};
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

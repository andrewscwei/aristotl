import Fuse from 'fuse.js';
import _ from 'lodash';
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
import Footer from '../components/Footer';
import Grid from '../components/Grid';
import Paginator from '../components/Paginator';
import SearchBar from '../components/SearchBar';
import Statistics from '../components/Statistics';
import NavControlManager from '../managers/NavControlManager';
import { AppState } from '../store';
import { fetchDefinitions } from '../store/definitions';
import { fetchFallacies, presentFallacyById } from '../store/fallacies';
import { colors } from '../styles/theme';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:home') : () => {};

interface StateProps {
  activeDefinitionIds: Array<string>;
  activeFallacyIds: Array<string>;
  fallacyDict: ReadonlyArray<Document>;
  fusedDocs: Fuse<Document>;
}

interface DispatchProps {
  fetchDefinitions: typeof fetchDefinitions;
  fetchFallacies: typeof fetchFallacies;
  presentFallacyById: typeof presentFallacyById;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {
  docsPerPage: number;
}

interface State {
  isSearching: boolean;
  isSummaryEnabled: boolean;
  pageIndex: number;
  searchInput?: string;
  filters: FallacyFilters;
}

class Home extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    docsPerPage: 20,
  };

  state: State = {
    isSearching: false,
    isSummaryEnabled: false,
    pageIndex: 0,
    searchInput: undefined,
    filters: {
      formal: true,
      informal: true,
      alpha: true,
      beta: true,
      gamma: true,
    },
  };

  nodeRefs = {
    paginator: createRef<Paginator>(),
  };

  constructor(props: Props) {
    super(props);
    this.props.fetchFallacies();
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

    // if (_.last(prevProps.activeFallacyIds) !== _.last(this.props.activeFallacyIds)) {
    //   const docId = _.last(this.props.activeFallacyIds);

    //   if (docId) {
    //     this.props.history.replace(`#${docId}`);
    //   }
    //   else {
    //     this.props.history.replace('/');
    //   }
    // }
  }

  getFilteredDocs(): ReadonlyArray<Document> {
    const searchInput = this.state.searchInput;
    const searchResults = _.isEmpty(searchInput) ? this.props.fallacyDict : this.props.fusedDocs.search(searchInput!);
    const filteredResults = _.filter(searchResults, (v) => {
      const types = _.get(v, 'data.types');
      const inheritance = _.get(v, 'data.inheritance');
      const isFormal = _.find(types, (v) => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined;
      const isInformal = _.find(types, (v) => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined;
      const isAlpha = inheritance.length === 0;
      const isBeta = inheritance.length === 1;
      const isGamma = inheritance.length >= 2;

      if (isFormal && !this.state.filters.formal) return false;
      if (isInformal && !this.state.filters.informal) return false;
      if (isAlpha && !this.state.filters.alpha) return false;
      if (isBeta && !this.state.filters.beta) return false;
      if (isGamma && !this.state.filters.gamma) return false;

      return true;
    });

    return filteredResults;
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
    debug('Rendering...', 'OK');

    const results = this.getFilteredDocs();
    const pageIndex = this.state.pageIndex;
    const pages = _.chunk(results, this.props.docsPerPage);
    const numPages = pages.length;
    const currResults = pages[pageIndex] || [];

    return (
      <Fragment>
        <Transition in={this.props.activeFallacyIds.length === 0} timeout={timeoutByTransitionStatus(200)} mountOnEnter={false}>
          {(status) => (
            <NavControlManager
              isEnabled={!this.state.isSearching && this.props.activeDefinitionIds.length === 0 && this.props.activeFallacyIds.length === 0}
              onPrev={() => this.toPreviousPage()}
              onNext={() => this.toNextPage()}
            >
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
                <Statistics
                  docsPerPage={this.props.docsPerPage}
                  pageIndex={this.state.pageIndex}
                  results={results}
                  onFiltersChange={(filters) => this.setState({ filters })}
                />
                <Paginator
                  ref={this.nodeRefs.paginator}
                  activePageIndex={this.state.pageIndex}
                  numPages={numPages}
                  onActivate={(index) => this.onPageIndexChange(index)}
                />
                <Grid
                  key={`${this.state.searchInput}-${this.state.pageIndex}`}
                  docs={currResults}
                  isSummaryEnabled={this.state.isSummaryEnabled}
                  onActivate={(doc) => doc.uid && this.props.presentFallacyById(doc.uid)}
                />
                <Footer/>
              </StyledRoot>
            </NavControlManager>
          )}
        </Transition>
        <FallacyStackModal/>
        <DefinitionStackModal/>
      </Fragment>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    activeDefinitionIds: state.definitions.activeDocIds,
    activeFallacyIds: state.fallacies.activeDocIds,
    fallacyDict: state.fallacies.docs[__I18N_CONFIG__.defaultLocale] || [],
    fusedDocs: new Fuse(state.fallacies.docs[__I18N_CONFIG__.defaultLocale] || [], {
      matchAllTokens: true,
      maxPatternLength: 24,
      minMatchCharLength: 0,
      shouldSort: true,
      tokenize: true,
      keys: [
        'data.abbreviation',
        'data.name',
        'data.aliases.name',
        'data.summary.text',
        'data.description.text',
        'tags',
      ],
    }),
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchDefinitions,
    fetchFallacies,
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

const StyledRoot = styled.div<{
  transitionStatus: TransitionStatus;
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-in-out')}
  ${container.fvtl}
  background: ${(props) => props.theme.colors.black};
  min-height: 100%;
  opacity: ${(props) => valueByTransitionStatus([0.4, 1], props.transitionStatus)};
  padding: 5rem 2rem 3rem;
  perspective: 80rem;
  pointer-events: ${(props) => valueByTransitionStatus(['none', 'auto'], props.transitionStatus)};
  transform-origin: center;
  transform: ${(props) => valueByTransitionStatus(['translate3d(0, 0, 0) scale(.9)', 'translate3d(0, 0, 0) scale(1)'], props.transitionStatus)};
  width: 100%;

  @media ${media.gtw(500)} {
    padding: 5rem 5rem 3rem;
  }
`;

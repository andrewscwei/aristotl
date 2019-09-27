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
import { changePageIndex, FallaciesFilters, fetchFallacies, filterFallacies, getFilteredFallacies, getFilteredFallaciesOnCurrentPage, getMaxPagesOfFilteredFallacies, presentFallacyById, searchFallacies } from '../store/fallacies';
import { colors } from '../styles/theme';
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:home') : () => {};

interface StateProps {
  docsPerPage: number;
  fallacyDict: ReadonlyArray<Document>;
  filteredFallacies: ReadonlyArray<Document>;
  filteredFallaciesOnCurrentPage: ReadonlyArray<Document>;
  maxPages: number;
  filters: FallaciesFilters;
  lastActiveDefinitionId?: string;
  lastActiveFallacyId?: string;
  pageIndex: number;
  searchInput: string;
}

interface DispatchProps {
  changePageIndex: typeof changePageIndex;
  fetchDefinitions: typeof fetchDefinitions;
  fetchFallacies: typeof fetchFallacies;
  filterFallacies: typeof filterFallacies;
  presentFallacyById: typeof presentFallacyById;
  searchFallacies: typeof searchFallacies;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {

}

interface State {
  isSearching: boolean;
  isSummaryEnabled: boolean;
}

class Home extends PureComponent<Props, State> {
  state: State = {
    isSearching: false,
    isSummaryEnabled: false,
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
    this.mapLocationToState();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const searchInputDidChange = prevProps.searchInput !== this.props.searchInput;

    if (__APP_CONFIG__.enableHistoryForSearch || __APP_CONFIG__.enableHistoryForFallacies) {
      const activeFallacyIdDidChange = prevProps.lastActiveFallacyId !== this.props.lastActiveFallacyId;

      if (searchInputDidChange || activeFallacyIdDidChange) {
        this.mapStateToLocation();
      }
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

  mapLocationToState() {
    const { search, page } = qs.parse(this.props.location.search);
    const searchInput = (typeof search === 'string' && search !== '') ? search : '';
    const hash = this.props.location.hash.startsWith('#') ? this.props.location.hash.substring(1) : undefined;

    if (__APP_CONFIG__.enableHistoryForSearch) {
      this.props.searchFallacies(searchInput);
    }

    if (__APP_CONFIG__.enableHistoryForFallacies && hash) {
      this.props.presentFallacyById(hash);
    }
  }

  mapStateToLocation() {
    if (!__APP_CONFIG__.enableHistoryForSearch && !__APP_CONFIG__.enableHistoryForFallacies) return;

    const params = [];
    let hash;

    if (__APP_CONFIG__.enableHistoryForSearch) {
      if (!_.isEmpty(this.props.searchInput)) params.push(`search=${this.props.searchInput}`);
    }

    if (__APP_CONFIG__.enableHistoryForFallacies) {
      hash = this.props.lastActiveFallacyId;
    }

    const location = {
      pathname: '/',
      hash,
      search: (params.length > 0) ? `?${params.join('&')}` : '',
    };

    this.props.history.replace(location);
  }

  render() {
    return (
      <Fragment>
        <Transition in={!this.props.lastActiveFallacyId} timeout={timeoutByTransitionStatus(200)} mountOnEnter={false}>
          {(status) => (
            <NavControlManager
              isEnabled={!this.state.isSearching && !this.props.lastActiveDefinitionId && !this.props.lastActiveFallacyId}
              onPrev={() => this.toPreviousPage()}
              onNext={() => this.toNextPage()}
            >
              <StyledRoot transitionStatus={status}>
                <StyledHeader>
                  <SearchBar
                    autoFocus={!this.props.lastActiveFallacyId && !this.props.lastActiveDefinitionId}
                    onFocusIn={() => this.setState({ isSearching: true })}
                    onFocusOut={() => this.setState({ isSearching: false })}
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
                  pageIndex={this.props.pageIndex}
                  results={this.props.filteredFallacies}
                />
                <Paginator
                  ref={this.nodeRefs.paginator}
                  activePageIndex={this.props.pageIndex}
                  numPages={this.props.maxPages}
                  onActivate={(pageIndex) => this.props.changePageIndex(pageIndex)}
                />
                <Grid
                  id={`${this.props.searchInput}-${this.props.pageIndex}`}
                  docs={this.props.filteredFallaciesOnCurrentPage}
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
    docsPerPage: state.fallacies.docsPerPage,
    fallacyDict: state.fallacies.docs[state.i18n.locale] || [],
    filteredFallacies: getFilteredFallacies(state.i18n.locale)(state.fallacies),
    filteredFallaciesOnCurrentPage: getFilteredFallaciesOnCurrentPage(state.i18n.locale)(state.fallacies),
    maxPages: getMaxPagesOfFilteredFallacies(state.i18n.locale)(state.fallacies),
    filters: state.fallacies.filters,
    lastActiveDefinitionId: state.definitions.lastActiveDocId,
    lastActiveFallacyId: state.fallacies.lastActiveDocId,
    pageIndex: state.fallacies.pageIndex,
    searchInput: state.fallacies.searchInput,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    changePageIndex,
    fetchDefinitions,
    fetchFallacies,
    filterFallacies,
    presentFallacyById,
    searchFallacies,
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

import Fuse from 'fuse.js';
import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import Hammer from 'react-hammerjs';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import ActionButton from '../components/ActionButton';
import Datasheet from '../components/Datasheet';
import Grid from '../components/Grid';
import Modal from '../components/Modal';
import Paginator from '../components/Paginator';
import SearchBar from '../components/SearchBar';
import Statistics from '../components/Statistics';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs, reduceDocs } from '../store/prismic';
import { colors } from '../styles/theme';
import { valueByTransitionStatus } from '../styles/utils';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:home') : () => {};

interface StateProps {
  i18n: I18nState;
  docs: ReadonlyArray<Document>;
  fusedDocs: Fuse<Document>;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {
  docsPerPage: number;
}

interface State {
  searchInput?: string;
  activeDoc?: Document;
  currentPageIndex: number;
  isSummaryEnabled: boolean;
}

class Home extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    docsPerPage: 20,
  };

  state = {
    searchInput: undefined,
    activeDoc: undefined,
    currentPageIndex: 0,
    isSummaryEnabled: false,
  };

  get filteredDocs(): ReadonlyArray<Document> {
    const searchInput = this.state.searchInput;

    if ((searchInput !== undefined) && (searchInput !== '')) {
      return this.props.fusedDocs.search(searchInput);
    }
    else {
      return this.props.docs;
    }
  }

  constructor(props: Props) {
    super(props);

    this.props.fetchDocs('fallacy', undefined, {
      orderings: '[my.fallacy.abbreviation]',
      pageSize: 100,
    }, 2);
  }

  countInformals(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      if (_.get(curr, 'data.type.slug') === 'informal-fallacy') {
        return out + 1;
      }
      else {
        return out;
      }
    }, 0);
  }

  countFormals(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      if (_.get(curr, 'data.type.slug') === 'formal-fallacy') {
        return out + 1;
      }
      else {
        return out;
      }
    }, 0);
  }

  enableSummaryMode() {
    this.setState({ isSummaryEnabled: true });
  }

  disableSummaryMode() {
    this.setState({ isSummaryEnabled: false });
  }

  onSearchInputChange(input: string) {
    this.setState({
      searchInput: input,
    });
  }

  onPresentDatasheet(doc?: Document) {
    debug('Presenting doc...', 'OK', doc);

    this.setState({
      activeDoc: doc,
    });
  }

  onDismissDatasheet() {
    debug('Dismissing doc...', 'OK');

    this.setState({
      activeDoc: undefined,
    });
  }

  onPageChange(pageIndex: number) {
    this.setState({
      currentPageIndex: pageIndex,
    });
  }

  onSwipe(direction: number, totalPages: number) {
    switch (direction) {
    case 2: // Left
      this.setState({
        currentPageIndex: (this.state.currentPageIndex + 1) % totalPages,
      });
      break;
    case 4: // Right
      this.setState({
        currentPageIndex: (this.state.currentPageIndex + totalPages - 1) % totalPages,
      });
    }
  }

  render() {
    const docs = this.filteredDocs;
    const pages = _.chunk(docs, this.props.docsPerPage);
    const docsOnCurrentPage = pages[this.state.currentPageIndex] || [];

    return (
      <Fragment>
        <Transition in={this.state.activeDoc === undefined} timeout={200} mountOnEnter={false}>
          {(state) => (
            <Hammer onSwipe={(event) => this.onSwipe(event.direction, pages.length)} direction={'DIRECTION_ALL' as any}>
              <StyledRoot transitionState={state}>
                <StyledHeader>
                  <StyledSearchBar id='search' onChange={(input: string) => this.onSearchInputChange(input)}/>
                  <StyledToggleSummaryButton
                    symbol='i'
                    isTogglable={true}
                    tintColor={colors.white}
                    hoverTintColor={colors.red}
                    activeTintColor={colors.red}
                    onToggleOn={() => this.enableSummaryMode()}
                    onToggleOff={() => this.disableSummaryMode()}
                  />
                </StyledHeader>
                <StyledStatistics
                  totalResults={docs.length}
                  subtotalResultsStart={this.state.currentPageIndex * this.props.docsPerPage + 1}
                  subtotalResultsEnd={docsOnCurrentPage.length + this.state.currentPageIndex * this.props.docsPerPage}
                  totalInformal={this.countInformals(docsOnCurrentPage)}
                  totalFormal={this.countFormals(docsOnCurrentPage)}
                />
                <StyledPaginator activePageIndex={this.state.currentPageIndex} maxPages={pages.length} onActivate={(index) => this.onPageChange(index)}/>
                <StyledGrid
                  input={`${this.state.searchInput}-${this.state.currentPageIndex}`}
                  docs={docsOnCurrentPage}
                  isSummaryEnabled={this.state.isSummaryEnabled}
                  onActivate={(doc) => this.onPresentDatasheet(doc)}
                />
              </StyledRoot>
            </Hammer>
          )}
        </Transition>
        <Modal in={this.state.activeDoc !== undefined} onExit={() => this.onDismissDatasheet()}>
          {(state, onExit) => (
            <StyledDatasheet
              transitionState={state}
              doc={this.state.activeDoc}
              onExit={() => onExit()}
            />
          )}
        </Modal>
      </Fragment>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
    docs: reduceDocs(state.prismic, 'fallacy') || [],
    fusedDocs: new Fuse(reduceDocs(state.prismic, 'fallacy') || [], {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 2,
      keys: [
        'data.abbreviation',
        'data.name',
        'data.aliases.name',
        'data.type.slug',
        'tags',
      ],
    }),
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchDocs,
  }, dispatch),
)(Home);

const StyledDatasheet = styled(Datasheet)<{
  transitionState: TransitionStatus;
}>`
  ${align.tr}
  ${animations.transition(['opacity', 'transform'], 200, 'ease-out')}
  width: 100%;
  max-width: 60rem;
  height: 100%;
  transform: ${(props) => valueByTransitionStatus(props.transitionState, ['translate3d(100%, 0, 0)', 'translate3d(0, 0, 0)'])};
`;

const StyledToggleSummaryButton = styled(ActionButton)`

`;

const StyledSearchBar = styled(SearchBar)`

`;

const StyledHeader = styled.header`
  ${container.fhcl}
  width: 100%;
  margin-bottom: 1rem;
  justify-content: space-between;
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

  > * {
    margin: 1rem;
  }
`;

const StyledRoot = styled.div<{
  transitionState: TransitionStatus;
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-in-out')}
  ${container.fvtl}
  padding: 5rem 3rem;
  background: ${(props) => props.theme.colors.offBlack};
  min-height: 100%;
  opacity: ${(props) => valueByTransitionStatus(props.transitionState, [0.4, 1])};
  perspective: 80rem;
  pointer-events: ${(props) => valueByTransitionStatus(props.transitionState, ['none', 'auto'])};
  transform-origin: center;
  transform: ${(props) => valueByTransitionStatus(props.transitionState, ['translate3d(0, 0, 0) scale(.8)', 'translate3d(0, 0, 0) scale(1)'])};
  width: 100%;
`;

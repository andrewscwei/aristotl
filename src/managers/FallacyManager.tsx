import Fuse from 'fuse.js';
import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import { AppState } from '../store';
import { fetchFallacies } from '../store/fallacies';
import { I18nState } from '../store/i18n';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('app:fallacy-manager') : () => {};

interface StateProps {
  i18n: I18nState;
  docs: ReadonlyArray<Document>;
  fusedDocs: Fuse<Document>;
}

interface DispatchProps {
  fetchFallacies: typeof fetchFallacies;
}

interface Props extends StateProps, DispatchProps {
  filters: {
    formal: boolean;
    informal: boolean;
    alpha: boolean;
    beta: boolean;
    gamma: boolean;
  };
  docsPerPage: number;
  pageIndex: number;
  searchInput?: string;
  children: (results: ReadonlyArray<Document>, currResults: ReadonlyArray<Document>, maxPages: number, startIndex: number, endIndex: number, numFormals: number, numInformals: number, numAlphas: number, numBetas: number, numGammas: number) => ReactNode;
}

class FallacyManager extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    pageIndex: 0,
    docsPerPage: 20,
  };

  constructor(props: Props) {
    super(props);
    this.props.fetchFallacies();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.filters !== this.props.filters) {
      debug('Changing filters...', 'OK', this.props.filters);
    }
  }

  getFilteredDocs(): ReadonlyArray<Document> {
    const searchInput = this.props.searchInput;
    const searchResults = _.isEmpty(searchInput) ? this.props.docs : this.props.fusedDocs.search(searchInput!);
    const filteredResults = _.filter(searchResults, (v) => {
      const types = _.get(v, 'data.types');
      const inheritance = _.get(v, 'data.inheritance');
      const isFormal = _.find(types, (v) => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined;
      const isInformal = _.find(types, (v) => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined;
      const isAlpha = inheritance.length === 0;
      const isBeta = inheritance.length === 1;
      const isGamma = inheritance.length >= 2;

      if (isFormal && !this.props.filters.formal) return false;
      if (isInformal && !this.props.filters.informal) return false;
      if (isAlpha && !this.props.filters.alpha) return false;
      if (isBeta && !this.props.filters.beta) return false;
      if (isGamma && !this.props.filters.gamma) return false;

      return true;
    });

    return filteredResults;
  }

  countInformals(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      const fragments = _.get(curr, 'data.types');
      const match = _.find(fragments, (v) => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined;
      if (match) out += 1;
      return out;
    }, 0);
  }

  countFormals(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      const fragments = _.get(curr, 'data.types');
      const match = _.find(fragments, (v) => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined;
      if (match) out += 1;
      return out;
    }, 0);
  }

  countAlphas(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      const fragments = _.get(curr, 'data.inheritance');
      if (fragments.length === 0) out += 1;
      return out;
    }, 0);
  }

  countBetas(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      const fragments = _.get(curr, 'data.inheritance');
      if (fragments.length === 1) out += 1;
      return out;
    }, 0);
  }

  countGammas(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      const fragments = _.get(curr, 'data.inheritance');
      if (fragments.length >= 2) out += 1;
      return out;
    }, 0);
  }

  render() {
    const results = this.getFilteredDocs();
    const pageIndex = this.props.pageIndex;
    const pages = _.chunk(results, this.props.docsPerPage);
    const numPages = pages.length;
    const currResults = pages[pageIndex] || [];
    const startIndex = this.props.docsPerPage * pageIndex;
    const endIndex = currResults.length + startIndex;

    return (
      <Fragment>
        {this.props.children(
          results,
          currResults,
          numPages,
          startIndex,
          endIndex,
          this.countFormals(currResults),
          this.countInformals(currResults),
          this.countAlphas(currResults),
          this.countBetas(currResults),
          this.countGammas(currResults),
        )}
      </Fragment>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
    docs: state.fallacies.docs[__I18N_CONFIG__.defaultLocale] || [],
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
    fetchFallacies,
  }, dispatch),
)(FallacyManager);

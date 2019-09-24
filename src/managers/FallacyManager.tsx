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
  children: (results: ReadonlyArray<Document>, currResults: ReadonlyArray<Document>, maxPages: number, startIndex: number, endIndex: number, numFormals: number, numInformals: number) => ReactNode;
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

    if ((searchInput !== undefined) && (searchInput !== '')) {
      return this.props.fusedDocs.search(searchInput);
    }
    else {
      return this.props.docs;
    }
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
        {this.props.children(results, currResults, numPages, startIndex, endIndex, this.countFormals(currResults), this.countInformals(currResults))}
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

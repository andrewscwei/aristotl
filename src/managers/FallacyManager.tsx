import Fuse from 'fuse.js';
import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import { AppState } from '../store';
import { fetchAll } from '../store/fallacies';
import { I18nState } from '../store/i18n';

interface StateProps {
  i18n: I18nState;
  docs: ReadonlyArray<Document>;
  fusedDocs: Fuse<Document>;
}

interface DispatchProps {
  fetchAll: typeof fetchAll;
}

interface Props extends StateProps, DispatchProps {
  pageIndex: number;
  docsPerPage: number;
  searchInput?: string;
  children: (docs: ReadonlyArray<Document>, results: ReadonlyArray<Document>, currResults: ReadonlyArray<Document>, maxPages: number, startIndex: number, endIndex: number, numFormals: number, numInformals: number) => ReactNode;
}

class FallacyManager extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    pageIndex: 0,
    docsPerPage: 20,
  };

  constructor(props: Props) {
    super(props);
    this.props.fetchAll();
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
        {this.props.children(this.props.docs, results, currResults, numPages, startIndex, endIndex, this.countFormals(currResults), this.countInformals(currResults))}
      </Fragment>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
    docs: state.fallacies.docs[__I18N_CONFIG__.defaultLocale] || [],
    fusedDocs: new Fuse(state.fallacies.docs[__I18N_CONFIG__.defaultLocale] || [], {
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
        'data.summary.text',
        'tags',
      ],
    }),
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchAll,
  }, dispatch),
)(FallacyManager);

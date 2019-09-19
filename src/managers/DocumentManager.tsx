import Fuse from 'fuse.js';
import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs, reduceDocs } from '../store/prismic';

interface StateProps {
  i18n: I18nState;
  docs: ReadonlyArray<Document>;
  fusedDocs: Fuse<Document>;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps {
  pageIndex: number;
  docsPerPage: number;
  searchInput?: string;
  children: (docs: ReadonlyArray<Document>, maxPages: number, startIndex: number, endIndex: number, numFormals: number, numInformals: number) => ReactNode;
}

class DocumentManager extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    pageIndex: 0,
    docsPerPage: 20,
  };

  constructor(props: Props) {
    super(props);

    this.props.fetchDocs('fallacy', undefined, {
      orderings: '[my.fallacy.abbreviation]',
      pageSize: 100,
    }, 2);
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
    const docs = this.getFilteredDocs();
    const pageIndex = this.props.pageIndex;
    const pages = _.chunk(docs, this.props.docsPerPage);
    const numPages = pages.length;
    const docsOnCurrentPage = pages[pageIndex] || [];
    const startIndex = this.props.docsPerPage * pageIndex;
    const endIndex = docsOnCurrentPage.length + startIndex;

    return (
      <Fragment>
        {this.props.children(docsOnCurrentPage, numPages, startIndex, endIndex, this.countFormals(docsOnCurrentPage), this.countInformals(docsOnCurrentPage))}
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
        'data.summary.text',
        'tags',
      ],
    }),
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchDocs,
  }, dispatch),
)(DocumentManager);

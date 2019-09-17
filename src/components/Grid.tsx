import Fuse from 'fuse.js';
import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, container, media } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs, reduceDocs } from '../store/prismic';
import Card from './Card';

interface StateProps {
  docs: ReadonlyArray<Document>;
  fusedDocs: Fuse<Document>;
  i18n: I18nState;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps {
  className?: string;
  id?: string;
  searchInput?: string;
}

interface State {
  fusedObject?: any;
  activeIndex: number;
}

class Grid extends PureComponent<Props, State> {
  state: State = {
    fusedObject: undefined,
    activeIndex: -1,
  };

  get filteredDocs(): ReadonlyArray<Document> {
    if (!this.props.searchInput || (this.props.searchInput === '')) {
      return this.props.docs;
    }
    else {
      return this.props.fusedDocs.search(this.props.searchInput);
    }
  }

  constructor(props: Props) {
    super(props);
    this.props.fetchDocs('fallacy', undefined, { orderings: '[my.fallacy.abbreviation]'});
  }

  render() {
    const { ltxt } = this.props.i18n;

    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        {this.filteredDocs.map((doc: Document, i: number) => (
          <StyledFallacyCard key={i} doc={doc} isExpanded={this.state.activeIndex === i} onActivate={() => this.setState({ activeIndex: i })}/>
        ))}
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    docs: reduceDocs(state.prismic, 'fallacy') || [],
    fusedDocs: new Fuse(reduceDocs(state.prismic, 'fallacy') || [], {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'data.abbreviation',
        'data.name',
        'data.aliases.name',
        'data.description.text',
        'data.examples.example.text',
        'data.type.slug',
        'tags',
      ],
    }),
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchDocs,
  }, dispatch),
)(Grid);

const StyledFallacyCard = styled(Card)`
`;

const StyledRoot = styled.div`
  ${animations.transition('all', 300, 'ease-out')}
  ${container.fhtl}
  flex-wrap: wrap;
  width: 100%;
  padding: 5rem 10%;

  > * {
    height: 18rem;
    width: calc(25% - 4rem);
    margin: 2rem;
  }

  @media ${media.gtmobile} {
    padding-left: ${(props) => props.theme.layout.searchBarWidthRatioAboveMobile + 5}%;
    padding-right: 5%;
    padding-top: 5rem;
    padding-bottom: 5rem;
  }

  @media ${media.gttablet} {
    padding-left: ${(props) => props.theme.layout.searchBarWidthRatioAboveTablet + 5}%;
  }
`;

import Fuse from 'fuse.js';
import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, container, media } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { fetchDocs, reduceDocs } from '../store/prismic';
import Card from './Card';

interface StateProps {
  docs: ReadonlyArray<Document>;
  fusedDocs: Fuse<Document>;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps {
  className?: string;
  id?: string;
  searchInput?: string;
  onActivate: (doc: Document) => void;
}

interface State {
  activeIndex: number;
}

class Grid extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    onActivate: () => {},
  };

  state: State = {
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

    this.props.fetchDocs('fallacy', undefined, {
      orderings: '[my.fallacy.abbreviation]',
      pageSize: 100,
    });
  }

  onActivate(cardIndex: number) {
    const docs = this.filteredDocs;

    if (cardIndex >= docs.length) throw new Error(`Invalid index ${cardIndex} provided`);

    this.setState({
      activeIndex: cardIndex,
    });

    this.props.onActivate(docs[cardIndex]);
  }

  render() {
    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        {this.filteredDocs.map((doc: Document, i: number) => (
          <StyledCard
            key={i}
            doc={doc}
            onActivate={() => this.onActivate(i)}
          />
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
      minMatchCharLength: 2,
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
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchDocs,
  }, dispatch),
)(Grid);

const StyledCard = styled(Card)`

`;

const StyledRoot = styled.div`
  ${animations.transition(['transform'], 300, 'ease-out')}
  ${container.fhtl}
  flex-wrap: wrap;
  transform: translate3d(0, 0, 0);
`;

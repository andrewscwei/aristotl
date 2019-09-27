import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, container, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { FallaciesFilters, filterFallacies } from '../store/fallacies';
import { colors } from '../styles/theme';
import Pixel from './Pixel';

interface StateProps {
  filters: FallaciesFilters;
}

interface DispatchProps {
  filterFallacies: typeof filterFallacies;
}

interface Props extends StateProps, DispatchProps {
  className?: string;
  docsPerPage: number;
  pageIndex: number;
  results: ReadonlyArray<Document>;
}

class Statistics extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    docsPerPage: 0,
    pageIndex: 0,
    results: [],
  };

  countFormals(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      const fragments = _.get(curr, 'data.types');
      const match = _.find(fragments, (v) => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined;
      if (match) out += 1;
      return out;
    }, 0);
  }

  countInformals(docs: ReadonlyArray<Document>): number {
    return docs.reduce((out, curr) => {
      const fragments = _.get(curr, 'data.types');
      const match = _.find(fragments, (v) => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined;
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
    const numResults = this.props.results.length;
    const pages = _.chunk(this.props.results, this.props.docsPerPage);
    const currResults = pages[this.props.pageIndex] || [];
    const startIndex = this.props.docsPerPage * this.props.pageIndex + 1;
    const endIndex = currResults.length + startIndex - 1;
    const numFormals = this.countFormals(currResults);
    const numInformals = this.countInformals(currResults);
    const numAlphas = this.countAlphas(currResults);
    const numBetas = this.countBetas(currResults);
    const numGammas = this.countGammas(currResults);

    return (
      <StyledRoot className={this.props.className}>
        <StyledCount>
          {(startIndex === 0 || endIndex === 0 || numResults === 0) &&
            <span>--</span>
            ||
            <span>{startIndex}-{endIndex} / {numResults}</span>
          }
        </StyledCount>
        <StyledFilterButton isActive={this.props.filters.formal} onClick={() => this.props.filterFallacies({ ...this.props.filters, formal: !this.props.filters.formal })}>
          <StyledFormalIcon size={6} isHollow={false} tintColor={colors.white}/>
          <span>{numFormals === 0 ? '--' : numFormals}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.informal} onClick={() => this.props.filterFallacies({ ...this.props.filters, informal: !this.props.filters.informal })}>
          <StyledInformalIcon size={6} isHollow={true} tintColor={colors.white}/>
          <span>{numInformals === 0 ? '--' : numInformals}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.alpha} onClick={() => this.props.filterFallacies({ ...this.props.filters, alpha: !this.props.filters.alpha })}>
          <span>α</span>
          <span>{numAlphas === 0 ? '--' : numAlphas}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.beta} onClick={() => this.props.filterFallacies({ ...this.props.filters, beta: !this.props.filters.beta })}>
          <span>β</span>
          <span>{numBetas === 0 ? '--' : numBetas}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.gamma} onClick={() => this.props.filterFallacies({ ...this.props.filters, gamma: !this.props.filters.gamma })}>
          <span>𝛾</span>
          <span>{numGammas === 0 ? '--' : numGammas}</span>
        </StyledFilterButton>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    filters: state.fallacies.filters,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    filterFallacies,
  }, dispatch),
)(Statistics);

const StyledFormalIcon = styled(Pixel)`
  ${animations.transition('background', 200, 'ease-out')}
`;

const StyledInformalIcon = styled(Pixel)`
${animations.transition('border-color', 200, 'ease-out')}
`;

const StyledCount = styled.div`
  ${container.fhcl}
  font-family: 'RobotoMono';
  font-size: 1.4rem;
  font-weight: 400;
  color: ${(props) => props.theme.colors.white};

  > * {
    flex: 0 0 auto;
  }

  ${selectors.eblc} {
    margin-right: .6rem;
  }
`;

const StyledFilterButton = styled.button<{
  isActive: boolean;
}>`
  ${container.fhcl}
  ${animations.transition('opacity', 200, 'ease-out')}
  font-family: 'RobotoMono';
  font-size: 1.4rem;
  font-weight: 400;
  color: ${(props) => props.theme.colors.white};
  opacity: ${(props) => props.isActive ? 1.0 : 0.2};

  > * {
    flex: 0 0 auto;
  }

  > span {
    ${animations.transition('color', 200, 'ease-out')}
  }

  ${selectors.eblc} {
    margin-right: .6rem;
  }

  ${selectors.hwot} {
    color: ${(props) => props.theme.colors.red};

    ${StyledFormalIcon} {
      background: ${(props) => props.theme.colors.red};
    }

    ${StyledInformalIcon} {
      border-color: ${(props) => props.theme.colors.red};
    }
  }
`;

const StyledRoot = styled.div`
  ${container.fhcl}
  flex-wrap: wrap;
  margin-left: 1rem;
  user-select: none;

  ${selectors.eblc} {
    margin-right: 3rem;
  }

  > * {
    flex: 0 0 auto;
  }
`;

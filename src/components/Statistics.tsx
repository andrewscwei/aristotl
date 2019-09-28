import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, container, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { getFilteredFallacies, getFilteredFallaciesOnCurrentPage, getMaxPagesOfFilteredFallacies } from '../selectors';
import { AppState } from '../store';
import { changeFallaciesFilters, FallaciesFilters } from '../store/fallacies';
import { colors } from '../styles/theme';
import Pixel from './Pixel';

interface StateProps {
  filteredFallacies: ReadonlyArray<Document>;
  filteredFallaciesOnCurrentPage: ReadonlyArray<Document>;
  filters: FallaciesFilters;
  maxPages: number;
  pageIndex: number;
  pageSize: number;
}

interface DispatchProps {
  changeFallaciesFilters: typeof changeFallaciesFilters;
}

interface Props extends StateProps, DispatchProps {
  className?: string;
}

class Statistics extends PureComponent<Props> {
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
    const numResults = this.props.filteredFallacies.length;
    const startIndex = this.props.pageSize * this.props.pageIndex + 1;
    const endIndex = this.props.filteredFallaciesOnCurrentPage.length + startIndex - 1;
    const numFormals = this.countFormals(this.props.filteredFallaciesOnCurrentPage);
    const numInformals = this.countInformals(this.props.filteredFallaciesOnCurrentPage);
    const numAlphas = this.countAlphas(this.props.filteredFallaciesOnCurrentPage);
    const numBetas = this.countBetas(this.props.filteredFallaciesOnCurrentPage);
    const numGammas = this.countGammas(this.props.filteredFallaciesOnCurrentPage);

    return (
      <StyledRoot className={this.props.className}>
        <StyledCount>
          {(startIndex === 0 || endIndex === 0 || numResults === 0) &&
            <span>--</span>
            ||
            <span>{startIndex}-{endIndex} / {numResults}</span>
          }
        </StyledCount>
        <StyledFilterButton isActive={this.props.filters.formal} onClick={() => this.props.changeFallaciesFilters({ ...this.props.filters, formal: !this.props.filters.formal })}>
          <StyledFormalIcon size={6} isHollow={false} tintColor={colors.white}/>
          <span>{numFormals === 0 ? '--' : numFormals}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.informal} onClick={() => this.props.changeFallaciesFilters({ ...this.props.filters, informal: !this.props.filters.informal })}>
          <StyledInformalIcon size={6} isHollow={true} tintColor={colors.white}/>
          <span>{numInformals === 0 ? '--' : numInformals}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.alpha} onClick={() => this.props.changeFallaciesFilters({ ...this.props.filters, alpha: !this.props.filters.alpha })}>
          <span>α</span>
          <span>{numAlphas === 0 ? '--' : numAlphas}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.beta} onClick={() => this.props.changeFallaciesFilters({ ...this.props.filters, beta: !this.props.filters.beta })}>
          <span>β</span>
          <span>{numBetas === 0 ? '--' : numBetas}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.props.filters.gamma} onClick={() => this.props.changeFallaciesFilters({ ...this.props.filters, gamma: !this.props.filters.gamma })}>
          <span>𝛾</span>
          <span>{numGammas === 0 ? '--' : numGammas}</span>
        </StyledFilterButton>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    filteredFallacies: getFilteredFallacies(state),
    filteredFallaciesOnCurrentPage: getFilteredFallaciesOnCurrentPage(state),
    filters: state.fallacies.filters,
    maxPages: getMaxPagesOfFilteredFallacies(state),
    pageIndex: state.fallacies.pageIndex,
    pageSize: state.fallacies.pageSize,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    changeFallaciesFilters,
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

import Fuse from 'fuse.js';
import _ from 'lodash';
import { createSelector } from 'reselect';
import { AppState } from '../store';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:selectors') : () => {};

export const getMetadata = createSelector([
  (state: AppState) => state.metadata[state.i18n.locale],
], (doc) => {
  debug('Getting localized metadata...', 'OK');

  return doc;
});

export const getDefinitions = createSelector([
  (state: AppState) => state.definitions.docs[state.i18n.locale] || [],
], (docs) => {
  debug('Getting localized definitions...', 'OK', `${docs.length} results`);

  return docs;
});

export const getFallacies = createSelector([
  (state: AppState) => state.fallacies.docs[state.i18n.locale] || [],
], (docs) => {
  debug('Getting localized fallacies...', 'OK', `${docs.length} results`);

  return docs;
});

export const getFallaciesFuse = createSelector([
  getFallacies,
], (docs) => {
  debug('Getting localized fallacies fuse...', 'OK');

  return new Fuse(docs, {
    distance: 100,
    keys: [
      'data.abbreviation',
      'data.name',
      'data.aliases.name',
      'data.summary.text',
      'data.description.text',
      'tags',
    ],
    includeMatches: __APP_CONFIG__.includeMatchesInSearch,
    isCaseSensitive: false,
    location: 0,
    matchAllTokens: false,
    maxPatternLength: 24,
    minMatchCharLength: 1,
    shouldSort: true,
    threshold: 0.1,
    tokenize: __APP_CONFIG__.useTokenizedSearch,
  });
});

export const getFilteredFallacies = createSelector([
  getFallacies,
  getFallaciesFuse,
  (state: AppState) => state.fallacies.searchInput,
  (state: AppState) => state.fallacies.filters,
], (docs, fuse, searchInput, filters) => {
  const res = (_.isEmpty(searchInput) || !fuse) ? docs : _.map(fuse.search(searchInput), (v) => v.item);
  const fres = _.filter(res, (v) => {
    const types = _.get(v, 'data.types');
    const inheritance = _.get(v, 'data.inheritance');
    const isFormal = _.find(types, (v) => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined;
    const isInformal = _.find(types, (v) => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined;
    const isAlpha = inheritance ? inheritance.length === 0 : true;
    const isBeta = inheritance ? inheritance.length === 1 : false;
    const isGamma = inheritance ? inheritance.length >= 2 : false;

    if (isFormal && !filters.formal) return false;
    if (isInformal && !filters.informal) return false;
    if (isAlpha && !filters.alpha) return false;
    if (isBeta && !filters.beta) return false;
    if (isGamma && !filters.gamma) return false;

    return true;
  });

  debug('Getting filtered fallacies...', 'OK', `${fres.length} results`);

  return fres;
});

export const getFilteredFallaciesInPageChunks = createSelector([
  getFilteredFallacies,
  (state: AppState) => state.fallacies.pageSize,
], (docs, pageSize) => {
  const chunks = _.chunk(docs, pageSize);

  debug('Getting filtered fallacies in page chunks...', 'OK', `${chunks.length} chunk(s)`);

  return chunks;
});

export const getFilteredFallaciesOnCurrentPage = createSelector([
  getFilteredFallaciesInPageChunks,
  (state: AppState) => state.fallacies.pageIndex,
], (chunks, pageIndex) => {
  const res = chunks[pageIndex] || [];

  debug('Getting filtered fallacies on current page...', 'OK', `${res.length} results`);

  return res;
});

export const getMaxPagesOfFilteredFallacies = createSelector([
  getFilteredFallaciesInPageChunks,
], (chunks) => {
  debug('Getting max pages of filtered fallacies...', 'OK', chunks.length);

  return chunks.length;
});

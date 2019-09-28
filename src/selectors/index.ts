import _ from 'lodash';
import { createSelector } from 'reselect';
import { AppState } from '../store';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:selectors') : () => {};

export const getCopyright = createSelector([
  (state: AppState) => state.copyright[state.i18n.locale],
], (doc) => {
  return doc;
});

export const getDefinitions = createSelector([
  (state: AppState) => state.definitions.docs[state.i18n.locale] || [],
], (docs) => {
  return docs;
});

export const getFallacies = createSelector([
  (state: AppState) => state.fallacies.docs[state.i18n.locale] || [],
], (docs) => {
  return docs;
});

export const getFilteredFallacies = createSelector([
  getFallacies,
  (state: AppState) => state.fallacies.fuses[state.i18n.locale] || undefined,
  (state: AppState) => state.fallacies.searchInput,
  (state: AppState) => state.fallacies.filters,
], (docs, fuse, searchInput, filters) => {
  const res = (_.isEmpty(searchInput) || !fuse) ? docs : fuse.search(searchInput);
  const fres = _.filter(res, (v) => {
    const types = _.get(v, 'data.types');
    const inheritance = _.get(v, 'data.inheritance');
    const isFormal = _.find(types, (v) => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined;
    const isInformal = _.find(types, (v) => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined;
    const isAlpha = inheritance.length === 0;
    const isBeta = inheritance.length === 1;
    const isGamma = inheritance.length >= 2;

    if (isFormal && !filters.formal) return false;
    if (isInformal && !filters.informal) return false;
    if (isAlpha && !filters.alpha) return false;
    if (isBeta && !filters.beta) return false;
    if (isGamma && !filters.gamma) return false;

    return true;
  });

  debug('Getting filtered fallacies...', 'OK', fres);

  return fres;
});

export const getFilteredFallaciesInPageChunks = createSelector([
  getFilteredFallacies,
  (state: AppState) => state.fallacies.pageSize,
], (docs, pageSize) => {
  return _.chunk(docs, pageSize);
});

export const getFilteredFallaciesOnCurrentPage = createSelector([
  getFilteredFallaciesInPageChunks,
  (state: AppState) => state.fallacies.pageIndex,
], (chunks, pageIndex) => {
  return chunks[pageIndex] || [];
});

export const getMaxPagesOfFilteredFallacies = createSelector([
  getFilteredFallaciesInPageChunks,
], (chunks) => {
  return chunks.length;
});

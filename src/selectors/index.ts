import Fuse from 'fuse.js'
import _ from 'lodash'
import { createSelector } from 'reselect'
import { AppState } from '../store'

export const getMetadata = (locale: string) => createSelector([
  (state: AppState) => state.metadata[locale],
], doc => doc)

export const getDefinitions = (locale: string) => createSelector([
  (state: AppState) => state.definitions.docs[locale] || [],
], docs => docs)

export const getFallacies = (locale: string) => createSelector([
  (state: AppState) => state.fallacies.docs[locale] || [],
], docs => docs)

export const getFallaciesFuse = (locale: string) => createSelector([
  getFallacies(locale),
], docs => new Fuse(docs, {
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
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.1,
}))

export const getFilteredFallacies = (locale: string) => createSelector([
  getFallacies(locale),
  getFallaciesFuse(locale),
  (state: AppState) => state.fallacies.searchInput,
  (state: AppState) => state.fallacies.filters,
], (docs, fuse, searchInput, filters) => {
  const res = (_.isEmpty(searchInput) || !fuse) ? docs : _.map(fuse.search(searchInput), v => v.item)
  const fres = _.filter(res, v => {
    const types = _.get(v, 'data.types')
    const inheritance = _.get(v, 'data.inheritance')
    const isFormal = _.find(types, v => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined
    const isInformal = _.find(types, v => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined
    const isAlpha = inheritance ? inheritance.length === 0 : true
    const isBeta = inheritance ? inheritance.length === 1 : false
    const isGamma = inheritance ? inheritance.length >= 2 : false

    if (isFormal && !filters.formal) return false
    if (isInformal && !filters.informal) return false
    if (isAlpha && !filters.alpha) return false
    if (isBeta && !filters.beta) return false
    if (isGamma && !filters.gamma) return false

    return true
  })

  return fres
})

export const getFilteredFallaciesInPageChunks = (locale: string) => createSelector([
  getFilteredFallacies(locale),
  (state: AppState) => state.fallacies.pageSize,
], (docs, pageSize) => _.chunk(docs, pageSize))

export const getFilteredFallaciesOnCurrentPage = (locale: string) => createSelector([
  getFilteredFallaciesInPageChunks(locale),
  (state: AppState) => state.fallacies.pageIndex,
], (chunks, pageIndex) => chunks[pageIndex] ?? [])

export const getMaxPagesOfFilteredFallacies = (locale: string) => createSelector([
  getFilteredFallaciesInPageChunks(locale),
], chunks => chunks.length)

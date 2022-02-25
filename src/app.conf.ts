/**
 * @file Configuration for both client and server environments.
 */

import dotenv from 'dotenv'

dotenv.config()

export default {
  /**
   * Version number.
   */
  version: require('../package.json').version,

  /**
   * Build number.
   */
  buildNumber: process.env.BUILD_NUMBER ?? 0,

  /**
   * Google Analytics ID (i.e. UA-XXXXXXXX-1).
   */
  ga: 'UA-108117457-5',

  /**
   * Delay (in ms) in searching while typing in the textfield.
   */
  typeSearchDelay: 150,

  /**
   * Specifies whether to include matches in Fuse.js search.
   */
  includeMatchesInSearch: false,

  /**
   * Enables debugger in production.
   */
  enableDebugInProduction: false,

  /**
   * Enables browser history for searches.
   */
  enableHistoryForSearch: true,

  /**
   * Enables browser history for filters.
   */
  enableHistoryForFilters: true,

  /**
   * Enables browser history for page indexes.
   */
  enableHistoryForPageIndexes: true,

  /**
   * Enables browser history for presented fallacies.
   */
  enableHistoryForFallacies: true,

  /**
   * Enables browser history for presented definitions.
   */
  enableHistoryForDefinitions: true,

  /**
   * Prismic config.
   */
  prismic: {
    apiEndpoint: 'https://aristotl.cdn.prismic.io/api/v2',
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  },

  /**
   * HTML metadata.
   */
  meta: {
    title: 'Aristotl',
    description: require('../package.json').description,
    keywords: (require('../package.json').keywords || []).join(','),
    url: require('../package.json').homepage,
  },

  /**
   * Supported locales (first locale is the default locale).
   */
  locales: ['en'],
}

/**
 * @file Configuration for both client and server environments.
 */

import dotenv from 'dotenv';

dotenv.config();

export default {
  // Version number.
  version: require('../package.json').version,

  // Build number.
  buildNumber: process.env.BUILD_NUMBER || 0,

  // Google Analytics ID (i.e. UA-XXXXXXXX-1)
  ga: undefined,

  // Prismic config.
  prismic: {
    // API endpoint.
    apiEndpoint: 'https://aristotl.cdn.prismic.io/api/v2',

    // Secret access token.
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  },

  // HTML metadata.
  meta: {
    // Title of the app.
    title: 'React Static Starter Kit',

    // Short description of the app.
    description: require('../package.json').description,

    // Search keywords.
    keywords: require('../package.json').keywords,

    // App URL.
    url: require('../package.json').homepage,
  },

  // Supported locales. First locale is the default locale.
  locales: ['en'],
};

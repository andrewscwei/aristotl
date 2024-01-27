/**
 * @file This is the Webpack config for compiling client assets in both
 *       `development` and `production` environments.
 */

import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import ForkTSCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import HTMLPlugin from 'html-webpack-plugin'
import path from 'path'
import { Configuration, DefinePlugin, EnvironmentPlugin, IgnorePlugin } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import appConf from '../src/app.conf'
import { getLocalesFromDir, getTranslationsFromDir } from './utils'

const isDev: boolean = process.env.NODE_ENV === 'development'
const cwd: string = path.join(__dirname, '../')
const inputDir: string = path.join(cwd, 'src')
const outputDir: string = path.join(cwd, 'build')
const localesDir: string = path.join(cwd, 'config/locales')
const locales = getLocalesFromDir(localesDir, appConf.locales[0], appConf.locales)
const port = Number(process.env.PORT) || 8080
const useBundleAnalyzer: boolean = process.env.ANALYZE_BUNDLE === 'true' ? true : false

const config: Configuration = {
  devtool: isDev ? 'eval-source-map' : false,
  entry: {
    main: path.join(inputDir, 'index.ts'),
    polyfills: path.join(inputDir, 'polyfills.ts'),
  },
  infrastructureLogging: {
    level: 'error',
  },
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          ...isDev ? {
            plugins: [require.resolve('react-refresh/babel')],
          } : {},
        },
      }],
    }, {
      test: /\.(jpe?g|png|gif|svg)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 8192,
          name: `assets/images/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        },
      }],
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 8192,
          name: `assets/media/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        },
      }],
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 8192,
          name: `assets/fonts/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        },
      }],
    }],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          test: /node_modules/,
          chunks: 'all',
          name: 'common',
          enforce: true,
        },
      },
    },
  },
  output: {
    filename: isDev ? '[name].js' : '[name].[chunkhash].js',
    path: outputDir,
    publicPath: process.env.PUBLIC_PATH || '/',
    sourceMapFilename: '[file].map',
    globalObject: 'this', // https://github.com/webpack/webpack/issues/6642#issuecomment-371087342
  },
  performance: {
    hints: isDev ? false : 'warning',
    maxEntrypointSize: 512 * 1024,
    maxAssetSize: 512 * 1024,
  },
  plugins: [
    new ForkTSCheckerPlugin(),
    new CopyPlugin({
      patterns: [{
        from: path.join(inputDir, 'static'),
        to: outputDir,
      }],
    }),
    new EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new DefinePlugin({
      __APP_CONFIG__: JSON.stringify(appConf),
      __I18N_CONFIG__: JSON.stringify({
        defaultLocale: appConf.locales[0],
        locales,
        dict: getTranslationsFromDir(localesDir, locales),
      }),
    }),
    new HTMLPlugin({
      appConf,
      chunks: ['common', 'main'].concat(isDev ? [] : ['polyfills']),
      chunksSortMode: 'manual',
      filename: 'index.html',
      inject: true,
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      template: path.join(inputDir, 'templates', 'index.html'),
    }),
    ...isDev ? [
      new ReactRefreshPlugin(),
    ] : [
      new IgnorePlugin({
        resourceRegExp: /^.*\/config\/.*$/,
      }),
    ],
    ...!useBundleAnalyzer ? [] : [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
      }),
    ],
  ],
  ...!isDev ? {} : {
    devServer: {
      client: {
        logging: 'error',
      },
      headers: {
        'Access-Control-Allow-Origin': `http://localhost:${port}`,
        'Access-Control-Allow-Methods': 'GET,OPTIONS,HEAD,PUT,POST,DELETE,PATCH',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With',
        'Access-Control-Allow-Credentials': 'true',
      },
      historyApiFallback: true,
      host: '0.0.0.0',
      hot: true,
      port,
      static: {
        publicPath: process.env.PUBLIC_PATH || '/',
      },
    },
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  stats: {
    colors: true,
    errorDetails: true,
    modules: true,
    reasons: true,
  },
  target: 'web',
}

export default config

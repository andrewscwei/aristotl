/**
 * @file This is the Webpack config for compiling client assets in both
 *       `development` and `production` environments.
 */

import CopyPlugin from 'copy-webpack-plugin';
import HTMLPlugin from 'html-webpack-plugin';
import path from 'path';
import { Configuration, DefinePlugin, EnvironmentPlugin, IgnorePlugin, Plugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import appConf from '../src/app.conf';
import { getLocalesFromDir, getTranslationsFromDir } from './utils';

const isDev: boolean = process.env.NODE_ENV === 'development';
const useBundleAnalyzer: boolean = process.env.ANALYZE_BUNDLE === 'true' ? true : false;
const cwd: string = path.join(__dirname, '../');
const inputDir: string = path.join(cwd, 'src');
const outputDir: string = path.join(cwd, 'build');
const localesDir: string = path.join(cwd, 'config/locales');
const locales = getLocalesFromDir(localesDir, appConf.locales[0], appConf.locales);
const port = Number(process.env.PORT) || 8080;

const config: Configuration = {
  devtool: isDev ? 'eval-source-map' : false,
  entry: {
    bundle: path.join(inputDir, 'index.tsx'),
    polyfills: path.join(inputDir, 'polyfills.tsx'),
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
        },
      }],
    }, {
      test: /\.(jpe?g|png|gif|svg)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: `assets/images/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        },
      }, {
        loader: 'image-webpack-loader',
        options: {
          disable: isDev,
        },
      }],
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: `assets/media/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        },
      }],
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
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
    new CopyPlugin([{
      from: path.join(inputDir, 'static'),
      ignore: ['.*'],
      to: outputDir,
    }]),
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
      chunks: ['polyfills', 'common', 'bundle'],
      chunksSortMode: 'manual',
      filename: 'index.html',
      inject: true,
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: false,
      },
      template: path.join(inputDir, 'templates', 'index.html'),
    }),
    ...isDev ? [] : [
      new IgnorePlugin(/^.*\/config\/.*$/),
    ],
    ...!useBundleAnalyzer ? [] : [
      new BundleAnalyzerPlugin(),
    ],
  ] as Array<Plugin>,
  ...!isDev ? {} : {
    devServer: {
      historyApiFallback: true,
      host: '0.0.0.0',
      hot: true,
      port,
      stats: { colors: true },
    },
  } as any,
  resolve: {
    alias: {
      ...!isDev ? {} : {
        'react-dom': '@hot-loader/react-dom',
      },
    },
    extensions: ['.js', '.ts', '.tsx'],
  },
  stats: {
    colors: true,
    errorDetails: true,
    modules: true,
    reasons: true,
  },
  target: 'web',
};

export default config;

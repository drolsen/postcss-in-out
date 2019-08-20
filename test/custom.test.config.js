const path = require('path');
const POSTCSSInOut = require('../index.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const POSTCSSNested = require('postcss-nested');
const POSTCSSImports = require('postcss-import');
const TestPlugins = require('./test.plugins.js');

// test webpack config
const config = {
  entry: path.resolve(__dirname, 'test.js'),
  output: {
    path: path.resolve(__dirname, '../dist'), 
    filename: 'custom/[name].js',
    pathinfo: false
  },
  module: {
    rules: [
      {
        'test': /\.css$/,
        'use': [
          MiniCssExtractPlugin.loader, // (see: https://www.npmjs.com/package/mini-css-extract-plugin)
          {
            'loader': 'css-loader', // (see: https://www.npmjs.com/package/css-loader)
            'options': {}
          }
        ]
      }
    ]
  },
  plugins: [
    // Where to output and how to name bundled stylesheets
    new MiniCssExtractPlugin({
      filename: `custom/[name].css`,
      chunkFilename: './custom/[name].css'
    }),
    // Pre and Post build hooks for POSTCSS YAY!
    new POSTCSSInOut({
      preBuild: {
        'loader': 'postcss-loader', // (see: https://www.npmjs.com/package/postcss-loader)
        'options': {
          'ident': 'postcss',
          'plugins': (loader) => [
            POSTCSSImports(),        // compiles down nesting per css file, not globally
          ]
        }
      },
      postBuild: [
        POSTCSSNested(),          // compiles down nesting per css file, not globally
        TestPlugins.variables(),  // compiles down variables globally
        TestPlugins.media(),      // compiles down media / variable usage globally
        TestPlugins.rems(),       // compiles down rem() method usage globally
        TestPlugins.roots()       // removes roots globally
      ]
    })
  ],
  optimization: {
    minimize: false
  } 
};

// Prod vs. Dev config customizing
module.exports = (env, argv) => {
  return config;
};

<div align="center">
  <img src="/assets/logo.png" width="300" />
  <p style="margin-top: 25px;">Plugin to add pre and post build hooks to PostCSS for global features.</p>

[![Build Status](https://travis-ci.com/drolsen/postcss-in-out.svg?branch=master)](https://travis-ci.com/drolsen/postcss-in-out)
[![dependencies Status](https://david-dm.org/drolsen/postcss-in-out/status.svg)](https://david-dm.org/drolsen/postcss-in-out)
[![devDependencies Status](https://david-dm.org/drolsen/postcss-in-out/dev-status.svg)](https://david-dm.org/drolsen/postcss-in-out?type=dev)
</div>

### Why PostCSSInOut
The main idea of PostCSSInOut is to finally bring a global context to PostCSS and developers!
This helps with the following:

- Can help to reduce required PostCSS clean up plugins.
- Can help to reduce CSS bundle sizes.
- Can help to simplify PostCSS API usage / development.

### How it works
By default PostCSS compilations happen at a per-css-file context, not a global full-sheet context.
This means you can't define variables, mixins, methods etc. to be used global across all your source css files.

With PostCSSInOut however, you are now offered both `preBuild` and `postBuild` context hooks! By leveraging these two context hooks, developers can define what custom (or community) PostCSS plugins/features ought to be globally available to source css files.

For instance, without PostCSSInOut; sharing `:root {...}` variables across two files would be done in one of two ways:
- Create a file system hierarchy CSS of import order that emphasis variables first.
- Import file A into file B, to use file A's variables within file B.

With PostCSSInOut, simply define community `postcss-variables` plugin to ran in the global context, and viola all variables declarations should be available globally to all src css files.

---

### Install
```
npm i --save-dev postcss-in-out
```
```
yarn add --dev postcss-in-out
```

### Webpack Config
Import postcss-in-out into your Webpack configuration file:
```js
const PostCSSInOut = require('postcss-in-out');
```

Instantiate a `new PostCSSInOut()` class within Webpack configuration's plugin array.
Take note that in this setup below we have no `postcss-loader` being used in our rules; this is intentional:
```js
module.exports = {
  module: {
    rules: [
      {
        'test': /\.css$/,
        'use': [
          MiniCssExtractPlugin.loader, // (see: https://www.npmjs.com/package/mini-css-extract-plugin)
          {
            'loader': 'css-loader'     // (see: https://www.npmjs.com/package/css-loader)
          }
        ]
      }
    ]
  },
  plugins: [
    new PostCSSInOut({
      preBuild: [
        // Postcss plugins added here gets compiled in a normal per-css-file context
      ],
      postBuild: [
        // Postcss plugins added here gets compiled in a global css file context
      ]
    }),
    new MiniCssExtractPlugin({
      filename: `basic/[name].css`,
      chunkFilename: './[name].css'
    })    
  ]
};
```
In the above configuration, we hands-over the `postcss-loader` configuration to PostCSSInOut and only focus on the plugin and features we want ran.

However, to maintain full control over the `postcss-loader` configuration, you can pass it instead of an array:

```js
module.exports = {
  module: {
    rules: [
      {
        'test': /\.css$/,
        'use': [
          MiniCssExtractPlugin.loader, // (see: https://www.npmjs.com/package/mini-css-extract-plugin)
          {
            'loader': 'css-loader'     // (see: https://www.npmjs.com/package/css-loader)
          }
        ]
      }
    ]
  },
  plugins: [
    new PostCSSInOut({
      preBuild: {
        'loader': 'postcss-loader', // (see: https://www.npmjs.com/package/postcss-loader)
        'options': {
          'ident': 'postcss',
          'plugins': (loader) => [
            // Postcss plugins added here gets compiled in a normal per-css-file context
          ]
        }
      },
      postBuild: [
        // Postcss plugins added here gets compiled in a global css file context
      ]
    }),
    new MiniCssExtractPlugin({
      filename: `basic/[name].css`,
      chunkFilename: './[name].css'
    })    
  ]
};
```
Please take note that the above example has the `postcss-loader` configuration living the the PostCSSInOut plugin, not the module.rules object. This is intentional and core to how PostCSSInOut works.

Thats it!


### Migrating to PostCSSInOut
This is a typical setup for PostCSS and Webpack:

```js
module.exports = {
  module: {
    rules: [
      {
        'test': /\.css$/,
        'use': [
          MiniCssExtractPlugin.loader, // (see: https://www.npmjs.com/package/mini-css-extract-plugin)
          {
            'loader': 'css-loader'     // (see: https://www.npmjs.com/package/css-loader)
          },
          {
          'loader': 'postcss-loader',  // (see: https://www.npmjs.com/package/postcss-loader)
          'options': {
            'ident': 'postcss',
            'plugins': (loader) => [
              // Postcss plugins added here gets compiled in a normal per-css-file context
            ]
          }          
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `basic/[name].css`,
      chunkFilename: './[name].css'
    })    
  ]
};
```

- `MiniCSSExtractPlugin` helps write our bundled CSS to disk and name the file
- `css-loader` helps Webpack parse CSS syntax during build
- `postcss-loader` helps Webpack parse CSS over PostCSS API

Here is that same setup, but now using PostCSSInOut:
```js
module.exports = {
  module: {
    rules: [
      {
        'test': /\.css$/,
        'use': [
          MiniCssExtractPlugin.loader, // (see: https://www.npmjs.com/package/mini-css-extract-plugin)
          {
            'loader': 'css-loader'     // (see: https://www.npmjs.com/package/css-loader)
          }
        ]
      }
    ]
  },
  plugins: [
    new PostCSSInOut({
      preBuild: {
        'loader': 'postcss-loader', // (see: https://www.npmjs.com/package/postcss-loader)
        'options': {
          'ident': 'postcss',
          'plugins': (loader) => [
            // Postcss plugins added here gets compiled in a normal per-css-file context
          ]
        }
      },
      postBuild: [
        // Postcss plugins added here gets compiled in a global css file context
      ]
    }),
    new MiniCssExtractPlugin({
      filename: `basic/[name].css`,
      chunkFilename: './[name].css'
    })    
  ]
};
```
The only difference is the location of the `postcss-loader` configuration being in PostCSSInOut instead of module.rules.

---

### Tests

PostCSSInOut comes with a number of tests found under `/test`.
These are here to help you better understand the expectations of this plugin's configuration(s).

Simply run `npm run test` or `yarn test` from the root of the plugin to run all tests. Running a test will produce `/dist/[test]` directories.

If you would like to change a test, update the root package.json file's `test` script to use any of the `/test/*.test.config.js` files.

- `basic.test.config.js` = Demonstrates the basic PostCSSInOut configuration.
- `custom.test.config.js` = Demonstrates the custom PostCSSInOut postcss-loader configuration.


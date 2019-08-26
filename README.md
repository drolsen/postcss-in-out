<div align="center">
  <img src="/assets/logo.png" width="300" />
  <p style="margin-top: 25px;">Plugin to add pre & post build hooks for global POSTCSS features.</p>

[![Build Status](https://travis-ci.com/drolsen/postcss-in-out.svg?branch=master)](https://travis-ci.com/drolsen/postcss-in-out)
[![dependencies Status](https://david-dm.org/drolsen/postcss-in-out/status.svg)](https://david-dm.org/drolsen/postcss-in-out)
[![devDependencies Status](https://david-dm.org/drolsen/postcss-in-out/dev-status.svg)](https://david-dm.org/drolsen/postcss-in-out?type=dev)
</div>

### Why PostCSSInOut
The main idea of PostCSSInOut is to finally bring a global context to PostCSS and developers!
This helps with the following:

- Helps reduce PostCSS clean up plugins needs
- Helps reduce CSS bundle sizes
- Helps simplify PostCSS API usage

### How it works
PostCSS compilations happen at a per-css-file context, not a global full-sheet context.
This means developers can't define global variables, mixins, methods etc. to be used across all your source files.

With PostCSSInOut developers are now offered both `preBuild` and `postBuild` context hooks!
By leveraging these two hooks, developers can define what custom (or community) plugins & features ought to be available globally to source CSS files.

For instance; without PostCSSInOut, sharing `:root {...}` variables across two files would be done in one of two ways:
- Create a CSS file system hierarchy of `@import` order that emphasizes variables first.
- `@import` file `A.css` into file `B.css`, to use file `A.css` variables within file `B.css`.

With PostCSSInOut however, developers can define `postcss-variables` community plugin to be ran in the `postBuild` hook, and all variables declarations will be available globally without anymore `@import` needs.

---

### Install
```
npm i --save-dev postcss-in-out
```
```
yarn add --dev postcss-in-out
```

### Configuration
Import postcss-in-out into your Webpack configuration file:
```js
const PostCSSInOut = require('postcss-in-out');
```

Instantiate a `new PostCSSInOut()` class within Webpack configuration's plugin array.
Take note that in this setup below we have no `postcss-loader` being used in our rules; this is intentional:
```js
module.exports = {
  plugins: [
    new PostCSSInOut({
      preBuild: [
        // Postcss plugins added here gets compiled in a normal per-css-file context
      ],
      postBuild: [
        // Postcss plugins added here gets compiled in a global css file context
      ]
    })    
  ]
};
```

Thats it!


### Migrating to PostCSSInOut
This is a typical configuration setup for CSS files being bundled with PostCSS and Webpack:

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

The only difference is the location of the `postcss-loader` no living in PostCSSInOut instead of module.rules. **Note: The above example is for if you prefer to still retain configuration control over `postcss-loader`; if not simply define `preBuild: [...]` as an array of plugins instead.**

---

### Tests

PostCSSInOut comes with a number of tests found under `/test`.
These are here to help you better understand the expectations of this plugin's configuration(s).

Simply run `npm run test` or `yarn test` from the root of the plugin to run all tests. Running a test will produce `/dist/[test]` directories.

If you would like to change a test, update the root package.json file's `test` script to use any of the `/test/*.test.config.js` files.

- `basic.test.config.js` = Demonstrates the basic PostCSSInOut configuration.
- `custom.test.config.js` = Demonstrates the custom PostCSSInOut postcss-loader configuration.


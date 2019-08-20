<div align="center">
  <img src="/assets/logo.png" width="300" />
  <p style="margin-top: 25px;">Plugin to add `preBuild` and `postBuild` hooks for global features.</p>

[![Build Status](https://travis-ci.com/drolsen/postcss-in-out.svg?branch=master)](https://travis-ci.com/drolsen/postcss-in-out)
[![dependencies Status](https://david-dm.org/drolsen/postcss-in-out/status.svg)](https://david-dm.org/drolsen/postcss-in-out)
[![devDependencies Status](https://david-dm.org/drolsen/postcss-in-out/dev-status.svg)](https://david-dm.org/drolsen/postcss-in-out?type=dev)
</div>

### Why POSTCSSInOut
The main idea of POSTCSSInOut is to finally bring a global context to developers! This helps with the following:

- Can help to reduce needed postcss-plugins that help clean up non global context features.
- Can help to reduce bundle size by work with features such as media query packing globally.
- Simplifies the Postcss API usage for developers who assume their feature to be working in a global context.


### How it works
By default Postcss compilations happen at a per-css-file context, not a global full-sheet context.
This means you can't define variables, mixins, methods etc. to be global across your source css files.

With POSTCSSInOut however, you are now offered both `preBuild` and `postBuild` context hooks! By leveraging these two context hooks, developers can define what custom (or community) Postcss plugins/features ought to be globally available to source css files.

For instance, without POSTCSSInOut; sharing :root {} variables across two files would be done in one of two ways:
- Create a file system hiarchy CSS of import order that emphasis variables first.
- Import file A into file B, to use file A's variables within file B.

With POSTCSSInOut, simply define community `postcss-variables` plugin to ran in the global context, and viola all variables declarations should be available globally to all src css files.

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
const POSTCSSInOut = require('postcss-in-out');
```

Instantiate a `new POSTCSSInOut()` class within Webpack configuration's plugin array.
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
    new POSTCSSInOut({
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
In the above configuration, we hands-over the `postcss-loader` configuration to POSTCSSInOut and only focus on the plugin and features we want ran.

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
    new POSTCSSInOut({
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
Please take note that the above example has the `postcss-loader` configuration living the the POSTCSSInOut plugin, not the module.rules object. This is intentional and core to how POSTCSSInOut works.

Thats it!


### Migrating to POSTCSSInOut
This is a typical setup for Postcss and webpack:

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

- MiniCSSExtractPlugin helps write our bundled CSS to disk and name the file
- css-loader helps webpack parse CSS syntax during build
- postcss-loader helps webpack parse CSS over Postcss API

Here is that same setup, but now using POSTCSSInOut:
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
    new POSTCSSInOut({
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
The only difference is the location of the `postcss-loader` configuration being in POSTCSSInOut instead of module.rules.

---

### Tests

POSTCSSInOut comes with a number of tests found under `/test`.
These are here to help you better understand the expectations of this plugin's configuration(s).

Simply run `npm run test` or `yarn test` from the root of the plugin to run all tests. Running a test will produce `/dist/[test]` directories.

If you would like to change a test, update the root package.json file's `test` script to use any of the `/test/*.test.config.js` files.

- `basic.test.config.js` = Demonstrates the basic POSTCSSInOut configuration.
- `custom.test.config.js` = Demonstrates the custom POSTCSSInOut postcss-loader configuration.


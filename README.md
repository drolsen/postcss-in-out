<div align="center">
  <img src="/assets/logo.png" width="300" />
  <p style="margin-top: 25px;">Plugin to add before and after hooks to POSTCSS.</p>

[![Build Status](https://travis-ci.com/drolsen/postcss-in-out.svg?branch=master)](https://travis-ci.com/drolsen/postcss-in-out)
[![dependencies Status](https://david-dm.org/drolsen/postcss-in-out/status.svg)](https://david-dm.org/drolsen/postcss-in-out)
[![devDependencies Status](https://david-dm.org/drolsen/postcss-in-out/dev-status.svg)](https://david-dm.org/drolsen/postcss-in-out?type=dev)
</div>

### How it works
POSTCSS is GREAT!
POSTCSS is POWERFULL!
POSTCSS is limited to per-file compilation scopes?

If you have ever tried to author your own POSTCSS plugins, you may have quickly noticed that although the compilations happens at a per file scope. This means you can't use variables, mixins or methods globally, without creating what some consider "rats nest" of imports statements across many CSS source CSS files.

If you have ever wished for there was a way to run (or author) POSTCSS plugins/API over global sheet context, then this is the plugin for you!

Introducing POSTCSS In-Out!

With this plugin, you now have the ability to define POSTCSS plugins in to what are called `preBuild` and `postBuild` webpack hooks.

Everything in the `preBuild` configuration is sent along to the normal POSTCSS compilation POSTCSS (single file compilation scopes). While everything in the `postBuild` configuration hook, is processed after the normal POSTCSS over your entine compiled sheet providing a global scope to Plugins and API.

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

Instantiate a new POSTCSSInOut() class within Webpack configuration's plugin array:
```js
module.exports = {
  "plugins": [
    new POSTCSSInOut()
  ]
};
```

Then, within your CSS module rule for POSTCSS, add the `preBuild` and `postBuild` hooks:

```js
'test': /\.css$/,
'use': [
  {
    'loader': 'postcss-loader', // (see: https://www.npmjs.com/package/postcss-loader)
    'options': {
      'ident': 'postcss',
      'plugins': (loader) => [
        preBundle: [
          // all plugins you wish to run in normal per-file compilation scopes
        ],
        postBundle: [
          // all plugins / api you wish to run in a global sheet compilation scope
        ]
      ]
    }
  }
]
```

Thats it!

---

### Tests

const POSTCSS = require('postcss');
const { sources, Compilation } = require('webpack');

class POSTCSSInOut {
  constructor(options) {
    this.options = options;
  }

  processPostBuild(children, callback) {
    const collection = Object.keys(children).map((j) => {
      let child = children[j];
      if (typeof child === 'object') {
        return child._value;
      }
      return child;
    }).join('');

    return POSTCSS([...this.options.postBuild])
      .process(collection, {
        from: '',
        to: ''
      })
      .then(result => {
        callback(result.css);
      })
  }

  apply(compiler){
    if (this.options.preBuild) {
      compiler.hooks.entryOption.tap('POSTCSSInOut', (context, entry) => {
        // Injects preBuild plugins into webpack build process (postcss-loader)
        Object.keys(compiler.options.module.rules).map((i) => {
          const rule = compiler.options.module.rules[i];
          // Looking for webpack CSS rules
          if (rule.test.toString().indexOf('.css') !== -1) {
            // Adding required postcss-loader for supplied plugin array
            if (Array.isArray(this.options.preBuild)) {
              rule.use.push(
                {
                  'loader': 'postcss-loader', // (see: https://www.npmjs.com/package/postcss-loader)
                  'options': {
                    'postcssOptions': {
                      'ident': 'postcss',
                      'plugins': [
                        ...this.options.preBuild
                      ]
                    }
                  }
                }
              )
            } else if (this.options.preBuild.loader) {
              // Allowing developers to pass their own postcss-loader configuation / plugins
              rule.use.push(this.options.preBuild);
            } else {
              // No preBuild plugin array or configuration object could be found.
              console.error('ERROR: POSTCSSInOut is either missing a preBuild configuration, or it is not an arry of plugins or object configuration.')
            }
          }
        });
      });
    } else {
      console.log('ERROR: It appears you have not configured the required preBuild setting. Either pass an array of postcss plugins or your own postcss-loader configuration object to preBuild option.')
    }

    // Processes full bundled css sheets over our postBundle plugins
    if (this.options.postBuild) {
      compiler.hooks.compilation.tap({ name: 'POSTCSSInOut' }, (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'POSTCSSInOut',
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS // see below for more stages
          },
          (assets) => {
            for (let i in assets) {
              if (i.indexOf('.css') !== -1) {
                this.processPostBuild(assets[i]._source._children, (results) => {
                  compilation.updateAsset(i, new sources.RawSource(results));
                });
              }
            }
          }
        )
      });
    } else {
      console.log('WARNING: POSTCSSInOut has no postBuild configuration. If you plan on not using the postBuild feature of POSTCSSInOut, it might be wise to use a default POSTCSS webpack instead.')
    }
  }
}

module.exports = POSTCSSInOut;

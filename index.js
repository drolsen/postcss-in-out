/*
  Helper plugin to process css files after being combined by mini-css-extract-plugin
*/
class ProcessCSSPostBundle {
  constructor () { /* Currently no options or constructor need */ }

  process(children, callback) {
    const collection = Object.keys(children).map((j) => {
      let child = children[j];
      if (typeof child === 'object') {
        return child._value;
      }
      return child;
    }).join('');

    return POSTCSS([...POSTCSSPlugins.postBundle])
      .process(collection, {
        from: '',
        to: ''
      })
      .then(result => {
        callback(result.css);
      })
  }

  apply(compiler) {
    compiler.hooks.emit.tap('ProcessCSSPostBundle', compilation => {
      Object.keys(compilation.assets).map((i) => {
        if (i.indexOf('assets.css') !== -1 || i.indexOf('guide.css') !== -1) {
          this.process(compilation.assets[i]._source.children, (results) => {
            compilation.assets[i]._source.children = [results];
          });
        }
      });
    });
  }
}
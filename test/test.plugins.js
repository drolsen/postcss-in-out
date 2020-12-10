const postcss = require('postcss');

const variables = (options = {}) => {
  options = Object.assign({}, options);
  const variables = [];
  return {
    postcssPlugin: 'postcss-variables',
    Once (root) {
      const extractVariables = (value) => {
        value = value.split(' ');
        return Object.keys(value).map(index => {
          if (value[index].replace(/var\((.*?)\)/g, '$1').indexOf('--') !== -1) {
            let quickClean = value[index].replace(/var\((.*?)\)/g, '$1');
            quickClean = quickClean.replace(/,/g, '');
            if (quickClean.split('(').length > 1) {
              return quickClean.split('(')[1];
            }
            return quickClean;
          }
          return;
        }).filter((n) => n);
      };

      // First, build list of variables
      root.walkRules(':root', rule => {
        rule.walkDecls(decl => {
          if (decl.prop.indexOf('--') !== -1) {
            variables[decl.prop] = decl.value;
          }
        });
      });

      // Next loop over list of variables values, and determin if
      // values are back referencing another variable or not.
      // if found to be back referencing another variable, use extractVariable method to
      // reverse loop up variables value in our list and update value
      Object.keys(variables).map(index => {
        const reverseLookupVariable = extractVariables(variables[index]);
        if (reverseLookupVariable.length) {
          const reverseLookupValue = variables[reverseLookupVariable];
          variables[index] = variables[index].replace('var('+reverseLookupVariable+')', reverseLookupValue);
        }
      });

      // Now that we have a distilled down list of all variables, lets replace all usage of variables across the
      // stylesheets using our clean variables list as a key
      root.walkRules(rule => {
        rule.walkDecls(decl => {
          Object.keys(variables).map(index => {
            if (decl.value.indexOf('var('+index+')') !== -1) {
              decl.value = decl.value.replace(/var\((.*?)\)/g, variables[index]);
            }
          });
        });
      });

      // Finally, we allow variable usage in the useage of mixins
      root.walkAtRules(rule => {
        if (rule.name === 'mixin') {
          Object.keys(variables).map(index => {
            if (rule.params.indexOf('var('+index+')') !== -1) {
              rule.params = rule.params.replace(/var\((.*?)\)/, variables[index]);
            }
          });
        }
      });
    }
  };
};

const media = (options = {}) => {
  options = Object.assign({
    preserve: false
  }, options);

  const queries = [];
  const packs = [];

  return {
    postcssPlugin: 'postcss-media',
    Once (root) {
      // collect all possible breakpoints
      root.walkDecls(decl => {
        const value = decl.value;
        if (value.indexOf('only screen and') !== -1 ||
          value.indexOf('screen and') !== -1 ||
          value.indexOf('only print and') !== -1 ||
          value.indexOf('print and') !== -1) {
          queries[decl.prop] = value;
          packs[value] = '';
        }
      });

      // replace @mediavariable declirations, with values from collected queries above
      root.walkAtRules('media', (rule) => {
        const variable = rule.params.replace(/\((.*)\)/g, '$1');
        let removeFlag = false;
        Object.keys(queries).map(key => {
          if (key === variable) {
            rule.params = queries[key];

            // gather meida queries inners
            rule.walkRules(innerRules => {
              let stringSelector = `  ${innerRules.selector} {\n`;
              innerRules.walkDecls(innerDecl => {
                  stringSelector += `    ${innerDecl.prop}: ${innerDecl.value};\n`;
              });
              stringSelector += '  }\n';

              packs[queries[key]] += stringSelector;
            });

            removeFlag = true;
          }
        });

        if (removeFlag) {
          rule.remove(); // remove this query, to re-append a packed set down below.
        }
      });

      // append compressed media quries to end of sheet
      Object.keys(packs).map((i) => {
        if (packs[i].length) {
          root.append(`@media ${i} {\n${packs[i]}\n}`);
        }
      });
    }
  };
};

const rems = (options = {}) => {
  options = Object.assign({
    baseSize: 16
  }, options);

  return {
    postcssPlugin: 'postcss-rems',
    Once (root) {
      root.walkDecls(decls => {
        if (decls.value.indexOf('rem(') !== -1) {
          let occurances = decls.value.match(/rem\(.*?\)/g);
          Object.keys(occurances).map(i => {
            let unit = parseInt(occurances[i].replace(/rem\((.*?)\)/g, '$1'), 10);
            decls.value = decls.value.replace(occurances[i], `${unit / options.baseSize}rem`);
          });
        }
      })
    }
  };
};

const roots = (options = {}) => {
  options = Object.assign({}, options);

  return {
    postcssPlugin: 'postcss-roots',
    Once (root) {
      root.walkRules(':root', rule => {
        // we never remove color root for guide purposes
        // if (typeof rule === 'undefined') { return false; }
        // if (rule.parent.source.input.file.indexOf('colors.css') !== -1) { return; }
        rule.remove();
      });
    }
  };
};

module.exports = {
  rems,
  roots,
  media,
  variables
};
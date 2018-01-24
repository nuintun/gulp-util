/**
 * @module plugins
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const is = require('./is');
const Vinyl = require('vinyl');
const async = require('./async');

/**
 * @class Plugin
 */
class Plugin {
  /**
   * @constructor
   * @param {string} name
   * @param {Promise} loaders
   */
  constructor(name, loaders) {
    this.name = name;
    this.loaders = loaders;
  }

  /**
   * @method process
   * @param {Vinyl} vinyl
   * @param {Object} options
   * @returns {Promise}
   */
  process(vinyl, options) {
    const name = this.name;
    const loaders = this.loaders;

    return new Promise((resolve, reject) => {
      async.series(
        loaders,
        (value, next) => {
          const loader = value[1];
          const result = loader(vinyl, options);

          if (Vinyl.isVinyl(result)) {
            vinyl = result;

            next();
          } else if (is.isPromiseLike(result)) {
            result
              .then(chunk => {
                if (Vinyl.isVinyl(chunk)) {
                  vinyl = chunk;
                }

                next();
              })
              .catch(error => {
                reject(error);
              });
          } else {
            next();
          }
        },
        () => {
          resolve(vinyl);
        }
      );
    });
  }
}

/**
 * @function normalizeLoaders
 * @description Normalize loaders
 * @param {Object} loaders
 * @param {Object} defaults
 */
function normalizeLoaders(loaders, defaults) {
  let builtIn = false;
  const result = new Set();

  if (Array.isArray(loaders)) {
    loaders.forEach(loader => {
      if (loader === 'default' && defaults && !builtIn) {
        // built-in loader
        builtIn = true;

        result.add(defaults);
      } else if (is.isFunction(loader)) {
        result.add(loader);
      }
    });
  } else if (is.isFunction(loaders)) {
    result.add(loaders);
  }

  if (!builtIn && defaults) {
    result.add(defaults);
  }

  return result;
}

/**
 * @function plugins
 * @param {Object} plugins
 * @param {Object} defaults
 * @returns {Object}
 */
module.exports = function(plugins, defaults) {
  let name;
  let loaders;
  const addons = new Map();

  if (plugins) {
    for (name in plugins) {
      if (plugins.hasOwnProperty(name)) {
        loaders = plugins[name];
        name = name.toLowerCase();
        loaders = normalizeLoaders(loaders, defaults[name]);

        if (loaders.size) {
          addons.set(name, new Plugin(name, loaders));
        }
      }
    }
  }

  if (defaults) {
    for (name in defaults) {
      if (defaults.hasOwnProperty(name)) {
        name = name.toLowerCase();

        if (!addons.has(name)) {
          loaders = new Set();

          loaders.add(defaults[name]);
          addons.set(name, new Plugin(name, loaders));
        }
      }
    }
  }

  return addons;
};

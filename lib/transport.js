/**
 * @module transport
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const hash = require('./hash');
const chalk = require('chalk');
const extname = require('path').extname;

/**
 * @function parse
 * @param {Vinyl} vinyl
 * @param {Object} options
 * @param {Function} debug
 * @returns {Promise}
 */
function parse(vinyl, options, debug) {
  const ext = extname(vinyl.path);
  const plugins = options.plugins;
  const name = ext.substring(1).toLowerCase();

  // Debug
  debug('use plugin: %s', chalk.reset.green(name));
  debug('read: %r', vinyl.path);

  // Process vinyl
  if (plugins.has(name)) {
    return plugins.get(name).process(vinyl, options);
  } else {
    return Promise.resolve(vinyl);
  }
}

/**
 * @function transport
 * @param {Vinyl} vinyl
 * @param {Object} options
 * @param {Cache} cache
 * @param {debug} debug
 * @returns {Promise}
 */
module.exports = function(vinyl, options, cache, debug) {
  if (options.cache) {
    const path = vinyl.path;

    if (cache.has(path)) {
      const key = hash(vinyl.stat);
      const cached = cache.get(path);

      // If hit cached use cache
      if (cached.key === key) {
        // Debug
        debug('read: %r from cache', path);

        return Promise.resolve(cached.vinyl);
      } else {
        // If not hit cached, parse vinyl
        return parse(vinyl, options, debug)
          .then(vinyl => {
            // Cache vinyl
            cache.set(path, { key, vinyl });

            return Promise.resolve(vinyl);
          })
          .catch(error => {
            return Promise.reject(error);
          });
      }
    }
  } else {
    return parse(vinyl, options, debug);
  }
};

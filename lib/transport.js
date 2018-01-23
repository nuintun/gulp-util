/**
 * @module transport
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const hash = require('./hash');
const chalk = require('chalk');
const extname = require('path').extname;

const nextTick = process.nextTick;

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

  const plugin = plugins[name];

  // Process vinyl
  if (plugin) {
    return plugin.process(vinyl, options);
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
module.exports = function transport(vinyl, options, cache, debug) {
  if (options.cache) {
    // Set hash
    vinyl.hash = hash(vinyl.stat);

    // Get cache
    const cached = cache.get(vinyl);

    // If not cached, parse vinyl
    if (cached === null) {
      return parse(vinyl, options, debug)
        .then(vinyl => {
          // Cache vinyl
          cache.set(vinyl);

          return Promise.resolve(vinyl);
        })
        .catch(error => {
          return Promise.reject(error);
        });
    } else {
      vinyl = cached;

      // Debug
      debug('read: %r from cache', vinyl.path);

      return Promise.resolve(vinyl);
    }
  } else {
    return parse(vinyl, options, debug);
  }
};

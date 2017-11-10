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
 * @param {Function} done
 * @param {Function} debug
 * @returns {void}
 */
function parse(vinyl, options, done, debug) {
  const ext = extname(vinyl.path);
  const plugins = options.plugins;
  const name = ext.substring(1).toLowerCase();

  // debug
  debug('use plugin: %s', chalk.reset.green(name));
  // debug
  debug('read: %r', vinyl.path);

  const plugin = plugins[name];
  const callback = (error, vinyl) => {
    vinyl.package = vinyl.package || {};

    done(error, vinyl, options);
  }

  // process vinyl
  if (plugin) {
    plugin
      .process(vinyl, options)
      .then((vinyl) => {
        callback(null, vinyl);
      })
      .catch((error) => {
        callback(error, vinyl);
      });
  } else {
    nextTick(() => {
      // non matched plugin
      callback(null, vinyl);
    });
  }
}

/**
 * @function transport
 * @param {Vinyl} vinyl
 * @param {Object} options
 * @param {Function} done
 * @param {Cache} cache
 * @param {debug} debug
 * @returns {void}
 */
module.exports = function(vinyl, options, done, cache, debug) {
  if (options.cache) {
    // set hash
    vinyl.hash = hash(vinyl.stat);

    // get cache
    const cached = cache.get(vinyl);

    // if not cached, parse vinyl
    if (cached === null) {
      parse(vinyl, options, (error, vinyl, options) => {
        // cache vinyl
        cache.set(vinyl);

        done(error, vinyl, options);
      }, debug);
    } else {
      vinyl = cached;

      // debug
      debug('read: %r from cache', vinyl.path);

      done(null, vinyl, options);
    }
  } else {
    parse(vinyl, options, done, debug);
  }
};

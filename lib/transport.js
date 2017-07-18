/*!
 * transport
 * Version: 0.0.1
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var hash = require('./hash');
var colors = require('colors/safe');
var extname = require('path').extname;

/**
 * parse
 *
 * @param {Vinyl} vinyl
 * @param {Object} options
 * @param {Function} done
 * @param {Function} debug
 * @returns {void}
 */
function parse(vinyl, options, done, debug) {
  var ext = extname(vinyl.path);
  var plugins = options.plugins;
  var name = ext.substring(1).toLowerCase();
  var plugin = plugins[name];

  // no match plugin, use other
  if (!plugin) {
    name = 'other';
    plugin = plugins.other;
  }

  // debug
  debug('use plugin: %s', colors.reset.green(name));
  // debug
  debug('read: %r', vinyl.path);

  // process vinyl
  plugin.process(vinyl, options, done);
}

/**
 * transport
 *
 * @param {Vinyl} vinyl
 * @param {Object} options
 * @param {Function} done
 * @returns {void}
 */
module.exports = function(vinyl, options, done, cache, debug) {
  if (options.cache) {
    // set hash
    vinyl.hash = hash(vinyl.stat);

    // get cache
    var cached = cache.get(vinyl);

    // if not cached, parse vinyl
    if (cached === null) {
      parse(vinyl, options, function(vinyl, options) {
        // cache vinyl
        cache.set(vinyl);

        done(vinyl, options);
      }, debug);
    } else {
      vinyl = cached;

      // debug
      debug('read: %r from cache', vinyl.path);

      done(vinyl, options);
    }
  } else {
    parse(vinyl, options, done, debug);
  }
};

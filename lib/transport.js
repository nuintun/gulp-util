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

  // debug
  debug('use plugin: %s', colors.reset.green(name));
  // debug
  debug('read: %r', vinyl.path);

  var plugin = plugins[name];
  var callback = function(error, vinyl) {
    vinyl.package = vinyl.package || {};

    done(error, vinyl, options);
  }

  // process vinyl
  if (plugin) {
    plugin
      .process(vinyl, options)
      .then(function(vinyl) {
        callback(null, vinyl);
      })
      .catch(function(error) {
        callback(error, vinyl);
      });
  } else {
    // no match plugin
    callback(null, vinyl);
  }
}

/**
 * transport
 *
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

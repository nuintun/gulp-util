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
var cache = require('./cache');
var util = require('./util');
var colors = util.colors;
var extname = require('path').extname;

/**
 * transport
 *
 * @param vinyl
 * @param options
 * @param done
 * @returns {*}
 */
module.exports = function transport(vinyl, options, done, debug) {
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
      debug('read file: %s from cache', colors.magenta(util.pathFromCwd(vinyl.path)));

      done(vinyl, options);
    }
  } else {
    parse(vinyl, options, done, debug);
  }
};

function parse(vinyl, options, done, debug) {
  var ext = extname(vinyl.path);
  var plugins = options.plugins;
  var name = ext.substring(1);
  var plugin = plugins[name];

  // no match plugin, use other
  if (!plugin) {
    name = 'other';
    plugin = plugins.other;
  }

  // debug
  debug('load plugin: %s', colors.green(name));
  // debug
  debug('read file: %s', colors.magenta(util.pathFromCwd(vinyl.path)));

  // parse vinyl
  return plugin.exec(vinyl, options, done);
}

/*!
 * cache
 * Version: 0.0.1
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var caches = {};

module.exports = {
  /**
   * get cache
   *
   * @param vinyl
   * @returns {*}
   */
  get: function(vinyl) {
    var hash = vinyl.hash;
    var cached = caches[vinyl.path];

    // hit
    if (cached && cached.hash === hash) {
      return cached;
    }

    return null;
  },
  /**
   * set cache
   *
   * @param vinyl
   */
  set: function(vinyl) {
    caches[vinyl.path] = vinyl;
  },
  /**
   * clean cache
   *
   * @param path
   */
  clean: function(path) {
    if (arguments.length) {
      delete caches[path];
    } else {
      caches = {};
    }
  }
};

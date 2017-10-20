/*!
 * cache
 *
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

/**
 * Cache
 *
 * @constructor
 * @returns {Cache}
 */
function Cache() {
  this.caches = {};
}

Cache.prototype = {
  /**
   * get cache
   *
   * @param vinyl
   * @returns {Vinyl}
   */
  get: function(vinyl) {
    var hash = vinyl.hash;
    var cached = this.caches[vinyl.path];

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
   * @returns {void}
   */
  set: function(vinyl) {
    this.caches[vinyl.path] = vinyl;
  },
  /**
   * clean cache
   *
   * @param path
   */
  clean: function(path) {
    if (arguments.length) {
      delete this.caches[path];
    } else {
      caches = {};
    }
  }
};

module.exports = Cache;

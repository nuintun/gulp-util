/**
 * @module cache
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

/**
 * @class Cache
 */
class Cache {
  /**
   * @constructor
   */
  constructor() {
    this.caches = {};
  }

  /**
   * @method get
   * @description get cache
   * @param {Vinyl} vinyl
   * @returns {Vinyl}
   */
  get(vinyl) {
    const hash = vinyl.hash;
    const cached = this.caches[vinyl.path];

    // hit
    if (cached && cached.hash === hash) {
      return cached;
    }

    return null;
  }

  /**
   * @method set
   * @description set cache
   * @param {Vinyl} vinyl
   * @returns {void}
   */
  set(vinyl) {
    this.caches[vinyl.path] = vinyl;
  }

  /**
   * @method clean
   * @description clean cache
   * @param {string} path
   */
  clean(path) {
    if (arguments.length) {
      delete this.caches[path];
    } else {
      caches = {};
    }
  }
}

module.exports = Cache;

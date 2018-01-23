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
   * @description Get cache
   * @param {Vinyl} vinyl
   * @returns {Vinyl}
   */
  get(vinyl) {
    const hash = vinyl.hash;
    const cached = this.caches[vinyl.path];

    // Hit
    if (cached && cached.hash === hash) {
      return cached;
    }

    return null;
  }

  /**
   * @method set
   * @description Set cache
   * @param {Vinyl} vinyl
   * @returns {void}
   */
  set(vinyl) {
    this.caches[vinyl.path] = vinyl;
  }

  /**
   * @method clear
   * @description Clear cache
   * @param {string} path
   */
  clear(path) {
    if (arguments.length) {
      delete this.caches[path];
    } else {
      caches = {};
    }
  }
}

module.exports = Cache;

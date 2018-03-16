/**
 * @module bundler
 * @license MIT
 * @version 2018/03/08
 */

/**
 * @function hash
 * @param {Stat} stat
 * @returns {string}
 */
function hash(stat) {
  const size = stat.size.toString(16);
  const mtime = stat.mtime.getTime().toString(16);

  return `${size}-${mtime}`;
}

/**
 * @class Cache
 */
export default class Cache {
  /**
   * @constructor
   */
  constructor() {
    this.cache = new Map();
  }

  /**
   * @method set
   * @param {Vinyl} vinyl
   * @returns {Cache}
   */
  set(vinyl) {
    const version = hash(vinyl.stat);

    this.cache.set(vinyl.path, { version, vinyl });

    return this;
  }

  /**
   * @method get
   * @param {Vinyl} vinyl
   */
  get(vinyl) {
    const path = vinyl.path;

    if (this.cache.has(path)) {
      const cache = this.cache.get(path);

      if (cache.version === hash(vinyl.stat)) {
        return cache.vinyl;
      }
    }
  }

  /**
   * @method clear
   */
  clear() {
    this.cache.clear();
  }
}

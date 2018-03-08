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
    this.cached = new Map();
  }

  /**
   * @method set
   * @param {Vinyl} vinyl
   * @returns {Cache}
   */
  set(vinyl) {
    const version = hash(vinyl.stat);

    this.cached.set(vinyl.path, { version, vinyl });

    return this;
  }

  /**
   * @method get
   * @param {Vinyl} vinyl
   */
  get(vinyl) {
    const path = vinyl.path;

    if (this.cached.has(path)) {
      const cached = this.cached.get(path);

      if (cached.version === hash(vinyl.stat)) {
        return cached.vinyl;
      }
    }
  }

  /**
   * @method clear
   */
  clear() {
    this.cached.clear();
  }
}

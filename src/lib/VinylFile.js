/**
 * @module VinylFile
 * @license MIT
 * @author nuintun
 */

import Vinyl from 'vinyl';

/**
 * @class VinylFile
 * @extends Vinyl
 */
export default class VinylFile extends Vinyl {
  /**
   * @function wrap
   * @description Wrap an older vinyl version to an newer vinyl version
   * @param {Vinyl} vinyl
   * @returns {Vinyl}
   */
  static wrap(vinyl) {
    return new Vinyl({
      cwd: vinyl.cwd,
      base: vinyl.base,
      path: vinyl.path,
      stat: vinyl.stat,
      contents: vinyl.contents
    });
  }
}

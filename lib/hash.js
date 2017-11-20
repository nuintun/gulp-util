/**
 * @module hash
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

/**
 * @function hash
 * @param {Stat} stat
 * @returns {string}
 */
module.exports = function hash(stat) {
  const size = stat.size.toString(16);
  const mtime = stat.mtime.getTime().toString(16);

  return '"' + size + '-' + mtime + '"';
};

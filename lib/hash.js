/*!
 * hash
 *
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

/**
 * hash
 * @param stat
 * @returns {string}
 */
module.exports = function hash(stat) {
  var size = stat.size.toString(16);
  var mtime = stat.mtime.getTime().toString(16);

  return '"' + size + '-' + mtime + '"';
};

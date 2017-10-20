/*!
 * enmu
 *
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

// concat status
var CONCAT_STATUS = {
  START: 0,
  END: 1,
};

// blank buffer
var BLANK_BUFFER = Buffer.from ? Buffer.from('') : new Buffer('');

// exports
module.exports = {
  BLANK_BUFFER: BLANK_BUFFER,
  CONCAT_STATUS: CONCAT_STATUS
};

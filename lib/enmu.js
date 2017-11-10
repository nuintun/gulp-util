/**
 * @module enmu
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

// concat status
const CONCAT_STATUS = {
  START: 0,
  END: 1,
};

// blank buffer
const BLANK_BUFFER = Buffer.from ? Buffer.from('') : new Buffer('');

// exports
module.exports = {
  BLANK_BUFFER,
  CONCAT_STATUS
};

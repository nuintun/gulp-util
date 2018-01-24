/**
 * @module enmu
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

// Bundle state
const BUNDLE_STATE = {
  START: 0,
  END: 1
};

// Blank buffer
const BLANK_BUFFER = Buffer.from ? Buffer.from('') : new Buffer('');

// Exports
module.exports = {
  BLANK_BUFFER,
  BUNDLE_STATE
};

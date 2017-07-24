/*!
 * rename
 * Version: 0.0.1
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var is = require('./is');
var path = require('path');
var extend = require('./extend');
var colors = require('colors/safe');

/**
 * rename file
 *
 * @param {Vinyl} vinyl
 * @param transform
 * @param debug
 * @returns {string}
 */
module.exports = function(vinyl, transform, debug) {
  transform = is.isFunction(transform) ? transform(vinyl.stem) : transform;

  // rename it when transformer is string as a file name
  if (transform && is.isString(transform)) {
    vinyl.stem = transform;
  } else {
    transform = extend({ prefix: '', suffix: '' }, transform);
    vinyl.stem = transform.prefix + vinyl.stem + vinyl.suffix;
  }

  // debug
  debug('rename to: %p', vinyl.basename);

  return path;
};

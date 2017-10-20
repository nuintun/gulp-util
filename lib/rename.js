/*!
 * rename
 *
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

var dirname = path.dirname;
var basename = path.basename;
var extname = path.extname;

/**
 * parse path
 *
 * @param {String} path
 * @returns {Object}
 */
function parse(path) {
  var ext = extname(path);

  return {
    origin: path,
    extname: ext,
    dirname: dirname(path),
    basename: basename(path, ext)
  }
}

/**
 * format path form meta
 *
 * @param {Object} meta
 * @returns {String}
 */
function format(meta) {
  var extname = meta.extname || '';
  var basename = meta.basename || '';
  var dirname = meta.dirname ? meta.dirname + '/' : '';

  dirname = dirname === '//' || dirname === '\\/' ? '/' : dirname;

  return dirname + basename + extname;
}

/**
 * rename file
 *
 * @param {String} path
 * @param {String|Function|Object} transform
 * @param {Function} debug
 * @returns {String}
 */
module.exports = function(path, transform, debug) {
  transform = is.isFunction(transform) ? transform(path) : transform;

  // rename it when transformer is string as a filepath
  if (transform) {
    if (is.isString(transform)) {
      path = transform.trim() || path;
    } else {
      var meta = parse(path);

      if (is.isString(transform.prefix)) {
        meta.basename = transform.prefix + meta.basename;
      }

      if (is.isString(transform.suffix)) {
        meta.basename += meta.suffix;
      }

      path = format(meta);

      // remove ./
      if (path.charAt(0) === '.' && meta.origin.charAt(0) !== '.') {
        path = path.slice(2);
      }
    }
  }

  // debug
  debug('rename to: %p', basename(path));

  return path;
};

/**
 * @module rename
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const is = require('./is');
const path = require('path');
const extend = require('./extend');

const dirname = path.dirname;
const basename = path.basename;
const extname = path.extname;

/**
 * @function parse
 * @description parse path
 * @param {string} path
 * @returns {Object}
 */
function parse(path) {
  const ext = extname(path);

  return {
    origin: path,
    extname: ext,
    dirname: dirname(path),
    basename: basename(path, ext)
  }
}

/**
 * @function format
 * @description format path form meta
 * @param {Object} meta
 * @returns {string}
 */
function format(meta) {
  const extname = meta.extname || '';
  const basename = meta.basename || '';
  let dirname = meta.dirname ? meta.dirname + '/' : '';

  dirname = dirname === '//' || dirname === '\\/' ? '/' : dirname;

  return dirname + basename + extname;
}

/**
 * @function rename
 * @description rename file
 * @param {string} path
 * @param {string|Function|Object} transform
 * @param {Function} debug
 * @returns {string}
 */
module.exports = function(path, transform, debug) {
  transform = is.isFunction(transform) ? transform(path) : transform;

  // rename it when transformer is string as a filepath
  if (transform) {
    if (is.isString(transform)) {
      path = transform.trim() || path;
    } else {
      const meta = parse(path);

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

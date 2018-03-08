/**
 * @module utils
 * @license MIT
 * @version 2017/11/10
 */

import chalk from 'chalk';
import * as is from './is';
import * as util from 'util';
import { join, relative } from 'path';

const cwd = process.cwd();

/**
 * @function slice
 * @description Faster slice arguments
 * @param {Array|arguments} args
 * @param {number} start
 * @returns {Array}
 * @see https://github.com/teambition/then.js
 */
export function slice(args, start) {
  start = start >>> 0;

  const length = args.length;

  if (start >= length) {
    return [];
  }

  const rest = new Array(length - start);

  while (length-- > start) {
    rest[length - start] = args[length];
  }

  return rest;
}

const OUTBOUND_RE = /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/;

/**
 * @function parseId
 * @description Parse id form vinyl
 * @param {Vinyl} vinyl
 * @param {Object} wwwroot
 * @param {Object} base
 * @returns {string}
 */
export function parseId(vinyl, wwwroot, base) {
  let path = relative(base, vinyl.path);

  // Vinyl not in base dir, user wwwroot
  if (OUTBOUND_RE.test(path)) {
    path = relative(wwwroot, vinyl.path);

    // Vinyl not in wwwroot, throw error
    if (OUTBOUND_RE.test(path)) {
      throwError('file %s is out of bound of wwwroot %s.', normalize(vinyl.path), normalize(wwwroot));
    }

    // Reset path
    path = join('/', path);
  }

  return normalize(path);
}

const WINDOWS_PATH_RE = /\\/g;
const SCHEME_SLASH_RE = /(:)?\/{2,}/;
const DOT_RE = /\/\.\//g;
const MULTI_SLASH_RE = /([^:])\/{2,}/g;
// DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
const DOUBLE_DOT_RE = /([^/]+)\/\.\.(?:\/|$)/g;
const XSS_RE = /^\/(\.\.\/)+/;

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
export function normalize(path) {
  // \a\b\.\c\.\d ==> /a/b/./c/./d
  path = path.replace(WINDOWS_PATH_RE, '/');

  // :///a/b/c ==> ://a/b/c
  path = path.replace(SCHEME_SLASH_RE, '$1//');

  // /a/b/./c/./d ==> /a/b/c/d
  path = path.replace(DOT_RE, '/');

  // @author wh1100717
  // a//b/c ==> a/b/c
  // ///a/b/c ==> //a/b/c
  // a///b/////c ==> a/b/c
  path = path.replace(MULTI_SLASH_RE, '$1/');

  // Transfer path
  let src = path;

  // a/b/c/../../d ==> a/b/../d ==> a/d
  do {
    src = src.replace(DOUBLE_DOT_RE, (matched, dirname) => {
      return dirname === '..' ? matched : '';
    });

    // Break
    if (path === src) {
      break;
    } else {
      path = src;
    }
  } while (true);

  // /../../../a ==> /a
  path = path.replace(XSS_RE, '/');

  // Get path
  return path;
}

const RELATIVE_RE = /^\.{1,2}[\\/]/;

/**
 * @function isRelative
 * @description Test path is relative path or not
 * @param {string} path
 * @returns {boolean}
 */
export function isRelative(path) {
  return RELATIVE_RE.test(path);
}

const ABSOLUTE_RE = /^[\\/](?:[^\\/]|$)/;

/**
 * @function isAbsolute
 * @description Test path is absolute path or not
 * @param {string} path
 * @returns {boolean}
 */
export function isAbsolute(path) {
  return ABSOLUTE_RE.test(path);
}

const NONLOCAL_RE = /^(?:[a-z0-9.+-]+:)?\/\/|^data:\w+?\/\w+?[,;]/i;

/**
 * @function isLocal
 * @description Test path is local path or not
 * @param {string} path
 * @returns {boolean}
 */
export function isLocal(path) {
  return !NONLOCAL_RE.test(path);
}

/**
 * @function isOutBound
 * @description Test path is out of bound of base
 * @param {string} path
 * @param {string} base
 * @returns {boolean}
 */
export function isOutBound(path, base) {
  return OUTBOUND_RE.test(relative(base, path));
}

/**
 * @function pathFromCwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
export function pathFromCwd(path) {
  return normalize(relative(cwd, path)) || './';
}

/**
 * @function throwError
 * @description Plugin error
 * @returns {void}
 */
export function throwError() {
  const message = apply(util.format, null, slice(arguments));

  throw new Error(message);
}

/**
 * @function parseMap
 * @description Parse map
 * @param {string} id
 * @param {Function} map
 * @param {string} base
 * @param {string} wwwroot
 * @returns {string}
 */
export function parseMap(id, map, base, wwwroot) {
  let src;

  // Calm map function
  if (is.isFunction(map)) {
    src = map(id, base, wwwroot);
  }

  // Must be string
  if (!src || !is.isString(src)) {
    return id;
  }

  return src;
}

/**
 * @function readonly
 * @description Define a readonly property
 * @param {Object} object
 * @param {string} prop
 * @param {any} value
 * @returns {void}
 */
export function readonly(object, prop, value) {
  const configure = {
    __proto__: null,
    writable: false,
    enumerable: true,
    configurable: false
  };

  // Set value
  if (arguments.length >= 3) {
    configure.value = value;
  }

  // Define property
  Object.defineProperty(object, prop, configure);
}

/**
 * @function apply
 * @description Faster apply, call is faster than apply, optimize less than 6 args
 * @param  {Function} fn
 * @param  {any} context
 * @param  {Array} args
 * @returns {void}
 * https://github.com/micro-js/apply
 * http://blog.csdn.net/zhengyinhui100/article/details/7837127
 */
export function apply(fn, context, args) {
  switch (args.length) {
    // Faster
    case 0:
      return fn.call(context);
    case 1:
      return fn.call(context, args[0]);
    case 2:
      return fn.call(context, args[0], args[1]);
    case 3:
      return fn.call(context, args[0], args[1], args[2]);
    default:
      // Slower
      return fn.apply(context, args);
  }
}

const ERROR_FORMAT_RE = /^\{\s*|\}\s*$/g;

/**
 * @function inspectError
 * @description Inspect error
 * @param {Error} error
 * @returns {string}
 */
export function inspectError(error) {
  return util.inspect(error).replace(ERROR_FORMAT_RE, '');
}

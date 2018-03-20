/**
 * @module utils
 * @license MIT
 * @version 2017/11/10
 */

import Vinyl from 'vinyl';
import chalk from 'chalk';
import * as is from './is';
import { join, relative } from 'path';

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

const DOT_RE = /\/\.\//g;
const XSS_RE = /^\/(\.\.\/)+/;
const WINDOWS_SEPARATOR_RE = /\\/g;
const SCHEME_SLASH_RE = /(:)?\/{2,}/;
const MULTI_SLASH_RE = /([^:])\/{2,}/g;
// DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
const DOUBLE_DOT_RE = /([^/]+)\/\.\.(?:\/|$)/g;

/**
 * @function unixify
 * @description Convert path separators to posix/unix-style forward slashes.
 * @param {string} path
 * @returns {string}
 */
export function unixify(path) {
  return path.replace(WINDOWS_SEPARATOR_RE, '/');
}

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
export function normalize(path) {
  // \a\b\.\c\.\d ==> /a/b/./c/./d
  path = unixify(path);

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

const OUTBOUND_RE = /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/;

/**
 * @function isOutBounds
 * @description Test path is out of bounds of root
 * @param {string} path
 * @param {string} root
 * @returns {boolean}
 */
export function isOutBounds(path, root) {
  return OUTBOUND_RE.test(relative(root, path));
}

/**
 * @function moduleId
 * @description Parse module id form vinyl
 * @param {Vinyl} vinyl
 * @param {Object} base
 * @returns {string}
 */
export function moduleId(vinyl, base) {
  const src = vinyl.path;
  const path = relative(base, src);

  // Vinyl not in base dir, user root
  if (OUTBOUND_RE.test(path)) {
    throw new RangeError(`Module ${normalize(src)} is out of bounds of base.`);
  }

  return normalize(path);
}

const cwd = process.cwd();

/**
 * @function path2cwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
export function path2cwd(path) {
  return normalize(relative(cwd, path)) || './';
}

/**
 * @function parseMap
 * @description Parse map
 * @param {string} id
 * @param {string} resolved
 * @param {Function} map
 * @returns {string}
 */
export function parseMap(id, resolved, map) {
  let src;

  // Calm map function
  if (is.isFunction(map)) {
    src = map(id, resolved);
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

/**
 *
 * @param {Vinyl} vinyl
 * @param {Iterable} plugins
 * @param {string} hook
 * @returns {Vinyl}
 */
export async function pipeline(vinyl, plugins, hook) {
  for (let plugin in plugins) {
    const returned = await plugin[hook](vinyl);

    if (Vinyl.isVinyl(returned)) {
      throw new TypeError(`The hook '${hook}' in plugin '${plugin.name}' must be returned a vinyl file.`);
    }

    vinyl = returned;
  }

  return vinyl;
}

/**
 * @function buffer
 * @param {string} string
 * @returns {Buffer}
 */
export function buffer(string) {
  return Buffer.from ? Buffer.from(string) : new Buffer(string);
}

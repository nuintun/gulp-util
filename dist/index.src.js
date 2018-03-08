/**
 * @module @nuintun/gulp-util
 * @author nuintun
 * @license MIT
 * @version 0.1.0
 * @description Utilities for gulp-cmd and gulp-css.
 * @see https://github.com/nuintun/gulp-util
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var chalk = require('chalk');
var util = require('util');
var path = require('path');
var debug = require('debug');
var timestamp = require('time-stamp');

/**
 * @module is
 * @license MIT
 * @version 2017/11/10
 */

const EXTRACT_TYPE_RE = /\[object (.+)\]/i;
const toString = Object.prototype.toString;
const getPrototypeOf = Object.getPrototypeOf;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const fnToString = hasOwnProperty.toString;
const objectFunctionString = fnToString.call(Object);

/**
 * @function typeOf
 * @param {any} value
 * @returns {string}
 */
function typeOf(value) {
  // Get real type
  let type = toString.call(value);

  type = type.replace(EXTRACT_TYPE_RE, '$1').toLowerCase();

  // Is nan and infinity
  if (type === 'number') {
    // Is nan
    if (value !== value) {
      return 'nan';
    }

    // Is infinity
    if (value === Infinity || value === -Infinity) {
      return 'infinity';
    }
  }

  // Return type
  return type;
}

/**
 * @function isFunction
 * @description Is function
 * @param {any} value
 * @returns {boolean}
 */
function isFunction(value) {
  return typeof value === 'function';
}

/**
 * @function isPlainObject
 * @description Is plain object
 * @param {any} value
 * @returns {boolean}
 */
function isPlainObject(value) {
  let proto, ctor;

  // Detect obvious negatives
  if (!value || typeOf(value) !== 'object') {
    return false;
  }

  // Proto
  proto = getPrototypeOf(value);

  // Objects with no prototype (e.g., `Object.create( null )`) are plain
  if (!proto) {
    return true;
  }

  // Objects with prototype are plain iff they were constructed by a global Object function
  ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;

  return typeof ctor === 'function' && fnToString.call(ctor) === objectFunctionString;
}

/**
 * @function isString
 * @description Is string
 * @param {any} value
 * @returns {boolean}
 */
function isString(value) {
  return typeOf(value) === 'string';
}

/**
 * @module utils
 * @license MIT
 * @version 2017/11/10
 */

const cwd = process.cwd();

/**
 * @function slice
 * @description Faster slice arguments
 * @param {Array|arguments} args
 * @param {number} start
 * @returns {Array}
 * @see https://github.com/teambition/then.js
 */
function slice(args, start) {
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
function parseId(vinyl, wwwroot, base) {
  let path$$1 = path.relative(base, vinyl.path);

  // Vinyl not in base dir, user wwwroot
  if (OUTBOUND_RE.test(path$$1)) {
    path$$1 = path.relative(wwwroot, vinyl.path);

    // Vinyl not in wwwroot, throw error
    if (OUTBOUND_RE.test(path$$1)) {
      throwError('file %s is out of bound of wwwroot %s.', normalize(vinyl.path), normalize(wwwroot));
    }

    // Reset path
    path$$1 = path.join('/', path$$1);
  }

  return normalize(path$$1);
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
function normalize(path$$1) {
  // \a\b\.\c\.\d ==> /a/b/./c/./d
  path$$1 = path$$1.replace(WINDOWS_PATH_RE, '/');

  // :///a/b/c ==> ://a/b/c
  path$$1 = path$$1.replace(SCHEME_SLASH_RE, '$1//');

  // /a/b/./c/./d ==> /a/b/c/d
  path$$1 = path$$1.replace(DOT_RE, '/');

  // @author wh1100717
  // a//b/c ==> a/b/c
  // ///a/b/c ==> //a/b/c
  // a///b/////c ==> a/b/c
  path$$1 = path$$1.replace(MULTI_SLASH_RE, '$1/');

  // Transfer path
  let src = path$$1;

  // a/b/c/../../d ==> a/b/../d ==> a/d
  do {
    src = src.replace(DOUBLE_DOT_RE, (matched, dirname) => {
      return dirname === '..' ? matched : '';
    });

    // Break
    if (path$$1 === src) {
      break;
    } else {
      path$$1 = src;
    }
  } while (true);

  // /../../../a ==> /a
  path$$1 = path$$1.replace(XSS_RE, '/');

  // Get path
  return path$$1;
}

const RELATIVE_RE = /^\.{1,2}[\\/]/;

/**
 * @function isRelative
 * @description Test path is relative path or not
 * @param {string} path
 * @returns {boolean}
 */
function isRelative(path$$1) {
  return RELATIVE_RE.test(path$$1);
}

const ABSOLUTE_RE = /^[\\/](?:[^\\/]|$)/;

/**
 * @function isAbsolute
 * @description Test path is absolute path or not
 * @param {string} path
 * @returns {boolean}
 */
function isAbsolute(path$$1) {
  return ABSOLUTE_RE.test(path$$1);
}

const NONLOCAL_RE = /^(?:[a-z0-9.+-]+:)?\/\/|^data:\w+?\/\w+?[,;]/i;

/**
 * @function isLocal
 * @description Test path is local path or not
 * @param {string} path
 * @returns {boolean}
 */
function isLocal(path$$1) {
  return !NONLOCAL_RE.test(path$$1);
}

/**
 * @function isOutBound
 * @description Test path is out of bound of base
 * @param {string} path
 * @param {string} base
 * @returns {boolean}
 */
function isOutBound(path$$1, base) {
  return OUTBOUND_RE.test(path.relative(base, path$$1));
}

/**
 * @function pathFromCwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
function pathFromCwd(path$$1) {
  return normalize(path.relative(cwd, path$$1)) || './';
}

/**
 * @function throwError
 * @description Plugin error
 * @returns {void}
 */
function throwError() {
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
function parseMap(id, map, base, wwwroot) {
  let src;

  // Calm map function
  if (isFunction(map)) {
    src = map(id, base, wwwroot);
  }

  // Must be string
  if (!src || !isString(src)) {
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
function readonly(object, prop, value) {
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
function apply(fn, context, args) {
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
function inspectError(error) {
  return util.inspect(error).replace(ERROR_FORMAT_RE, '');
}

/**
 * @module hash
 * @license MIT
 * @version 2017/11/10
 */

/**
 * @function hash
 * @param {Stat} stat
 * @returns {string}
 */
function hash(stat) {
  const size = stat.size.toString(16);
  const mtime = stat.mtime.getTime().toString(16);

  return `${size}-${mtime}`;
}

/**
 * @module debug
 * @license MIT
 * @version 2018/03/08
 */

// File path relative cwd
debug.formatters.r = function(value) {
  return chalk.reset.magenta(pathFromCwd(value));
};

// File path
debug.formatters.p = function(value) {
  return chalk.reset.magenta(value);
};

// Normalized file path
debug.formatters.P = function(value) {
  return chalk.reset.magenta(normalize(value));
};

function debug$1(namespace) {
  const logger = debug(namespace);

  // Set debug color use 6
  logger.color = 6;

  return logger;
}

/**
 * @module logger
 * @license MIT
 * @version 2018/03/07
 */

/**
 * @function getTimestamp
 * @returns {string}
 */
function getTimestamp() {
  return `[${chalk.reset.gray(timestamp('HH:mm:ss'))}]`;
}

/**
 * @function log
 */
function log() {
  const time = getTimestamp();

  process.stdout.write(`${time} `);
  apply(console.log, console, arguments);

  return this;
}

/**
 * @module extend
 * @license MIT
 * @version 2017/11/10
 */

// Undefined
const undef = void 0;

/**
 * @function extend
 * @returns {Object}
 */
function extend() {
  let i = 1;
  let deep = false;
  const length = arguments.length;
  let target = arguments[0] || {};
  let options, name, src, copy, copyIsArray, clone;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    // Skip the boolean and the target
    target = arguments[i++] || {};
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {};
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        // Only copy own property
        if (!options.hasOwnProperty(name)) {
          continue;
        }

        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && Array.isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);
        } else if (copy !== undef) {
          // Don't bring in undefined values
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
}

/**
 * @module index
 * @license MIT
 * @version 2017/11/10
 */

exports.hash = hash;
exports.debug = debug$1;
exports.logger = log;
exports.extend = extend;
exports.typeOf = typeOf;
exports.isFunction = isFunction;
exports.isPlainObject = isPlainObject;
exports.isString = isString;
exports.slice = slice;
exports.parseId = parseId;
exports.normalize = normalize;
exports.isRelative = isRelative;
exports.isAbsolute = isAbsolute;
exports.isLocal = isLocal;
exports.isOutBound = isOutBound;
exports.pathFromCwd = pathFromCwd;
exports.throwError = throwError;
exports.parseMap = parseMap;
exports.readonly = readonly;
exports.apply = apply;
exports.inspectError = inspectError;

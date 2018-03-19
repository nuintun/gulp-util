/**
 * @module @nuintun/gulp-util
 * @author nuintun
 * @license MIT
 * @version 0.1.0
 * @description Utilities for gulp-cmd and gulp-css.
 * @see https://github.com/nuintun/gulp-util
 */

'use strict';

const Vinyl = require('vinyl');
const chalk = require('chalk');
const path = require('path');
const crypto = require('crypto');
const debug = require('debug');
const timestamp = require('time-stamp');

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
function unixify(path$$1) {
  return path$$1.replace(WINDOWS_SEPARATOR_RE, '/');
}

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
function normalize(path$$1) {
  // \a\b\.\c\.\d ==> /a/b/./c/./d
  path$$1 = unixify(path$$1);

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

const OUTBOUND_RE = /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/;

/**
 * @function isOutBounds
 * @description Test path is out of bounds of root
 * @param {string} path
 * @param {string} root
 * @returns {boolean}
 */
function isOutBounds(path$$1, root) {
  return OUTBOUND_RE.test(path.relative(root, path$$1));
}

/**
 * @function moduleId
 * @description Parse module id form vinyl
 * @param {Vinyl} vinyl
 * @param {Object} root
 * @param {Object} base
 * @returns {string}
 */
function moduleId(vinyl, root, base) {
  let path$$1 = path.relative(base, vinyl.path);

  // Vinyl not in base dir, user root
  if (OUTBOUND_RE.test(path$$1)) {
    path$$1 = path.relative(root, vinyl.path);

    // Vinyl not in root, throw error
    if (OUTBOUND_RE.test(path$$1)) {
      throw new RangeError(`File ${normalize(vinyl.path)} is out of bounds of root.`);
    }

    // Add /
    path$$1 = path.join('/', path$$1);
  }

  return normalize(path$$1);
}

const cwd = process.cwd();

/**
 * @function path2cwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
function path2cwd(path$$1) {
  return normalize(path.relative(cwd, path$$1)) || './';
}

/**
 * @function parseMap
 * @description Parse map
 * @param {string} id
 * @param {string} referer
 * @param {Function} map
 * @returns {string}
 */
function parseMap(id, referer, map) {
  let src;

  // Calm map function
  if (isFunction(map)) {
    src = map(id, referer);
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

/**
 *
 * @param {Vinyl} vinyl
 * @param {Iterable} plugins
 * @param {string} hook
 * @returns {Vinyl}
 */
async function pipeline(vinyl, plugins, hook) {
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
function buffer(string) {
  return Buffer.from ? Buffer.from(string) : new Buffer(string);
}

/**
 * @module md5
 * @license MIT
 * @version 2018/03/16
 */

function md5(string) {
  return crypto
    .createHash('md5')
    .update(string)
    .digest('hex');
}

/**
 * @module debug
 * @license MIT
 * @version 2018/03/08
 */

// File path relative cwd
debug.formatters.C = function(value) {
  return chalk.reset.magenta(path2cwd(value));
};

// File path
debug.formatters.f = function(value) {
  return chalk.reset.magenta(value);
};

// Normalized file path
debug.formatters.F = function(value) {
  return chalk.reset.magenta(normalize(value));
};

function debugging(namespace) {
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
 * @function info
 */
function info() {
  const time = getTimestamp();

  process.stdout.write(`${time} `);
  apply(console.info, console, arguments);

  return this;
}

/**
 * @function dir
 */
function dir() {
  const time = getTimestamp();

  process.stdout.write(`${time} `);
  apply(console.dir, console, arguments);

  return this;
}

/**
 * @function warn
 */
function warn() {
  const time = getTimestamp();

  process.stderr.write(`${time} `);
  apply(console.warn, console, arguments);

  return this;
}

/**
 * @function error
 */
function error() {
  const time = getTimestamp();

  process.stderr.write(`${time} `);
  apply(console.error, console, arguments);

  return this;
}

log.info = info;
log.dir = dir;
log.warn = warn;
log.error = error;

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
 * @module promisify
 * @license MIT
 * @version 2018/03/16
 */

/**
 * @function promisify
 * @param {Function} fn
 * @returns {Promise}
 */
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, ...args) => {
        if (error) return reject(error);

        if (args.length === 1) return resolve(args[0]);

        resolve(args);
      });
    });
  };
}

/**
 * @module vinyl-file
 * @license MIT
 * @version 2018/03/16
 */

/**
 * @class VinylFile
 * @extends Vinyl
 */
class VinylFile extends Vinyl {
  /**
   * @function wrap
   * @description Wrap an older vinyl version to an newer vinyl version
   * @param {Vinyl} vinyl
   * @returns {Vinyl}
   */
  static wrap(vinyl) {
    return new Vinyl({
      cwd: vinyl.cwd,
      base: vinyl.base,
      path: vinyl.path,
      stat: vinyl.stat,
      contents: vinyl.contents
    });
  }
}

/**
 * @module index
 * @license MIT
 * @version 2017/11/10
 */

exports.md5 = md5;
exports.debug = debugging;
exports.logger = log;
exports.extend = extend;
exports.promisify = promisify;
exports.VinylFile = VinylFile;
exports.typeOf = typeOf;
exports.isFunction = isFunction;
exports.isPlainObject = isPlainObject;
exports.isString = isString;
exports.slice = slice;
exports.unixify = unixify;
exports.normalize = normalize;
exports.isRelative = isRelative;
exports.isAbsolute = isAbsolute;
exports.isLocal = isLocal;
exports.isOutBounds = isOutBounds;
exports.moduleId = moduleId;
exports.path2cwd = path2cwd;
exports.parseMap = parseMap;
exports.readonly = readonly;
exports.apply = apply;
exports.pipeline = pipeline;
exports.buffer = buffer;

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
const inspectAttrs = require('inspect-attrs');
const path = require('path');
const timestamp = require('time-stamp');

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

const cwd = process.cwd();

/**
 * @function path2cwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
function path2cwd(path$$1) {
  return normalize(path.relative(cwd, path$$1)) || '.';
}

/**
 * @function parseMap
 * @description Parse map
 * @param {string} id
 * @param {string} resolved
 * @param {Function} map
 * @returns {string}
 */
function parseMap(id, resolved, map) {
  let src;

  // Calm map function
  if (inspectAttrs.typpy(map, Function)) {
    src = map(id, resolved);
  }

  // Must be string
  if (!src || !inspectAttrs.typpy(src, String)) {
    return id;
  }

  return src;
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
 * @function pipeline
 * @param {Iterable} plugins
 * @param {string} hook
 * @param {string} path
 * @param {Buffer} contents
 * @param {Object} options
 * @returns {Buffer}
 */
async function pipeline(plugins, hook, path$$1, contents, options) {
  for (let plugin of plugins) {
    const actuator = plugin[hook];

    // If actuator exist
    if (actuator) {
      const buffer = await actuator(path$$1, contents, options);

      // Valid returned
      if (!Buffer.isBuffer(buffer)) {
        throw new TypeError(`The hook '${hook}' in plugin '${plugin.name}' must be returned a buffer.`);
      }

      // Override vinyl
      contents = buffer;
    }
  }

  return contents;
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
 * @module logger
 * @license MIT
 * @version 2018/03/07
 */

/**
 * @function getTimestamp
 * @returns {string}
 */
function getTimestamp() {
  return `[${chalk.gray(timestamp('HH:mm:ss'))}]`;
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

// Get typpy
const { typpy } = inspectAttrs;

exports.chalk = chalk;
exports.inspectAttrs = inspectAttrs;
exports.typpy = typpy;
exports.logger = log;
exports.promisify = promisify;
exports.VinylFile = VinylFile;
exports.slice = slice;
exports.unixify = unixify;
exports.normalize = normalize;
exports.isRelative = isRelative;
exports.isAbsolute = isAbsolute;
exports.isLocal = isLocal;
exports.isOutBounds = isOutBounds;
exports.path2cwd = path2cwd;
exports.parseMap = parseMap;
exports.apply = apply;
exports.pipeline = pipeline;
exports.buffer = buffer;

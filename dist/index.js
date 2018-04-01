/**
 * @module @nuintun/gulp-util
 * @author nuintun
 * @license MIT
 * @version 0.2.0
 * @description Utilities for gulp-cmd and gulp-css.
 * @see https://github.com/nuintun/gulp-util#readme
 */

'use strict';

const Vinyl = require('vinyl');
const chalk = require('chalk');
const inspectAttrs = require('inspect-attrs');
const fs = require('fs');
const path = require('path');
const timestamp = require('time-stamp');
const isUrl = require('is-url');

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
 * @module utils
 * @license MIT
 * @version 2017/11/10
 */

/**
 * @function unixify
 * @description Convert path separators to posix/unix-style forward slashes.
 * @param {string} path
 * @returns {string}
 */
function unixify(path$$1) {
  return path$$1.replace(/\\/g, '/');
}

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
function normalize(path$$1) {
  const dot = /^\.[\\/]/.test(path$$1);

  // Normalize path
  path$$1 = unixify(path.normalize(path$$1));

  // Get path
  return dot && !path$$1.startsWith('../') ? `./${path$$1}` : path$$1;
}

/**
 * @function isRelative
 * @description Test path is relative path or not
 * @param {string} path
 * @returns {boolean}
 */
function isRelative(path$$1) {
  return /^\.{1,2}[\\/]/.test(path$$1);
}

/**
 * @function isAbsolute
 * @description Test path is absolute path or not
 * @param {string} path
 * @returns {boolean}
 */
function isAbsolute(path$$1) {
  return /^[\\/](?:[^\\/]|$)/.test(path$$1);
}

/**
 * @function isOutBounds
 * @description Test path is out of bounds of root
 * @param {string} path
 * @param {string} root
 * @returns {boolean}
 */
function isOutBounds(path$$1, root) {
  return /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/.test(path.relative(root, path$$1));
}

const cwd = process.cwd();

/**
 * @function path2cwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
function path2cwd(path$$1) {
  return unixify(path.relative(cwd, path$$1)) || '.';
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
  let mapped = id;

  // Calm map function
  if (inspectAttrs.typpy(map, Function)) {
    mapped = map(id, resolved);

    // Must be string
    if (!inspectAttrs.typpy(mapped, String)) mapped = id;
  }

  return mapped;
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
 * @param {string} contents
 * @param {Object} options
 * @returns {string}
 */
async function pipeline(plugins, hook, path$$1, contents, options) {
  for (let plugin of plugins) {
    const actuator = plugin[hook];

    // If actuator exist
    if (actuator) {
      const code = await actuator(path$$1, contents, options);

      // Valid returned
      if (!inspectAttrs.typpy(code, String)) {
        const name = inspectAttrs.typpy(plugin.name, String) ? plugin.name : 'anonymous';

        throw new TypeError(`The hook '${hook}' in plugin '${name}' must be returned a string.`);
      }

      // Override contents
      contents = code;
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
 * @function combine
 * @param {Set} bundles
 * @returns {Buffer}
 */
function combine(bundles) {
  const contents = [];

  // Traverse bundles
  bundles.forEach(bundle => contents.push(bundle.contents));

  // Concat contents
  return Buffer.concat(contents);
}

// Promisify stat and readFile
const fsReadStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

/**
 * @function fsSafeAccess
 * @param {string} path
 * @param {Number} mode
 * @returns {boolean}
 */
function fsSafeAccess(path$$1, mode = fs.constants.R_OK) {
  try {
    fs.accessSync(path$$1, mode);
  } catch (error) {
    return false;
  }

  return true;
}

/**
 * @function fetchModule
 * @param {string} path
 * @param {Object} options
 * @returns {Vinyl}
 */
async function fetchModule(path$$1, options) {
  // Read module
  const base = options.base;
  const stat = await fsReadStat(path$$1);
  const contents = await fsReadFile(path$$1);

  // Return a vinyl file
  return new VinylFile({ base, path: path$$1, stat, contents });
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
 * @module index
 * @license MIT
 * @version 2017/11/10
 */

// Get typpy
const { typpy } = inspectAttrs;

exports.chalk = chalk;
exports.inspectAttrs = inspectAttrs;
exports.isUrl = isUrl;
exports.typpy = typpy;
exports.logger = log;
exports.promisify = promisify;
exports.VinylFile = VinylFile;
exports.unixify = unixify;
exports.normalize = normalize;
exports.isRelative = isRelative;
exports.isAbsolute = isAbsolute;
exports.isOutBounds = isOutBounds;
exports.path2cwd = path2cwd;
exports.parseMap = parseMap;
exports.apply = apply;
exports.pipeline = pipeline;
exports.buffer = buffer;
exports.combine = combine;
exports.fsReadStat = fsReadStat;
exports.fsReadFile = fsReadFile;
exports.fsSafeAccess = fsSafeAccess;
exports.fetchModule = fetchModule;

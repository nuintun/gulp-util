/**
 * @module @nuintun/gulp-util
 * @author nuintun
 * @license MIT
 * @version 2.0.1
 * @description Utilities for gulp-cmd and gulp-css.
 * @see https://github.com/nuintun/gulp-util#readme
 */

'use strict';

const Vinyl = require('vinyl');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const isUrl = require('is-url');
const timestamp = require('time-stamp');
const Ajv = require('ajv');
const errors = require('ajv-errors');
const keywords = require('ajv-keywords');

/**
 * @module typpy
 * @license MIT
 * @author nuintun
 * @see https://github.com/IonicaBizau/typpy
 */

/**
 * @function typpy
 * @description Gets the type of the input value or compares it with a provided type
 * @param {Anything} input The input value
 * @param {Constructor|String} target The target type
 * @returns {String|Boolean}
 */
function typpy(input, target) {
  // If only one arguments, return string type
  if (arguments.length === 1) return typpy.typeof(input, false);

  // If input is NaN, use special check
  if (input !== input) return target !== target || target === 'nan';

  // Other
  return typpy.typeof(input, typpy.typeof(target, true) !== String) === target;
}

/**
 * @function typeof
 * @description Gets the type of the input value. This is used internally
 * @param {Anything} input The input value
 * @param {Boolean} ctor A flag to indicate if the return value should be a string or not
 * @returns {Constructor|String}
 */
typpy.typeof = function (input, ctor) {
  // NaN
  if (input !== input) return ctor ? NaN : 'nan';
  // Null
  if (null === input) return ctor ? null : 'null';
  // Undefined
  if (undefined === input) return ctor ? undefined : 'undefined';

  // Other
  return ctor ? input.constructor : input.constructor.name.toLowerCase();
};

/**
 * @module promisify
 * @license MIT
 * @author nuintun
 */

/**
 * @function promisify
 * @param {Function} fn
 * @returns {Promise}
 */
function promisify(fn) {
  return function (...args) {
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
 * @module VinylFile
 * @license MIT
 * @author nuintun
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
 * @author nuintun
 */

/**
 * @function unixify
 * @description Convert path separators to posix/unix-style forward slashes.
 * @param {string} path
 * @returns {string}
 */
function unixify(path) {
  return path.replace(/\\/g, '/');
}

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
function normalize(path$1) {
  const dot = /^\.[\\/]/.test(path$1);

  // Normalize path
  path$1 = unixify(path.normalize(path$1));

  // Get path
  return dot && !path$1.startsWith('../') ? `./${path$1}` : path$1;
}

/**
 * @function isRelative
 * @description Test path is relative path or not
 * @param {string} path
 * @returns {boolean}
 */
function isRelative(path) {
  return /^\.{1,2}[\\/]/.test(path);
}

/**
 * @function isAbsolute
 * @description Test path is absolute path or not
 * @param {string} path
 * @returns {boolean}
 */
function isAbsolute(path) {
  return /^[\\/](?:[^\\/]|$)/.test(path);
}

/**
 * @function isOutBounds
 * @description Test path is out of bounds of root
 * @param {string} path
 * @param {string} root
 * @returns {boolean}
 */
function isOutBounds(path$1, root) {
  return /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/.test(path.relative(root, path$1));
}

const cwd = process.cwd();

/**
 * @function path2cwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
function path2cwd(path$1) {
  return unixify(path.relative(cwd, path$1)) || '.';
}

/**
 * @function parseMap
 * @description Parse map
 * @param {string} id
 * @param {string} resolved
 * @param {Function} map
 * @param {...any} rest
 * @returns {string}
 */
function parseMap(id, resolved, map, ...rest) {
  let mapped = id;

  // Calm map function
  if (typpy(map, Function)) {
    mapped = map(id, resolved, ...rest);

    // Must be string
    if (!typpy(mapped, String)) mapped = id;
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
async function pipeline(plugins, hook, path, contents, options) {
  for (let plugin of plugins) {
    const actuator = plugin[hook];

    // If actuator exist
    if (actuator) {
      const code = await actuator(path, contents, options);

      // Valid returned
      if (!typpy(code, String)) {
        const name = typpy(plugin.name, String) ? plugin.name : 'anonymous';

        throw new TypeError(`The hook '${hook}' in plugin '${name}' must be returned a string.`);
      }

      // Override contents
      contents = code;
    }
  }

  return contents;
}

/**
 * @function combine
 * @param {Set|Array} bundles
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
function fsSafeAccess(path, mode = fs.constants.R_OK) {
  try {
    fs.accessSync(path, mode);
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
async function fetchModule(path, options) {
  // Read module
  const base = options.base;
  const stat = await fsReadStat(path);
  const contents = await fsReadFile(path);

  // Return a vinyl file
  return new VinylFile({ base, path, stat, contents });
}

/**
 * @module logger
 * @license MIT
 * @author nuintun
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

const logger = { log, info, dir, warn, error };

/**
 * @module ValidationError
 * @license MIT
 * @author nuintun
 */

/**
 * @class ValidationError
 * @extends Error
 */
class ValidationError extends Error {
  /**
   * @constructor
   * @param {Array} errors
   * @param {string} name
   */
  constructor(errors, name) {
    super();

    this.name = 'ValidationError';

    this.message = `${name || ''}\n\n`;

    this.errors = errors.map(error => {
      let dataPath = error.dataPath.replace(/^\//, '').replace(/\//g, '.');

      switch (error.keyword) {
        case 'required':
          const required = error.params.missingProperty;

          dataPath = dataPath ? `${dataPath}.${required}` : required;

          this.message += `Missing options: ${dataPath}\n`;
          break;
        case 'additionalProperties':
          const unknown = error.params.additionalProperty;

          dataPath = dataPath ? `${dataPath}.${unknown}` : unknown;

          this.message += `Unknown options: ${dataPath}\n`;
          break;
        default:
          this.message += `Invalid options: ${dataPath} ${error.message}\n`;
      }

      return error;
    });

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @module index
 * @license MIT
 * @author nuintun
 */

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  jsonPointers: true
});

keywords(ajv, ['instanceof', 'typeof']);
errors(ajv);

/**
 * @function validateOptions
 * @param {Object} schema
 * @param {Object} options
 * @param {string} name
 * @returns {boolean}
 */
function validateOptions(schema, options, name) {
  if (!ajv.validate(schema, options)) {
    throw new ValidationError(ajv.errors, name);
  }

  return true;
}

exports.chalk = chalk;
exports.isUrl = isUrl;
exports.VinylFile = VinylFile;
exports.apply = apply;
exports.combine = combine;
exports.fetchModule = fetchModule;
exports.fsReadFile = fsReadFile;
exports.fsReadStat = fsReadStat;
exports.fsSafeAccess = fsSafeAccess;
exports.isAbsolute = isAbsolute;
exports.isOutBounds = isOutBounds;
exports.isRelative = isRelative;
exports.logger = logger;
exports.normalize = normalize;
exports.parseMap = parseMap;
exports.path2cwd = path2cwd;
exports.pipeline = pipeline;
exports.promisify = promisify;
exports.typpy = typpy;
exports.unixify = unixify;
exports.validateOptions = validateOptions;

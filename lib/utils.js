/**
 * @module utils
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const fs = require('fs');
const is = require('./is');
const path = require('path');
const util = require('util');
const enmu = require('./enmu');
const debug = require('debug');
const Vinyl = require('vinyl');
const chalk = require('chalk');

const cwd = process.cwd();
const join = path.join;
const dirname = path.dirname;
const relative = path.relative;
const slice = Array.prototype.slice;

// File path relative cwd
debug.formatters.r = function(value) {
  return chalk.reset.magenta(pathFromCwd(value));
};

// File path
debug.formatters.p = function(value) {
  return chalk.reset.magenta(value);
};

/**
 * @function setDebug
 * @description Set debug
 * @param {any} namespace
 * @returns {debug}
 */
function setDebug(namespace) {
  const debugs = debug(namespace);

  // Set debug color use 6
  debugs.color = 6;

  return debugs;
}

/**
 * @function parseId
 * @description Parse id form vinyl
 * @param {Vinyl} vinyl
 * @param {Object} wwwroot
 * @param {Object} base
 * @returns {string}
 */
function parseId(vinyl, wwwroot, base) {
  let path = relative(base, vinyl.path);
  const OUTBOUNDRE = /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/;

  // Vinyl not in base dir, user wwwroot
  if (OUTBOUNDRE.test(path)) {
    path = relative(wwwroot, vinyl.path);

    // Vinyl not in wwwroot, throw error
    if (OUTBOUNDRE.test(path)) {
      throwError('file: %s is out of bound of wwwroot: %s.', normalize(vinyl.path), normalize(wwwroot));
    }

    // Reset path
    path = join('/', path);
  }

  return normalize(path);
}

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
function normalize(path) {
  // \a\b\.\c\.\d ==> /a/b/./c/./d
  path = path.replace(/\\/g, '/');

  // :///a/b/c ==> ://a/b/c
  path = path.replace(/(:)?\/{2,}/, '$1//');

  // /a/b/./c/./d ==> /a/b/c/d
  path = path.replace(/\/\.\//g, '/');

  // @author wh1100717
  // a//b/c ==> a/b/c
  // ///a/b/c ==> //a/b/c
  // a///b/////c ==> a/b/c
  path = path.replace(/([^:])\/{2,}/g, '$1/');

  // Transfer path
  let src = path;
  // DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
  const DOUBLE_DOT_RE = /([^/]+)\/\.\.(?:\/|$)/g;

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
  path = path.replace(/^\/(\.\.\/)+/, '/');

  // Get path
  return path;
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
 * @function isLocal
 * @description Test path is local path or not
 * @param {string} path
 * @returns {boolean}
 */
function isLocal(path) {
  return !/^\w*?:\/\/|^\/\//.test(path) && !/^data:\w+?\/\w+?[,;]/i.test(path);
}

/**
 * @function isOutBound
 * @description Test path is out of bound of base
 * @param {string} path
 * @param {string} base
 * @returns {boolean}
 */
function isOutBound(path, base) {
  return /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/.test(relative(base, path));
}

/**
 * @function pathFromCwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
function pathFromCwd(path) {
  return normalize(relative(cwd, path)) || './';
}

/**
 * @function throwError
 * @description Plugin error
 * @returns {void}
 */
function throwError() {
  const message = apply(util.format, null, slice.call(arguments));

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
 * @function readonlyProperty
 * @description Define a readonly property
 * @param {Object} object
 * @param {string} prop
 * @param {any} value
 * @returns {void}
 */
function readonlyProperty(object, prop, value) {
  const setting = {
    __proto__: null,
    writable: false,
    enumerable: true,
    configurable: false
  };

  // Set value
  if (arguments.length >= 3) {
    setting[value] = value;
  }

  // Define property
  Object.defineProperty(object, prop, setting);
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
 * @function inspectError
 * @description Inspect error
 * @param {Error} error
 * @returns {string}
 */
function inspectError(error) {
  return util.inspect(error).replace(/^\{\s*|\}\s*$/g, '');
}

/**
 * @function vinylFile
 * @description Get a vinyl from a vinyl and contents
 * @private
 * @param {Vinyl} vinyl
 * @param {Stream|Buffer|null} contents
 */

function vinylFile(vinyl, contents) {
  return new Vinyl({
    cwd: vinyl.cwd,
    base: vinyl.base,
    path: vinyl.path,
    stat: vinyl.stat,
    contents: contents
  });
}

/**
 * @function wrapVinyl
 * @description Wrap an older vinyl version to an newer vinyl version
 * @param {Vinyl} vinyl
 * @returns {Vinyl}
 */
function wrapVinyl(vinyl) {
  return vinylFile(vinyl, vinyl.contents);
}

/**
 * @function blankVinyl
 * @description Clone a blank vinyl from a vinyl
 * @param {Vinyl} vinyl
 * @returns {Vinyl}
 */
function blankVinyl(vinyl) {
  return vinylFile(vinyl, enmu.BLANK_BUFFER);
}

// Exports
module.exports = {
  cwd,
  slice,
  apply,
  parseId,
  isLocal,
  parseMap,
  normalize,
  wrapVinyl,
  blankVinyl,
  isRelative,
  isAbsolute,
  throwError,
  isOutBound,
  pathFromCwd,
  inspectError,
  debug: setDebug,
  readonlyProperty
};

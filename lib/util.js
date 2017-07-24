/*!
 * util
 * Version: 0.0.1
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var fs = require('fs');
var is = require('./is');
var path = require('path');
var util = require('util');
var enmu = require('./enmu');
var debug = require('debug');
var Vinyl = require('vinyl');
var colors = require('colors/safe');

var cwd = process.cwd();
var join = path.join;
var dirname = path.dirname;
var relative = path.relative;
var slice = Array.prototype.slice;

// file path relative cwd
debug.formatters.r = function(value) {
  return colors.reset.magenta(pathFromCwd(value));
};

// file path
debug.formatters.p = function(value) {
  return colors.reset.magenta(value);
};

/**
 * set debug
 *
 * @param {any} namespace
 * @returns
 */
function setDebug(namespace) {
  var debugs = debug(namespace);

  // set debug color use 6
  debugs.color = 6;

  return debugs;
}

/**
 * parse id form vinyl
 *
 * @param {Vinyl} vinyl
 * @param {Object} wwwroot
 * @param {Object} base
 * @returns {String}
 */
function parseId(vinyl, wwwroot, base) {
  var path = relative(base, vinyl.path);
  var OUTBOUNDRE = /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/;

  // vinyl not in base dir, user wwwroot
  if (OUTBOUNDRE.test(path)) {
    path = relative(wwwroot, vinyl.path);

    // vinyl not in wwwroot, throw error
    if (OUTBOUNDRE.test(path)) {
      throwError('file: %s is out of bound of wwwroot: %s.', normalize(vinyl.path), normalize(wwwroot));
    }

    // reset path
    path = join('/', path);
  }

  return normalize(path);
}

/**
 * normalize path
 *
 * @param path
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
  // a///b/////c ==> a/b/c
  path = path.replace(/([^:/])\/+\//g, '$1/');

  // transfer path
  var src = path;
  // DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
  var DOUBLE_DOT_RE = /([^/]+)\/\.\.(?:\/|$)/g;

  // a/b/c/../../d ==> a/b/../d ==> a/d
  do {
    src = src.replace(DOUBLE_DOT_RE, function(matched, dirname) {
      return dirname === '..' ? matched : '';
    });

    // break
    if (path === src) {
      break;
    } else {
      path = src;
    }
  } while (true);

  // /../../../a ==> /a
  path = path.replace(/^\/(\.\.\/)+/, '/');

  // get path
  return path;
}

/**
 * test path is relative path or not
 *
 * @param path
 * @returns {boolean}
 */
function isRelative(path) {
  return /^\.{1,2}[\\/]/.test(path);
}

/**
 * test path is absolute path or not
 *
 * @param path
 * @returns {boolean}
 */
function isAbsolute(path) {
  return /^[\\/](?:[^\\/]|$)/.test(path);
}

/**
 * test path is local path or not
 *
 * @param path
 * @returns {boolean}
 */
function isLocal(path) {
  return !/^\w*?:\/\/|^\/\//.test(path) && !/^data:\w+?\/\w+?[,;]/i.test(path);
}

/**
 * test path is out of bound of base
 *
 * @param path
 * @param base
 * @returns {boolean}
 */
function isOutBound(path, base) {
  return /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/.test(relative(base, path));
}

/**
 * get relative path from cwd
 *
 * @param path
 * @returns {string}
 */
function pathFromCwd(path) {
  return normalize(relative(cwd, path)) || './';
}

/**
 * plugin error
 *
 * @returns {void}
 */
function throwError() {
  var message = apply(util.format, null, slice.call(arguments));

  throw new Error(message);
}

/**
 * parse map
 *
 * @param {String} id
 * @param {Function} map
 * @param {String} base
 * @param {String} wwwroot
 * @returns {String}
 */
function parseMap(id, map, base, wwwroot) {
  var src;

  // calm map function
  if (is.isFunction(map)) {
    src = map(id, base, wwwroot);
  }

  // must be string
  if (!src || !is.isString(src)) {
    return id;
  }

  return src;
}

/**
 * define a readonly property
 *
 * @param object
 * @param prop
 * @param value
 * @returns {void}
 */
function readonlyProperty(object, prop, value) {
  var setting = {
    __proto__: null,
    writable: false,
    enumerable: true,
    configurable: false
  };

  // set value
  if (arguments.length >= 3) {
    setting[value] = value;
  }

  // define property
  Object.defineProperty(object, prop, setting);
}

/**
 * faster apply
 * Call is faster than apply, optimize less than 6 args
 *
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
 * inspect error
 *
 * @param {Error} error
 * @returns {String}
 */
function inspectError(error) {
  return util
    .inspect(error)
    .replace(/^\{\s*|\}\s*$/g, '');
}

/**
 * get a vinyl from a vinyl and contents
 *
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
 * wrap an older vinyl version to an newer vinyl version
 *
 * @param {Vinyl} vinyl
 * @returns {Vinyl}
 */
function wrapVinyl(vinyl) {
  return vinylFile(vinyl, vinyl.contents);
}

/**
 * clone a blank vinyl from a vinyl
 *
 * @param {Vinyl} vinyl
 * @returns {Vinyl}
 */
function blankVinyl(vinyl) {
  return vinylFile(vinyl, enmu.BLANK_BUFFER);
}

// exports
module.exports = {
  cwd: cwd,
  slice: slice,
  apply: apply,
  debug: setDebug,
  parseId: parseId,
  isLocal: isLocal,
  parseMap: parseMap,
  normalize: normalize,
  wrapVinyl: wrapVinyl,
  blankVinyl: blankVinyl,
  isRelative: isRelative,
  isAbsolute: isAbsolute,
  throwError: throwError,
  isOutBound: isOutBound,
  pathFromCwd: pathFromCwd,
  inspectError: inspectError,
  readonlyProperty: readonlyProperty
};

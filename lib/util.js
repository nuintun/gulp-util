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

var path = require('path');
var util = require('util');
var colors = require('colors/safe');

var join = path.join;
var dirname = path.dirname;
var relative = path.relative;
var cwd = process.cwd();
var BACKSLASH_RE = /\\/g;
var DOT_RE = /\/\.\//g;
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
var MULTI_SLASH_RE = /([^:/])\/+\//g;
var PROTOCOL_SLASH_RE = /(:)?\/{2,}/;
var slice = Array.prototype.slice;

/**
 * normalize path
 * @param path
 * @returns {string}
 */
function normalize(path) {
  // \a\b\.\c\.\d ==> /a/b/./c/./d
  path = path.replace(BACKSLASH_RE, '/');

  // :///a/b/c ==> ://a/b/c
  path = path.replace(PROTOCOL_SLASH_RE, '$1//');

  // /a/b/./c/./d ==> /a/b/c/d
  path = path.replace(DOT_RE, '/');

  // @author wh1100717
  // a//b/c ==> a/b/c
  // a///b/////c ==> a/b/c
  // DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
  path = path.replace(MULTI_SLASH_RE, '$1/');

  // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
  while (path.match(DOUBLE_DOT_RE)) {
    path = path.replace(DOUBLE_DOT_RE, '/');
  }

  // get path
  return path;
}

/**
 * resolve a `relative` path base on `base` path
 * @param relative
 * @param vinyl
 * @param wwwroot
 * @returns {string}
 */
function resolve(relative, vinyl, wwwroot, debug) {
  var base;
  var absolute;

  // resolve
  if (isAbsolute(relative)) {
    base = wwwroot;
    absolute = join(base, relative.substring(1));
  } else {
    base = dirname(vinyl.path);
    absolute = join(base, relative);

    // out of base, use wwwroot
    if (isRelative(absolute)) {
      base = wwwroot;
      absolute = join(base, relative);

      // out of wwwroot
      if (isOutBound(absolute, wwwroot)) {
        throwError('file: %s is out of bound of wwwroot: %s.', normalize(absolute), normalize(wwwroot));
      }
    }
  }

  // debug
  debug('resolve path: %s', colors.magenta(normalize(relative)));
  debug('of base path: %s', colors.magenta(pathFromCwd(base)));
  debug('to: %s', colors.magenta(pathFromCwd(absolute)));

  return absolute;
}

/**
 * test path is relative path or not
 * @param path
 * @returns {boolean}
 */
function isRelative(path) {
  return /^\.{1,2}[\\/]/.test(path);
}

/**
 * test path is absolute path or not
 * @param path
 * @returns {boolean}
 */
function isAbsolute(path) {
  return /^[\\/](?:[^\\/]|$)/.test(path);
}

/**
 * test path is local path or not
 * @param path
 * @returns {boolean}
 */
function isLocal(path) {
  return !/^\w*?:\/\/|^\/\//.test(path) && !/^data:\w+?\/\w+?[,;]/i.test(path);
}

/**
 * test path is out of bound of base
 * @param path
 * @param base
 * @returns {boolean}
 */
function isOutBound(path, base) {
  return /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/.test(relative(base, path));
}

/**
 * get relative path from cwd
 * @param path
 * @returns {string}
 */
function pathFromCwd(path) {
  return normalize(relative(cwd, path)) || './';
}

/**
 * plugin error
 */
function throwError() {
  var message = apply(util.format, null, slice.call(arguments));

  throw new Error(message);
}

/**
 * define a readonly property
 * @param object
 * @param prop
 * @param value
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
 * Faster apply
 * Call is faster than apply, optimize less than 6 args
 *
 * @param  {Function} fn
 * @param  {any} context
 * @param  {Array} args
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

module.exports = {
  cwd: cwd,
  slice: slice,
  apply: apply,
  undef: void(0),
  colors: colors,
  isLocal: isLocal,
  resolve: resolve,
  normalize: normalize,
  isRelative: isRelative,
  isAbsolute: isAbsolute,
  throwError: throwError,
  isOutBound: isOutBound,
  pathFromCwd: pathFromCwd,
  readonlyProperty: readonlyProperty
};

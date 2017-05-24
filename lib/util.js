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
var debug = require('debug');
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

  // DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
  var DOUBLE_DOT_RE = /[^./]+\/\.\.\//;

  // a/b/c/../../d ==> a/b/../d ==> a/d
  while (DOUBLE_DOT_RE.test(path)) {
    path = path.replace(DOUBLE_DOT_RE, '');
  }

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
 * @param {Object} map
 * @returns {String}
 */
function parseMap(id, map) {
  var ret = id;

  if (Array.isArray(map)) {
    for (var i = 0, len = map.length; i < len; i++) {
      var rule = map[i];

      // parse map
      if (is.isFunction(rule)) {
        ret = rule(id);
      } else if (Array.isArray(rule)) {
        ret = id.replace(rule[0], rule[1]);
      }

      // must be string
      if (!ret || !is.isString(ret)) {
        ret = id;
      }

      // only apply the first matched rule
      if (ret !== id) break;
    }
  }

  return ret;
}

/**
 * define a readonly property
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
 * Faster apply
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

// exports
module.exports = {
  cwd: cwd,
  slice: slice,
  apply: apply,
  debug: setDebug,
  isLocal: isLocal,
  parseMap: parseMap,
  normalize: normalize,
  isRelative: isRelative,
  isAbsolute: isAbsolute,
  throwError: throwError,
  isOutBound: isOutBound,
  pathFromCwd: pathFromCwd,
  readonlyProperty: readonlyProperty
};

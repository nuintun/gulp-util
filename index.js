/*!
 * index
 * Version: 0.0.1
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var Vinyl = require('vinyl');
var colors = require('colors/safe');
var async = require('./lib/async');
var Cache = require('./lib/cache');
var enmu = require('./lib/enmu');
var extend = require('./lib/extend');
var hash = require('./lib/hash');
var is = require('./lib/is');
var plugins = require('./lib/plugins');
var rename = require('./lib/rename');
var transport = require('./lib/transport');
var util = require('./lib/util');

module.exports = {
  Vinyl: Vinyl,
  colors: colors,
  async: async,
  Cache: Cache,
  BLANK_BUFFER: enmu.BLANK_BUFFER,
  CONCAT_STATUS: enmu.CONCAT_STATUS,
  extend: extend,
  hash: hash,
  type: is.type,
  isString: is.isString,
  isFunction: is.isFunction,
  isPlainObject: is.isPlainObject,
  plugins: plugins,
  rename: rename,
  transport: transport,
  cwd: util.cwd,
  debug: util.debug,
  slice: util.slice,
  apply: util.apply,
  isLocal: util.isLocal,
  resolve: util.resolve,
  normalize: util.normalize,
  isRelative: util.isRelative,
  isAbsolute: util.isAbsolute,
  throwError: util.throwError,
  isOutBound: util.isOutBound,
  pathFromCwd: util.pathFromCwd,
  readonlyProperty: util.readonlyProperty
};

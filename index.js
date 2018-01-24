/**
 * @module index
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const Vinyl = require('vinyl');
const chalk = require('chalk');
const async = require('./lib/async');
const enmu = require('./lib/enmu');
const extend = require('./lib/extend');
const hash = require('./lib/hash');
const is = require('./lib/is');
const plugins = require('./lib/plugins');
const transport = require('./lib/transport');
const utils = require('./lib/utils');

module.exports = {
  hash,
  Vinyl,
  chalk,
  async,
  extend,
  plugins,
  transport,
  type: is.type,
  isString: is.isString,
  isFunction: is.isFunction,
  isPlainObject: is.isPlainObject,
  isPromiseLike: is.isPromiseLike,
  cwd: utils.cwd,
  slice: utils.slice,
  apply: utils.apply,
  debug: utils.debug,
  parseId: utils.parseId,
  isLocal: utils.isLocal,
  parseMap: utils.parseMap,
  normalize: utils.normalize,
  wrapVinyl: utils.wrapVinyl,
  blankVinyl: utils.blankVinyl,
  isRelative: utils.isRelative,
  isAbsolute: utils.isAbsolute,
  throwError: utils.throwError,
  isOutBound: utils.isOutBound,
  pathFromCwd: utils.pathFromCwd,
  inspectError: utils.inspectError,
  readonlyProperty: utils.readonlyProperty,
  CONCAT_STATUS: enmu.CONCAT_STATUS
};

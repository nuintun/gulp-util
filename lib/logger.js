/**
 * @module logger
 * @license MIT
 * @version 2018/03/07
 */

'use strict';

const gray = require('ansi-gray');
const apply = require('./utils').apply;
const timestamp = require('time-stamp');
const supportsColor = require('color-support');

/**
 * @function hasFlag
 * @param {string} flag
 * @returns {boolean}
 */
function hasFlag(flag) {
  return process.argv.indexOf('--' + flag) !== -1;
}

/**
 * @function addColor
 * @param {string} value
 * @returns {string}
 */
function addColor(value) {
  if (hasFlag('no-color')) {
    return value;
  }

  if (hasFlag('color')) {
    return gray(value);
  }

  if (supportsColor()) {
    return gray(value);
  }

  return value;
}

/**
 * @function getTimestamp
 * @returns {string}
 */
function getTimestamp() {
  return `[${addColor(timestamp('HH:mm:ss'))}]`;
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

module.exports = log;
module.exports.info = info;
module.exports.dir = dir;
module.exports.warn = warn;
module.exports.error = error;

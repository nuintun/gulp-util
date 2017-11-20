/**
 * @module is
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const stream = require('stream');

const toString = Object.prototype.toString;
const getPrototypeOf = Object.getPrototypeOf;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const fnToString = hasOwnProperty.toString;
const objectFunctionString = fnToString.call(Object);
const EXTRACTTYPE_RE = /\[object (.+)\]/i;

/**
 * @function type
 * @param {any} value
 * @returns {String}
 */
function type(value) {
  // Get real type
  let type = toString.call(value).toLowerCase();

  type = type.replace(EXTRACTTYPE_RE, '$1').toLowerCase();

  // Is nan and infinity
  if (type === 'number') {
    // Is nan
    if (value !== value) {
      return 'nan';
    }

    // Is infinity
    if (value === Infinity || value === -Infinity) {
      return 'infinity';
    }
  }

  // Return type
  return type;
}

/**
 * @function isFunction
 * @description Is function
 * @param {any} value
 * @returns {boolean}
 */
function isFunction(value) {
  return type(value) === 'function';
}

/**
 * @function isPlainObject
 * @description Is plain object
 * @param {any} value
 * @returns {boolean}
 */
function isPlainObject(value) {
  let proto, ctor;

  // Detect obvious negatives
  if (!value || type(value) !== 'object') {
    return false;
  }

  // Proto
  proto = getPrototypeOf(value);

  // Objects with no prototype (e.g., `Object.create( null )`) are plain
  if (!proto) {
    return true;
  }

  // Objects with prototype are plain iff they were constructed by a global Object function
  ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;

  return typeof ctor === 'function' && fnToString.call(ctor) === objectFunctionString;
}

/**
 * @function isString
 * @description Is string
 * @param {any} value
 * @returns {boolean}
 */
function isString(value) {
  return type(value) === 'string';
}

/**
 * @function isPromise
 * @description Is promise, non strict judge
 * @param {any} value
 * @returns {boolean}
 */
function isPromise(value) {
  return value && isFunction(value.then) && isFunction(value.catch);
}

module.exports = {
  type,
  isString,
  isPromise,
  isFunction,
  isPlainObject
};

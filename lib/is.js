/*!
 * is
 *
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var stream = require('stream');

var toString = Object.prototype.toString;
var getPrototypeOf = Object.getPrototypeOf;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var fnToString = hasOwnProperty.toString;
var objectFunctionString = fnToString.call(Object);
var EXTRACTTYPE_RE = /\[object (.+)\]/i;

/**
 * type
 *
 * @param value
 * @returns {String}
 */
function type(value) {
  // Get real type
  var type = toString.call(value).toLowerCase();

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
 * Is function
 *
 * @param value
 * @returns {boolean}
 */
function isFunction(value) {
  return type(value) === 'function';
}

/**
 * Is plain object
 *
 * @param value
 * @returns {Boolean}
 */
function isPlainObject(value) {
  var proto, ctor;

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
 * Is string
 *
 * @param value
 * @returns {boolean}
 */
function isString(value) {
  return type(value) === 'string';
}

/**
 * Is promise
 * non strict judge
 *
 * @param value
 * @returns {boolean}
 */
function isPromise(value) {
  return value
    && isFunction(value.then)
    && isFunction(value.catch);
}

module.exports = {
  type: type,
  isString: isString,
  isPromise: isPromise,
  isFunction: isFunction,
  isPlainObject: isPlainObject
};

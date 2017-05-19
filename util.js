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

var isArray = Array.isArray;
var toString = Object.prototype.toString;
var getPrototypeOf = Object.getPrototypeOf;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var fnToString = hasOwnProperty.toString;
var objectFunctionString = fnToString.call(Object);
var EXTRACTTYPE_RE = /\[object (.+)\]/i;
var undef = void(0);

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
 * extend
 *
 * @returns {Object}
 */
function extend() {
  var i = 1;
  var deep = false;
  var length = arguments.length;
  var target = arguments[0] || {};
  var options, name, src, copy, copyIsArray, clone;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    // Skip the boolean and the target
    target = arguments[i++] || {};
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {};
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        // Only copy own property
        if (!options.hasOwnProperty(name)) {
          continue;
        }

        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);
        } else if (copy !== undef) {
          // Don't bring in undefined values
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
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

// exports
module.exports = {
  type: type,
  extend: extend,
  isArray: isArray,
  isString: isString,
  isFunction: isFunction,
  isPlainObject: isPlainObject
}

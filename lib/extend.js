/*!
 * extend
 * Version: 0.0.1
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var is = require('./is');
var util = require('./util');

/**
 * extend
 *
 * @returns {Object}
 */
module.exports = function extend() {
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
  if (typeof target !== 'object' && !is.isFunction(target)) {
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
        if (deep && copy && (is.isPlainObject(copy) || (copyIsArray = is.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && is.isArray(src) ? src : [];
          } else {
            clone = src && is.isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);
        } else if (copy !== util.undef) {
          // Don't bring in undefined values
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

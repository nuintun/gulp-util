/*!
 * Plugin
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
var Vinyl = require('vinyl');

/**
 * Plugin
 * @param name
 * @param transport
 * @constructor
 */
function Plugin(name, transport) {
  var context = this;

  context.name = name;
  context.vinyl = null;

  // transport must be a function
  if (is.isFunction(transport)) {
    context.transport = transport;
  } else {
    util.throwError('plugin %s: transport must be a function.', context.name);
  }
}

/**
 * prototype
 * @type {{push: Function, exec: Function}}
 */
Plugin.prototype = {
  /**
   * push
   * @param vinyl
   */
  push: function(vinyl) {
    var context = this;

    if (Vinyl.isVinyl(context.vinyl)) {
      vinyl.package = vinyl.package || {};
      context.vinyl = vinyl;
    } else {
      util.throwError('plugin %s: transport function must be return a vinyl.', this.name);
    }
  },
  /**
   * exec
   * @param vinyl
   * @param options
   * @param done
   */
  exec: function(vinyl, options, done) {
    var context = this;

    // set vinyl
    context.vinyl = vinyl;

    // run transport
    context.transport(vinyl, options, next(done, options).bind(context));
  }
};

/**
 * next
 * @param done
 * @param options
 * @returns {Function}
 */
function next(done, options) {
  return function() {
    done(this.vinyl, options);
  };
}

/**
 * exports module
 */
module.exports = Plugin;

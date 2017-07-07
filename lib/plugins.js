/*!
 * plugins
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
 *
 * @type {{push: Function, process: Function}}
 */
Plugin.prototype = {
  /**
   * push
   *
   * @param vinyl
   * @returns {void}
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
   * process
   *
   * @param vinyl
   * @param options
   * @param done
   * @returns {void}
   */
  process: function(vinyl, options, done) {
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
  return function(error, vinyl) {
    var length = arguments.length;

    if (length && error !== null) {
      return util.throwError(error);
    }

    if (length >= 2) {
      this.push(vinyl);
    }

    done(this.vinyl, options);
  };
}

/**
 * plugins
 *
 * @param plugins
 * @param defaults
 * @returns {Object}
 */
module.exports = function(plugins, defaults) {
  var name, addon;
  var addons = {};

  if (plugins) {
    for (name in plugins) {
      if (plugins.hasOwnProperty(name)) {
        addon = plugins[name];
        name = name.toLowerCase();
        addons[name] = new Plugin(name, addon);
      }
    }
  }

  if (defaults) {
    for (name in defaults) {
      if (defaults.hasOwnProperty(name)) {
        addon = defaults[name];
        name = name.toLowerCase();

        if (!addons[name]) {
          addons[name] = new Plugin(name, addon);
        }
      }
    }
  }

  return addons;
};

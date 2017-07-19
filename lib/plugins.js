/*!
 * plugins
 * Version: 0.0.1
 * Date: 2017/07/17
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var is = require('./is');
var Vinyl = require('vinyl');
var async = require('./async');
var through = require('@nuintun/through');

/**
 * Plugin
 *
 * @param {String} name
 * @param {Function|Array<Function>} loaders
 * @constructor
 */
function Plugin(name, loaders) {
  this.name = name;
  this.loaders = Array.isArray(loaders) ? loaders : [loaders];
}

/**
 * process
 *
 * @param {Vinyl} vinyl
 * @param {Object} options
 * @returns {Stream}
 */
Plugin.prototype.process = function(vinyl) {
  var loader;
  var name = this.name;
  var loaders = this.loaders;
  var length = loaders.length;

  if (length) {
    for (var i = 0; i + 1 < length;) {
      loader = loaders[i].pipe(loaders[++i]);
    }
  } else {
    loader = through();
  }

  loader.push(vinyl);

  return loader;
};

/**
 * normalize loaders
 *
 * @param {Object} loaders
 * @param {Object} defaults
 */
function normalizeLoaders(loaders, defaults, options) {
  var result = [];

  if (Array.isArray(loaders)) {
    loaders.forEach(function(loader) {
      if (loader === 'inline-loader') {
        defaults && result.push(defaults(options));
      } else if (is.isDuplex(loader)) {
        result.push(loader);
      }
    });
  } else if (is.isDuplex(loaders)) {
    result = loaders;
  } else if (defaults) {
    result = defaults(options);
  }

  return result;
}

/**
 * plugins
 *
 * @param plugins
 * @param defaults
 * @returns {Object}
 */
module.exports = function(plugins, defaults, options) {
  var name;
  var loaders;
  var addons = {};

  if (plugins) {
    for (name in plugins) {
      if (plugins.hasOwnProperty(name)) {
        loaders = plugins[name];
        name = name.toLowerCase();
        loaders = normalizeLoaders(loaders, defaults[name], options);
        addons[name] = new Plugin(name, loaders);
      }
    }
  }

  if (defaults) {
    for (name in defaults) {
      if (defaults.hasOwnProperty(name)) {
        name = name.toLowerCase();

        if (!addons[name]) {
          loaders = defaults[name];
          addons[name] = new Plugin(name, loaders(options));
        }
      }
    }
  }

  return addons;
};

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
 * @returns {void}
 */
Plugin.prototype.process = function(vinyl, options) {
  var name = this.name;
  var loaders = this.loaders;

  return new Promise(function(resolve, reject) {
    async.series(loaders, function(loader, next, index) {
      var result = loader(vinyl, options);

      if (Vinyl.isVinyl(result)) {
        vinyl = result;
        vinyl.package = vinyl.package || {};

        next();
      } else if (is.isPromise(result)) {
        result
          .then(function(chunk) {
            if (Vinyl.isVinyl(chunk)) {
              vinyl = chunk;
              vinyl.package = vinyl.package || {};
            }

            next();
          })
          .catch(function(error) {
            reject(error);
          });
      } else {
        next();
      }
    }, function() {
      resolve(vinyl);
    });
  });
};

/**
 * normalize
 *
 * @param {Object} loaders
 * @param {Object} defaults
 */
function normalize(loaders, defaults) {
  var result = [];

  if (Array.isArray(loaders)) {
    loaders.forEach(function(loader) {
      if (loader === 'inline-loader') {
        defaults && result.push(defaults);
      } else if (is.isFunction(loader)) {
        result.push(loader);
      }
    });
  } else if (is.isFunction(loaders)) {
    result = loaders;
  } else if (defaults) {
    result = defaults;
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
module.exports = function(plugins, defaults) {
  var name;
  var loaders;
  var addons = {};

  if (plugins) {
    for (name in plugins) {
      if (plugins.hasOwnProperty(name)) {
        loaders = plugins[name];
        name = name.toLowerCase();
        loaders = normalize(loaders, defaults[name]);
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
          addons[name] = new Plugin(name, loaders);
        }
      }
    }
  }

  return addons;
};

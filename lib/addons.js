'use strict';

var Vinyl = require('vinyl');
var util = require('./util');
var async = require('./async');

/**
 * Plugin
 *
 * @param {*} name
 * @param {*} loaders
 */
function Plugin(name, loaders) {
  this.name = name;
  this.loaders = Array.isArray(loaders) ? loaders : [loaders];
}

Plugin.prototype.process = function(vinyl, options) {
  var name = this.name;
  var loaders = this.loaders;

  return new Promise(function(resolve, reject) {
    async.series(loaders, function(loader, next, index) {
      loader(vinyl, options)
        .then(function(vinyl) {
          if (Vinyl.isVinyl(vinyl)) {
            vinyl = vinyl;
            vinyl.package = vinyl.package || {};

            next();
          } else {
            util.throwError('plugin %s\'s loader [%s]: resolve data must be a vinyl.', name, index);
          }
        })
        .catch(function(error) {
          reject(error);
        });
    }, function() {
      resolve(vinyl);
    });
  });
};

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

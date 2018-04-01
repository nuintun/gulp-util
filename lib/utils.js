/**
 * @module utils
 * @license MIT
 * @version 2017/11/10
 */

import Vinyl from 'vinyl';
import chalk from 'chalk';
import promisify from './promisify';
import VinylFile from './vinyl-file';
import { typpy } from 'inspect-attrs';
import { stat, readFile, accessSync, constants } from 'fs';
import { join, relative, normalize as Pnormalize } from 'path';

/**
 * @function unixify
 * @description Convert path separators to posix/unix-style forward slashes.
 * @param {string} path
 * @returns {string}
 */
export function unixify(path) {
  return path.replace(/\\/g, '/');
}

/**
 * @function normalize
 * @description Normalize path
 * @param {string} path
 * @returns {string}
 */
export function normalize(path) {
  const dot = /^\.[\\/]/.test(path);

  // Normalize path
  path = unixify(Pnormalize(path));

  // Get path
  return dot && !path.startsWith('../') ? `./${path}` : path;
}

/**
 * @function isRelative
 * @description Test path is relative path or not
 * @param {string} path
 * @returns {boolean}
 */
export function isRelative(path) {
  return /^\.{1,2}[\\/]/.test(path);
}

/**
 * @function isAbsolute
 * @description Test path is absolute path or not
 * @param {string} path
 * @returns {boolean}
 */
export function isAbsolute(path) {
  return /^[\\/](?:[^\\/]|$)/.test(path);
}

/**
 * @function isOutBounds
 * @description Test path is out of bounds of root
 * @param {string} path
 * @param {string} root
 * @returns {boolean}
 */
export function isOutBounds(path, root) {
  return /(?:^[\\\/]?)\.\.(?:[\\\/]|$)/.test(relative(root, path));
}

const cwd = process.cwd();

/**
 * @function path2cwd
 * @description Get relative path from cwd
 * @param {string} path
 * @returns {string}
 */
export function path2cwd(path) {
  return unixify(relative(cwd, path)) || '.';
}

/**
 * @function parseMap
 * @description Parse map
 * @param {string} id
 * @param {string} resolved
 * @param {Function} map
 * @returns {string}
 */
export function parseMap(id, resolved, map) {
  let mapped = id;

  // Calm map function
  if (typpy(map, Function)) {
    mapped = map(id, resolved);

    // Must be string
    if (!typpy(mapped, String)) mapped = id;
  }

  return mapped;
}

/**
 * @function apply
 * @description Faster apply, call is faster than apply, optimize less than 6 args
 * @param  {Function} fn
 * @param  {any} context
 * @param  {Array} args
 * @returns {void}
 * https://github.com/micro-js/apply
 * http://blog.csdn.net/zhengyinhui100/article/details/7837127
 */
export function apply(fn, context, args) {
  switch (args.length) {
    // Faster
    case 0:
      return fn.call(context);
    case 1:
      return fn.call(context, args[0]);
    case 2:
      return fn.call(context, args[0], args[1]);
    case 3:
      return fn.call(context, args[0], args[1], args[2]);
    default:
      // Slower
      return fn.apply(context, args);
  }
}

/**
 * @function pipeline
 * @param {Iterable} plugins
 * @param {string} hook
 * @param {string} path
 * @param {string} contents
 * @param {Object} options
 * @returns {string}
 */
export async function pipeline(plugins, hook, path, contents, options) {
  for (let plugin of plugins) {
    const actuator = plugin[hook];

    // If actuator exist
    if (actuator) {
      const code = await actuator(path, contents, options);

      // Valid returned
      if (!typpy(code, String)) {
        const name = typpy(plugin.name, String) ? plugin.name : 'anonymous';

        throw new TypeError(`The hook '${hook}' in plugin '${name}' must be returned a string.`);
      }

      // Override contents
      contents = code;
    }
  }

  return contents;
}

/**
 * @function buffer
 * @param {string} string
 * @returns {Buffer}
 */
export function buffer(string) {
  return Buffer.from ? Buffer.from(string) : new Buffer(string);
}

/**
 * @function combine
 * @param {Set} bundles
 * @returns {Buffer}
 */
export function combine(bundles) {
  const contents = [];

  // Traverse bundles
  bundles.forEach(bundle => contents.push(bundle.contents));

  // Concat contents
  return Buffer.concat(contents);
}

// Promisify stat and readFile
export const fsReadStat = promisify(stat);
export const fsReadFile = promisify(readFile);

/**
 * @function fsSafeAccess
 * @param {string} path
 * @param {Number} mode
 * @returns {boolean}
 */
export function fsSafeAccess(path, mode = constants.R_OK) {
  try {
    accessSync(path, mode);
  } catch (error) {
    return false;
  }

  return true;
}

/**
 * @function fetchModule
 * @param {string} path
 * @param {Object} options
 * @returns {Vinyl}
 */
export async function fetchModule(path, options) {
  // Read module
  const base = options.base;
  const stat = await fsReadStat(path);
  const contents = await fsReadFile(path);

  // Return a vinyl file
  return new VinylFile({ base, path, stat, contents });
}

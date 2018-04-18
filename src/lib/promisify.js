/**
 * @module promisify
 * @license MIT
 * @version 2018/03/16
 */

/**
 * @function promisify
 * @param {Function} fn
 * @returns {Promise}
 */
export default function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, ...args) => {
        if (error) return reject(error);

        if (args.length === 1) return resolve(args[0]);

        resolve(args);
      });
    });
  };
}

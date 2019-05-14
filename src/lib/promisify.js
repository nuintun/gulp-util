/**
 * @module promisify
 * @license MIT
 * @author nuintun
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

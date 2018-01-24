/**
 * @module async
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

/**
 * @function series
 * @param {any} array
 * @param {Function} iterator
 * @param {Function} done
 * @param {any} context
 */
function series(array, iterator, done) {
  // If not array call done immediate
  if (!Array.isArray(array)) {
    return done();
  }

  // Get array entries
  const it = array.entries();

  /**
   * @function traverse
   * @param {Iterator} it
   */
  function traverse(it) {
    const item = it.next();

    if (item.done) {
      done();
    } else {
      const value = item.value;

      iterator(
        value[1],
        () => {
          traverse(it);
        },
        value[0]
      );
    }
  }

  // Run traverse
  traverse(it);
}

module.exports = { series };

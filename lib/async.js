/**
 * @module async
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

/**
 * @function series
 * @param {Iterable} iterable
 * @param {Function} iterator
 * @param {Function} done
 * @param {any} context
 */
function series(iterable, iterator, done) {
  // If not iterable call done immediate
  if (!iterable || typeof iterable.entries !== 'function') {
    return done();
  }

  // Get iterator entries
  const it = iterable.entries();

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

      iterator(value, () => {
        traverse(it);
      });
    }
  }

  // Run traverse
  traverse(it);
}

module.exports = { series };

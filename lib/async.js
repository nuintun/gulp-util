/**
 * @module async
 * @license MIT
 * @version 2017/11/10
 */

'use strict';

const is = require('./is');

/**
 * @function series
 * @param {Iterable} iterable
 * @param {Function} iterator
 * @param {Function} done
 * @param {any} context
 */
function series(iterable, iterator, done) {
  // If not iterable call done immediate
  if (!iterable || !is.isFunction(iterable[Symbol.iterator])) {
    return done();
  }

  // Get iterator entries
  const it = iterable[Symbol.iterator]();

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

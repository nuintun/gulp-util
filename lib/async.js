/*!
 * async
 *
 * Date: 2017/05/19
 * https://github.com/nuintun/gulp-util
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/gulp-util/blob/master/LICENSE
 */

'use strict';

var nextTick = process.nextTick;

/**
 * Iterator
 *
 * @param array
 * @constructor
 */
function Iterator(array) {
  var context = this;

  context.index = 0;
  context.array = Array.isArray(array) ? array : [];
}

/**
 * create the next item.
 * @returns {{done: boolean, value: undefined}}
 */
Iterator.prototype.next = function() {
  var context = this;
  var done = context.index >= context.array.length;
  var value = !done ? context.array[context.index++] : undefined;

  return {
    done: done,
    value: value
  };
};

/**
 * exports module
 */
module.exports = {
  Iterator: Iterator,
  series: function(array, iterator, done, context) {
    // create a new iterator
    var it = new Iterator(array);

    // bind context
    if (arguments.length >= 4) {
      iterator = iterator.bind(context);
      done = done.bind(context);
    }

    /**
     * walk iterator
     * @param it
     */
    function walk(it) {
      var item = it.next();

      if (item.done) {
        done();
      } else {
        iterator(item.value, function() {
          nextTick(function() {
            walk(it);
          });
        }, it.index);
      }
    }

    // run walk
    walk(it);
  }
};

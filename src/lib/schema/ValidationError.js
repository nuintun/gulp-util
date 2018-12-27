/**
 * @module ValidationError
 * @license MIT
 * @version 2018/12/27
 */

/**
 * @class ValidationError
 * @extends Error
 */
export default class ValidationError extends Error {
  /**
   * @constructor
   * @param {Array} errors
   * @param {string} name
   */
  constructor(errors, name) {
    super();

    this.name = 'ValidationError';

    this.message = `${name || ''} Invalid Options\n\n`;

    this.errors = errors.map(error => {
      error.dataPath = error.dataPath.replace(/\//g, '.');

      return error;
    });

    this.errors.forEach(error => {
      this.message += `options${error.dataPath} ${error.message}\n`;
    });

    Error.captureStackTrace(this, this.constructor);
  }
}

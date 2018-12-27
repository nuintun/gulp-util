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
      if (error.keyword === 'additionalProperties') {
        error.dataPath = error.params.additionalProperty;
      } else {
        error.dataPath = error.dataPath.replace(/\//g, '.');
      }

      return error;
    });

    this.errors.forEach(error => {
      if (error.keyword === 'additionalProperties') {
        this.message += `unknown options: ${error.dataPath}\n`;
      } else {
        this.message += `options${error.dataPath} ${error.message}\n`;
      }
    });

    Error.captureStackTrace(this, this.constructor);
  }
}

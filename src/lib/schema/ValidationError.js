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

    this.message = `${name || ''}\n\n`;

    this.errors = errors.map(error => {
      let dataPath = error.dataPath.replace(/^\//, '').replace(/\//g, '.');

      switch (error.keyword) {
        case 'required':
          const required = error.params.missingProperty;

          dataPath = dataPath ? `${dataPath}.${required}` : required;

          this.message += `Missing options: ${dataPath}\n`;
          break;
        case 'additionalProperties':
          const unknown = error.params.additionalProperty;

          dataPath = dataPath ? `${dataPath}.${unknown}` : unknown;

          this.message += `Unknown options: ${dataPath}\n`;
          break;
        default:
          this.message += `Invalid options: ${dataPath} ${error.message}\n`;
      }

      return error;
    });

    Error.captureStackTrace(this, this.constructor);
  }
}

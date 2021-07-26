/**
 * @module ValidationError
 * @license MIT
 * @author nuintun
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
      let instancePath = error.instancePath.replace(/^\//, '').replace(/\//g, '.');

      switch (error.keyword) {
        case 'required':
          const required = error.params.missingProperty;

          instancePath = instancePath ? `${instancePath}.${required}` : required;

          this.message += `Missing options: ${instancePath}\n`;
          break;
        case 'additionalProperties':
          const unknown = error.params.additionalProperty;

          instancePath = instancePath ? `${instancePath}.${unknown}` : unknown;

          this.message += `Unknown options: ${instancePath}\n`;
          break;
        default:
          this.message += `Invalid options: ${instancePath} ${error.message}\n`;
      }

      return error;
    });

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @module index
 * @license MIT
 * @version 2018/12/27
 */

import Ajv from 'ajv';
import errors from 'ajv-errors';
import keywords from 'ajv-keywords';
import ValidationError from './ValidationError';

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  jsonPointers: true
});

errors(ajv);
keywords(ajv, ['instanceof', 'typeof']);

/**
 * @function validateOptions
 * @param {Object} schema
 * @param {Object} options
 * @param {string} name
 * @returns {boolean}
 */
export default function validateOptions(schema, options, name) {
  if (!ajv.validate(schema, options)) {
    throw new ValidationError(ajv.errors, name);
  }

  return true;
}

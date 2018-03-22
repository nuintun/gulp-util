/**
 * @module attrs
 * @license MIT
 * @version 2018/03/22
 */

import typpy from './typpy';

/**
 * @function formatMessage
 * @param {any} message
 * @param {string} keys
 * @returns {string|null}
 */
function formatMessage(message, keys) {
  return typpy(message, String) ? message.replace(/%s/g, keys) : null;
}

/**
 * @function checkTypesOK
 * @param {Array} types
 * @param {any} value
 * @returns {boolean}
 */
function checkTypesOK(types, value) {
  return types.some(type => typpy(value, type));
}

/**
 * @function matchRules
 * @param {any} source
 * @param {string} sourceKey
 * @param {Object} rules
 * @param {string} ruleKey
 */
function matchRules(source, sourceKey, rules, ruleKey) {
  const rule = rules[ruleKey];

  // Required
  if (rule.required && !source.hasOwnProperty(sourceKey)) {
    throw new Error(formatMessage(rule.onRequired, ruleKey) || `Attr ${ruleKey} is required!`);
  }

  // Get current
  const current = source[sourceKey];
  // Get types
  const types = Array.isArray(rule.type) ? rule.type : [rule.type];

  // Not passed
  if (!checkTypesOK(types, current)) {
    // Has default value
    if (rule.hasOwnProperty('default') && checkTypesOK(types, rule.default)) {
      return (source[sourceKey] = rule.default);
    }

    // Throw error
    throw new TypeError(formatMessage(rule.onTypeError, ruleKey) || `Attr ${ruleKey} is invalid!`);
  }
}

/**
 * @function attrs
 * @param {Object} source
 * @param {Object} rules
 * @returns {object}
 */
export default function attrs(source, rules) {
  // Visit cache
  const visited = new Set();

  // Visit rules
  Object.keys(rules).forEach(key => {
    if (typpy(key, String)) {
      let current = source;
      const attrs = key.split('.');

      // Visit attrs
      return attrs.reduce((attrs, key) => {
        // Add key
        attrs.push(key);

        // Get keys
        const keys = attrs.join('.');

        // Hit cache
        if (!visited.has(keys)) {
          // Add cache
          visited.add(keys);
          // Match rules
          matchRules(current, key, rules, keys);
        }

        // Move current cursor
        current = current[key];

        // Return attrs
        return attrs;
      }, []);
    }

    // Rule key not a string
    matchRules(source, key, rules, key);
  });

  return source;
}

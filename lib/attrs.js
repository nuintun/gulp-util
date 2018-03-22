/**
 * @module attrs
 * @license MIT
 * @version 2018/03/22
 */

import typpy from './typpy';

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
  const message = typpy(rule.message, String) ? rule.message.replace(/%s/g, ruleKey) : null;

  // Required
  if (rule.required && !source.hasOwnProperty(sourceKey)) {
    throw new Error(message || `Attr ${ruleKey} is required!`);
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
    throw new TypeError(message || `Attr ${ruleKey} not valid!`);
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
      return attrs.reduce((attrs, attr) => {
        attrs.push(attr);

        // Get key
        const key = attrs.join('.');

        // Hit cache
        if (visited.has(key)) return attrs;

        // Add cache
        visited.add(key);

        // Match rules
        matchRules(current, attr, rules, key);

        // Move current cursor
        current = current[attr];

        return attrs;
      }, []);
    }

    // Rule key not a string
    matchRules(source, key, rules, key);
  });

  return source;
}

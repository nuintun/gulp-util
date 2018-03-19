/**
 * @module debug
 * @license MIT
 * @version 2018/03/08
 */

import chalk from 'chalk';
import debug from 'debug';
import { normalize, path2cwd } from './utils';

// File path relative cwd
debug.formatters.C = function(value) {
  return chalk.magenta(path2cwd(value));
};

// File path
debug.formatters.f = function(value) {
  return chalk.magenta(value);
};

// Normalized file path
debug.formatters.F = function(value) {
  return chalk.magenta(normalize(value));
};

export default function debugging(namespace) {
  const logger = debug(namespace);

  // Set debug color use 6
  logger.color = 6;

  return logger;
}

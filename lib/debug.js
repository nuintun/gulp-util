/**
 * @module debug
 * @license MIT
 * @version 2018/03/08
 */

import chalk from 'chalk';
import debug from 'debug';
import { normalize, pathFromCwd } from './utils';

// File path relative cwd
debug.formatters.r = function(value) {
  return chalk.reset.magenta(pathFromCwd(value));
};

// File path
debug.formatters.p = function(value) {
  return chalk.reset.magenta(value);
};

// Normalized file path
debug.formatters.P = function(value) {
  return chalk.reset.magenta(normalize(value));
};

export default function(namespace) {
  const logger = debug(namespace);

  // Set debug color use 6
  logger.color = 6;

  return logger;
}

/**
 * @module logger
 * @license MIT
 * @version 2018/03/07
 */

'use strict';

import chalk from 'chalk';
import { apply } from './utils';
import timestamp from 'time-stamp';

/**
 * @function getTimestamp
 * @returns {string}
 */
function getTimestamp() {
  return `[${chalk.reset.gray(timestamp('HH:mm:ss'))}]`;
}

/**
 * @function log
 */
export default function log() {
  const time = getTimestamp();

  process.stdout.write(`${time} `);
  apply(console.log, console, arguments);

  return this;
}

/**
 * @function info
 */
export function info() {
  const time = getTimestamp();

  process.stdout.write(`${time} `);
  apply(console.info, console, arguments);

  return this;
}

/**
 * @function dir
 */
export function dir() {
  const time = getTimestamp();

  process.stdout.write(`${time} `);
  apply(console.dir, console, arguments);

  return this;
}

/**
 * @function warn
 */
export function warn() {
  const time = getTimestamp();

  process.stderr.write(`${time} `);
  apply(console.warn, console, arguments);

  return this;
}

/**
 * @function error
 */
export function error() {
  const time = getTimestamp();

  process.stderr.write(`${time} `);
  apply(console.error, console, arguments);

  return this;
}

/**
 * @module index
 * @license MIT
 * @version 2017/11/10
 */

import * as inspectAttrs from 'inspect-attrs';

// Get typpy
const { typpy } = inspectAttrs;

// Export
export * from './lib/utils';
export { inspectAttrs, typpy };
export { default as chalk } from 'chalk';
export { default as logger } from './lib/logger';
export { default as promisify } from './lib/promisify';
export { default as VinylFile } from './lib/vinyl-file';

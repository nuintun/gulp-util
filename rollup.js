/**
 * @module rollup
 * @license MIT
 * @version 2017/10/24
 */

'use strict';

const fs = require('fs-extra');
const rollup = require('rollup');
const pkg = require('./package.json');

/**
 * @function build
 * @param {Object} inputOptions
 * @param {Object} outputOptions
 */
async function build(inputOptions, outputOptions) {
  await fs.remove('index.js');

  const bundle = await rollup.rollup(inputOptions);

  await bundle.write(outputOptions);

  console.log(`Build ${outputOptions.file} success!`);
}

const banner = `/**
 * @module ${pkg.name}
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

const inputOptions = {
  input: 'src/index.js',
  preferConst: true,
  external: ['fs', 'path', 'util', 'crypto', 'vinyl', 'debug', 'chalk', 'time-stamp', 'inspect-attrs', 'is-url']
};

const outputOptions = {
  banner,
  format: 'cjs',
  strict: true,
  indent: true,
  legacy: true,
  interop: false,
  file: 'index.js'
};

build(inputOptions, outputOptions);

/**
 * @module rollup
 * @license MIT
 * @version 2017/10/24
 */

'use strict';

const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-es');
const pkg = require('./package.json');

const banner = `/**
 * @module ${pkg.name}
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

rollup
  .rollup({
    input: 'index.js',
    external: ['fs', 'path', 'util', 'vinyl', 'debug', 'chalk', 'time-stamp']
  })
  .then(function(bundle) {
    try {
      fs.statSync('dist');
    } catch (e) {
      // no such file or directory
      fs.mkdirSync('dist');
    }

    bundle
      .generate({
        format: 'cjs',
        strict: true,
        indent: true,
        interop: false,
        banner: banner
      })
      .then(function(result) {
        const src = 'dist/index.src.js';
        const min = 'dist/index.js';

        fs.writeFileSync(src, result.code);
        console.log(`  Build ${src} success!`);

        result = uglify.minify(result.code, { ecma: 6 });

        fs.writeFileSync(min, banner + result.code);
        console.log(`  Build ${min} success!`);
      })
      .catch(function(error) {
        console.error(error);
      });
  })
  .catch(function(error) {
    console.error(error);
  });

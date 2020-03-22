import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

const pkg = require('./package.json');

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        name: pkg.name,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        name: pkg.name,
      },
      {
        file: 'dist/index.min.js',
        format: 'cjs',
        name: pkg.name,
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
]

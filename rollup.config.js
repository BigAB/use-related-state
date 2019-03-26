import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    external: ['react'],
    output: [
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: pkg.main, format: 'cjs', sourcemap: true },
    ],
  },
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'useRelatedState',
      file: pkg.browser,
      format: 'umd',
      globals: {
        react: 'React',
      },
    },
    plugins: [resolve(), commonjs()],
    external: ['react'],
  },
];

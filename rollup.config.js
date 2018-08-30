import { uglify } from 'rollup-plugin-uglify'
import clear from 'rollup-plugin-clear'
import filesize from 'rollup-plugin-filesize'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json';

const input = 'src/index.ts'
const sharedPlugins = [typescript()]
const commonConfig = {
  input,
  plugins: sharedPlugins
}

export default [
  {
    ...commonConfig,
    output: {
      name: 'Smarkdown',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      clear({
        targets: ['dist']
      }),
      ...sharedPlugins,
      uglify(),
      filesize(),
    ]
  },
  {
    ...commonConfig,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ]
  }
]
import { uglify } from 'rollup-plugin-uglify'
import clear from 'rollup-plugin-clear'
import filesize from 'rollup-plugin-filesize'
import license from 'rollup-plugin-license'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

const banner = `/*!
* Smarkdown v${pkg.version}
* (c) 2018-present ${pkg.author}
* Released under the ${pkg.license} License.
*/`

const input = 'src/index.ts'
const sharedPlugins = [
  typescript(),
  license({
    banner
  })
]
const commonConfig = { input }

export default [
  {
    ...commonConfig,
    output: {
      name: 'Smarkdown',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      ...sharedPlugins,
      clear({
        targets: ['dist']
      }),
      uglify(),
      filesize(),
    ]
  },
  {
    ...commonConfig,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      ...sharedPlugins
    ]
  }
]
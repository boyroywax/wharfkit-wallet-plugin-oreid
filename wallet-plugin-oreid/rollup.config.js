import fs from 'fs'
import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import resolve from "@rollup/plugin-node-resolve"
import nodePolyfills from 'rollup-plugin-polyfill-node'
import commonjs from '@rollup/plugin-commonjs'


import pkg from './package.json'

const name = pkg.name
const license = fs.readFileSync('LICENSE').toString('utf-8').trim()
const banner = `
/**
 * ${name} v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim()

const external = Object.keys(pkg.peerDependencies)

/** @type {import('rollup').RollupOptions} */
export default [
    {
        input: 'src/index.ts',
        output: {
            banner,
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            exports: "named",
        },
        plugins: [typescript({target: 'es6'}), json(), resolve({
            jsnext: true,
            main: true,
            browser: true,
          }), nodePolyfills(),
        commonjs()],
        external,
    },
    {
        input: 'src/index.ts',
        output: {
            banner,
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        },
        plugins: [typescript({target: 'es2020'}), json(), resolve({
            jsnext: true,
            main: true,
            browser: true,
          }), commonjs(), nodePolyfills()],
        external,
    },
    {
        input: 'src/index.ts',
        output: {banner, file: pkg.types, format: 'esm'},

        plugins: [dts()],
    },
]

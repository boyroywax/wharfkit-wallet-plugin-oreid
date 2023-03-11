import resolve from '@rollup/plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import {terser} from 'rollup-plugin-terser'
import gzipPlugin from 'rollup-plugin-gzip'
import nodePolyfills from 'rollup-plugin-polyfill-node'

import pkg from './package.json'

const replaceVersion = replace({
    preventAssignment: true,
    __ver: pkg.version,
})

const sveltePreprocessOptions = {
    defaults: {
        script: 'typescript',
    },
    sourceMap: true,
}

export default [
    {
        input: 'src/index.ts',
        output: {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
            globals: {
                crypto: 'crypto-browserify'
            }
        },
        plugins: [
            replaceVersion,
            svelte({
                preprocess: sveltePreprocess(sveltePreprocessOptions),
                emitCss: false,
            }),
            resolve({
                browser: true,
                // crypto: true,
                // http: true,
                // https: true,
                // url: true,
                // stream: true,
                // assert: true,
                // tty: true,
                dedupe: ['svelte'],
            }),
            json(),
            typescript({target: 'es6'}),
            // terser(),
            // gzipPlugin(),
            nodePolyfills()
        ],
        external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
    },
    {
        input: 'src/index.ts',
        output: {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            replaceVersion,
            svelte({
                preprocess: sveltePreprocess(sveltePreprocessOptions),
                emitCss: false,
            }),
            resolve({
                browser: true,
                dedupe: ['svelte'],
            }),
            json(),
            typescript({target: 'es2020'}),
            // terser(),
            // gzipPlugin(),
            nodePolyfills()
        ],
        external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
    },
    {
        input: 'src/index.ts',
        output: {file: pkg.types, format: 'esm', sourceMap: true},
        plugins: [
            replaceVersion,
            svelte({
                preprocess: sveltePreprocess(sveltePreprocessOptions),
                emitCss: false,
            }),
            resolve({
                browser: true,
                dedupe: ['svelte'],
            }),
            typescript({target: 'es6'}),
            dts(),
            nodePolyfills()
        ],
    },
]

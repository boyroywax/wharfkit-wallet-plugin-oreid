import resolve from '@rollup/plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import {terser} from 'rollup-plugin-terser'
import gzipPlugin from 'rollup-plugin-gzip'
// import nodePolyfills from 'rollup-plugin-polyfill-node'
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
                'crypto': require.resolve("crypto-browserify"),
                'http': require.resolve("stream-http"),
                'https': require.resolve("https-browserify"),
                'url': require.resolve("url"),
                'stream': require.resolve("stream-browserify"),
                'assert': require.resolve("assert"),
                'tty': 'tty',
                'util': 'util',
                'os': require.resolve("os-browserify"),
                'zlib': 'zlib'
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
                dedupe: ['svelte'],
            }),
            json(),
            typescript({target: 'es6'}),
            // terser(),
            // gzipPlugin(),
            // nodePolyfills()
        ],
        external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
    },
    {
        input: 'src/index.ts',
        output: {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
            globals: {
                'crypto': require.resolve("crypto-browserify"),
                'http': require.resolve("stream-http"),
                'https': "https-browserify",
                'url': require.resolve("url"),
                'stream': require.resolve("stream-browserify"),
                'assert': require.resolve("assert"),
                'tty': 'tty',
                'util': 'util',
                'os': require.resolve("os-browserify"),
                'zlib': 'zlib'
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
        output: {
            file: pkg.types,
            format: 'esm',
            globals: {
                'crypto': require.resolve("crypto-browserify"),
                'http': require.resolve("stream-http"),
                'https': "https-browserify",
                'url': require.resolve("url"),
                'stream': require.resolve("stream-browserify"),
                'assert': require.resolve("assert"),
                'tty': 'tty',
                'util': 'util',
                'os': require.resolve("os-browserify"),
                'zlib': 'zlib'
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
                dedupe: ['svelte'],
            }),
            typescript({target: 'es6'}),
            dts(),
            nodePolyfills()
        ],
    },
]

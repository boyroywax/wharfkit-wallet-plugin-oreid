external: [
    'crypto',
    'http',
    'https',
    'url',
    'stream',
    'assert',
    'tty',
    'util',
    'os',
    'zlib'
],

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

"dependencies": {
    "assert": "^2.0.0",
    "crypto-browserify": "^3.12.0",
    "http-browserify": "^1.7.0",
    "https-browserify": "^1.0.0",
    "os-browserify": "^0.3.0",
    "rollup-plugin-polyfill-node": "^0.12.0",
    "stream-browserify": "^3.0.0",
    "stream-http": "^3.2.0",
    "url": "^0.11.0"
}
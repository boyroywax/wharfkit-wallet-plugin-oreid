# wallet-plugin-oreid work repo

## Develop ORE ID Wharf Plugin

### Setup
#### Clone the Repo
1. ```git clone <this repo.git>```
2. ```cd wharfkit-wallet-plugin-oreid```

#### Link the wallet-plugin to web-ui-renderer-oreid-sample
3. ```cd wallet-plugin-oreid```
4. ```make```
5. ```yarn link```
6. ```cd ../web-ui-renderer-oreid-sample```
7. ```yarn link "wallet-plugin-oreid"```

#### Run the sample
8. ```yarn run dev```

### Editing the Wallet Plugin
1. Edit the files in the ```src``` folder.
2. ```make```
3. The sample should automatically refresh with the new changes.

## Implement ORE ID Wharf Plugin into your project

### Install dependencies
#### Append the devDependencies section in ```web-ui-renderer-oreid-sample/package.json```
```json
...
    "devDependencies": {
        ...
        "https-browserify": "1.0.0",
        "crypto-browserify": "3.12.0",
        "stream-browserify": "3.0.0",
        "http-browserify": "1.7.0",
        "stream-http": "3.2.0",
        "os-browserify": "^0.3.0",
        "rollup-plugin-node-polyfills2": "^0.1.0"
    }
```
#### Install the deps in the ```web-ui-renderer-oreid-sample``` folder
```shell
yarn install
```

### Add nodePolyfills()
#### Declare the import
```javascript
...
import nodePolyfills from 'rollup-plugin-node-polyfills2'
...
```

#### Append plugins section of ```web-ui-renderer-oreid-sample/test/rollup.config.js```
```javascript
export default {
    ...
    plugins: [
        nodePolyfills(),
        ...
    ],
    ...
}

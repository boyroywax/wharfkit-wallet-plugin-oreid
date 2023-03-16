# wallet-plugin-oreid work repo

## Index
```text
A.) Develop ORE ID Wharf Plugin
    1.) Quickstart
    2.) Project Synopsis
        a.) Features
        b.) Ideas
        c.) To-Dos
    3.) Setup
    4.) Editing the Wallet Plugin
B.) Implement ORE ID Wharf Plugin into `web-ui-renderer-oreid-sample`
    1.) Install dependencies
    2.) Add nodePolyfills()
    3.) Add the ORE ID Wallet WebUIRenderer
    4.) Build and Run the sample application
C.) Adding ORE ID Wharf Wallet Plugin to ```example-vite-svelte-ts```
```

---

## A. Develop ORE ID Wharf Plugin

### Quick Start
[GitPod WorkSpace](https://gitpod.io/#https://github.com/boyroywax/wharfkit-wallet-plugin-oreid)

### Project Synopsis

#### Features
```text
✅ Login - ORE ID Auth Login/SignUp
✅ Login - Blockchain Selector
⛔️ Login - Oauth Provider Selector
⛔️ Login - Permission Selector
⛔️ Login - Auto-login
⛔️ Login - ORE ID Auth Reusable account support
⛔️ Login - Load contract whitelist upon login
⛔️ Transaction - ORE ID Non-Custodial Transaction Signing
⛔️ Transaction - Support for Transact plugins
⛔️ Transaction - Whitelist contract actions for silent signing
⛔️ Transaction - Silent Signing/Whitelist Auto Signing
⛔️ ORE ID - Pass in oreId object to plugin
⛔️ ORE ID - Pass in appId/Public API Key to oreId object
```

#### Ideas
```text
💡 Advanced - Delayed Account creation
💡 Advanced - Custodial Account support
💡 Advanced - Support for ORE Network (Testnet and Mainnet) (PR for @wharfkit/session)
```

#### To-Do's
```text
🔵 Publish `teamaikon/wallet-plugin-oreid` package to NPM
🔵 Developer Documentation for Integration of `teamaikon/wallet-plugin-oreid` into project using `@wharfkit/web-ui-renderer`
🔵 Implement Reusable accounts as default account structure
🔵 Implement Whitelisting functionality for silent/auto signing
🟠 Clean up old eosjs dependencies, upgrade to greymass/eosjs
🟠 Remove bloated and old dependencies in oreid-js package
🟠 Re-useable account work for ORE ID
```

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


---


## B. Implement ORE ID Wharf Plugin into ```web-ui-renderer-oreid-sample```

### Install dependencies
1. Append the devDependencies and peerDependencies section in ```web-ui-renderer-oreid-sample/package.json```
```json
...
    "peerDependencies": {
        ...
        "oreid-js": "^4.5.0",
        "oreid-webpopup": "^2.2.5-beta.0"
    },
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
2.  Install the deps in the ```web-ui-renderer-oreid-sample``` folder
```shell
yarn install
```

### Add nodePolyfills()
3. Declare the import
```javascript
...
import nodePolyfills from 'rollup-plugin-node-polyfills2'
...
```

4. Append plugins section of ```web-ui-renderer-oreid-sample/test/rollup.config.js```
```javascript
export default {
    ...
    plugins: [
        nodePolyfills(),
        ...
    ],
    ...
}
```

### Add the ORE ID Wallet WebUIRenderer
5. Make updates to ```web-ui-renderer-oreid-sample/test/public/index.html```
```javascript
...
const sessionKit = new SessionKit({
    ...
    walletPlugins: [
        ...
        new WebUIRenderer.WalletPluginOreId()
    ]
...
```

### Build and run the sample application
```shell
cd web-ui-renderer-oreid-sample
yarn run build
yarn run serve
```

---

## C. Adding ORE ID Wharf Wallet Plugin to ```example-vite-svelte-ts```

1. Edit ```src/lib/Login.svelte``` file to include ORE ID
```typescript
import { WalletPluginOreId } from "wallet-plugin-oreid"
```

2. Add the ```WalletPluginOreid()``` to ``SessionKit``` 
```typescript
...
    const sessionKit = new SessionKit({
    ...
        walletPlugins: [
            ...
            new WalletPluginOreId()
        ],
    ...
    })
...
```
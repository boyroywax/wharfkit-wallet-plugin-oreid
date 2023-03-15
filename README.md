# wallet-plugin-oreid work repo

## Develop ORE ID

### Setup
Clone the Repo
1. ```git clone <this repo.git>```
2. ```cd wharfkit-wallet-plugin-oreid```

Link the wallet-plugin to web-ui-renderer-oreid-sample
3. ```cd wallet-plugin-oreid```
4. ```make```
5. ```yarn link```
6. ```cd ../web-ui-renderer-oreid-sample```
7. ```yarn link "wallet-plugin-oreid"```

Run the sample
8. ```yarn run dev```

### Editing the Wallet Plugin
1. Edit the files in the ```src``` folder.
2. ```make```
3. The sample should automatically refresh with the new changes.
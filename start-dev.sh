#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
source ~/.bashrc
nvm use 18

cd wallet-plugin-oreid
yarn install
yarn link

cd ../example-vite-svelte-ts
yarn install
yarn link "wallet-plugin-oreid"

cd ../web-ui-renderer-oreid-sample
yarn install
yarn link "wallet-plugin-oreid"
yarn run dev
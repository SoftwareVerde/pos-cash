#!/bin/bash

mkdir -p tmp/libauth
cd tmp/libauth

npm install -g browserify
npm install @bitauth/libauth
echo "global.window.libauth = require('@bitauth/libauth')" > main.js
browserify main.js -o libauth.js

echo $(pwd)/libauth.js

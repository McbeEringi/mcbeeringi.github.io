#!/bin/sh
git clone https://github.com/codemirror/dev tmp
cd tmp
node bin/cm.js install
git clone https://github.com/codemirror/website
cd website
npm i
npm run build
cd ../../
mv -f tmp/website/output/try/mods/* ./
rm -rf tmp
ls>index.txt
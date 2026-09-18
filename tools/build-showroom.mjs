// Rebuild in an isolated tooling directory: npm install --prefix /tmp/aestyve-tools three@0.186.0 esbuild@0.25.12
// AESTYVE_TOOLING=/tmp/aestyve-tools node tools/build-showroom.mjs
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(resolve(process.env.AESTYVE_TOOLING||'.','package.json'));
const {build}=require('esbuild');
await build({entryPoints:['assets/aestyve-webgl-source.js'],outfile:'assets/aestyve-webgl.js',bundle:true,format:'esm',minify:true,legalComments:'linked',alias:{three:require.resolve('three')},target:['es2020']});

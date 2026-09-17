import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'dist');
const sdk='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/';
const assets=[
 ['vendor/mediapipe/vision_bundle.mjs',sdk+'vision_bundle.mjs'],
 ['vendor/mediapipe/wasm/vision_wasm_internal.js',sdk+'wasm/vision_wasm_internal.js'],
 ['vendor/mediapipe/wasm/vision_wasm_internal.wasm',sdk+'wasm/vision_wasm_internal.wasm'],
 ['vendor/mediapipe/wasm/vision_wasm_nosimd_internal.js',sdk+'wasm/vision_wasm_nosimd_internal.js'],
 ['vendor/mediapipe/wasm/vision_wasm_nosimd_internal.wasm',sdk+'wasm/vision_wasm_nosimd_internal.wasm'],
 ['vendor/face_landmarker.task','https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task']
];
async function download(url){let error;for(let attempt=0;attempt<3;attempt++){try{const response=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error(`${response.status}: ${url}`);const data=Buffer.from(await response.arrayBuffer());if(data.length<1024)throw Error(`Unexpected asset: ${url}`);return data;}catch(e){error=e;await new Promise(r=>setTimeout(r,500*(attempt+1)));}}throw error;}
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css','app.js','engine.js','skin.js','content.js','gels.json','health.html','health.js'])await copyFile(resolve(root,name),resolve(out,name));
// GLSL uniforms/varyings must have matching precision across shader stages.
let engine=await readFile(resolve(out,'engine.js'),'utf8');
const shaderStart='const VS=`attribute';
if(engine.split(shaderStart).length!==2)throw Error('Review vertex shader precision before building');
engine=engine.replace(shaderStart,'const VS=`precision mediump float;attribute');
await writeFile(resolve(out,'engine.js'),engine);
// Fail-closed upgrade transforms for the reviewed v0.2 source module.
// Runtime behaviour is tested against dist/, the only deployment directory.
let app=await readFile(resolve(out,'app.js'),'utf8');
const upgrades=[
 ["const base='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';","const base='./vendor/mediapipe';"],
 ["modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'","modelAssetPath:'./vendor/face_landmarker.task'"],
 ['const was={before:state.before,mode:view.mode,','const was={before:view.before,mode:view.mode,'],
 ["view?.setMesh(demoMesh());view?.resetCamera();","view?.setMesh(demoMesh());view?.resetCamera();if(view)$('#geometry-count').textContent=`${view.base.length/3} VERTICES / ${view.mesh.indices.length/3} TRIANGLES`;"],
 ["a.download=name;a.click();setTimeout","a.download=name;document.body.append(a);a.click();a.remove();setTimeout"],
 ["$('#upload').disabled=b||!$('#consent').checked;","$('#upload').disabled=b||!view||!$('#consent').checked;"],
 ["box.append(p);return;}for(const item of optionsForConcern","box.append(p);return;}const note=document.createElement('p');note.className='subtle';note.textContent=tr('riskNotClearance');box.append(note);for(const item of optionsForConcern"],
 ["releasePhoto();const pending=modelPromise;","releasePhoto();$('#consent').checked=false;setBusy(false);const pending=modelPromise;"]
];
for(const [from,to] of upgrades){if(app.split(from).length!==2)throw Error('Source upgrade anchor changed; review before building: '+from);app=app.replace(from,to);}
await writeFile(resolve(out,'app.js'),app);
const html=(await readFile(resolve(out,'index.html'),'utf8')).replace("script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net; connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com;","script-src 'self' 'wasm-unsafe-eval'; connect-src 'self';");
await writeFile(resolve(out,'index.html'),html.replace('<footer>','<p><a href="./health.html">브라우저 환경 점검 · Browser check · 环境检查</a></p><footer>'));
// The deployable application uses only same-origin SDK/model requests, after consent.
let content=await readFile(resolve(out,'content.js'),'utf8');
content=content.replace('모델·폰트 다운로드 시 외부 CDN에 접속합니다.','얼굴 모델은 이 사이트에서 내려받고, 폰트는 외부 CDN에 요청합니다.');
content=content.replace('Model and font downloads contact external CDNs.','The face model is downloaded from this site; fonts are requested from an external CDN.');
content=content.replace('模型与字体下载会连接外部 CDN。','面部模型从本站下载，字体会请求外部 CDN。');
await writeFile(resolve(out,'content.js'),content);
const manifest=[];
await Promise.all(assets.map(async([path,url])=>{const data=await download(url);if(path.endsWith('.wasm')&&!data.subarray(0,4).equals(Buffer.from([0,97,115,109])))throw Error('Invalid WASM: '+path);const target=resolve(out,path);await mkdir(dirname(target),{recursive:true});await writeFile(target,data);manifest.push({path,source:url,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}));
manifest.sort((a,b)=>a.path.localeCompare(b.path));
await writeFile(resolve(out,'asset-manifest.json'),JSON.stringify({version:'0.3.0',sdkVersion:'0.10.21',modelVersion:'1',builtAt:new Date().toISOString(),assets:manifest},null,2));
await writeFile(resolve(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
await copyFile(resolve(root,'THIRD_PARTY.md'),resolve(out,'THIRD_PARTY.md'));
await writeFile(resolve(out,'release.json'),JSON.stringify({version:'0.3.0',purpose:'private technical evaluation',clinicalValidation:false,photoUpload:false,sourceCommit:process.env.GITHUB_SHA||process.env.VERCEL_GIT_COMMIT_SHA||'local'},null,2));
console.log(`Built ${out}. ${manifest.length} SDK/model assets are self-hosted. No font binaries copied. Enable authenticated preview before any user test.`);

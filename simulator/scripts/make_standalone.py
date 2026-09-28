"""Package verified dist as a self-contained private evaluation HTML.
No font binaries or patient images are embedded. ML assets decode on demand.
Requires a modern browser with DecompressionStream and WebAssembly.
"""
from pathlib import Path
import base64, gzip, hashlib, json, re, sys
site=Path(sys.argv[1]);out=Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
required=['app.js','engine.js','skin.js','content.js','gels.json','style.css','index.html','vendor/mediapipe/vision_bundle.mjs','vendor/face_landmarker.task','vendor/mediapipe/wasm/vision_wasm_internal.js','vendor/mediapipe/wasm/vision_wasm_internal.wasm','vendor/mediapipe/wasm/vision_wasm_nosimd_internal.js','vendor/mediapipe/wasm/vision_wasm_nosimd_internal.wasm']
assert all((site/f).is_file() for f in required), 'Use complete verified dist including vendor assets'
def encode(data):return base64.b64encode(gzip.compress(data,compresslevel=9,mtime=0)).decode()
assets={k:encode((site/k).read_bytes()) for k in required if k not in ['style.css','index.html']}
app=(site/'app.js').read_text()
start=app.index('async function loadModel()');end=app.index('function timeout(',start)
app=app[:start]+'''async function loadModel(){
 if(!modelPromise)modelPromise=window.AESTYVE_LOCAL.loadFaceModel().catch(error=>{modelPromise=null;throw error;});
 return modelPromise;
}
'''+app[end:]
app=app.replace("fetch('./gels.json').then(r=>{if(!r.ok)throw Error('assets');return r.json();})", "window.AESTYVE_LOCAL.text('gels.json').then(JSON.parse)")
assert "fetch('./gels.json')" not in app
assets['app.js']=encode(app.encode())
content=(site/'content.js').read_text()
content += '''\nstrings.privacy = [
'이 단일 HTML은 사진·랜드마크·설문을 페이지 메모리에서 처리하며 서버로 보내지 않습니다. 얼굴 모델은 이 파일에 포함되어 있습니다. 에스코어드림 폰트를 위해 외부 CDN에 접속할 수 있습니다. 삭제·새로고침으로 세션이 사라지며, 직접 저장한 파일은 기기에 남습니다.',
'This single HTML processes photos, landmarks and answers in page memory, not on a server. The face model is embedded in this file. The S-Core Dream font may contact an external CDN. Deletion or refresh clears the session; explicitly downloaded files remain on your device.',
'此单个 HTML 在页面内存中处理照片、关键点和问卷，不上传服务器。文件内置面部模型，S-Core Dream 字体可能连接外部 CDN。删除或刷新将清除会话，主动下载的文件仍留在本机。'];
strings.loading=['파일에 포함된 얼굴 모델을 준비하는 중… 사진은 전송되지 않습니다.','Preparing the embedded face model… your photo is not transmitted.','正在准备内置面部模型…照片不会上传。'];
strings.loadError=['얼굴 모델을 시작하지 못했습니다. 이 HTML 파일을 최신 PC Chrome에서 직접 열어 다시 시도하세요. 사진은 전송하지 않았습니다.','The face model could not start. Open this HTML directly in a current desktop Chrome browser and try again. No photo was transmitted.','面部模型启动失败，请用新版桌面 Chrome 直接打开此 HTML 后重试。照片未上传。'];
strings.lab=['3D 얼굴 탐색 · 로컬 웹 테스트','3D face exploration · local web test','3D 面部探索 · 本地网页测试'];
'''
assets['content.js']=encode(content.encode())
bootstrap=r'''
(async()=>{
 'use strict';
 const packed=JSON.parse(document.getElementById('asset-pack').textContent);
 document.getElementById('asset-pack').remove();
 const cache=new Map(),urls=[];
 const alertBox=document.getElementById('local-error');
 async function bytes(name){
  if(!packed[name])throw Error('Missing embedded asset: '+name);
  const encoded=atob(packed[name]),bin=new Uint8Array(encoded.length);
  for(let i=0;i<bin.length;i++)bin[i]=encoded.charCodeAt(i);
  return new Uint8Array(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
 }
 const text=async name=>new TextDecoder().decode(await bytes(name));
 function url(data,type){const u=URL.createObjectURL(new Blob([data],{type}));urls.push(u);return u;}
 async function moduleUrl(name){
  if(cache.has(name))return cache.get(name);
  const promise=(async()=>{
   let code=await text(name);
   for(const dependency of ['engine.js','skin.js','content.js']){
    if(code.includes(`'./${dependency}'`))code=code.split(`'./${dependency}'`).join(JSON.stringify(await moduleUrl(dependency)));
   }
   return url(code,'text/javascript');
  })();cache.set(name,promise);return promise;
 }
 window.AESTYVE_LOCAL={text,async loadFaceModel(){
  const sdk=await import(await moduleUrl('vendor/mediapipe/vision_bundle.mjs'));
  const simd=await sdk.FilesetResolver.isSimdSupported();
  const stem=simd?'vision_wasm_internal':'vision_wasm_nosimd_internal';
  const loader=url(await bytes(`vendor/mediapipe/wasm/${stem}.js`),'text/javascript');
  const binary=url(await bytes(`vendor/mediapipe/wasm/${stem}.wasm`),'application/wasm');
  return sdk.FaceLandmarker.createFromOptions({wasmLoaderPath:loader,wasmBinaryPath:binary},
   {baseOptions:{modelAssetBuffer:await bytes('vendor/face_landmarker.task'),delegate:'CPU'},
    runningMode:'IMAGE',numFaces:2,minFaceDetectionConfidence:.7,minFacePresenceConfidence:.7,
    outputFaceBlendshapes:false,outputFacialTransformationMatrixes:false});
 }};
 try{
  if(typeof DecompressionStream==='undefined'||typeof WebAssembly==='undefined')throw Error('Modern browser required');
  await import(await moduleUrl('app.js'));
  document.getElementById('local-loading').hidden=true;
 }catch(error){
  alertBox.hidden=false;
  alertBox.textContent='시작하지 못했습니다. 파일을 PC Chrome에서 직접 열어 주세요. / Open this file in a current desktop Chrome browser. '+String(error);
  document.getElementById('local-loading').hidden=true;
 }
 // URLs remain valid across BFCache restores, are browser-memory-only, and
 // are reclaimed when this document is discarded. app.js erases user data on pagehide.
})();
'''
nonce=hashlib.sha256(bootstrap.encode()).hexdigest()[:32]
html=(site/'index.html').read_text()
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>',f'''<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-{nonce}' blob: 'wasm-unsafe-eval'; connect-src blob:; img-src data: blob:; style-src 'unsafe-inline'; font-src https://cdn.jsdelivr.net; worker-src blob:; object-src 'none'; base-uri 'none'; form-action 'none'">''',html)
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+(site/'style.css').read_text()+'\n.local-banner{padding:12px 4vw;background:#e8e3dc;border-bottom:1px solid #d8d1c7;font:12px/1.7 sans-serif}.local-banner strong{margin-right:12px}.local-banner details{margin-top:4px}.local-banner summary{cursor:pointer}.local-error{background:#fee;padding:18px;font:14px/1.7 sans-serif}</style>')
html=html.replace('href="./"','href="#"')
html=html.replace('<body>','''<body><div class="local-banner" id="local-instructions"><strong>LOCAL WEB EDITION · 0.3.1</strong>비공개 체험용 / Private evaluation
<details><summary>시작 방법 · How to start · 使用方法</summary><p>PC Chrome에서 이 파일 열기 → 성인·본인 사진 처리 동의 → 정면 사진 선택 → 생성된 3D 얼굴을 회전하고 겔 드래그. 단일 사진의 깊이는 추정값입니다. 피부 관찰·일반 정보 기능이며 진단이나 시술 추천이 아닙니다.</p><p>Open this file in desktop Chrome → consent → choose your own front-facing photo → rotate the estimated 3D surface and drag a gel onto it. Model files are embedded; no photo is sent to a server. This is visualization and information, not diagnosis or a treatment plan.</p><p>用桌面 Chrome 打开本文件 → 同意 → 选择本人正面照片 → 旋转估算 3D 面部并拖动凝胶。文件内置模型，照片不上传。这是可视化和信息功能，不作诊断或治疗建议。</p><p>기기·브라우저에 따라 지원 차이가 있습니다. 문제가 생기면 새로고침하고 사진 크기를 줄여보세요. 사진·상담 메모는 저장 버튼을 누른 파일을 제외하면 페이지 메모리에만 있습니다. 폰트는 인터넷 연결 시 CDN에서 불러오며 이 파일에는 폰트 바이너리가 없습니다.</p></details><span id="local-loading">화면을 준비하는 중… / Preparing…</span></div><div id="local-error" class="local-error" role="alert" hidden></div>''')
html=re.sub(r'<p><a href="./health.html">.*?</a></p>','<p><a href="#local-instructions">사용 방법 · How to use · 使用方法</a></p>',html)
html=html.replace('<script type="module" src="./app.js"></script>',f'<script type="application/json" id="asset-pack">{json.dumps(assets,separators=(",",":"))}</script>\n<script nonce="{nonce}">{bootstrap}</script>')
assert './app.js' not in html
out.write_text(html)
print(json.dumps({'file':str(out),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'fontBinaries':0}))

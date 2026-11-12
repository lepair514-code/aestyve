const button=document.querySelector('#check'),output=document.querySelector('#checks');
function line(name,pass,detail=''){const p=document.createElement('p');p.textContent=`${pass?'✓':'✕'} ${name}${detail?' — '+detail:''}`;output.append(p);return pass;}
button.onclick=async()=>{button.disabled=true;output.replaceChildren();let model;try{
 line('보안 연결 / Secure context',window.isSecureContext);
 line('WebAssembly',typeof WebAssembly==='object');
 const c=document.createElement('canvas'),gl=c.getContext('webgl2')||c.getContext('webgl');line('WebGL 그래픽 / Graphics',!!gl);gl?.getExtension('WEBGL_lose_context')?.loseContext();
 const manifest=await fetch('./asset-manifest.json').then(r=>{if(!r.ok)throw Error('Build assets missing');return r.json();});line('배포 파일 / Build assets',manifest.assets.length===6,`v${manifest.version}`);
 const {FaceLandmarker,FilesetResolver}=await import('./vendor/mediapipe/vision_bundle.mjs');
 const files=await FilesetResolver.forVisionTasks('./vendor/mediapipe/wasm');
 model=await FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'./vendor/face_landmarker.task',delegate:'CPU'},runningMode:'IMAGE',numFaces:2});
 line('얼굴 모델 초기화 / Face model initialization',true,'사진 추론·임상 검증과는 별도 / not inference or clinical validation');
 }catch(error){line('점검 미완료 / Incomplete',false,'연결·브라우저 지원 또는 배포 파일을 확인하세요 / check network, browser support and deployed assets');}finally{model?.close();button.disabled=false;}};

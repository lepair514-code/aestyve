/* A shared continuous pose drives WebGL and the six-face CSS 3D fallback. */
const root = document.querySelector('[data-ae-showroom]');
if (root) {
 const scene = root.querySelector('.ae-scene');
 const cartons = [...root.querySelectorAll('[data-carton]')];
 const buttons = [...root.querySelectorAll('[data-product]')];
 const toggle = root.querySelector('.ae-formula-toggle');
 const hud = root.querySelector('.ae-hud');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let position=0,target=0,tilt=0,targetTilt=0,drag=null,active=0,visible=true,raf=0,last=0,webgl=null,open=false,hideTimer;
 let size={width:scene.clientWidth,height:scene.clientHeight};
 const mod = n => ((n % 3) + 3) % 3;
 const names=['Alpha','Beta','Gamma'];
 function formula(value) {
  clearTimeout(hideTimer);open=value;
  toggle.setAttribute('aria-expanded',String(value));
  toggle.querySelector('[data-toggle-label]').textContent=value?toggle.dataset.closeLabel:toggle.dataset.openLabel;
  toggle.firstElementChild.textContent=value?'−':'＋';
  if(value){hud.hidden=false;requestAnimationFrame(()=>{if(open)root.classList.add('is-formula-open')})}
  else{root.classList.remove('is-formula-open');hideTimer=setTimeout(()=>{if(!open)hud.hidden=true},reduced.matches?0:800)}
 }
 function selection() {
  const selected=mod(Math.round(target));
  if(selected===active)return;
  active=selected;root.dataset.activeProduct=names[active].toLowerCase();
  root.querySelector('.ae-active-name').textContent='Ep. '+names[active];
  buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
 }
 function choose(index){const current=mod(Math.round(target));let delta=mod(index-current);if(delta>1)delta-=3;target=Math.round(target)+delta;targetTilt=0;selection();formula(true);wake()}
 buttons.forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.product))));
 root.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{target=Math.round(target)+Number(b.dataset.step);selection();formula(true);wake()}));
 toggle.addEventListener('click',()=>formula(!open));
 scene.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home')choose(0);else if(e.key==='End')choose(2);else{target=Math.round(target)+(e.key==='ArrowRight'?1:-1);selection();formula(true);wake()}}});
 scene.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:target,lastX:e.clientX,lastTime:performance.now(),velocity:0,moved:false};scene.setPointerCapture(e.pointerId);scene.classList.add('is-dragging');wake()});
 scene.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved && Math.abs(dx)<6)return;
  if(!drag.moved && Math.abs(dy)>Math.abs(dx)*1.3 && e.pointerType==='touch'){end(e,true);return}
  const now=performance.now();drag.velocity=(e.clientX-drag.lastX)/Math.max(12,now-drag.lastTime);drag.lastX=e.clientX;drag.lastTime=now;
  drag.moved=true;target=drag.start-dx/Math.max(180,size.width*.38);targetTilt=Math.max(-.18,Math.min(.18,dy*.002));
  if(!open)formula(true);selection();wake();
 });
 function end(e,cancelled=false){if(!drag||e.pointerId!==drag.id)return;
  const velocity=performance.now()-drag.lastTime<100?drag.velocity:0;
  target=Math.round(target-(cancelled?0:Math.max(-.35,Math.min(.35,velocity*.18))));targetTilt=0;drag=null;scene.classList.remove('is-dragging');if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId);selection();wake();
 }
 scene.addEventListener('pointerup',e=>end(e));scene.addEventListener('pointercancel',e=>end(e,true));scene.addEventListener('lostpointercapture',e=>end(e,true));
 function poses(time){return names.map((_,i)=>{const angle=(i-position)*Math.PI*2/3;return {x:Math.sin(angle)*2.65,y:Math.sin(angle)*.13+(reduced.matches?0:Math.sin(time*.00055+i*1.8)*.045),z:Math.cos(angle)*1.05,rx:.035+tilt,ry:-.34+Math.sin(angle)*-.35+-position*Math.PI*2,rz:Math.sin(angle)*-.19-.065,scale:1}})}
 function frame(time){raf=0;if(!visible||document.hidden)return;
  const dt=Math.min(50,time-(last||time));last=time;const a=reduced.matches?1:1-Math.exp(-dt/105);
  position+=(target-position)*a;tilt+=(targetTilt-tilt)*a;
  const pose=poses(time);const unit=Math.min(size.width/7.55,size.height/5.9);
  cartons.forEach((el,i)=>{const p=pose[i];el.style.transform=`translate3d(${p.x*unit}px,${-p.y*unit}px,${p.z*unit}px) rotateX(${p.rx}rad) rotateY(${p.ry}rad) rotateZ(${p.rz}rad) scale(${unit*3.8/407})`});
  if(webgl)webgl.draw(pose);
  if(!reduced.matches||Math.abs(target-position)>.0001||drag)raf=requestAnimationFrame(frame);
 }
 function wake(){if(!raf&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(frame)}}
 new ResizeObserver(()=>{size={width:scene.clientWidth,height:scene.clientHeight};webgl?.resize(size);wake()}).observe(scene);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0}},{threshold:.02}).observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()});
 reduced.addEventListener('change',wake);root.dataset.activeProduct='alpha';root.dataset.renderer='css3d';wake();
 // A volumetric, fully interactive fallback is already visible while WebGL loads.
 import('./aestyve-webgl.js?v=20260918b').then(async({createShowroom})=>{
  webgl=await createShowroom(root.querySelector('.ae-webgl'),size,()=>{root.dataset.renderer='css3d';webgl=null;wake()});
  if(webgl){webgl.draw(poses(performance.now()));root.dataset.renderer='webgl';wake()}
 }).catch(()=>{/* CSS 3D retains the complete collection, drag and formula experience. */});
}

/* Pointer, touch and keyboard access to the same catalog-backed information. */
(()=>{'use strict';
 const root=document.querySelector('.ha-intro');if(!root)return;
 const menu=document.querySelector('.menu'),toggle=document.querySelector('.menu-toggle');
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu?.classList.toggle('open',open)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');setFormula(false)}});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),scene=root.querySelector('.ha-scene');
 const products=[['Alpha','30G × 2','—'],['Beta','27G × 1','25G × 1'],['Gamma','25G × 1','23G × 1']];
 const orbits=[...root.querySelectorAll('[data-orbit]')],syringes=[...root.querySelectorAll('[data-syringe]')],buttons=[...root.querySelectorAll('[data-product]')];
 let index=0,target=0,position=0,lean=0,leanTarget=0,raf=0,visible=true;
 const wrap=v=>((v%3)+3)%3;
 function render(){
  const mobile=scene.clientWidth<600,spread=mobile?scene.clientWidth*.32:Math.min(230,scene.clientWidth*.27);
  orbits.forEach((el,i)=>{let d=((i-position+1.5)%3+3)%3-1.5;const near=1-Math.min(1,Math.abs(d));const x=d*spread,y=-50+(1-near)*16;el.style.transform=`translate3d(${x}px,${y}%,${near*100-110}px) rotateY(${d*-16+lean*10}deg) rotateZ(${d*13-8+lean*4}deg) scale(${.71+near*.29})`;el.style.zIndex=String(Math.round(near*10)+1);el.style.opacity=String(.62+near*.38)});
  syringes.forEach(el=>{el.style.transform=`translate3d(${lean*12}px,${lean*-6}px,0) rotate(${10+lean*8}deg)`});
 }
 function frame(){raf=0;position+=reduced.matches?target-position:(target-position)*.11;lean+=reduced.matches?leanTarget-lean:(leanTarget-lean)*.12;render();if(visible&&!document.hidden&&(Math.abs(target-position)>.001||Math.abs(leanTarget-lean)>.001))raf=requestAnimationFrame(frame)}
 function wake(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(frame)}
 function select(i,announce=true){index=wrap(i);target=i;root.dataset.productIndex=String(index);buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===index)));syringes.forEach((el,n)=>el.hidden=n!==index);root.querySelector('[data-product-name]').textContent='Ep. '+products[index][0];root.querySelector('[data-product-count]').textContent='0'+(index+1);root.querySelector('[data-needle]').textContent=products[index][1];root.querySelector('[data-cannula]').textContent=products[index][2];if(announce)root.querySelector('.ha-live').textContent='Ep. '+products[index][0];wake()}
 buttons.forEach((b,n)=>b.addEventListener('click',()=>{let delta=n-wrap(Math.round(target));if(delta>1)delta-=3;if(delta< -1)delta+=3;select(Math.round(target)+delta)}));
 root.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>select(Math.round(target)+Number(b.dataset.step))));
 const formula=root.querySelector('.ha-formula'),formulaButton=root.querySelector('.ha-formula-button');let formulaTimer;
 function setFormula(open){clearTimeout(formulaTimer);formulaButton.setAttribute('aria-expanded',String(open));formulaButton.textContent=(open?'− ':'＋ ')+(open?formulaButton.dataset.close:formulaButton.dataset.open);if(open){formula.hidden=false;requestAnimationFrame(()=>root.classList.add('is-formula-open'))}else{root.classList.remove('is-formula-open');formulaTimer=setTimeout(()=>{formula.hidden=true},reduced.matches?0:450)}}
 formulaButton.addEventListener('click',()=>setFormula(formulaButton.getAttribute('aria-expanded')!=='true'));
 // Horizontal intent preserves native vertical scrolling on touch screens.
 function draggable(el,{start=()=>{},move=()=>{},end=()=>{},step}){let pointer=null,originX=0,originY=0,lastX=0,lastTime=0,velocity=0,active=false;
  el.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,a,input'))return;pointer=e.pointerId;originX=lastX=e.clientX;originY=e.clientY;lastTime=performance.now();velocity=0;active=false;start()});
  el.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const dx=e.clientX-originX,dy=e.clientY-originY;if(!active){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)*1.2){pointer=null;return}if(Math.abs(dx)<5)return;active=true;el.setPointerCapture(pointer);el.classList.add('is-dragging')}const now=performance.now();velocity=(e.clientX-lastX)/Math.max(8,now-lastTime);lastX=e.clientX;lastTime=now;move(dx,dy)});
  function finish(e,cancel=false){if(pointer!==e.pointerId)return;const wasActive=active;pointer=null;active=false;el.classList.remove('is-dragging');if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);if(wasActive)end(e.clientX-originX,cancel?0:velocity,cancel)}
  el.addEventListener('pointerup',e=>finish(e));el.addEventListener('pointercancel',e=>finish(e,true));el.addEventListener('lostpointercapture',e=>{if(pointer===e.pointerId)finish(e,true)});
  el.addEventListener('keydown',e=>{if(e.target!==el)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}});
 }
 let startTarget=0;
 draggable(scene,{start:()=>{startTarget=Math.round(target)},move:(dx,dy)=>{target=startTarget-dx/Math.max(160,scene.clientWidth*.34);leanTarget=Math.max(-1,Math.min(1,dy/140));setFormula(true);wake()},end:(dx,v,cancel)=>{let n=cancel?startTarget:Math.round(target-v*.2);if(!cancel&&n===startTarget&&Math.abs(dx)>38)n+=dx<0?1:-1;leanTarget=0;select(n)},step:dir=>{select(Math.round(target)+dir);setFormula(true)}});
 new ResizeObserver(wake).observe(scene);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0}},{threshold:.01}).observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()});reduced.addEventListener('change',wake);select(0,false);render();
 // Texture imagery is illustrative; no trial values are tied to these photos.
 let gel=0;const gelArea=document.querySelector('[data-drag-gel]');function setGel(i){gel=wrap(i);document.querySelectorAll('[data-gel]').forEach((el,n)=>el.hidden=n!==gel);document.querySelectorAll('[data-gel-button]').forEach((el,n)=>el.setAttribute('aria-pressed',String(n===gel)));document.querySelector('[data-gel-index]').textContent='0'+(gel+1)}
 const gelPreload=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){gelArea.querySelectorAll('img').forEach(img=>img.loading='eager');gelPreload.disconnect()}},{rootMargin:'500px'});gelPreload.observe(gelArea);
 document.querySelectorAll('[data-gel-button]').forEach((b,n)=>b.addEventListener('click',()=>setGel(n)));draggable(gelArea,{end:dx=>{if(Math.abs(dx)>25)setGel(gel+(dx<0?1:-1))},step:d=>setGel(gel+d)});
 let formulation=0;const formulations=[['Fine','60–120'],['Deep','150–210'],['Volume','260–300']],rheology=document.querySelector('[data-drag-rheology]');function setFormulation(i){formulation=wrap(i);rheology.querySelectorAll('[data-formulation]').forEach((b,n)=>b.setAttribute('aria-pressed',String(n===formulation)));rheology.querySelector('[data-range-name]').textContent=formulations[formulation][0];rheology.querySelector('[data-range-value]').replaceChildren(document.createTextNode(formulations[formulation][1]),Object.assign(document.createElement('small'),{textContent:'Pa'}))}
 rheology.querySelectorAll('[data-formulation]').forEach((b,n)=>b.addEventListener('click',()=>setFormulation(n)));draggable(rheology,{end:dx=>{if(Math.abs(dx)>25)setFormulation(formulation+(dx<0?1:-1))},step:d=>setFormulation(formulation+d)});
 let mri=0;function setMri(i){mri=((i%2)+2)%2;document.querySelectorAll('[data-mri-panel]').forEach((p,n)=>p.hidden=n!==mri);document.querySelectorAll('[data-mri]').forEach((b,n)=>b.setAttribute('aria-pressed',String(n===mri)))}document.querySelectorAll('[data-mri]').forEach((b,n)=>b.addEventListener('click',()=>setMri(n)));draggable(document.querySelector('[data-drag-mri]'),{end:dx=>{if(Math.abs(dx)>25)setMri(mri+1)},step:d=>setMri(mri+d)});
})();

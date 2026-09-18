(()=>{'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-face-studio]').forEach(root=>{
  const stage=root.querySelector('.fs-canvas'),buttons=[...root.querySelectorAll('[data-fs-line]')],packs=[...root.querySelectorAll('[data-fs-pack]')],names=['Alpha','Beta','Gamma'];
  if(!stage)return;
  let selected=0,frame=0,rx=0,ry=0,pointer=null,startX=0,startY=0,startSelected=0,dragged=false;
  function select(index){selected=(index+3)%3;root.dataset.line=names[selected].toLowerCase();buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));packs.forEach((p,i)=>p.hidden=i!==selected);root.querySelector('[data-fs-name]').textContent='Ep. '+names[selected];}
  function paint(){frame=0;stage.style.setProperty('--fs-rx',rx.toFixed(2)+'deg');stage.style.setProperty('--fs-ry',ry.toFixed(2)+'deg');}
  function move(x,y){if(reduced.matches)return;const r=stage.getBoundingClientRect();rx=Math.max(-3,Math.min(3,(.5-(y-r.top)/r.height)*6));ry=Math.max(-5,Math.min(5,((x-r.left)/r.width-.5)*10));if(!frame)frame=requestAnimationFrame(paint);}
  function reset(){rx=ry=0;if(!frame)frame=requestAnimationFrame(paint);}
  buttons.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(selected+(e.key==='ArrowRight'?1:-1))}else if(e.key==='Home'||e.key==='End'){e.preventDefault();select(e.key==='Home'?0:2)}});
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer=e.pointerId;startX=e.clientX;startY=e.clientY;startSelected=selected;dragged=false;});
  stage.addEventListener('pointermove',e=>{if(pointer===e.pointerId){const dx=e.clientX-startX,dy=e.clientY-startY;if(!dragged&&Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){pointer=null;reset();return}if(!dragged&&Math.abs(dx)>8){dragged=true;stage.setPointerCapture(pointer);stage.classList.add('is-dragging')}if(dragged){e.preventDefault();select(startSelected-Math.round(dx/100));move(e.clientX,e.clientY)}}else if(e.pointerType==='mouse')move(e.clientX,e.clientY);});
  function end(e){if(e.pointerId!==pointer)return;pointer=null;dragged=false;stage.classList.remove('is-dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);reset();}
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);stage.addEventListener('lostpointercapture',end);stage.addEventListener('pointerleave',()=>{if(pointer===null)reset()});stage.addEventListener('dragstart',e=>e.preventDefault());reduced.addEventListener('change',reset);
  root.classList.add('fs-ready');if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){root.classList.add('fs-visible');observer.disconnect()}},{threshold:.12});observer.observe(root)}else root.classList.add('fs-visible');
 });
})();

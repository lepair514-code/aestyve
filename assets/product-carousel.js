(()=>{'use strict';
 document.querySelectorAll('.ae-product-carousel').forEach(root=>{
  const rail=root.querySelector('.ae-product-rail'),cards=[...rail.querySelectorAll('.solution')],prev=root.querySelector('[data-carousel-prev]'),next=root.querySelector('[data-carousel-next]'),count=root.querySelector('.ae-carousel-count');
  if(!cards.length)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,pointer=null,startX=0,startY=0,startScroll=0,lastX=0,lastTime=0,velocity=0,dragging=false,suppressClick=false,suppressTimer;
  const max=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
  const step=()=>cards[0].offsetWidth+(parseFloat(getComputedStyle(rail).columnGap)||0);
  function update(){raf=0;const visible=cards.map((c,i)=>({i,left:c.offsetLeft-rail.scrollLeft,right:c.offsetLeft+c.offsetWidth-rail.scrollLeft})).filter(c=>c.left>=-6&&c.right<=rail.clientWidth+6);let first,last;if(visible.length){first=visible[0].i+1;last=visible[visible.length-1].i+1}else{first=Math.min(cards.length,Math.round(rail.scrollLeft/step())+1);last=first}count.textContent=(first===last?String(first).padStart(2,'0'):String(first).padStart(2,'0')+'–'+String(last).padStart(2,'0'))+' / '+String(cards.length).padStart(2,'0');prev.disabled=rail.scrollLeft<3;next.disabled=rail.scrollLeft>=max()-3}
  function queue(){if(!raf)raf=requestAnimationFrame(update)}
  function go(index){rail.scrollTo({left:Math.max(0,Math.min(max(),index*step())),behavior:reduced.matches?'auto':'smooth'})}
  function advance(dir){const current=rail.scrollLeft/step();go(dir>0?Math.floor(current+.05)+1:Math.ceil(current-.05)-1)}
  prev.addEventListener('click',()=>advance(-1));next.addEventListener('click',()=>advance(1));
  rail.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();advance(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();go(e.key==='Home'?0:cards.length-1)}});
  rail.addEventListener('dragstart',e=>e.preventDefault());
  // Touch keeps the browser's native inertial swipe; mouse uses a drag gesture.
  rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;pointer=e.pointerId;startX=lastX=e.clientX;startY=e.clientY;startScroll=rail.scrollLeft;lastTime=performance.now();velocity=0;dragging=false;suppressClick=false;clearTimeout(suppressTimer)});
  rail.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!dragging){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){pointer=null;return}if(Math.abs(dx)<6)return;dragging=true;suppressClick=true;rail.setPointerCapture(pointer);rail.classList.add('is-dragging')}e.preventDefault();const now=performance.now();velocity=(e.clientX-lastX)/Math.max(8,now-lastTime);lastX=e.clientX;lastTime=now;rail.scrollLeft=startScroll-dx});
  function finish(e,cancel=false){if(pointer!==e.pointerId)return;pointer=null;const moved=dragging;dragging=false;rail.classList.remove('is-dragging');if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId);if(moved){const momentum=cancel||performance.now()-lastTime>120?0:velocity*90;go(Math.round((rail.scrollLeft-momentum)/step()));suppressTimer=setTimeout(()=>suppressClick=false,300)}}
  rail.addEventListener('pointerup',e=>finish(e));rail.addEventListener('pointercancel',e=>finish(e,true));rail.addEventListener('lostpointercapture',e=>finish(e,true));
  rail.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false}},true);
  // A small perspective tilt and a restrained glass highlight follow the mouse.
  cards.forEach(card=>{let hoverFrame=0,rx=0,ry=0,gx=50,gy=30;
   function reset(){cancelAnimationFrame(hoverFrame);hoverFrame=0;card.classList.remove('is-hovered');card.style.setProperty('--card-rx','0deg');card.style.setProperty('--card-ry','0deg')}
   card.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced.matches||dragging||pointer!==null){reset();return}const rect=card.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));rx=(.5-y)*5;ry=(x-.5)*5;gx=x*100;gy=y*100;card.classList.add('is-hovered');if(!hoverFrame)hoverFrame=requestAnimationFrame(()=>{hoverFrame=0;card.style.setProperty('--card-rx',rx.toFixed(2)+'deg');card.style.setProperty('--card-ry',ry.toFixed(2)+'deg');card.style.setProperty('--card-gx',gx.toFixed(1)+'%');card.style.setProperty('--card-gy',gy.toFixed(1)+'%')})});
   card.addEventListener('pointerleave',reset);card.addEventListener('pointerdown',reset);card.addEventListener('blur',reset);reduced.addEventListener('change',reset);
  });
  rail.addEventListener('scroll',queue,{passive:true});new ResizeObserver(queue).observe(rail);root.querySelector('.ae-carousel-controls').hidden=false;update();
 });
})();

(function(){
  'use strict';
  const menu=document.getElementById('main-menu'), toggle=document.querySelector('.menu-toggle');
  function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');}
  toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
  const tabs=[...document.querySelectorAll('[role="tab"]')];
  const panels=[...document.querySelectorAll('.product-panel')];
  function select(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});panels.forEach(p=>p.hidden=p.id!==tab.getAttribute('aria-controls'));}
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',e=>{e.preventDefault();select(tab);});
    tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();select(tabs[next]);tabs[next].focus();});
  });
  if(tabs.length)select(tabs[0]);
})();

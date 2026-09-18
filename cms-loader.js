(function(){
  var menuButton = document.querySelector('.menu-btn'), menu = document.querySelector('.menu');
  if (menuButton && menu) {
    menu.id = menu.id || 'site-navigation';
    menuButton.setAttribute('aria-controls', menu.id);
    var syncMenu = function(){ menuButton.setAttribute('aria-expanded', String(menu.classList.contains('open'))); };
    var closeMenu = function(){ menu.classList.remove('open'); syncMenu(); };
    syncMenu();
    menuButton.addEventListener('click', function(){ requestAnimationFrame(syncMenu); });
    menu.addEventListener('click', function(event){ if(event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function(event){ if(event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
    matchMedia('(min-width:961px)').addEventListener('change', function(event){ if(event.matches) closeMenu(); });
  }
  var path = location.pathname;
  var url = '/content.json';
  if (path.indexOf('/en/') === 0 || path === '/en') url = '/content-en.json';
  else if (path.indexOf('/zh/') === 0 || path === '/zh') url = '/content-zh.json';
  fetch(url, {cache:'no-store'}).then(function(r){ return r.json(); }).then(function(data){
    document.querySelectorAll('[data-cms]').forEach(function(el){
      var item = data[el.getAttribute('data-cms')];
      if(!item) return;
      // Old CMS exports include authoring comments in plain-text fields.
      // Keep these internal notes out of every language's rendered copy.
      var value = String(item.value == null ? '' : item.value).replace(/<!--[\s\S]*?-->/g, '');
      if(item.type === 'rich'){
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });
    // The inquiry button must use the same address as the editable EMAIL field.
    var contactEmail = document.querySelector('[data-cms="contact.contact-desc.1"]');
    var address = contactEmail && contactEmail.textContent.trim();
    if (address && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      document.querySelectorAll('main a[href^="mailto:"]').forEach(function(link){
        var query = link.getAttribute('href').split('?')[1];
        link.setAttribute('href', 'mailto:' + address + (query ? '?' + query : ''));
      });
    }
  }).catch(function(){ /* content.json 로드 실패 시 기본 텍스트 유지 */ });
})();

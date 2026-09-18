(() => {
  'use strict';
  // INNOFill/PLLA have a separate header and previously lacked a menu handler.
  const toggle = document.querySelector('.menu-button');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  nav.id ||= 'ae-product-navigation';
  toggle.setAttribute('aria-controls', nav.id);
  toggle.setAttribute('aria-expanded', 'false');
  const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) { close(); toggle.focus(); }
  });
  matchMedia('(min-width:1041px)').addEventListener('change', event => { if (event.matches) close(); });
})();

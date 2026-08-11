/* ============================================================
   Aestyve – main.js
   Header scroll / Hero slider / Tab filter / Lang toggle
   / Mobile nav / Fade-up / Contact form
============================================================ */

(function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────── */
  function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

  /* ── Current language ─────────────────────────────────── */
  let currentLang = localStorage.getItem('aestyve-lang') || 'ko';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('aestyve-lang', lang);

    // update all [data-ko] / [data-en] elements
    qsa('[data-ko]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val === null) return;
      // use innerHTML to support <br>
      if (el.tagName === 'INPUT' || el.tagName === 'BUTTON') {
        el.value = val;
      } else {
        el.innerHTML = val;
      }
    });

    // toggle active state on lang buttons
    qsa('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  /* ── Header scroll ────────────────────────────────────── */
  const header = qs('#header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 60);

    // active nav link based on section in view
    const sections = qsa('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - header.offsetHeight - 20) {
        current = sec.id;
      }
    });
    qsa('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile Nav ───────────────────────────────────────── */
  const hamburger    = qs('#hamburger');
  const mobileNav    = qs('#mobile-nav');
  const mobileClose  = qs('#mobile-nav-close');
  const mobileOverlay = qs('#mobile-nav-overlay');

  function openMobile()  { mobileNav?.classList.add('open');   mobileOverlay?.classList.add('visible'); }
  function closeMobile() { mobileNav?.classList.remove('open'); mobileOverlay?.classList.remove('visible'); }

  hamburger?.addEventListener('click', openMobile);
  mobileClose?.addEventListener('click', closeMobile);
  mobileOverlay?.addEventListener('click', closeMobile);
  qsa('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobile));

  /* ── Hero Slider ──────────────────────────────────────── */
  const slides  = qsa('.hero-slide');
  const dots    = qsa('.hero-dot');
  let current   = 0;
  let autoTimer = null;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    stopAuto();
    if (slides.length > 1) autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto() { clearInterval(autoTimer); }

  qs('#hero-prev')?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  qs('#hero-next')?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(+dot.dataset.idx); startAuto(); }));
  startAuto();

  /* ── Product Tab Filter ────────────────────────────────── */
  const tabBtns    = qsa('.tab-btn');
  const cards      = qsa('.product-card');
  const featured   = qs('.product-featured');

  function applyFilter(filter) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));

    // Featured
    if (featured) {
      const cats = (featured.dataset.category || '').split(' ');
      const show = filter === 'all' || cats.includes(filter);
      featured.classList.toggle('hidden', !show);
    }

    // Grid cards
    cards.forEach(card => {
      const cats = (card.dataset.category || '').split(' ');
      const show = filter === 'all' || cats.includes(filter);
      card.classList.toggle('hidden', !show);
    });
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
  applyFilter('all');

  /* ── Language Toggle ──────────────────────────────────── */
  qsa('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
  applyLang(currentLang);

  /* ── Fade-up on scroll ─────────────────────────────────── */
  const fadeEls = qsa('.about-text, .about-stats, .stat-item, .science-card, .academy-card, .news-item, .product-card, .product-featured, .contact-info, .contact-form');
  fadeEls.forEach(el => el.classList.add('fade-up'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => observer.observe(el));

  /* ── Smooth Anchor ─────────────────────────────────────── */
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight || 72) + 8;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ── Contact Form ──────────────────────────────────────── */
  const contactForm = qs('#contact-form');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = currentLang === 'ko' ? '전송 완료!' : 'Sent!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = origText;
      btn.disabled = false;
      contactForm.reset();
    }, 2500);
  });

  /* ── Content from content.json (optional) ──────────────── */
  fetch('data/content.json')
    .then(r => r.ok ? r.json() : null)
    .catch(() => null)
    .then(data => {
      if (!data) return;
      // Site title
      if (data.site && data.site.titleKo) {
        document.title = data.site.titleKo + ' | Aesthetic Solutions';
      }
      // Logo
      if (data.site && data.site.logo) {
        const logoImg = qs('#header-logo');
        if (logoImg) { logoImg.src = data.site.logo; logoImg.style.display = 'block'; }
        const fLogo = qs('.footer-logo');
        if (fLogo) fLogo.src = data.site.logo;
      }
    });

})();

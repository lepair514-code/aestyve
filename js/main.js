/**
 * Aestyve — main.js
 */

const STATE = { lang: 'ko', content: null };
const LANGS = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'zh-CN', flag: '🇨🇳', label: '中文' },
  { code: 'th',   flag: '🇹🇭', label: 'ภาษาไทย' },
];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const t = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[STATE.lang] || obj['ko'] || obj['en'] || '';
};
function showToast(msg, duration = 2400) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* ─── 언어 ─── */
function initLang() {
  const stored = localStorage.getItem('aestyve_lang');
  if (stored && LANGS.find(l => l.code === stored)) { STATE.lang = stored; return; }
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('zh')) STATE.lang = 'zh-CN';
  else if (nav.startsWith('th')) STATE.lang = 'th';
  else if (nav.startsWith('en')) STATE.lang = 'en';
  else STATE.lang = 'ko';
  const lp = new URLSearchParams(location.search).get('lang');
  if (lp && LANGS.find(l => l.code === lp)) STATE.lang = lp;
}
function setLang(code) {
  STATE.lang = code;
  localStorage.setItem('aestyve_lang', code);
  document.documentElement.lang = code;
  if (STATE.content) renderAll();
}
function renderLangSwitcher() {
  const wrap = $('#lang-switcher');
  const mobileWrap = $('#mobile-lang-switcher');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (mobileWrap) mobileWrap.innerHTML = '';
  LANGS.forEach(({ code, flag, label }) => {
    const btn = document.createElement('button');
    btn.className = 'lang-btn' + (code === STATE.lang ? ' active' : '');
    btn.textContent = flag;
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.addEventListener('click', () => { setLang(code); renderLangSwitcher(); });
    wrap.appendChild(btn);
    if (mobileWrap) {
      const btn2 = btn.cloneNode(true);
      btn2.addEventListener('click', () => { setLang(code); renderLangSwitcher(); });
      mobileWrap.appendChild(btn2);
    }
  });
}

/* ─── 콘텐츠 로드 ─── */
async function loadContent() {
  try {
    const stored = localStorage.getItem('aestyve_content');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') { STATE.content = parsed; renderAll(); return; }
    }
  } catch (e) {}
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    STATE.content = await res.json();
    renderAll();
  } catch (err) {
    console.error('[Aestyve] content.json 로드 실패:', err);
  }
}

/* ─── 전체 렌더 ─── */
function renderAll() {
  const c = STATE.content;
  if (!c) return;
  renderNav(c.nav);
  renderHero(c.heroes);
  renderProducts(c.products);
  renderBrand(c.settings);
  renderContact(c.settings);
  renderFooter(c.settings);
  renderLangSwitcher();
}

/* ─── Nav ─── */
function renderNav(navItems) {
  const nav = $('#main-nav');
  const mLinks = $('#mobile-nav-links');
  if (!nav || !navItems) return;
  nav.innerHTML = navItems.map(item =>
    `<a href="${item.href}" class="nav-link">${t(item.label)}</a>`
  ).join('');
  if (mLinks) {
    mLinks.innerHTML = navItems.map(item =>
      `<a href="${item.href}" class="mobile-nav-link">${t(item.label)}</a>`
    ).join('');
    $$('.mobile-nav-link', mLinks).forEach(a =>
      a.addEventListener('click', () => toggleMobileNav(false))
    );
  }
}

/* ─── Hero ─── */
function renderHero(heroes) {
  const videoWrap = $('#hero-video-wrap');
  const overlay   = $('#hero-overlay');
  if (!videoWrap || !overlay) return;
  const h = (heroes && heroes.length > 0) ? heroes[0] : null;
  let bgHtml = '';
  if (h && h.bgVideo) {
    const ytMatch = h.bgVideo.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      const vid = ytMatch[1];
      const src = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&vq=hd1080&origin=${encodeURIComponent(location.origin)}`;
      bgHtml = `<iframe id="hero-yt-iframe" class="hero-video-full" src="${src}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Aestyve Hero Video"></iframe>`;
      bgHtml += `<button id="hero-unmute-btn" aria-label="소리 켜기" onclick="heroToggleMute(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" class="yt-icon-poly"/><line x1="23" y1="9" x2="17" y2="15" class="yt-muted-line"/><line x1="17" y1="9" x2="23" y2="15" class="yt-muted-line"/></svg></button>`;
    } else {
      bgHtml = `<video id="hero-video" class="hero-video-full" autoplay muted loop playsinline preload="auto" src="${h.bgVideo}"></video>`;
    }
  } else {
    bgHtml = `<div class="hero-video-full" style="background:${(h && h.bgColor) || '#1A2755'};"></div>`;
  }
  videoWrap.innerHTML = bgHtml;
  if (h) {
    const accent = h.accentColor || '#A8B9FF';
    const titleLines = (t(h.title) || '').replace(/\n/g, '<br/>');
    overlay.innerHTML = `<div class="hero-overlay-inner">
      ${t(h.label)    ? `<span class="hero-label" style="background:${accent}22;color:${accent};">${t(h.label)}</span>` : ''}
      ${titleLines    ? `<h1 class="hero-title" style="color:#fff;">${titleLines}</h1>` : ''}
      ${t(h.subtitle) ? `<p class="hero-subtitle" style="color:rgba(255,255,255,.78);">${t(h.subtitle)}</p>` : ''}
      ${t(h.btnText)  ? `<a href="${h.btnHref||'#'}" class="hero-btn" style="color:${accent};border-color:${accent};">${t(h.btnText)} <span>&#8594;</span></a>` : ''}
    </div>`;
    overlay.style.display = '';
  } else {
    overlay.style.display = 'none';
  }
}

let _ytMuted = true;
function heroToggleMute(btn) {
  const iframe = document.getElementById('hero-yt-iframe');
  if (!iframe) return;
  _ytMuted = !_ytMuted;
  iframe.contentWindow.postMessage(JSON.stringify({ event:'command', func: _ytMuted ? 'mute' : 'unMute', args:[] }), '*');
  btn.querySelectorAll('.yt-muted-line').forEach(l => { l.style.display = _ytMuted ? '' : 'none'; });
  if (!_ytMuted) iframe.contentWindow.postMessage(JSON.stringify({ event:'command', func:'setVolume', args:[100] }), '*');
}
window.heroToggleMute = heroToggleMute;

/* ─── Products — 가로 슬라이더 ─── */
let sliderIdx = 0;

function renderProducts(prods) {
  const track = $('#slider-track');
  const dotsWrap = $('#slider-dots');
  if (!track || !prods || !prods.length) return;

  track.innerHTML = prods.map((p) =>
    `<a class="slide-card" href="product.html?id=${p.id}">
      <div class="slide-img-wrap">
        <img src="${p.image || ''}" alt="${t(p.name)}" loading="lazy" />
      </div>
      <div class="slide-info">
        <span class="slide-name">${t(p.name) || ''}</span>
        <span class="slide-arrow">&#8594;</span>
      </div>
    </a>`
  ).join('');

  /* dots */
  dotsWrap.innerHTML = prods.map((_, i) =>
    `<button class="slide-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="제품 ${i+1}"></button>`
  ).join('');
  $$('.slide-dot', dotsWrap).forEach(btn =>
    btn.addEventListener('click', () => goSlide(parseInt(btn.dataset.i)))
  );

  sliderIdx = 0;
  updateSlider(prods.length);
}

function goSlide(idx) {
  const prods = STATE.content?.products || [];
  sliderIdx = Math.max(0, Math.min(idx, prods.length - 1));
  updateSlider(prods.length);
}

function updateSlider(total) {
  const track = $('#slider-track');
  if (!track) return;

  /* 카드 너비 = 트랙 부모 기준으로 계산 */
  const card = track.querySelector('.slide-card');
  if (!card) return;
  const gap = 24;
  const cardW = card.getBoundingClientRect().width + gap;
  track.style.transform = `translateX(-${sliderIdx * cardW}px)`;

  /* dots */
  $$('.slide-dot').forEach((d, i) => d.classList.toggle('active', i === sliderIdx));

  /* 버튼 상태 */
  const prev = $('#slider-prev');
  const next = $('#slider-next');
  if (prev) prev.style.opacity = sliderIdx === 0 ? '0.25' : '1';
  if (next) next.style.opacity = sliderIdx >= total - 1 ? '0.25' : '1';
}

function initSlider() {
  const prev = $('#slider-prev');
  const next = $('#slider-next');
  if (prev) prev.addEventListener('click', () => { const total = STATE.content?.products?.length || 0; goSlide(sliderIdx - 1); });
  if (next) next.addEventListener('click', () => { const total = STATE.content?.products?.length || 0; goSlide(sliderIdx + 1); });

  /* 드래그 */
  const track = $('#slider-track');
  if (!track) return;
  let startX = 0, dragging = false, moved = 0;
  track.addEventListener('pointerdown', e => { startX = e.clientX; dragging = true; moved = 0; track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', e => { if (!dragging) return; moved = e.clientX - startX; });
  track.addEventListener('pointerup', () => {
    if (!dragging) return; dragging = false;
    const total = STATE.content?.products?.length || 0;
    if (moved < -50) goSlide(sliderIdx + 1);
    else if (moved > 50) goSlide(sliderIdx - 1);
  });

  window.addEventListener('resize', () => updateSlider(STATE.content?.products?.length || 0));
}

/* ─── Brand ─── */
function renderBrand(s) {
  if (!s) return;
  const descEl = $('#brand-desc');
  if (descEl && s.brandStory) descEl.textContent = t(s.brandStory);
  const statsEl = $('#brand-stats');
  if (statsEl && s.stats?.length) {
    statsEl.innerHTML = s.stats.map(st =>
      `<div class="brand-stat"><div class="stat-number">${st.number||'-'}</div><div class="stat-label">${t(st.label)||'-'}</div></div>`
    ).join('');
  }
  const tagEl = $('#brand-tag');
  if (tagEl) tagEl.textContent = { ko:'ABOUT AESTYVE', en:'ABOUT AESTYVE', 'zh-CN':'关于 AESTYVE', th:'เกี่ยวกับ AESTYVE' }[STATE.lang] || 'ABOUT AESTYVE';
  const titleEl = $('#brand-title');
  if (titleEl) titleEl.innerHTML = ({
    ko: '피부과학의 혁신,<br/>아름다움의 새 기준',
    en: 'Innovation in Dermatology,<br/>A New Standard of Beauty',
    'zh-CN': '皮肤科学的创新，<br/>美丽的新标准',
    th: 'นวัตกรรมผิวหนัง<br/>มาตรฐานความงามใหม่',
  }[STATE.lang] || '');
}

/* ─── Contact ─── */
function renderContact(s) {
  if (!s) return;
  const set = (id, val) => { const el = $(id); if (el) el.textContent = val || '-'; };
  set('#contact-brand-name', s.brandName);
  set('#contact-slogan', t(s.slogan));
  set('#contact-phone', s.contact?.phone);
  set('#contact-email', s.contact?.email);
  set('#contact-address', s.contact?.address);
  set('#contact-map-text', s.contact?.address);
  const sl = $('#social-links');
  if (sl) {
    const social = s.social || {};
    const defs = [
      { key:'instagram', icon:'fab fa-instagram', label:'Instagram' },
      { key:'youtube',   icon:'fab fa-youtube',   label:'YouTube'   },
      { key:'facebook',  icon:'fab fa-facebook',  label:'Facebook'  },
      { key:'tiktok',    icon:'fab fa-tiktok',    label:'TikTok'    },
    ];
    sl.innerHTML = defs.filter(d => social[d.key])
      .map(d => `<a href="${social[d.key]}" class="social-link" target="_blank" rel="noopener" aria-label="${d.label}"><i class="${d.icon}"></i></a>`)
      .join('');
  }
}

/* ─── Footer ─── */
function renderFooter(s) {
  if (!s) return;
  const fd = $('#footer-desc');
  if (fd) fd.textContent = t(s.slogan) || 'Aestyve';
  const fc = $('#footer-copyright');
  if (fc) fc.textContent = `© ${new Date().getFullYear()} ${s.brandName || 'Aestyve'}. All rights reserved.`;
}

/* ─── Header scroll ─── */
function initHeaderScroll() {
  const header = $('#site-header');
  if (!header) return;
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10), { passive:true });
}

/* ─── Hamburger ─── */
function toggleMobileNav(force) {
  const btn = $('#hamburger');
  const nav = $('#mobile-nav');
  if (!btn || !nav) return;
  const isOpen = force !== undefined ? !force : nav.classList.contains('open');
  nav.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
}
function initHamburger() {
  const btn = $('#hamburger');
  if (btn) btn.addEventListener('click', () => toggleMobileNav());
  document.addEventListener('click', e => {
    const nav = $('#mobile-nav');
    const header = $('#site-header');
    if (nav?.classList.contains('open') && !header?.contains(e.target)) toggleMobileNav(false);
  });
}

/* ─── Init ─── */
function init() {
  initLang();
  renderLangSwitcher();
  initHeaderScroll();
  initHamburger();
  initSlider();
  loadContent();
}

document.addEventListener('DOMContentLoaded', init);
window.showToast = showToast;

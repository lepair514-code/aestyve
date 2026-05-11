/**
 * Aestyve — main.js
 */

const STATE = { lang: 'ko', content: null, activeCat: 'all' };
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

/* ─── 콘텐츠 로드 (content.json + IndexedDB) ─── */
async function loadContent() {
  /* 1) IndexedDB에서 detailImages 맵 로드 */
  const imgMap = await ImageStore.getAll();

  /* 2) content.json fetch */
  let fresh = null;
  try {
    const res = await fetch('data/content.json?v=' + Date.now());
    if (res.ok) fresh = await res.json();
  } catch (e) {}

  function _applyImgMap(products) {
    return (products || []).map(p => ({ ...p, detailImages: imgMap[p.id] || [] }));
  }

  if (fresh) {
    try {
      const stored = localStorage.getItem('aestyve_content');
      if (stored) {
        const cached = JSON.parse(stored);
        if (cached && typeof cached === 'object') {
          STATE.content = {
            ...fresh,
            heroes:   cached.heroes   || fresh.heroes,
            settings: cached.settings || fresh.settings,
            nav:      cached.nav      || fresh.nav,
            products: (fresh.products || []).map(fp => {
              const cp = (cached.products || []).find(p => p.id === fp.id);
              if (!cp) return { ...fp, detailImages: imgMap[fp.id] || [] };
              return {
                ...fp,
                name:     cp.name     || fp.name,
                detail:   cp.detail   || fp.detail,
                category: cp.category || fp.category,
                detailImages: imgMap[fp.id] || [],
              };
            }),
            categories: fresh.categories || cached.categories,
          };
          renderAll();
          return;
        }
      }
    } catch (e) {}
    STATE.content = { ...fresh, products: _applyImgMap(fresh.products) };
    renderAll();
    return;
  }

  /* 3) fetch 실패 → localStorage 폴백 */
  try {
    const stored = localStorage.getItem('aestyve_content');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        parsed.products = _applyImgMap(parsed.products);
        STATE.content = parsed;
        renderAll();
        return;
      }
    }
  } catch (e) {}
  console.error('[Aestyve] content.json 로드 실패');
}

/* ─── 전체 렌더 ─── */
function renderAll() {
  const c = STATE.content;
  if (!c) return;
  renderNav(c.nav);
  renderHero(c.heroes);
  renderCategoryTabs(c.categories, c.products);
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
const HERO_YT_FALLBACK = 'https://youtu.be/uRgcUCCeykk'; // YouTube fallback URL
const HERO_POSTER      = 'images/hero-poster.jpg';

function _buildYtEmbed(vid) {
  const src = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&vq=hd1080&origin=${encodeURIComponent(location.origin)}`;
  return `<iframe id="hero-yt-iframe" class="hero-video-full" src="${src}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Aestyve Hero Video"></iframe>`
       + `<button id="hero-unmute-btn" aria-label="소리 켜기" onclick="heroToggleMute(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" class="yt-icon-poly"/><line x1="23" y1="9" x2="17" y2="15" class="yt-muted-line"/><line x1="17" y1="9" x2="23" y2="15" class="yt-muted-line"/></svg></button>`;
}

function _fallbackToYoutube(wrap) {
  const m = HERO_YT_FALLBACK.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (m) wrap.innerHTML = _buildYtEmbed(m[1]);
}

function renderHero(heroes) {
  const videoWrap = $('#hero-video-wrap');
  const overlay   = $('#hero-overlay');
  if (!videoWrap || !overlay) return;
  const h = (heroes && heroes.length > 0) ? heroes[0] : null;
  let bgHtml = '';
  if (h && h.bgVideo) {
    const ytMatch = h.bgVideo.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      /* ── YouTube URL ── */
      bgHtml = _buildYtEmbed(ytMatch[1]);
    } else {
      /* ── 로컬 MP4 URL ── */
      bgHtml = `<video id="hero-video" class="hero-video-full"
          autoplay muted loop playsinline preload="auto"
          poster="${HERO_POSTER}"
          src="${h.bgVideo}"></video>`;
    }
  } else {
    bgHtml = `<div class="hero-video-full" style="background:${(h && h.bgColor) || '#1A2755'};"></div>`;
  }
  videoWrap.innerHTML = bgHtml;

  /* error 시에만 fallback (타임아웃 제거 — 스트리밍 중 오탐 방지) */
  const vid = videoWrap.querySelector('#hero-video');
  if (vid) {
    vid.addEventListener('error', () => {
      console.warn('[Hero] 비디오 error → YouTube fallback');
      _fallbackToYoutube(videoWrap);
    });
  }
  /* 동영상 위 텍스트 오버레이 없음 */
  overlay.style.display = 'none';
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

/* ─── 카테고리 탭 + 제품 그리드 ─── */
function renderCategoryTabs(cats, prods) {
  const tabsEl = $('#cat-tabs');
  if (!tabsEl) return;

  const categories = cats || [];

  tabsEl.innerHTML = categories.map(c => {
    const label = t(c.label) || c.id;
    const isActive = STATE.activeCat === c.id;
    return `<button class="cat-tab${isActive ? ' active' : ''}" data-cat="${c.id}">${label}</button>`;
  }).join('');

  $$('.cat-tab', tabsEl).forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.activeCat = btn.dataset.cat;
      $$('.cat-tab', tabsEl).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProductGrid(prods);
    });
  });

  renderProductGrid(prods);
}

function renderProductGrid(prods) {
  const grid = $('#prod-grid');
  if (!grid) return;
  if (!prods || !prods.length) {
    grid.innerHTML = `<div class="prod-empty">등록된 제품이 없습니다.</div>`;
    return;
  }

  const filtered = STATE.activeCat === 'all'
    ? prods
    : prods.filter(p => p.category === STATE.activeCat);

  if (!filtered.length) {
    grid.innerHTML = `<div class="prod-empty">해당 카테고리에 제품이 없습니다.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const name = t(p.name) || '';
    const catLabel = (() => {
      const c = (STATE.content?.categories || []).find(c => c.id === p.category);
      return c ? (t(c.label) || p.category) : (p.category || '');
    })();
    return `
    <a class="prod-card" href="product.html?id=${p.id}">
      <div class="prod-card-img-wrap">
        <img src="${p.image || ''}" alt="${name}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=prod-card-no-img>📦</div>'" />
        <div class="prod-card-view"><span>VIEW</span></div>
      </div>
      <div class="prod-card-info">
        ${catLabel ? `<span class="prod-card-cat">${catLabel}</span>` : ''}
        <div class="prod-card-name">${name}</div>
      </div>
    </a>`;
  }).join('');
}

/* ─── Brand ─── */
/* 언어별 브랜드 스토리 이미지
 * ko / zh-CN / th → 한국어 버전
 * en              → 영어 버전
 */
const BRAND_STORY_IMGS = {
  ko:      'images/brand-story-ko.jpg',
  en:      'images/brand-story-en.jpg',
  'zh-CN': 'images/brand-story-ko.jpg',
  th:      'images/brand-story-ko.jpg',
};
const BRAND_STORY_ALTS = {
  ko:      'Aestyve 브랜드 스토리 — 미학과 재생의 만남',
  en:      'Aestyve Brand Story — Where Aesthetics Meet Revival',
  'zh-CN': 'Aestyve 品牌故事',
  th:      'Aestyve แบรนด์สตอรี่',
};

function renderBrand() {
  const imgEl = $('#brand-story-img');
  if (!imgEl) return;
  const src = BRAND_STORY_IMGS[STATE.lang] || BRAND_STORY_IMGS['ko'];
  const alt = BRAND_STORY_ALTS[STATE.lang]  || BRAND_STORY_ALTS['ko'];
  imgEl.src = src;
  imgEl.alt = alt;
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
  loadContent();
}

document.addEventListener('DOMContentLoaded', init);
window.showToast = showToast;

/**
 * Aestyve — main.js v5
 * 3CE 모티브 완전 구현:
 *  - Hero: absolute 겹침 + fade 전환 + Ken Burns + 텍스트 stagger anim-in
 *  - Custom Cursor: RAF lag-follow + click 이펙트
 *  - Products: 드래그 스크롤 + 카드 stagger reveal
 *  - Brand: 패럴랙스 + 라인 클립 in-view
 *  - Contact: 라인 클립 + 좌우 슬라이드 in-view
 *  - 전체: IntersectionObserver reveal
 */

/* ══════════════════════════════════════
   GLOBALS
══════════════════════════════════════ */
const STATE = {
  lang: 'ko',
  content: null,
  activeCat: 'all',
  heroIdx: 0,
  heroTotal: 0,
  heroPaused: false,
  heroTimer: null,
  heroDuration: 6000,
  heroTransitioning: false,
};

const LANGS = [
  { code: 'ko',   flag: '🇰🇷', label: '한국어' },
  { code: 'en',   flag: '🇺🇸', label: 'English' },
  { code: 'zh-CN',flag: '🇨🇳', label: '中文' },
  { code: 'th',   flag: '🇹🇭', label: 'ภาษาไทย' },
];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const t = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[STATE.lang] || obj.ko || obj.en || '';
};

function showToast(msg, duration = 2600) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* ══════════════════════════════════════
   CUSTOM CURSOR — RAF lag-follow
══════════════════════════════════════ */
function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  /* Ring은 부드럽게 따라옴 */
  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  })();

  /* 호버 확장 */
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a,button,[role=button],.prod-card,.cat-tab,.hero-dot,.hero-arrow');
    dot.classList.toggle('hover', !!el);
    ring.classList.toggle('hover', !!el);
  });

  /* 클릭 이펙트 */
  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));

  document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });
}

/* ══════════════════════════════════════
   LANG
══════════════════════════════════════ */
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
  [['#lang-switcher'], ['#mobile-lang-switcher']].forEach(([sel]) => {
    const wrap = $(sel);
    if (!wrap) return;
    wrap.innerHTML = '';
    LANGS.forEach(({ code, flag, label }) => {
      const btn = document.createElement('button');
      btn.className = 'lang-btn' + (code === STATE.lang ? ' active' : '');
      btn.textContent = flag; btn.title = label;
      btn.setAttribute('aria-label', label);
      btn.addEventListener('click', () => { setLang(code); renderLangSwitcher(); });
      wrap.appendChild(btn);
    });
  });
}

/* ══════════════════════════════════════
   CONTENT LOAD (cached-first merge)
══════════════════════════════════════ */
async function loadContent() {
  const imgMap = await ImageStore.getAll();

  let fresh = null;
  try {
    const res = await fetch('data/content.json?v=' + Date.now());
    if (res.ok) fresh = await res.json();
  } catch (e) {}

  let cached = null;
  try {
    const s = localStorage.getItem('aestyve_content');
    if (s) cached = JSON.parse(s);
  } catch (e) {}

  const _applyImg = prods => (prods || []).map(p => ({ ...p, detailImages: imgMap[p.id] || [] }));

  if (fresh) {
    if (cached && typeof cached === 'object') {
      const freshMap  = Object.fromEntries((fresh.products || []).map(p => [p.id, p]));
      const cachedIds = new Set((cached.products || []).map(p => p.id));
      const merged    = (cached.products || []).map(cp => ({ ...(freshMap[cp.id] || {}), ...cp, detailImages: imgMap[cp.id] || [] }));
      const freshOnly = (fresh.products || []).filter(fp => !cachedIds.has(fp.id)).map(fp => ({ ...fp, detailImages: imgMap[fp.id] || [] }));
      STATE.content = {
        ...fresh,
        heroes:     cached.heroes     || fresh.heroes,
        settings:   cached.settings   || fresh.settings,
        nav:        cached.nav        || fresh.nav,
        categories: cached.categories || fresh.categories,
        products:   [...merged, ...freshOnly],
      };
    } else {
      STATE.content = { ...fresh, products: _applyImg(fresh.products) };
    }
    renderAll(); return;
  }
  if (cached) {
    cached.products = _applyImg(cached.products || []);
    STATE.content = cached; renderAll(); return;
  }
  console.error('[Aestyve] 콘텐츠 로드 실패');
}

/* ══════════════════════════════════════
   RENDER ALL
══════════════════════════════════════ */
function renderAll() {
  const c = STATE.content;
  if (!c) return;
  renderNav(c.nav);
  renderHero(c.heroes);
  renderMarquee(c.settings);
  renderCategoryTabs(c.categories, c.products);
  renderBrand(c.settings);
  renderContact(c.settings);
  renderFooter(c.settings);
  renderLangSwitcher();
  setTimeout(scanReveal, 150);
}

/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
function renderNav(navItems) {
  const nav    = $('#main-nav');
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

/* ══════════════════════════════════════
   HERO SLIDER ENGINE
   - 슬라이드: absolute 겹침, fade 전환
   - 배경: Ken Burns (CSS animation)
   - 텍스트: stagger anim-in (JS setTimeout)
══════════════════════════════════════ */
/* 슬라이드 HTML 생성 — 배경 이미지 전용 */
function _buildSlideHTML(h, idx) {
  let mediaBg = '';

  if (h.bgImage) {
    /* 이미지 배경 (Base64 또는 URL) — Ken Burns CSS 애니메이션 적용 */
    mediaBg = `<img class="hero-slide-bg" src="${h.bgImage}" alt="" loading="${idx===0?'eager':'lazy'}" />`;
  } else {
    /* 이미지 없으면 딥블루 단색 */
    mediaBg = `<div class="hero-slide-bg" style="background:${h.bgColor||'#0E1A3A'};position:absolute;inset:0;"></div>`;
  }

  const eyebrow = t(h.label)    || 'AESTYVE';
  const title   = t(h.title)    || 'PREMIUM<br>BEAUTY SCIENCE';
  const sub     = t(h.subtitle) || '';

  /* 타이틀 라인 분리 */
  const titleLines = title.replace(/\\n/g, '\n').split(/\n|<br\s*\/?>/i);
  const titleHTML = titleLines.map(line =>
    `<span class="hero-title-line"><span class="hero-title-inner">${line}</span></span>`
  ).join('');

  return `
  <div class="hero-slide" data-idx="${idx}">
    ${mediaBg}
    <div class="hero-slide-overlay"></div>
    <div class="hero-slide-content">
      <div class="hero-slide-eyebrow">${eyebrow}</div>
      <h1 class="hero-slide-title">${titleHTML}</h1>
      ${sub ? `<p class="hero-slide-sub">${sub}</p>` : ''}
    </div>
  </div>`;
}

/* 폴백 슬라이드 */
function _buildFallbackSlide() {
  return `<div class="hero-slide active" data-idx="0">
    <div class="hero-slide-bg" style="background:#0A0A0A;position:absolute;inset:0;"></div>
    <div class="hero-slide-overlay"></div>
    <div class="hero-slide-content">
      <div class="hero-slide-eyebrow">AESTYVE</div>
      <h1 class="hero-slide-title">
        <span class="hero-title-line"><span class="hero-title-inner">PREMIUM</span></span>
        <span class="hero-title-line"><span class="hero-title-inner">BEAUTY</span></span>
      </h1>
    </div>
  </div>`;
}

/* 히어로 텍스트 애니메이션 — anim-in 순차 추가 */
let _textAnimTimer = null;
function _triggerTextAnim(slideEl) {
  if (!slideEl) return;
  clearTimeout(_textAnimTimer);

  /* 모든 요소 리셋 */
  const eyebrow = slideEl.querySelector('.hero-slide-eyebrow');
  const sub     = slideEl.querySelector('.hero-slide-sub');
  const btn     = slideEl.querySelector('.hero-slide-btn');
  const inners  = slideEl.querySelectorAll('.hero-title-inner');

  [eyebrow, sub, btn, ...inners].forEach(el => el && el.classList.remove('anim-in'));

  /* 순차 등장 */
  const seq = [
    { el: eyebrow, delay: 80 },
    ...Array.from(inners).map((el, i) => ({ el, delay: 180 + i * 90 })),
    { el: sub, delay: 380 },
    { el: btn, delay: 500 },
  ];
  seq.forEach(({ el, delay }) => {
    if (!el) return;
    setTimeout(() => el.classList.add('anim-in'), delay);
  });
}

/* CSS: hero-title-line / inner 스타일 추가 (동적) */
function _injectTitleLineStyles() {
  if (document.getElementById('hero-title-line-style')) return;
  const style = document.createElement('style');
  style.id = 'hero-title-line-style';
  style.textContent = `
    .hero-slide-title { overflow: visible; }
    .hero-title-line  { display: block; overflow: hidden; line-height: 0.95; }
    .hero-title-inner {
      display: block; opacity: 0;
      transform: translateY(100%) skewY(2deg);
      transition: none;
      will-change: transform, opacity;
    }
    .hero-title-inner.anim-in {
      opacity: 1; transform: translateY(0) skewY(0);
      transition: opacity .85s cubic-bezier(.16,1,.3,1), transform .85s cubic-bezier(.16,1,.3,1);
    }
    .hero-slide-eyebrow { transition: none; }
    .hero-slide-eyebrow.anim-in {
      opacity: 1 !important; transform: translateY(0) !important;
      transition: opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1) !important;
    }
    .hero-slide-sub { transition: none; }
    .hero-slide-sub.anim-in {
      opacity: 1 !important; transform: translateY(0) !important;
      transition: opacity .65s cubic-bezier(.16,1,.3,1) .05s, transform .65s cubic-bezier(.16,1,.3,1) .05s !important;
    }
    .hero-slide-btn { transition: background .3s, border-color .3s, color .3s; }
    .hero-slide-btn.anim-in {
      opacity: 1 !important; transform: translateY(0) !important;
      transition: opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1),
                  background .3s, border-color .3s, color .3s !important;
    }
  `;
  document.head.appendChild(style);
}

/* 히어로 렌더 */
function renderHero(heroes) {
  _injectTitleLineStyles();
  const track = $('#hero-slides');
  const dotsEl = $('#hero-dots');
  if (!track) return;

  const list = (heroes && heroes.length) ? heroes : null;
  STATE.heroTotal = list ? list.length : 1;
  STATE.heroIdx   = 0;

  if (list) {
    track.innerHTML = list.map((h, i) => _buildSlideHTML(h, i)).join('');
  } else {
    track.innerHTML = _buildFallbackSlide();
  }

  /* 첫 슬라이드 활성화 */
  const firstSlide = track.querySelector('.hero-slide');
  if (firstSlide) firstSlide.classList.add('active');

  /* 도트 생성 */
  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < STATE.heroTotal; i++) {
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab'); dot.setAttribute('aria-label', `슬라이드 ${i+1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsEl.appendChild(dot);
    }
  }

  _updateHeroCounter();

  /* 첫 슬라이드 텍스트 등장 */
  setTimeout(() => _triggerTextAnim(firstSlide), 300);

  /* 자동 재생 */
  if (STATE.heroTotal > 1) {
    _startHeroTimer();
    const hero = $('#hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => { STATE.heroPaused = true;  _stopHeroTimer(); });
      hero.addEventListener('mouseleave', () => { STATE.heroPaused = false; _startHeroTimer(); });
    }
  }

  /* 로컬 비디오 에러 폴백 */
  $$('.hero-slide video', track).forEach(vid => {
    vid.addEventListener('error', () => {
      const slide = vid.closest('.hero-slide');
      if (!slide) return;
      const bg = document.createElement('div');
      bg.className = 'hero-slide-bg';
      bg.style.cssText = 'background:#0A0A0A;position:absolute;inset:0;';
      vid.replaceWith(bg);
    });
  });
}

/* 슬라이드 전환 */
function goToSlide(idx) {
  if (STATE.heroTransitioning) return;
  const slides = $$('.hero-slide', $('#hero-slides'));
  const dots   = $$('.hero-dot',   $('#hero-dots'));
  if (!slides.length) return;

  idx = ((idx % STATE.heroTotal) + STATE.heroTotal) % STATE.heroTotal;
  if (idx === STATE.heroIdx) return;

  STATE.heroTransitioning = true;

  const prevSlide = slides[STATE.heroIdx];
  const nextSlide = slides[idx];

  /* EXIT: 이전 슬라이드 fade out */
  if (prevSlide) {
    prevSlide.classList.remove('active');
    prevSlide.classList.add('exit');
    /* 텍스트 reset */
    ['.hero-slide-eyebrow','.hero-slide-sub','.hero-slide-btn','.hero-title-inner'].forEach(sel => {
      prevSlide.querySelectorAll(sel).forEach(el => el.classList.remove('anim-in'));
    });
    setTimeout(() => prevSlide.classList.remove('exit'), 950);
  }

  /* 도트 */
  dots[STATE.heroIdx]?.classList.remove('active');

  STATE.heroIdx = idx;

  /* ENTER: 다음 슬라이드 fade in */
  if (nextSlide) {
    nextSlide.classList.add('active');
    /* Ken Burns 재시작: animation 재적용 */
    const bg = nextSlide.querySelector('.hero-slide-bg');
    if (bg) {
      bg.style.animation = 'none';
      bg.offsetHeight; // reflow
      bg.style.animation = '';
    }
    /* 텍스트 stagger */
    setTimeout(() => _triggerTextAnim(nextSlide), 120);
  }

  dots[STATE.heroIdx]?.classList.add('active');
  _updateHeroCounter();
  _resetProgress();

  setTimeout(() => { STATE.heroTransitioning = false; }, 950);
}

function _updateHeroCounter() {
  const cur   = $('#hero-cur');
  const total = $('#hero-total');
  if (cur)   cur.textContent   = String(STATE.heroIdx + 1).padStart(2, '0');
  if (total) total.textContent = String(STATE.heroTotal).padStart(2, '0');
}

/* ── 자동 재생 타이머 + Progress bar ── */
let _progressRaf = null;
let _progressStart = 0;

function _startHeroTimer() {
  _stopHeroTimer();
  _progressStart = performance.now();
  _animateProgress();
  STATE.heroTimer = setTimeout(() => {
    if (!STATE.heroPaused) { goToSlide(STATE.heroIdx + 1); _startHeroTimer(); }
  }, STATE.heroDuration);
}

function _stopHeroTimer() {
  clearTimeout(STATE.heroTimer);
  cancelAnimationFrame(_progressRaf);
}

function _resetProgress() {
  const fill = $('#hero-progress-fill');
  if (fill) fill.style.width = '0%';
  _progressStart = performance.now();
}

function _animateProgress() {
  const fill = $('#hero-progress-fill');
  if (!fill) return;
  const pct = Math.min(((performance.now() - _progressStart) / STATE.heroDuration) * 100, 100);
  fill.style.width = pct + '%';
  if (pct < 100) _progressRaf = requestAnimationFrame(_animateProgress);
}

/* ── 히어로 컨트롤 바인딩 ── */
function initHeroControls() {
  const prev = $('#hero-prev');
  const next = $('#hero-next');
  if (prev) prev.addEventListener('click', () => { goToSlide(STATE.heroIdx-1); _startHeroTimer(); });
  if (next) next.addEventListener('click', () => { goToSlide(STATE.heroIdx+1); _startHeroTimer(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goToSlide(STATE.heroIdx-1); _startHeroTimer(); }
    if (e.key === 'ArrowRight') { goToSlide(STATE.heroIdx+1); _startHeroTimer(); }
  });

  /* 터치 스와이프 */
  let touchX = 0;
  const hero = $('#hero');
  if (hero) {
    hero.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 48) { goToSlide(STATE.heroIdx + (dx < 0 ? 1 : -1)); _startHeroTimer(); }
    });
  }

  /* 스크롤 힌트 */
  const hint = $('#hero-scroll-hint');
  if (hint) hint.addEventListener('click', () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════
   MARQUEE
══════════════════════════════════════ */
function renderMarquee(settings) {
  const track = $('#marquee-track');
  if (!track) return;
  const brand = settings?.brandName || 'AESTYVE';
  const words = [brand, 'DERMATOLOGY', 'BEAUTY SCIENCE', 'PREMIUM CARE', brand, 'INNOVATION', 'SCIENCE'];
  const repeated = [...words, ...words];
  track.innerHTML = repeated.map(w => `<span>${w}</span>`).join('');
}

/* ══════════════════════════════════════
   CATEGORY TABS + DRAG SCROLL
══════════════════════════════════════ */
function renderCategoryTabs(cats, prods) {
  const tabsEl = $('#cat-tabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = '';
  (cats || []).forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (STATE.activeCat === c.id ? ' active' : '');
    btn.textContent = t(c.label) || c.id;
    btn.dataset.cat = c.id;
    btn.addEventListener('click', () => {
      STATE.activeCat = c.id;
      $$('.cat-tab', tabsEl).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProductGrid(prods);
    });
    tabsEl.appendChild(btn);
  });
  const countNum = $('#prod-count-num');
  if (countNum) countNum.textContent = (prods || []).length;
  renderProductGrid(prods);
}

function renderProductGrid(prods) {
  const grid  = $('#prod-grid');
  if (!grid) return;

  if (!prods || !prods.length) {
    grid.innerHTML = `<div class="prod-empty">등록된 제품이 없습니다.</div>`;
    _updateScrollThumb(); return;
  }

  const filtered = STATE.activeCat === 'all'
    ? prods
    : prods.filter(p => p.category === STATE.activeCat);

  if (!filtered.length) {
    grid.innerHTML = `<div class="prod-empty">해당 카테고리에 제품이 없습니다.</div>`;
    _updateScrollThumb(); return;
  }

  grid.innerHTML = filtered.map(p => {
    const name = t(p.name) || '';
    const catObj = (STATE.content?.categories || []).find(c => c.id === p.category);
    const catLabel = catObj ? (t(catObj.label) || p.category) : (p.category || '');
    const badges = (p.badges || []).slice(0, 2).map(b => `<span class="prod-card-badge">${b}</span>`).join('');
    return `
    <a class="prod-card reveal" href="product.html?id=${p.id}">
      <div class="prod-card-img-wrap">
        ${badges ? `<div class="prod-card-badge-wrap">${badges}</div>` : ''}
        <img src="${p.image||''}" alt="${name}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=prod-card-no-img>📦</div>'" />
        ${p.hoverImage ? `<img class="prod-card-hover-img" src="${p.hoverImage}" alt="${name} hover" loading="lazy" />` : ''}
        <div class="prod-card-view"><span>VIEW</span></div>
      </div>
      ${catLabel ? `<div class="prod-card-cat">${catLabel}</div>` : ''}
      <div class="prod-card-name">${name}</div>
    </a>`;
  }).join('');

  /* 카드 stagger reveal */
  _staggerCards();
  _updateScrollThumb();
}

/* 카드 stagger — IntersectionObserver + delay */
function _staggerCards() {
  const cards = $$('.prod-card.reveal');
  if (!cards.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = cards.indexOf(e.target);
        setTimeout(() => e.target.classList.add('visible'), idx * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  cards.forEach(c => obs.observe(c));
}

/* 드래그 스크롤 */
function initDragScroll() {
  const track = $('#prod-scroll-track');
  if (!track) return;
  let isDown = false, startX = 0, scrollLeft = 0;
  track.addEventListener('mousedown', e => {
    isDown = true; startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft; track.classList.add('dragging');
  });
  track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('dragging'); });
  track.addEventListener('mouseup',    () => { isDown = false; track.classList.remove('dragging'); });
  track.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.4;
    _updateScrollThumb();
  });
  track.addEventListener('scroll', _updateScrollThumb, { passive: true });
}

function _updateScrollThumb() {
  const track = $('#prod-scroll-track');
  const thumb = $('#prod-scroll-thumb');
  if (!track || !thumb) return;
  const ratio  = track.scrollLeft / (track.scrollWidth - track.clientWidth || 1);
  const bar    = track.parentElement?.querySelector('.prod-scroll-bar');
  const trackW = bar?.clientWidth || 200;
  const thumbW = Math.max(40, (track.clientWidth / track.scrollWidth) * trackW);
  thumb.style.width = thumbW + 'px';
  thumb.style.left  = (ratio * (trackW - thumbW)) + 'px';
}

/* ══════════════════════════════════════
   BRAND — 패럴랙스 + 라인 클립 in-view
══════════════════════════════════════ */
const BRAND_IMGS = {
  ko: 'images/brand-story-ko.jpg', en: 'images/brand-story-en.jpg',
  'zh-CN': 'images/brand-story-ko.jpg', th: 'images/brand-story-ko.jpg',
};
const BRAND_ALTS = {
  ko: 'Aestyve 브랜드 스토리', en: 'Aestyve Brand Story',
  'zh-CN': 'Aestyve 品牌故事', th: 'Aestyve แบรนด์สตอรี่',
};

function renderBrand(settings) {
  const imgEl = $('#brand-story-img');
  if (imgEl) {
    imgEl.src = BRAND_IMGS[STATE.lang] || BRAND_IMGS.ko;
    imgEl.alt = BRAND_ALTS[STATE.lang] || BRAND_ALTS.ko;
  }

  /* 브랜드 오버레이 텍스트 제거됨 — 이미지만 표시 */
}

/* 패럴랙스 */
function initParallax() {
  const img = $('#brand-story-img');
  if (!img) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const brand = $('#brand');
      if (brand) {
        const rect  = brand.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const ratio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          img.style.transform = `translateY(${(ratio - 0.5) * 50}px) scale(1.06)`;
        }
      }
      ticking = false;
    });
  }, { passive: true });
}

/* ══════════════════════════════════════
   CONTACT — 좌우 슬라이드 + 라인 클립
══════════════════════════════════════ */
function renderContact(s) {
  if (!s) return;
  const set = (id, val) => { const el = $(id); if (el) el.textContent = val || '-'; };
  set('#contact-brand-name', (s.brandName || 'AESTYVE').toUpperCase());
  set('#contact-slogan',     t(s.slogan));
  set('#contact-phone',      s.contact?.phone);
  set('#contact-email',      s.contact?.email);
  set('#contact-address',    s.contact?.address);

  const mapText = $('#contact-map-text');
  if (mapText && s.contact?.address) {
    mapText.innerHTML = s.contact.address.replace(/,\s*/g, ',<br/>');
  }

  /* 소셜 */
  const sl = $('#social-links');
  if (sl) {
    const soc = s.social || {};
    const defs = [
      { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
      { key: 'youtube',   icon: 'fab fa-youtube',   label: 'YouTube' },
      { key: 'facebook',  icon: 'fab fa-facebook',  label: 'Facebook' },
      { key: 'tiktok',    icon: 'fab fa-tiktok',    label: 'TikTok' },
    ];
    const links = defs.filter(d => soc[d.key])
      .map(d => `<a href="${soc[d.key]}" class="social-link" target="_blank" rel="noopener" aria-label="${d.label}"><i class="${d.icon}"></i></a>`)
      .join('');
    const wcQr  = s.wechatQr || localStorage.getItem('aestyve_wechat_qr') || '';
    const wcBtn = (soc.wechat || wcQr)
      ? `<button class="social-link wechat-btn" aria-label="WeChat" onclick="openWechatModal()"><i class="fab fa-weixin"></i></button>`
      : '';
    sl.innerHTML = links + wcBtn;
  }

  /* Contact 섹션 in-view 애니메이션 */
  _initContactInView();
}

function _initContactInView() {
  /* Contact head: eyebrow + title + desc */
  const head = $('.contact-head');
  if (head) {
    /* 타이틀 라인 분리 */
    const titleEl = $('.contact-big-title', head);
    if (titleEl && !titleEl.querySelector('.contact-title-line')) {
      const lines = ['GET IN', 'TOUCH'];
      titleEl.innerHTML = lines.map(line =>
        `<span class="contact-title-line"><span class="contact-title-inner">${line}</span></span>`
      ).join('');
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('anim-in');
          /* eyebrow delay */
          const ey = e.target.querySelector('.contact-eyebrow');
          if (ey) setTimeout(() => ey.classList.add('anim-in'), 0);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    obs.observe(head);
  }

  /* Info & Map panel */
  const info = $('.contact-info-panel');
  const map  = $('.contact-map-panel');
  if (info || map) {
    const obs2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('anim-in'); obs2.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    if (info) obs2.observe(info);
    if (map)  obs2.observe(map);
  }
}

/* ══════════════════════════════════════
   WECHAT MODAL
══════════════════════════════════════ */
function openWechatModal() {
  const modal = $('#wechat-modal');
  if (!modal) return;
  const qrSrc = (STATE.content?.settings?.wechatQr) || localStorage.getItem('aestyve_wechat_qr') || '';
  const img = $('#wechat-qr-img'), ph = $('#wechat-qr-placeholder');
  if (img && ph) {
    if (qrSrc) { img.src = qrSrc; img.style.display='block'; ph.style.display='none'; }
    else        { img.style.display='none'; ph.style.display='flex'; }
  }
  modal.style.display = 'flex'; document.body.style.overflow = 'hidden';
}
function closeWechatModal() {
  const modal = $('#wechat-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}
function initWechatModal() {
  const closeBtn = $('#wechat-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeWechatModal);
  const modal = $('#wechat-modal');
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeWechatModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWechatModal(); });
}
window.openWechatModal  = openWechatModal;
window.closeWechatModal = closeWechatModal;

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
function renderFooter(s) {
  if (!s) return;
  const fd = $('#footer-desc');
  if (fd) fd.textContent = t(s.slogan) || '';
  const fc = $('#footer-copyright');
  if (fc) fc.textContent = `© ${new Date().getFullYear()} ${s.brandName||'Aestyve'}. All rights reserved.`;
}

/* ══════════════════════════════════════
   SCROLL REVEAL (일반 요소)
══════════════════════════════════════ */
let _revealObs = null;
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  _revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); _revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  $$('.reveal').forEach(el => _revealObs.observe(el));
}
function scanReveal() {
  if (_revealObs) $$('.reveal:not(.visible)').forEach(el => _revealObs.observe(el));
}

/* ══════════════════════════════════════
   HEADER SCROLL
══════════════════════════════════════ */
function initHeaderScroll() {
  const header = $('#site-header');
  if (!header) return;
  window.addEventListener('scroll', () =>
    header.classList.toggle('scrolled', window.scrollY > 40), { passive: true }
  );
}

/* ══════════════════════════════════════
   HAMBURGER
══════════════════════════════════════ */
function toggleMobileNav(force) {
  const btn = $('#hamburger'), nav = $('#mobile-nav');
  if (!btn || !nav) return;
  const isOpen = force !== undefined ? !force : nav.classList.contains('open');
  nav.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
  document.body.style.overflow = !isOpen ? 'hidden' : '';
}
function initHamburger() {
  const btn = $('#hamburger');
  if (btn) btn.addEventListener('click', () => toggleMobileNav());
  document.addEventListener('click', e => {
    const nav    = $('#mobile-nav');
    const header = $('#site-header');
    if (nav?.classList.contains('open') && !header?.contains(e.target)) toggleMobileNav(false);
  });
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
function init() {
  initLang();
  renderLangSwitcher();
  initCursor();
  initHeaderScroll();
  initHamburger();
  initHeroControls();
  initWechatModal();
  initReveal();
  initDragScroll();
  initParallax();
  loadContent();
}

document.addEventListener('DOMContentLoaded', init);
window.showToast = showToast;

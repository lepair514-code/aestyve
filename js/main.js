/**
 * Aestyve — main.js v4
 * 3CE 모티브: 풀스크린 히어로 슬라이더 + 가로 드래그 스크롤 + 커스텀 커서
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
};

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
   CUSTOM CURSOR
══════════════════════════════════════ */
function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover: none)').matches) return; // 터치 기기

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });

  /* ring은 부드럽게 따라옴 */
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  /* 호버 상태 */
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a, button, [role=button], .prod-card, .cat-tab, .hero-dot');
    if (el) { dot.classList.add('hover'); ring.classList.add('hover'); }
    else     { dot.classList.remove('hover'); ring.classList.remove('hover'); }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '1';
  });
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
  const wrap = $('#lang-switcher');
  const mWrap = $('#mobile-lang-switcher');
  if (!wrap) return;
  [wrap, mWrap].forEach(w => { if (w) w.innerHTML = ''; });
  LANGS.forEach(({ code, flag, label }) => {
    const btn = document.createElement('button');
    btn.className = 'lang-btn' + (code === STATE.lang ? ' active' : '');
    btn.textContent = flag;
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.addEventListener('click', () => { setLang(code); renderLangSwitcher(); });
    wrap.appendChild(btn);
    if (mWrap) {
      const b2 = btn.cloneNode(true);
      b2.addEventListener('click', () => { setLang(code); renderLangSwitcher(); });
      mWrap.appendChild(b2);
    }
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

      const merged   = (cached.products || []).map(cp => ({
        ...(freshMap[cp.id] || {}), ...cp,
        detailImages: imgMap[cp.id] || [],
      }));
      const freshOnly = (fresh.products || [])
        .filter(fp => !cachedIds.has(fp.id))
        .map(fp => ({ ...fp, detailImages: imgMap[fp.id] || [] }));

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
    STATE.content = cached;
    renderAll(); return;
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
  setTimeout(scanReveal, 120);
}

/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
function renderNav(navItems) {
  const nav   = $('#main-nav');
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
══════════════════════════════════════ */
const HERO_YT_FALLBACK = 'https://youtu.be/uRgcUCCeykk';
const HERO_POSTER      = 'images/hero-poster.jpg';

/* ─ 슬라이드 HTML 생성 ─ */
function _buildSlideHTML(h, idx) {
  /* 배경 미디어 */
  let mediaBg = '';
  if (h.bgVideo) {
    const ytMatch = h.bgVideo.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch && idx === 0) {
      /* 첫 슬라이드만 YouTube 자동재생 */
      const vid = ytMatch[1];
      const src = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
      mediaBg = `<div class="yt-wrap"><iframe src="${src}" frameborder="0" allow="autoplay;encrypted-media" title="Hero Video"></iframe></div>`;
    } else if (!ytMatch) {
      /* 로컬 MP4 */
      mediaBg = `<video class="hero-slide-bg" autoplay muted loop playsinline preload="auto" poster="${HERO_POSTER}" src="${h.bgVideo}" id="hero-video-${idx}"></video>`;
    } else {
      /* YouTube 슬라이드지만 첫번째가 아닌 경우 → 포스터 이미지 */
      mediaBg = `<div class="hero-slide-bg" style="background:#0B1628;"></div>`;
    }
  } else if (h.bgImage) {
    mediaBg = `<img class="hero-slide-bg" src="${h.bgImage}" alt="" loading="${idx === 0 ? 'eager' : 'lazy'}" />`;
  } else {
    mediaBg = `<div class="hero-slide-bg" style="background:${h.bgColor || '#0B1628'};"></div>`;
  }

  /* 텍스트 */
  const eyebrow = t(h.label) || 'AESTYVE';
  const title   = t(h.title)    || 'PREMIUM<br>BEAUTY SCIENCE';
  const sub     = t(h.subtitle) || '';
  const btn     = t(h.btnText)  || '';
  const href    = h.btnHref     || '#products';

  return `
  <div class="hero-slide${idx === 0 ? ' active' : ''}" data-idx="${idx}">
    ${mediaBg}
    <div class="hero-slide-overlay"></div>
    <div class="hero-slide-content">
      <div class="hero-slide-eyebrow">${eyebrow}</div>
      <h1 class="hero-slide-title">${title.replace(/\n/g, '<br>')}</h1>
      ${sub ? `<p class="hero-slide-sub">${sub}</p>` : ''}
      ${btn ? `<a href="${href}" class="hero-slide-btn">${btn} <i class="fas fa-arrow-right" style="font-size:.65rem;"></i></a>` : ''}
    </div>
  </div>`;
}

/* ─ 히어로 폴백 (슬라이드가 없을 때) ─ */
function _buildFallbackSlide() {
  const ytMatch = HERO_YT_FALLBACK.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    const vid = ytMatch[1];
    const src = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
    return `<div class="hero-slide active" data-idx="0">
      <div class="yt-wrap"><iframe src="${src}" frameborder="0" allow="autoplay;encrypted-media" title="Hero Video"></iframe></div>
      <div class="hero-slide-overlay"></div>
      <div class="hero-slide-content">
        <div class="hero-slide-eyebrow">AESTYVE</div>
        <h1 class="hero-slide-title">PREMIUM<br>BEAUTY</h1>
      </div>
    </div>`;
  }
  return `<div class="hero-slide active" data-idx="0">
    <div class="hero-slide-bg" style="background:#0B1628;"></div>
    <div class="hero-slide-overlay"></div>
    <div class="hero-slide-content">
      <div class="hero-slide-eyebrow">AESTYVE</div>
      <h1 class="hero-slide-title">PREMIUM<br>BEAUTY</h1>
    </div>
  </div>`;
}

/* ─ 히어로 렌더 ─ */
function renderHero(heroes) {
  const track = $('#hero-slides');
  const dotsEl = $('#hero-dots');
  if (!track) return;

  const list = (heroes && heroes.length) ? heroes : null;
  STATE.heroTotal = list ? list.length : 1;
  STATE.heroIdx   = 0;

  /* 슬라이드 생성 */
  if (list) {
    track.innerHTML = list.map((h, i) => _buildSlideHTML(h, i)).join('');
  } else {
    track.innerHTML = _buildFallbackSlide();
  }

  /* 도트 생성 */
  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < STATE.heroTotal; i++) {
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `슬라이드 ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goToSlide(i));
      dotsEl.appendChild(dot);
    }
  }

  /* 카운터 */
  _updateHeroUI();

  /* 자동 재생 (슬라이드 2개 이상) */
  if (STATE.heroTotal > 1) {
    _startHeroTimer();
    /* 마우스 진입 시 일시정지 */
    const hero = $('#hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => { STATE.heroPaused = true; _stopHeroTimer(); });
      hero.addEventListener('mouseleave', () => { STATE.heroPaused = false; _startHeroTimer(); });
    }
  }

  /* 음소거 버튼 제거 (슬라이더에서는 별도 처리) */
  const muteBtn = $('#hero-unmute-btn');
  if (muteBtn) muteBtn.style.display = 'none';

  /* 로컬 비디오 error → fallback */
  $$('.hero-slide video', track).forEach(vid => {
    vid.addEventListener('error', () => {
      const slide = vid.closest('.hero-slide');
      if (!slide) return;
      const existing = slide.querySelector('.hero-slide-bg');
      if (existing) existing.remove();
      const overlay = document.createElement('div');
      overlay.className = 'hero-slide-bg';
      overlay.style.cssText = 'background:#0B1628;position:absolute;inset:0;';
      slide.insertBefore(overlay, slide.firstChild);
    });
  });
}

/* ─ 슬라이드 이동 ─ */
function goToSlide(idx) {
  const slides = $$('.hero-slide', $('#hero-slides'));
  const dots   = $$('.hero-dot', $('#hero-dots'));
  if (!slides.length) return;

  idx = ((idx % STATE.heroTotal) + STATE.heroTotal) % STATE.heroTotal;

  slides[STATE.heroIdx]?.classList.remove('active');
  dots[STATE.heroIdx]?.classList.remove('active');
  dots[STATE.heroIdx]?.setAttribute('aria-selected', 'false');

  STATE.heroIdx = idx;
  slides[STATE.heroIdx]?.classList.add('active');
  dots[STATE.heroIdx]?.classList.add('active');
  dots[STATE.heroIdx]?.setAttribute('aria-selected', 'true');

  _updateHeroUI();
  _resetHeroProgress();
}

function _updateHeroUI() {
  const cur   = $('#hero-cur');
  const total = $('#hero-total');
  if (cur)   cur.textContent   = String(STATE.heroIdx + 1).padStart(2, '0');
  if (total) total.textContent = String(STATE.heroTotal).padStart(2, '0');
}

/* ─ 자동 재생 타이머 + 프로그레스 바 ─ */
let _progressRaf = null;
let _progressStart = 0;

function _startHeroTimer() {
  _stopHeroTimer();
  _progressStart = performance.now();
  _animateProgress();
  STATE.heroTimer = setTimeout(() => {
    if (!STATE.heroPaused) goToSlide(STATE.heroIdx + 1);
    if (!STATE.heroPaused) _startHeroTimer();
  }, STATE.heroDuration);
}

function _stopHeroTimer() {
  clearTimeout(STATE.heroTimer);
  cancelAnimationFrame(_progressRaf);
}

function _resetHeroProgress() {
  const fill = $('#hero-progress-fill');
  if (fill) fill.style.width = '0%';
  _progressStart = performance.now();
}

function _animateProgress() {
  const fill = $('#hero-progress-fill');
  if (!fill) return;
  const elapsed = performance.now() - _progressStart;
  const pct = Math.min((elapsed / STATE.heroDuration) * 100, 100);
  fill.style.width = pct + '%';
  if (pct < 100) _progressRaf = requestAnimationFrame(_animateProgress);
}

/* ─ 화살표 바인딩 ─ */
function initHeroControls() {
  const prev = $('#hero-prev');
  const next = $('#hero-next');
  if (prev) prev.addEventListener('click', () => { goToSlide(STATE.heroIdx - 1); _startHeroTimer(); });
  if (next) next.addEventListener('click', () => { goToSlide(STATE.heroIdx + 1); _startHeroTimer(); });

  /* 키보드 */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goToSlide(STATE.heroIdx - 1); _startHeroTimer(); }
    if (e.key === 'ArrowRight') { goToSlide(STATE.heroIdx + 1); _startHeroTimer(); }
  });

  /* 터치 스와이프 */
  let touchX = 0;
  const hero = $('#hero');
  if (hero) {
    hero.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) {
        goToSlide(STATE.heroIdx + (dx < 0 ? 1 : -1));
        _startHeroTimer();
      }
    });
  }

  /* 스크롤 힌트 클릭 */
  const hint = $('#hero-scroll-hint');
  if (hint) {
    hint.style.cursor = 'none';
    hint.addEventListener('click', () => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* ══════════════════════════════════════
   MARQUEE
══════════════════════════════════════ */
function renderMarquee(settings) {
  const track = $('#marquee-track');
  if (!track) return;
  const brand = settings?.brandName || 'AESTYVE';
  const words = [brand, 'DERMATOLOGY', 'BEAUTY SCIENCE', 'PREMIUM CARE', brand, 'INNOVATION'];
  /* 2배 반복으로 무한 루프 */
  const repeated = [...words, ...words];
  track.innerHTML = repeated.map(w => `<span>${w}</span>`).join('');
}

/* ══════════════════════════════════════
   CATEGORY TABS + 가로 드래그 스크롤
══════════════════════════════════════ */
function renderCategoryTabs(cats, prods) {
  const tabsEl = $('#cat-tabs');
  if (!tabsEl) return;

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

  /* 제품 수 배지 */
  const countNum = $('#prod-count-num');
  if (countNum) countNum.textContent = (prods || []).length;

  renderProductGrid(prods);
}

function renderProductGrid(prods) {
  const grid  = $('#prod-grid');
  const track = $('#prod-scroll-track');
  if (!grid) return;

  if (!prods || !prods.length) {
    grid.innerHTML = `<div class="prod-empty">등록된 제품이 없습니다.</div>`;
    _updateScrollThumb();
    return;
  }

  const filtered = STATE.activeCat === 'all'
    ? prods
    : prods.filter(p => p.category === STATE.activeCat);

  if (!filtered.length) {
    grid.innerHTML = `<div class="prod-empty">해당 카테고리에 제품이 없습니다.</div>`;
    _updateScrollThumb();
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const name = t(p.name) || '';
    const catLabel = (() => {
      const c = (STATE.content?.categories || []).find(c => c.id === p.category);
      return c ? (t(c.label) || p.category) : (p.category || '');
    })();
    const badges = (p.badges || []).slice(0, 2)
      .map(b => `<span class="prod-card-badge">${b}</span>`).join('');

    return `
    <a class="prod-card" href="product.html?id=${p.id}">
      <div class="prod-card-img-wrap">
        ${badges ? `<div class="prod-card-badge-wrap">${badges}</div>` : ''}
        <img src="${p.image || ''}" alt="${name}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=prod-card-no-img>📦</div>'" />
        <div class="prod-card-view"><span>VIEW</span></div>
      </div>
      ${catLabel ? `<div class="prod-card-cat">${catLabel}</div>` : ''}
      <div class="prod-card-name">${name}</div>
    </a>`;
  }).join('');

  scanReveal();
  _updateScrollThumb();
}

/* ── 가로 드래그 스크롤 ── */
function initDragScroll() {
  const track = $('#prod-scroll-track');
  if (!track) return;

  let isDown = false, startX = 0, scrollLeft = 0;

  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.classList.add('dragging');
  });
  track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('dragging'); });
  track.addEventListener('mouseup',    () => { isDown = false; track.classList.remove('dragging'); });
  track.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    const x  = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.4;
    track.scrollLeft = scrollLeft - walk;
    _updateScrollThumb();
  });

  /* 스크롤 이벤트로도 thumb 업데이트 */
  track.addEventListener('scroll', _updateScrollThumb, { passive: true });
}

function _updateScrollThumb() {
  const track = $('#prod-scroll-track');
  const thumb = $('#prod-scroll-thumb');
  if (!track || !thumb) return;
  const ratio = track.scrollLeft / (track.scrollWidth - track.clientWidth || 1);
  const trackW = track.parentElement?.querySelector('.prod-scroll-bar')?.clientWidth || 100;
  const thumbW = Math.max(40, (track.clientWidth / track.scrollWidth) * trackW);
  thumb.style.width = thumbW + 'px';
  thumb.style.left  = (ratio * (trackW - thumbW)) + 'px';
}

/* ══════════════════════════════════════
   BRAND
══════════════════════════════════════ */
const BRAND_IMGS = {
  ko: 'images/brand-story-ko.jpg',
  en: 'images/brand-story-en.jpg',
  'zh-CN': 'images/brand-story-ko.jpg',
  th: 'images/brand-story-ko.jpg',
};
const BRAND_ALTS = {
  ko: 'Aestyve 브랜드 스토리',
  en: 'Aestyve Brand Story',
  'zh-CN': 'Aestyve 品牌故事',
  th: 'Aestyve แบรนด์สตอรี่',
};

function renderBrand(settings) {
  const img = $('#brand-story-img');
  if (img) { img.src = BRAND_IMGS[STATE.lang] || BRAND_IMGS.ko; img.alt = BRAND_ALTS[STATE.lang] || BRAND_ALTS.ko; }

  /* 브랜드 오버레이 텍스트 */
  const titleEl = $('#brand-overlay-title');
  const descEl  = $('#brand-overlay-desc');
  if (settings) {
    if (titleEl) titleEl.innerHTML = (settings.brandName || 'AESTYVE').toUpperCase() + '<br>SCIENCE';
    if (descEl) descEl.textContent = t(settings.brandStory) || t(settings.slogan) || '';
  }
}

/* ══════════════════════════════════════
   CONTACT
══════════════════════════════════════ */
function renderContact(s) {
  if (!s) return;

  const set = (id, val) => { const el = $(id); if (el) el.textContent = val || '-'; };
  set('#contact-brand-name', (s.brandName || 'AESTYVE').toUpperCase());
  set('#contact-slogan', t(s.slogan));
  set('#contact-phone', s.contact?.phone);
  set('#contact-email', s.contact?.email);
  set('#contact-address', s.contact?.address);

  const mapText = $('#contact-map-text');
  if (mapText && s.contact?.address) {
    mapText.innerHTML = s.contact.address.replace(/,\s*/g, ',<br/>');
  }

  /* 소셜 링크 */
  const sl = $('#social-links');
  if (sl) {
    const social = s.social || {};
    const defs = [
      { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
      { key: 'youtube',   icon: 'fab fa-youtube',   label: 'YouTube' },
      { key: 'facebook',  icon: 'fab fa-facebook',  label: 'Facebook' },
      { key: 'tiktok',    icon: 'fab fa-tiktok',    label: 'TikTok' },
    ];
    const links = defs.filter(d => social[d.key])
      .map(d => `<a href="${social[d.key]}" class="social-link" target="_blank" rel="noopener" aria-label="${d.label}"><i class="${d.icon}"></i></a>`)
      .join('');

    const wcQr  = s.wechatQr || localStorage.getItem('aestyve_wechat_qr') || '';
    const wcBtn = (social.wechat || wcQr)
      ? `<button class="social-link wechat-btn" aria-label="WeChat" onclick="openWechatModal()"><i class="fab fa-weixin"></i></button>`
      : '';

    sl.innerHTML = links + wcBtn;
  }
}

/* ══════════════════════════════════════
   WECHAT MODAL
══════════════════════════════════════ */
function openWechatModal() {
  const modal = $('#wechat-modal');
  if (!modal) return;
  const qrSrc = (STATE.content?.settings?.wechatQr) || localStorage.getItem('aestyve_wechat_qr') || '';
  const img = $('#wechat-qr-img');
  const ph  = $('#wechat-qr-placeholder');
  if (img && ph) {
    if (qrSrc) { img.src = qrSrc; img.style.display = 'block'; ph.style.display = 'none'; }
    else        { img.style.display = 'none'; ph.style.display = 'flex'; }
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
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
  if (fc) fc.textContent = `© ${new Date().getFullYear()} ${s.brandName || 'Aestyve'}. All rights reserved.`;
}

/* ══════════════════════════════════════
   SCROLL REVEAL
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
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
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
  const btn = $('#hamburger');
  const nav = $('#mobile-nav');
  if (!btn || !nav) return;
  const isOpen = force !== undefined ? !force : nav.classList.contains('open');
  nav.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', !isOpen);
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
   PARALLAX (brand image on scroll)
══════════════════════════════════════ */
function initParallax() {
  const img = $('#brand-story-img');
  if (!img) return;
  window.addEventListener('scroll', () => {
    const brand = $('#brand');
    if (!brand) return;
    const rect = brand.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const ratio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    img.style.transform = `translateY(${(ratio - 0.5) * 40}px) scale(1.05)`;
  }, { passive: true });
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

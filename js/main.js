/**
 * Aestyve — main.js
 * Hero 비디오 + Products 이미지 수직 나열 + Brand/Contact/Footer
 */

/* ─── 전역 상태 ─── */
const STATE = {
  lang: 'ko',
  content: null,
};

const LANGS = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'zh-CN', flag: '🇨🇳', label: '中文' },
  { code: 'th',   flag: '🇹🇭', label: 'ภาษาไทย' },
];

/* ─── 유틸 ─── */
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

/* ─── 언어 초기화 ─── */
function initLang() {
  const stored = localStorage.getItem('aestyve_lang');
  if (stored && LANGS.find(l => l.code === stored)) {
    STATE.lang = stored;
  } else {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('zh')) STATE.lang = 'zh-CN';
    else if (nav.startsWith('th')) STATE.lang = 'th';
    else if (nav.startsWith('en')) STATE.lang = 'en';
    else STATE.lang = 'ko';
  }
  const params = new URLSearchParams(location.search);
  const lp = params.get('lang');
  if (lp && LANGS.find(l => l.code === lp)) STATE.lang = lp;
}

function setLang(code) {
  STATE.lang = code;
  localStorage.setItem('aestyve_lang', code);
  document.documentElement.lang = code;
  if (STATE.content) renderAll();
}

/* ─── 언어 스위처 ─── */
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
  // localStorage 우선
  try {
    const stored = localStorage.getItem('aestyve_content');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        STATE.content = parsed;
        renderAll();
        return;
      }
    }
  } catch (e) {
    console.warn('[Aestyve] localStorage 파싱 오류');
  }
  // content.json fallback
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
    $$('.mobile-nav-link', mLinks).forEach(a => {
      a.addEventListener('click', () => toggleMobileNav(false));
    });
  }
}

/* ─── Hero 비디오 ─── */
function renderHero(heroes) {
  const videoWrap = $('#hero-video-wrap');
  const overlay   = $('#hero-overlay');
  if (!videoWrap || !overlay) return;

  const h = (heroes && heroes.length > 0) ? heroes[0] : null;

  let bgHtml = '';
  if (h && h.bgVideo) {
    const src = h.bgVideo;
    const ytMatch = src.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (ytMatch) {
      const videoId = ytMatch[1];
      const embedSrc =
        `https://www.youtube.com/embed/${videoId}` +
        `?autoplay=1&mute=1&loop=1&playlist=${videoId}` +
        `&controls=0&showinfo=0&rel=0&modestbranding=1` +
        `&playsinline=1&enablejsapi=1&vq=hd1080` +
        `&origin=${encodeURIComponent(location.origin)}`;

      bgHtml = `<iframe
          id="hero-yt-iframe"
          class="hero-video-full"
          src="${embedSrc}"
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
          title="Aestyve Hero Video"></iframe>`;

      bgHtml += `<button id="hero-unmute-btn" aria-label="소리 켜기" title="소리 켜기"
          onclick="heroToggleMute(this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" class="yt-icon-poly"/>
            <line x1="23" y1="9" x2="17" y2="15" class="yt-muted-line"/>
            <line x1="17" y1="9" x2="23" y2="15" class="yt-muted-line"/>
          </svg>
        </button>`;
    } else {
      bgHtml = `<video id="hero-video" class="hero-video-full"
          autoplay muted loop playsinline preload="auto" src="${src}"></video>`;
    }
  } else if (h && h.bgImage) {
    bgHtml = `<img class="hero-video-full" src="${h.bgImage}" alt="" aria-hidden="true" />`;
  } else {
    const bgColor = (h && h.bgColor) || '#1A2755';
    bgHtml = `<div class="hero-video-full" style="background:${bgColor};"></div>`;
  }
  videoWrap.innerHTML = bgHtml;

  if (h) {
    const accent = h.accentColor || '#A8B9FF';
    const titleLines = (t(h.title) || '').replace(/\n/g, '<br/>');
    overlay.innerHTML = `
      <div class="hero-overlay-inner">
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

/* ─── YouTube 음소거 토글 ─── */
let _ytMuted = true;
function heroToggleMute(btn) {
  const iframe = document.getElementById('hero-yt-iframe');
  if (!iframe) return;
  _ytMuted = !_ytMuted;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func: _ytMuted ? 'mute' : 'unMute', args: [] }), '*'
  );
  btn.querySelectorAll('.yt-muted-line').forEach(l => { l.style.display = _ytMuted ? '' : 'none'; });
  if (!_ytMuted) {
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*'
    );
  }
}
window.heroToggleMute = heroToggleMute;

/* ─── Products — reanzen 스타일 이미지 좌 + 스펙 우 ─── */
function renderProducts(prods) {
  const grid = $('#product-grid');
  if (!grid) return;

  if (!prods || !prods.length) {
    grid.innerHTML = `<div class="loading-block">제품 데이터 없음</div>`;
    return;
  }

  const labels = {
    composition: { ko: 'Composition', en: 'Composition', 'zh-CN': 'Composition', th: 'Composition' },
    rawMaterial: { ko: 'Raw Material', en: 'Raw Material', 'zh-CN': 'Raw Material', th: 'Raw Material' },
    purpose:     { ko: 'Purpose',     en: 'Purpose',     'zh-CN': 'Purpose',     th: 'Purpose' },
    storage:     { ko: 'Storage',     en: 'Storage',     'zh-CN': 'Storage',     th: 'Storage' },
  };

  /* 섹션 헤딩 */
  const headingHtml = `
    <div class="prod-section-heading">
      <h2>PRODUCTS</h2>
    </div>`;

  /* 제품 행 */
  const itemsHtml = prods.map((p) => {
    const imgHtml = p.image
      ? `<img src="${p.image}" alt="${t(p.name)}" loading="lazy" />`
      : `<div class="prod-img-placeholder">✦</div>`;

    /* 뱃지 pills */
    const badgesHtml = (p.badges && p.badges.length)
      ? `<div class="prod-badges">${p.badges.map(b => `<span class="prod-badge">${b}</span>`).join('')}</div>`
      : '';

    /* 스펙 rows — labeled sections */
    const specRows = [
      { key: 'composition', val: p.composition },
      { key: 'rawMaterial', val: p.rawMaterial },
      { key: 'purpose',     val: t(p.purpose) },
      { key: 'storage',     val: t(p.storage) },
    ].filter(r => r.val).map(r => `
      <div class="prod-spec-row">
        <div class="prod-spec-label">${labels[r.key][STATE.lang] || labels[r.key]['en']}</div>
        <div class="prod-spec-val">${r.val}</div>
      </div>`).join('');

    return `
    <div class="prod-item">
      <div class="prod-img-wrap">${imgHtml}</div>
      <div class="prod-info">
        ${badgesHtml}
        <h3 class="prod-name">${t(p.name) || ''}</h3>
        <div class="prod-specs">${specRows}</div>
      </div>
    </div>`;
  }).join('');

  grid.innerHTML = headingHtml + itemsHtml;
}

/* ─── Brand ─── */
function renderBrand(s) {
  if (!s) return;
  const descEl = $('#brand-desc');
  if (descEl && s.brandStory) descEl.textContent = t(s.brandStory);

  const statsEl = $('#brand-stats');
  if (statsEl && s.stats?.length) {
    statsEl.innerHTML = s.stats.map(st => `
      <div class="brand-stat">
        <div class="stat-number">${st.number || '-'}</div>
        <div class="stat-label">${t(st.label) || '-'}</div>
      </div>`).join('');
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

  const socDefs = [
    { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
    { key: 'youtube',   icon: 'fab fa-youtube',   label: 'YouTube' },
    { key: 'facebook',  icon: 'fab fa-facebook',  label: 'Facebook' },
    { key: 'tiktok',    icon: 'fab fa-tiktok',    label: 'TikTok' },
  ];
  const sl = $('#social-links');
  if (sl) {
    const social = s.social || {};
    sl.innerHTML = socDefs
      .filter(d => social[d.key])
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
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
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

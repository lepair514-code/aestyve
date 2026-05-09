/**
 * Aestyve — product.js
 * 상세 페이지: URL 파라미터 ?id=p1 로 제품 데이터 로드
 */

const STATE = { lang: 'ko', content: null };
const LANGS = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'zh-CN', flag: '🇨🇳', label: '中文' },
  { code: 'th',   flag: '🇹🇭', label: 'ภาษาไทย' },
];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const t = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[STATE.lang] || obj['ko'] || obj['en'] || '';
};

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
  if (STATE.content) renderProduct();
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
    btn.addEventListener('click', () => { setLang(code); renderLangSwitcher(); });
    wrap.appendChild(btn);
    if (mobileWrap) {
      const b2 = btn.cloneNode(true);
      b2.addEventListener('click', () => { setLang(code); renderLangSwitcher(); });
      mobileWrap.appendChild(b2);
    }
  });
}

function renderNav(navItems) {
  const nav = $('#main-nav');
  if (!nav || !navItems) return;
  nav.innerHTML = navItems.map(item =>
    `<a href="index.html${item.href}" class="nav-link">${t(item.label)}</a>`
  ).join('');
  const mLinks = $('#mobile-nav-links');
  if (mLinks) {
    mLinks.innerHTML = navItems.map(item =>
      `<a href="index.html${item.href}" class="mobile-nav-link">${t(item.label)}</a>`
    ).join('');
  }
}

/* ─── 콘텐츠 로드 (content.json 우선, localStorage fallback) ─── */
async function loadContent() {
  /* 1) content.json 항상 먼저 fetch */
  let fresh = null;
  try {
    const res = await fetch('data/content.json?v=' + Date.now());
    if (res.ok) fresh = await res.json();
  } catch (e) {}

  if (fresh) {
    /* content.json 성공 → localStorage의 name·detail·detailImages 덮어쓰기 */
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
              if (!cp) return fp;
              return {
                ...fp,
                name:         cp.name         || fp.name,
                detail:       cp.detail       || fp.detail,
                category:     cp.category     || fp.category,
                detailImages: cp.detailImages || fp.detailImages || [],
              };
            }),
            categories: fresh.categories || cached.categories,
          };
          renderProduct();
          return;
        }
      }
    } catch (e) {}
    STATE.content = fresh;
    renderProduct();
    return;
  }

  /* 2) fetch 실패 → localStorage 폴백 */
  try {
    const stored = localStorage.getItem('aestyve_content');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') { STATE.content = parsed; renderProduct(); return; }
    }
  } catch (e) {}

  console.error('[Aestyve] content.json 로드 실패 및 localStorage 없음');
}

/* ─── 제품 렌더 ─── */
function renderProduct() {
  const c = STATE.content;
  if (!c) return;

  renderNav(c.nav);
  renderLangSwitcher();

  /* URL에서 id 파라미터 읽기 */
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const prods = c.products || [];
  const p = id ? prods.find(x => x.id === id) : prods[0];

  if (!p) {
    document.title = 'Aestyve — Product';
    return;
  }

  const name   = t(p.name)   || '';
  const detail = t(p.detail) || t(p.desc) || '';

  document.title = `Aestyve — ${name}`;

  const imgEl  = $('#detail-img');
  const nameEl = $('#detail-name');
  const descEl = $('#detail-desc');

  if (imgEl)  { imgEl.src = p.image || ''; imgEl.alt = name; }
  if (nameEl) nameEl.textContent = name;
  if (descEl) {
    if (detail) {
      descEl.textContent = detail;
      descEl.className = 'detail-desc';
    } else {
      descEl.textContent = STATE.lang === 'ko' ? '상세 내용은 준비 중입니다.' : 'Details coming soon.';
      descEl.className = 'detail-empty';
    }
  }

  /* ─── 상세 이미지 갤러리 ─── */
  const section = $('#detail-images-section');
  if (section) {
    const imgs = p.detailImages || [];
    if (imgs.length > 0) {
      section.style.display = '';
      section.innerHTML = imgs.map((src, i) => `
        <div class="detail-gallery-item" onclick="openLightbox(${i})">
          <img src="${src}" alt="${name} 상세 이미지 ${i + 1}"
               onerror="this.closest('.detail-gallery-item').style.display='none'" />
        </div>`).join('');
      /* 라이트박스 데이터 저장 */
      section._imgs = imgs;
    } else {
      section.style.display = 'none';
      section.innerHTML = '';
    }
  }
}

/* ─── 라이트박스 ─── */
window.openLightbox = function(idx) {
  const section = $('#detail-images-section');
  const imgs = section?._imgs || [];
  if (!imgs.length) return;

  let current = idx;
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.innerHTML = `
    <div id="lightbox-bg"></div>
    <button id="lightbox-close" aria-label="닫기">✕</button>
    ${imgs.length > 1 ? `<button id="lightbox-prev" aria-label="이전">&#8249;</button>` : ''}
    <div id="lightbox-img-wrap">
      <img id="lightbox-img" src="${imgs[current]}" alt="" />
    </div>
    ${imgs.length > 1 ? `<button id="lightbox-next" aria-label="다음">&#8250;</button>` : ''}
    ${imgs.length > 1 ? `<div id="lightbox-counter">${current + 1} / ${imgs.length}</div>` : ''}
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const imgEl = overlay.querySelector('#lightbox-img');
  const counter = overlay.querySelector('#lightbox-counter');

  function goTo(i) {
    current = (i + imgs.length) % imgs.length;
    imgEl.src = imgs[current];
    if (counter) counter.textContent = `${current + 1} / ${imgs.length}`;
  }

  overlay.querySelector('#lightbox-close').addEventListener('click', closeLightbox);
  overlay.querySelector('#lightbox-bg').addEventListener('click', closeLightbox);
  overlay.querySelector('#lightbox-prev')?.addEventListener('click', () => goTo(current - 1));
  overlay.querySelector('#lightbox-next')?.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', _lbKeyHandler);
  function _lbKeyHandler(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  }
  overlay._keyHandler = _lbKeyHandler;
};

function closeLightbox() {
  const overlay = $('#lightbox-overlay');
  if (!overlay) return;
  document.removeEventListener('keydown', overlay._keyHandler);
  overlay.remove();
  document.body.style.overflow = '';
}

/* ─── Header scroll ─── */
function initHeaderScroll() {
  const header = $('#site-header');
  if (!header) return;
  window.addEventListener('scroll', () =>
    header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
}

/* ─── Hamburger ─── */
function initHamburger() {
  const btn = $('#hamburger');
  const nav = $('#mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', e => {
    const header = $('#site-header');
    if (nav.classList.contains('open') && !header?.contains(e.target)) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  initLang();
  renderLangSwitcher();
  initHeaderScroll();
  initHamburger();
  loadContent();
});

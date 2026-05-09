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

/* ─── 콘텐츠 로드 ─── */
async function loadContent() {
  try {
    const stored = localStorage.getItem('aestyve_content');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') { STATE.content = parsed; renderProduct(); return; }
    }
  } catch (e) {}
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    STATE.content = await res.json();
    renderProduct();
  } catch (err) {
    console.error('[Aestyve] content.json 로드 실패:', err);
  }
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

  const name = t(p.name) || '';
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

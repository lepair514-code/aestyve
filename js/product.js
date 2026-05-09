/**
 * Aestyve — product.js
 * 상세 페이지
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
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
    return (products || []).map(p => ({
      ...p,
      detailImages: imgMap[p.id] || [],
    }));
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
          renderProduct();
          return;
        }
      }
    } catch (e) {}
    STATE.content = { ...fresh, products: _applyImgMap(fresh.products) };
    renderProduct();
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
        renderProduct();
        return;
      }
    }
  } catch (e) {}
  console.error('[Aestyve] content.json 로드 실패');
}

/* ─── 제품 렌더 ─── */
function renderProduct() {
  const c = STATE.content;
  if (!c) return;

  renderNav(c.nav);
  renderLangSwitcher();

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const prods = c.products || [];
  const p = id ? prods.find(x => x.id === id) : prods[0];

  if (!p) { document.title = 'Aestyve — Product'; return; }

  const name = t(p.name) || '';
  document.title = `Aestyve — ${name}`;

  /* 메인 이미지 */
  const imgEl = $('#detail-img');
  if (imgEl) { imgEl.src = p.image || ''; imgEl.alt = name; }

  /* 배지 */
  const badgesEl = $('#detail-badges');
  if (badgesEl) {
    const badges = p.badges || [];
    badgesEl.innerHTML = badges.map(b => `<span class="detail-badge">${esc(b)}</span>`).join('');
    badgesEl.style.display = badges.length ? '' : 'none';
  }

  /* 제품명 */
  const nameEl = $('#detail-name');
  if (nameEl) nameEl.textContent = name;

  /* 목적/설명 */
  const purposeEl = $('#detail-purpose');
  if (purposeEl) {
    const purpose = t(p.purpose) || t(p.detail) || t(p.desc) || '';
    if (purpose) {
      purposeEl.textContent = purpose;
      purposeEl.style.display = '';
    } else {
      purposeEl.style.display = 'none';
    }
  }

  /* 스펙 테이블: composition + rawMaterial */
  const specsEl = $('#detail-specs');
  if (specsEl) {
    const rows = [];
    const specLabels = {
      ko: { composition: '용량 / 구성', rawMaterial: '원료', storage: '보관 방법' },
      en: { composition: 'Composition', rawMaterial: 'Raw Material', storage: 'Storage' },
      'zh-CN': { composition: '成分', rawMaterial: '原料', storage: '储存方法' },
      th: { composition: 'ส่วนประกอบ', rawMaterial: 'วัตถุดิบ', storage: 'การเก็บรักษา' },
    };
    const labels = specLabels[STATE.lang] || specLabels['ko'];
    if (p.composition) rows.push([labels.composition, p.composition]);
    if (p.rawMaterial)  rows.push([labels.rawMaterial, p.rawMaterial]);

    if (rows.length) {
      specsEl.innerHTML = `
        <table class="detail-spec-table">
          <tbody>
            ${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}
          </tbody>
        </table>`;
      specsEl.style.display = '';
    } else {
      specsEl.style.display = 'none';
    }
  }

  /* 보관 방법 */
  const storageEl = $('#detail-storage');
  if (storageEl) {
    const storage = t(p.storage) || '';
    if (storage) {
      const storageTitle = { ko:'보관 방법', en:'Storage', 'zh-CN':'储存方法', th:'การเก็บรักษา' }[STATE.lang] || 'Storage';
      storageEl.innerHTML = `
        <div class="detail-storage-inner">
          <i class="fas fa-snowflake"></i>
          <div>
            <div class="detail-storage-title">${esc(storageTitle)}</div>
            <div class="detail-storage-text">${esc(storage)}</div>
          </div>
        </div>`;
      storageEl.style.display = '';
    } else {
      storageEl.style.display = 'none';
    }
  }

  /* 카탈로그 이미지 갤러리 */
  const gallerySection = $('#detail-gallery-section');
  const galleryGrid = $('#detail-gallery-grid');
  const imgs = p.detailImages || [];
  if (gallerySection && galleryGrid) {
    if (imgs.length) {
      gallerySection.style.display = '';
      galleryGrid.innerHTML = imgs.map((src, i) => `
        <div class="detail-gallery-item" data-idx="${i}" role="button" tabindex="0"
             aria-label="카탈로그 이미지 ${i+1}">
          <img src="${esc(src)}" alt="${esc(name)} 카탈로그 ${i+1}"
               onerror="this.closest('.detail-gallery-item').style.display='none'" />
          <div class="detail-gallery-zoom"><i class="fas fa-search-plus"></i></div>
        </div>`).join('');

      /* 클릭 → 라이트박스 */
      galleryGrid.querySelectorAll('.detail-gallery-item').forEach(item => {
        item.addEventListener('click', () => openLightbox(parseInt(item.dataset.idx), imgs, name));
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') openLightbox(parseInt(item.dataset.idx), imgs, name);
        });
      });
    } else {
      gallerySection.style.display = 'none';
    }
  }
}

/* ─── 라이트박스 ─── */
let _lbImgs = [], _lbCurrent = 0;

function openLightbox(idx, imgs, altBase) {
  _lbImgs = imgs;
  _lbCurrent = idx;
  const lb = $('#lightbox');
  if (!lb) return;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  _lbRender(altBase);
}
function _lbRender(altBase) {
  const img = $('#lightbox-img');
  const counter = $('#lightbox-counter');
  const prev = $('#lightbox-prev');
  const next = $('#lightbox-next');
  if (img) { img.src = _lbImgs[_lbCurrent]; img.alt = `${altBase || ''} ${_lbCurrent + 1}`; }
  if (counter) counter.textContent = `${_lbCurrent + 1} / ${_lbImgs.length}`;
  if (prev) prev.style.display = _lbImgs.length > 1 ? '' : 'none';
  if (next) next.style.display = _lbImgs.length > 1 ? '' : 'none';
}
function closeLightbox() {
  const lb = $('#lightbox');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
}
function lbGo(dir) {
  _lbCurrent = (_lbCurrent + dir + _lbImgs.length) % _lbImgs.length;
  _lbRender();
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

  /* 라이트박스 이벤트 */
  const lb = $('#lightbox');
  if (lb) {
    $('#lightbox-bg')?.addEventListener('click', closeLightbox);
    $('#lightbox-close')?.addEventListener('click', closeLightbox);
    $('#lightbox-prev')?.addEventListener('click', () => lbGo(-1));
    $('#lightbox-next')?.addEventListener('click', () => lbGo(1));
    document.addEventListener('keydown', e => {
      if (lb.style.display === 'none') return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft')  lbGo(-1);
      if (e.key === 'ArrowRight') lbGo(1);
    });
  }
});

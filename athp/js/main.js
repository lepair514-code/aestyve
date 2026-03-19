/**
 * Aestyve — main.js
 * 기능: content.json 로드 → 다국어(i18n) → 렌더(히어로/카테고리/제품/리뷰/연락처)
 *       슬라이더 자동/수동, 탭 필터, 리뷰 슬라이더, 헤더 스크롤, 햄버거, 토스트
 */

/* ─── 전역 상태 ─── */
const STATE = {
  lang: 'ko',
  content: null,
  heroIdx: 0,
  heroTimer: null,
  revIdx: 0,
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
  // URL param override
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

/* ─── 언어 스위처 렌더 ─── */
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
    btn.setAttribute('aria-pressed', code === STATE.lang ? 'true' : 'false');
    btn.addEventListener('click', () => {
      setLang(code);
      renderLangSwitcher();
    });
    wrap.appendChild(btn);

    if (mobileWrap) {
      const btn2 = btn.cloneNode(true);
      btn2.addEventListener('click', () => {
        setLang(code);
        renderLangSwitcher();
      });
      mobileWrap.appendChild(btn2);
    }
  });
}

/* ─── content.json 로드 ─── */
async function loadContent() {
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    STATE.content = await res.json();
    renderAll();
  } catch (err) {
    console.error('[Aestyve] content.json 로드 실패:', err);
    renderError('data/content.json 파일을 찾을 수 없습니다.<br/>관리자 페이지에서 데이터를 Export 후 파일을 배포해주세요.');
  }
}

function renderError(msg) {
  const sections = ['#hero', '#categories', '#products', '#brand', '#reviews'];
  sections.forEach(sel => {
    const el = $(sel);
    if (el) el.innerHTML = `<div class="container"><div class="error-block">${msg}</div></div>`;
  });
}

/* ─── 전체 렌더 ─── */
function renderAll() {
  const c = STATE.content;
  if (!c) return;
  renderNoticeBar(c.settings);
  renderNav(c.nav);
  renderHero(c.heroes);
  renderCategories(c.categories);
  renderProducts(c.products);
  renderBrand(c.settings);
  renderReviews(c.reviews);
  renderContact(c.settings);
  renderFooter(c.settings);
  renderLangSwitcher();
}

/* ─── Notice Bar ─── */
function renderNoticeBar(s) {
  const el = $('#notice-bar');
  if (!el) return;
  if (!s.noticeBar?.visible) { el.style.display = 'none'; return; }
  el.style.display = '';
  el.textContent = t(s.noticeBar.text);
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
    // Close mobile nav on link click
    $$('.mobile-nav-link', mLinks).forEach(a => {
      a.addEventListener('click', () => toggleMobileNav(false));
    });
  }
}

/* ─── Hero Slider ─── */
function renderHero(heroes) {
  if (!heroes?.length) return;
  const track = $('#hero-track');
  const dotsWrap = $('#hero-dots');
  if (!track || !dotsWrap) return;

  // Slides
  track.innerHTML = heroes.map((h, i) => {
    const titleLines = t(h.title) || '';
    return `
    <div class="hero-slide" role="group" aria-label="슬라이드 ${i+1}" data-idx="${i}">
      <div class="hero-bg-block" style="background:${h.bgColor || '#1A2755'};"></div>
      <div class="hero-deco" style="background:${h.accentColor || '#4F7EF7'};"></div>
      <div class="hero-deco2" style="background:${h.accentColor || '#4F7EF7'};"></div>
      <div class="container">
        <div class="hero-content">
          <span class="hero-label" style="background:${h.accentColor || '#4F7EF7'}22;color:${h.accentColor || '#A8B9FF'};">
            ${t(h.label)}
          </span>
          <h1 class="hero-title" style="color:#ffffff;">${(titleLines).replace(/\n/g,'<br/>')}</h1>
          <p class="hero-subtitle" style="color:rgba(255,255,255,.75);">${t(h.subtitle)}</p>
          <a href="${h.btnHref || '#'}" class="hero-btn"
             style="color:${h.accentColor || '#A8B9FF'};border-color:${h.accentColor || '#A8B9FF'};">
            ${t(h.btnText)} <span>&#8594;</span>
          </a>
        </div>
      </div>
    </div>`;
  }).join('');

  // Dots
  dotsWrap.innerHTML = heroes.map((_, i) =>
    `<button class="hero-dot${i===0?' active':''}" role="tab" aria-label="슬라이드 ${i+1} 선택" data-idx="${i}"></button>`
  ).join('');
  $$('.hero-dot', dotsWrap).forEach(dot => {
    dot.addEventListener('click', () => goHero(parseInt(dot.dataset.idx)));
  });

  goHero(0);
  startHeroAuto();
}

function goHero(idx) {
  const heroes = STATE.content?.heroes;
  if (!heroes) return;
  const count = heroes.length;
  idx = ((idx % count) + count) % count;
  STATE.heroIdx = idx;

  const track = $('#hero-track');
  if (track) track.style.transform = `translateX(-${idx * 100}%)`;

  $$('.hero-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
    d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
  });
}

function startHeroAuto() {
  clearInterval(STATE.heroTimer);
  STATE.heroTimer = setInterval(() => {
    const count = STATE.content?.heroes?.length || 1;
    goHero((STATE.heroIdx + 1) % count);
  }, 5500);
}

/* ─── Categories ─── */
function renderCategories(cats) {
  const grid = $('#category-grid');
  if (!grid) return;
  if (!cats?.length) {
    grid.innerHTML = `<div class="error-block">카테고리 데이터 없음</div>`;
    return;
  }
  grid.innerHTML = cats.map(c => `
    <div class="category-card" style="background:${c.bgColor||'#E8ECF8'};color:${c.accentColor||'#1A2755'};" tabindex="0" role="button" aria-label="${t(c.title)}">
      <span class="cat-icon">${c.icon||'✨'}</span>
      <div class="cat-title">${t(c.title)}</div>
      <div class="cat-desc" style="color:${c.accentColor||'#1A2755'};">${t(c.desc)}</div>
    </div>`
  ).join('');

  // Section text i18n
  updateStaticText('#cat-tag', { ko:'카테고리', en:'CATEGORIES', 'zh-CN':'分类', th:'หมวดหมู่' });
  updateStaticText('#cat-title', { ko:'피부 고민별 솔루션', en:'Solutions by Skin Concern', 'zh-CN':'按肤质烦恼分类', th:'โซลูชันตามปัญหาผิว' });
  updateStaticText('#cat-desc', { ko:'당신의 피부 타입과 고민에 맞는 과학적 솔루션을 찾아보세요', en:'Find scientific solutions tailored to your skin type and concerns', 'zh-CN':'找到适合您肤质和烦恼的科学解决方案', th:'ค้นหาโซลูชันทางวิทยาศาสตร์ที่เหมาะกับประเภทผิวและปัญหาของคุณ' });
}

/* ─── Products ─── */
function renderProducts(prods) {
  const grid = $('#product-grid');
  if (!grid) return;
  if (!prods?.length) {
    grid.innerHTML = `<div class="error-block" style="grid-column:1/-1;">제품 데이터 없음</div>`;
    return;
  }
  grid.innerHTML = prods.map(p => `
    <div class="product-card" data-cat="${p.category||'all'}">
      <div class="product-thumb" style="background:${p.bgColor||'#E8ECF8'};">
        <div class="product-thumb-inner" style="background:${p.bgColor||'#E8ECF8'};color:${p.accentColor||'#1A2755'};">
          ${(t(p.name)||'').split(' ').slice(0,2).map(w => w[0]||'').join('')}
        </div>
        <span class="product-badge" style="background:${p.accentColor||'#1A2755'};">${t(p.badge)||''}</span>
      </div>
      <div class="product-body">
        <div class="product-name">${t(p.name)}</div>
        <div class="product-desc">${t(p.desc)}</div>
        <div class="product-footer">
          <span class="product-price">${p.price||''}</span>
          <button class="product-buy" onclick="showToast('준비 중입니다 😊')">
            ${STATE.lang==='ko'?'구매하기':STATE.lang==='en'?'Buy Now':STATE.lang==='zh-CN'?'立即购买':'ซื้อเลย'}
          </button>
        </div>
      </div>
    </div>`
  ).join('');

  updateStaticText('#prod-tag', { ko:'제품', en:'PRODUCTS', 'zh-CN':'产品', th:'สินค้า' });
  updateStaticText('#prod-title', { ko:'Aestyve 제품', en:'Aestyve Products', 'zh-CN':'Aestyve 产品', th:'สินค้า Aestyve' });
  updateStaticText('#prod-desc', { ko:'피부과학이 만든 믿을 수 있는 뷰티 솔루션', en:'Trustworthy beauty solutions made by derma science', 'zh-CN':'皮肤科学打造的可信赖美容解决方案', th:'โซลูชันความงามที่เชื่อถือได้จากวิทยาศาสตร์ผิวหนัง' });

  // Re-apply current filter
  const activeTab = $('.filter-tab.active');
  if (activeTab) applyFilter(activeTab.dataset.filter);
}

function applyFilter(filter) {
  $$('.product-card').forEach(card => {
    const cat = card.dataset.cat || 'all';
    const show = filter === 'all' || cat === filter;
    card.classList.toggle('hidden', !show);
  });
}

/* ─── Brand ─── */
function renderBrand(s) {
  updateStaticText('#brand-title', { ko:'피부과학의 혁신,\n아름다움의 새 기준', en:'Innovation in Dermatology,\nA New Standard of Beauty', 'zh-CN':'皮肤科学的创新，\n美丽的新标准', th:'นวัตกรรมผิวหนัง\nมาตรฐานความงามใหม่' });
  updateStaticText('#brand-tag', { ko:'ABOUT AESTYVE', en:'ABOUT AESTYVE', 'zh-CN':'关于 AESTYVE', th:'เกี่ยวกับ AESTYVE' });

  const descEl = $('#brand-desc');
  if (descEl && s.brandStory) descEl.textContent = t(s.brandStory);

  const statsEl = $('#brand-stats');
  if (statsEl && s.stats?.length) {
    statsEl.innerHTML = s.stats.map(st => `
      <div class="brand-stat">
        <div class="stat-number">${st.number||'-'}</div>
        <div class="stat-label">${t(st.label)||'-'}</div>
      </div>`
    ).join('');
  }
}

/* ─── Reviews ─── */
let revAutoTimer = null;
function renderReviews(reviews) {
  const track = $('#reviews-track');
  if (!track) return;
  if (!reviews?.length) {
    track.innerHTML = `<div class="error-block">리뷰 데이터 없음</div>`;
    return;
  }

  updateStaticText('#review-title', { ko:'고객 후기', en:'Customer Reviews', 'zh-CN':'客户评价', th:'รีวิวจากลูกค้า' });
  updateStaticText('#review-desc', { ko:'Aestyve를 경험한 고객들의 진솔한 이야기', en:'Honest stories from customers who experienced Aestyve', 'zh-CN':'亲身体验Aestyve的客户真实故事', th:'เรื่องราวจริงจากลูกค้าที่มีประสบการณ์กับ Aestyve' });

  track.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating||5)}${'☆'.repeat(5-(r.rating||5))}</div>
      <p class="review-text">"${t(r.text)}"</p>
      <span class="review-author">— ${t(r.name)}</span>
    </div>`
  ).join('');

  STATE.revIdx = 0;
  clearInterval(revAutoTimer);
  revAutoTimer = setInterval(() => scrollReviews(1), 4000);
}

function scrollReviews(dir) {
  const track = $('#reviews-track');
  if (!track) return;
  const cards = $$('.review-card', track);
  if (!cards.length) return;
  const count = cards.length;
  STATE.revIdx = ((STATE.revIdx + dir) % count + count) % count;

  const cardW = cards[0].offsetWidth + 20; // gap
  track.style.transform = `translateX(-${STATE.revIdx * cardW}px)`;
}

/* ─── Contact ─── */
function renderContact(s) {
  if (!s) return;
  const setT = (id, val) => { const el = $(id); if (el) el.textContent = val || '-'; };
  setT('#contact-brand-name', s.brandName);
  setT('#contact-slogan', t(s.slogan));
  setT('#contact-phone', s.contact?.phone);
  setT('#contact-email', s.contact?.email);
  setT('#contact-address', s.contact?.address);
  setT('#contact-map-text', s.contact?.address);

  const social = s.social || {};
  const socDefs = [
    { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
    { key: 'youtube',   icon: 'fab fa-youtube',   label: 'YouTube' },
    { key: 'facebook',  icon: 'fab fa-facebook',  label: 'Facebook' },
    { key: 'tiktok',    icon: 'fab fa-tiktok',    label: 'TikTok' },
  ];
  const sl = $('#social-links');
  if (sl) {
    sl.innerHTML = socDefs
      .filter(s => social[s.key])
      .map(s => `<a href="${social[s.key]}" class="social-link" target="_blank" rel="noopener" aria-label="${s.label}"><i class="${s.icon}"></i></a>`)
      .join('');
  }
}

/* ─── Footer ─── */
function renderFooter(s) {
  const fd = $('#footer-desc');
  if (fd) fd.innerHTML = `${t(s.slogan)||'Aestyve'} — ${t(s.brandStory)||''}`.slice(0, 100) + '...';
  const fc = $('#footer-copyright');
  if (fc) fc.textContent = `© ${new Date().getFullYear()} ${s.brandName||'Aestyve'}. All rights reserved.`;
}

/* ─── Helper: static text i18n ─── */
function updateStaticText(sel, obj) {
  const el = $(sel);
  if (!el) return;
  const txt = t(obj);
  if (txt) el.innerHTML = txt.replace(/\n/g, '<br/>');
}

/* ─── Filter Tabs (이벤트 위임) ─── */
function initFilters() {
  const tabContainer = document.querySelector('.filter-tabs');
  if (!tabContainer) return;
  tabContainer.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;
    $$('.filter-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    applyFilter(btn.dataset.filter);
  });
}

/* ─── Hero Navigation ─── */
function initHeroNav() {
  const prev = $('#hero-prev');
  const next = $('#hero-next');
  if (prev) prev.addEventListener('click', () => {
    const count = STATE.content?.heroes?.length || 1;
    goHero((STATE.heroIdx - 1 + count) % count);
    startHeroAuto();
  });
  if (next) next.addEventListener('click', () => {
    const count = STATE.content?.heroes?.length || 1;
    goHero((STATE.heroIdx + 1) % count);
    startHeroAuto();
  });
}

/* ─── Reviews Navigation ─── */
function initReviewNav() {
  const prev = $('#rev-prev');
  const next = $('#rev-next');
  if (prev) prev.addEventListener('click', () => {
    clearInterval(revAutoTimer);
    scrollReviews(-1);
  });
  if (next) next.addEventListener('click', () => {
    clearInterval(revAutoTimer);
    scrollReviews(1);
  });
}

/* ─── Header Scroll ─── */
function initHeaderScroll() {
  const header = $('#site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
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
  // Close on outside click
  document.addEventListener('click', e => {
    const nav = $('#mobile-nav');
    const header = $('#site-header');
    if (nav?.classList.contains('open') && !header?.contains(e.target)) toggleMobileNav(false);
  });
}

/* ─── Touch / Swipe (Hero) ─── */
function initHeroSwipe() {
  const section = $('#hero');
  if (!section) return;
  let startX = 0;
  section.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  section.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) {
      const count = STATE.content?.heroes?.length || 1;
      goHero(diff < 0 ? (STATE.heroIdx + 1) % count : (STATE.heroIdx - 1 + count) % count);
      startHeroAuto();
    }
  });
}

/* ─── Init ─── */
function init() {
  initLang();
  renderLangSwitcher();
  initFilters();
  initHeroNav();
  initReviewNav();
  initHeaderScroll();
  initHamburger();
  initHeroSwipe();
  loadContent();
}

document.addEventListener('DOMContentLoaded', init);

// 전역 노출 (onclick 콜백용)
window.showToast = showToast;

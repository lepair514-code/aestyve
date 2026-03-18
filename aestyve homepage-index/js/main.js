/* =========================================================
   Aestyve - Main JS (i18n + API rendering)
   Languages: ko | en | zh-CN | th
   Lang key: stored in localStorage as 'aestyve_lang'
   ?lang=ko|en|zh-CN|th URL param overrides all
   Browser lang mapping:
     zh, zh-CN, zh-TW, zh-HK → zh-CN
     th → th
     ko → ko
     * → en
   ========================================================= */

'use strict';

/* ── SUPPORTED LANGUAGES ── */
const LANGS = ['ko', 'en', 'zh-CN', 'th'];

/* ── i18n STRINGS ── */
const I18N = {
  ko: {
    nav_home: '홈', nav_skincare: '스킨케어', nav_products: '제품',
    nav_brand: '브랜드', nav_contact: '고객센터',
    hero_shop_now: '제품 보기',
    trust_derma: '피부과 테스트 완료', trust_clinical: '임상 시험 성분',
    trust_shipping: '전 세계 배송', trust_return: '30일 반품 보장',
    cat_eyebrow: '피부 고민별 라인', cat_title: '내 피부 고민에 맞는 솔루션',
    cat_subtitle: '피부 고민에 특화된 라인으로 맞춤 케어를 시작하세요',
    prod_eyebrow: '베스트셀러', prod_title: '지금 인기 있는 제품',
    tab_all: '전체', tab_device: '디바이스', tab_skincare: '스킨케어', tab_set: '세트',
    brand_eyebrow: 'OUR STORY', brand_title: '에스티브 브랜드',
    review_eyebrow: '고객 리뷰', review_title: '실제 사용 후기',
    cert_eyebrow: 'TRUSTED', cert_title: '안심하고 사용하세요',
    cert1_title: '피부과 테스트', cert1_desc: '30명 이상의 피부과 전문의가 검증한 성분과 처방',
    cert2_title: '안전한 성분', cert2_desc: '임상 시험을 완료한 500+ 성분만 엄선 사용',
    cert3_title: '수상 경력', cert3_desc: '국내외 뷰티 어워드 다수 수상한 검증된 브랜드',
    cert4_title: '지속 가능성', cert4_desc: '친환경 패키징과 동물 실험 없는 클린 뷰티',
    footer_products: '제품', footer_device: '디바이스', footer_skincare: '스킨케어',
    footer_sets: '세트', footer_new: '신제품',
    footer_company: '회사', footer_about: '브랜드 소개', footer_news: '뉴스',
    footer_careers: '채용', footer_stores: '매장 안내',
    footer_contact: '고객센터',
    footer_privacy: '개인정보처리방침', footer_terms: '이용약관',
    btn_shop: '구매하기', currency_symbol: '₩',
  },
  en: {
    nav_home: 'Home', nav_skincare: 'Skincare', nav_products: 'Products',
    nav_brand: 'Brand', nav_contact: 'Support',
    hero_shop_now: 'Shop Now',
    trust_derma: 'Dermatologist Tested', trust_clinical: 'Clinically Tested Ingredients',
    trust_shipping: 'Worldwide Shipping', trust_return: '30-Day Returns',
    cat_eyebrow: 'BY SKIN CONCERN', cat_title: 'Find Your Skin Solution',
    cat_subtitle: 'Explore lines crafted for your unique skin concern',
    prod_eyebrow: 'BESTSELLERS', prod_title: 'Trending Right Now',
    tab_all: 'All', tab_device: 'Devices', tab_skincare: 'Skincare', tab_set: 'Sets',
    brand_eyebrow: 'OUR STORY', brand_title: 'About Aestyve',
    review_eyebrow: 'REVIEWS', review_title: 'What Our Customers Say',
    cert_eyebrow: 'TRUSTED', cert_title: 'Shop with Confidence',
    cert1_title: 'Dermatologist Tested', cert1_desc: 'Verified by 30+ dermatology specialists',
    cert2_title: 'Safe Ingredients', cert2_desc: 'Only 500+ clinically-tested ingredients used',
    cert3_title: 'Award Winning', cert3_desc: 'Multiple international beauty awards',
    cert4_title: 'Sustainable', cert4_desc: 'Eco packaging & cruelty-free clean beauty',
    footer_products: 'Products', footer_device: 'Devices', footer_skincare: 'Skincare',
    footer_sets: 'Sets', footer_new: 'New Arrivals',
    footer_company: 'Company', footer_about: 'About', footer_news: 'News',
    footer_careers: 'Careers', footer_stores: 'Store Locator',
    footer_contact: 'Support',
    footer_privacy: 'Privacy Policy', footer_terms: 'Terms of Service',
    btn_shop: 'Shop Now', currency_symbol: '₩',
  },
  'zh-CN': {
    nav_home: '首页', nav_skincare: '护肤', nav_products: '产品',
    nav_brand: '品牌', nav_contact: '客服',
    hero_shop_now: '立即选购',
    trust_derma: '皮肤科测试认证', trust_clinical: '临床验证成分',
    trust_shipping: '全球配送', trust_return: '30天退换保障',
    cat_eyebrow: '按肌肤问题', cat_title: '找到适合您的肌肤方案',
    cat_subtitle: '专为您的肌肤烦恼定制的护肤系列',
    prod_eyebrow: '畅销产品', prod_title: '热卖中',
    tab_all: '全部', tab_device: '美容仪', tab_skincare: '护肤品', tab_set: '套装',
    brand_eyebrow: '品牌故事', brand_title: '关于爱思蒂薇',
    review_eyebrow: '用户评价', review_title: '真实使用感受',
    cert_eyebrow: '品质认证', cert_title: '放心选购',
    cert1_title: '皮肤科测试', cert1_desc: '30位以上皮肤科医生认证的成分与配方',
    cert2_title: '安全成分', cert2_desc: '严选500+经临床验证的安全成分',
    cert3_title: '获奖品牌', cert3_desc: '荣获多个国际美妆大奖',
    cert4_title: '可持续发展', cert4_desc: '环保包装，无动物实验',
    footer_products: '产品', footer_device: '美容仪', footer_skincare: '护肤品',
    footer_sets: '套装', footer_new: '新品上市',
    footer_company: '公司', footer_about: '品牌介绍', footer_news: '新闻',
    footer_careers: '招聘', footer_stores: '门店查询',
    footer_contact: '客服',
    footer_privacy: '隐私政策', footer_terms: '服务条款',
    btn_shop: '立即购买', currency_symbol: '₩',
  },
  th: {
    nav_home: 'หน้าหลัก', nav_skincare: 'สกินแคร์', nav_products: 'สินค้า',
    nav_brand: 'แบรนด์', nav_contact: 'ติดต่อ',
    hero_shop_now: 'ซื้อเลย',
    trust_derma: 'ผ่านการทดสอบโดยผิวแพทย์', trust_clinical: 'ส่วนผสมผ่านการทดสอบทางคลินิก',
    trust_shipping: 'จัดส่งทั่วโลก', trust_return: 'คืนสินค้าภายใน 30 วัน',
    cat_eyebrow: 'ตามปัญหาผิว', cat_title: 'ค้นหาโซลูชันสำหรับผิวของคุณ',
    cat_subtitle: 'ไลน์ผลิตภัณฑ์ที่ออกแบบมาเพื่อแก้ปัญหาผิวของคุณ',
    prod_eyebrow: 'สินค้าขายดี', prod_title: 'กำลังเป็นที่นิยม',
    tab_all: 'ทั้งหมด', tab_device: 'อุปกรณ์', tab_skincare: 'สกินแคร์', tab_set: 'เซต',
    brand_eyebrow: 'เรื่องราวของเรา', brand_title: 'เกี่ยวกับ Aestyve',
    review_eyebrow: 'รีวิวลูกค้า', review_title: 'ประสบการณ์จริงจากผู้ใช้',
    cert_eyebrow: 'ได้รับการรับรอง', cert_title: 'ซื้ออย่างมั่นใจ',
    cert1_title: 'ผ่านการทดสอบผิวแพทย์', cert1_desc: 'ตรวจสอบโดยผิวแพทย์กว่า 30 คน',
    cert2_title: 'ส่วนผสมปลอดภัย', cert2_desc: 'คัดสรรเฉพาะส่วนผสม 500+ ที่ผ่านการทดสอบทางคลินิก',
    cert3_title: 'รางวัลที่ได้รับ', cert3_desc: 'ผ่านรางวัลความงามระดับนานาชาติมากมาย',
    cert4_title: 'ยั่งยืน', cert4_desc: 'บรรจุภัณฑ์เป็นมิตรกับสิ่งแวดล้อม ไม่ทดสอบกับสัตว์',
    footer_products: 'สินค้า', footer_device: 'อุปกรณ์', footer_skincare: 'สกินแคร์',
    footer_sets: 'เซต', footer_new: 'สินค้าใหม่',
    footer_company: 'บริษัท', footer_about: 'เกี่ยวกับเรา', footer_news: 'ข่าวสาร',
    footer_careers: 'ร่วมงานกับเรา', footer_stores: 'ค้นหาสาขา',
    footer_contact: 'ติดต่อ',
    footer_privacy: 'นโยบายความเป็นส่วนตัว', footer_terms: 'ข้อกำหนดการใช้บริการ',
    btn_shop: 'ซื้อเลย', currency_symbol: '₩',
  }
};

/* ── LANGUAGE DETECTION & MANAGEMENT ── */
let currentLang = 'ko';

function detectLang() {
  // 1. URL param ?lang=
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang) {
    const matched = matchLang(urlLang);
    if (matched) return matched;
  }
  // 2. localStorage
  const stored = localStorage.getItem('aestyve_lang');
  if (stored && LANGS.includes(stored)) return stored;
  // 3. Browser language
  const navLang = navigator.language || navigator.userLanguage || '';
  return matchLang(navLang);
}

function matchLang(rawLang) {
  const l = rawLang.toLowerCase();
  // zh-CN, zh-TW, zh-HK, zh → zh-CN (간체 우선)
  if (l.startsWith('zh')) return 'zh-CN';
  if (l.startsWith('th')) return 'th';
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('en')) return 'en';
  return null;
}

function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem('aestyve_lang', lang);
  applyLang();
  refreshContent();
  updateLangBtns();
  // Update html lang attr
  document.documentElement.lang = lang;
}

function applyLang() {
  const strings = I18N[currentLang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (strings[key] !== undefined) el.textContent = strings[key];
  });
}

function updateLangBtns() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
  });
}

/* ── GET LOCALIZED VALUE from a field prefix ── */
// Example: getL(record, 'title') → record.title_ko / title_en / title_zh_CN / title_th
function getL(obj, field) {
  const suffix = currentLang.replace('-', '_'); // zh-CN → zh_CN
  const key = `${field}_${suffix}`;
  const val = obj[key];
  if (val && val.trim && val.trim() !== '') return val;
  // Fallback chain: ko → en
  const fallbacks = ['ko', 'en', 'zh_CN', 'th'];
  for (const fb of fallbacks) {
    const fbKey = `${field}_${fb}`;
    if (obj[fbKey] && obj[fbKey].trim && obj[fbKey].trim() !== '') return obj[fbKey];
  }
  return '';
}

/* ── API HELPERS ── */
async function apiFetch(table, params = {}) {
  const qs = new URLSearchParams({ limit: 100, ...params }).toString();
  const res = await fetch(`tables/${table}?${qs}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

/* ── HERO SLIDER STATE ── */
let heroSlides = [];
let heroIdx = 0;
let heroInterval = null;

function buildHero(banners) {
  heroSlides = banners.filter(b => b.visible !== false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  renderHeroSlides();
  buildHeroDots();
  startHeroAuto();
}

function renderHeroSlides() {
  const wrap = document.getElementById('heroSlides');
  if (!wrap) return;
  if (heroSlides.length === 0) {
    wrap.innerHTML = `<div class="hero-slide" style="background:#1A2755;align-items:center;justify-content:center;">
      <div class="hero-content align-center"><h1 class="hero-title">Aestyve</h1></div>
    </div>`;
    return;
  }
  wrap.innerHTML = heroSlides.map((s, i) => {
    const title = getL(s, 'title');
    const subtitle = getL(s, 'subtitle');
    const btnText = getL(s, 'btn_text');
    const align = s.text_align || 'left';
    const bgColor = s.bg_color || '#111';
    return `<div class="hero-slide" style="background:${bgColor};">
      ${s.image_url ? `<img src="${s.image_url}" alt="${title}" loading="${i===0?'eager':'lazy'}" />` : ''}
      <div class="hero-slide-overlay"></div>
      <div class="hero-content align-${align}">
        <div class="hero-label">AESTYVE</div>
        <h1 class="hero-title">${title}</h1>
        <p class="hero-subtitle">${subtitle}</p>
        <a href="${s.btn_link||'#products'}" class="hero-btn">${btnText||I18N[currentLang].hero_shop_now} <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>`;
  }).join('');
  goToHeroSlide(heroIdx, false);
}

function buildHeroDots() {
  const dots = document.getElementById('heroDots');
  if (!dots) return;
  dots.innerHTML = heroSlides.map((_, i) =>
    `<button class="hero-dot${i===0?' active':''}" onclick="goToHeroSlide(${i})" aria-label="슬라이드 ${i+1}"></button>`
  ).join('');
}

function goToHeroSlide(idx, animate = true) {
  heroIdx = ((idx % heroSlides.length) + heroSlides.length) % heroSlides.length;
  const wrap = document.getElementById('heroSlides');
  if (wrap) {
    wrap.style.transition = animate ? 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
    wrap.style.transform = `translateX(-${heroIdx * 100}%)`;
  }
  document.querySelectorAll('.hero-dot').forEach((d,i) => d.classList.toggle('active', i===heroIdx));
}

function slideHero(dir) {
  stopHeroAuto();
  goToHeroSlide(heroIdx + dir);
  startHeroAuto();
}

function startHeroAuto() {
  stopHeroAuto();
  if (heroSlides.length > 1) heroInterval = setInterval(() => goToHeroSlide(heroIdx + 1), 5500);
}
function stopHeroAuto() { if (heroInterval) { clearInterval(heroInterval); heroInterval = null; } }

/* ── CATEGORIES ── */
function buildCategories(cats) {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  const visible = cats.filter(c => c.visible !== false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  if (visible.length === 0) { grid.innerHTML = ''; return; }
  grid.innerHTML = visible.map(c => {
    const name = getL(c, 'name');
    const concern = getL(c, 'skin_concern');
    const label = getL(c, 'label');
    return `<a href="${c.link_url||'#products'}" class="category-card">
      ${c.image_url ? `<img src="${c.image_url}" alt="${name}" loading="lazy" />` : '<div style="background:#ddd;width:100%;height:100%;"></div>'}
      <div class="category-card-overlay">
        <div class="category-label">${label}</div>
        <div class="category-name">${name}</div>
        <div class="category-concern">${concern}</div>
      </div>
      <div class="category-arrow"><i class="fas fa-arrow-right"></i></div>
    </a>`;
  }).join('');
}

/* ── PRODUCTS ── */
let allProducts = [];
let currentTab = 'all';

function buildProducts(products) {
  allProducts = products.filter(p => p.visible !== false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  renderProducts(currentTab);
}

function filterProducts(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tab));
  renderProducts(tab);
}

function renderProducts(tab) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const filtered = tab === 'all' ? allProducts : allProducts.filter(p => p.tab_category === tab);
  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color:#888;grid-column:1/-1;padding:40px;text-align:center;">No products</p>`;
    return;
  }
  const strings = I18N[currentLang] || I18N.en;
  grid.innerHTML = filtered.map(p => {
    const name = getL(p, 'name');
    const desc = getL(p, 'desc');
    const badge = getL(p, 'badge');
    const badgeLower = badge.toLowerCase();
    const badgeClass = badgeLower.includes('new') ? 'badge-new' :
                       badgeLower.includes('인기') || badgeLower.includes('popular') || badgeLower.includes('热') || badgeLower.includes('ยอด') ? 'badge-popular' :
                       badgeLower.includes('save') || badgeLower.includes('할인') || badgeLower.includes('划') || badgeLower.includes('ลด') ? 'badge-save' : '';
    const priceStr = p.price ? `${strings.currency_symbol}${Number(p.price).toLocaleString()}` : '';
    return `<div class="product-card">
      <div class="product-img-wrap">
        ${p.image_url ? `<img src="${p.image_url}" alt="${name}" loading="lazy" />` : ''}
        ${badge ? `<span class="product-badge ${badgeClass}">${badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${name}</div>
        <div class="product-desc">${desc}</div>
        <div class="product-footer">
          <div class="product-price">${priceStr}</div>
          <a href="${p.link_url||'#'}" class="product-btn">${strings.btn_shop}</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── BRAND STORY ── */
function buildBrand(settings) {
  if (!settings) return;
  const story = getL(settings, 'brand_story');
  const storyEl = document.getElementById('brandStoryText');
  if (storyEl) storyEl.textContent = story;

  const statsEl = document.getElementById('brandStats');
  if (statsEl) {
    const stats = [
      { number: settings.stat1_number, label: getL(settings, 'stat1_label') },
      { number: settings.stat2_number, label: getL(settings, 'stat2_label') },
      { number: settings.stat3_number, label: getL(settings, 'stat3_label') },
    ].filter(s => s.number);
    statsEl.innerHTML = stats.map(s => `
      <div class="brand-stat-card">
        <div class="brand-stat-number">${s.number}</div>
        <div class="brand-stat-label">${s.label}</div>
      </div>`).join('');
  }
}

/* ── REVIEWS ── */
function buildReviews(reviews) {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;
  const visible = reviews.filter(r => r.visible !== false);
  if (visible.length === 0) return;

  // Duplicate for infinite scroll
  const doubled = [...visible, ...visible];
  track.innerHTML = doubled.map(r => {
    const content = getL(r, 'content');
    const product = getL(r, 'product');
    const stars = '★'.repeat(Math.min(5, Math.max(1, r.rating||5))) + '☆'.repeat(5 - Math.min(5, r.rating||5));
    const initial = (r.author||'?')[0].toUpperCase();
    return `<div class="review-card">
      <div class="review-stars">${stars}</div>
      <p class="review-text">"${content}"</p>
      <div class="review-meta">
        <div class="review-avatar">${initial}</div>
        <div>
          <div class="review-author">${r.author||''}</div>
          <div class="review-product">${product}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── SITE SETTINGS ── */
function applySiteSettings(settings) {
  if (!settings) return;

  // Primary color
  if (settings.primary_color) {
    document.documentElement.style.setProperty('--primary', settings.primary_color);
  }
  if (settings.secondary_color) {
    document.documentElement.style.setProperty('--primary-light', settings.secondary_color);
  }

  // Notice bar
  const noticebar = document.getElementById('noticebar');
  const noticeText = document.getElementById('noticeText');
  if (settings.notice_visible === false || settings.notice_visible === 0) {
    if (noticebar) noticebar.style.display = 'none';
  } else if (noticeText) {
    noticeText.textContent = getL(settings, 'notice_text');
  }

  // Footer slogan
  const footerSlogan = document.getElementById('footerSlogan');
  if (footerSlogan) footerSlogan.textContent = getL(settings, 'slogan');

  // Footer contacts
  const footerPhone = document.getElementById('footerPhone');
  const footerEmail = document.getElementById('footerEmail');
  const footerAddress = document.getElementById('footerAddress');
  if (footerPhone && settings.footer_phone) footerPhone.textContent = settings.footer_phone;
  if (footerEmail && settings.footer_email) footerEmail.textContent = settings.footer_email;
  if (footerAddress) footerAddress.textContent = getL(settings, 'footer_address');

  // SNS links
  const snsMap = {
    snsInsta: settings.sns_instagram,
    snsYoutube: settings.sns_youtube,
    snsFacebook: settings.sns_facebook,
    snsTiktok: settings.sns_tiktok,
  };
  Object.entries(snsMap).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
  });
}

/* ── REFRESH CONTENT on lang change ── */
let cachedData = { settings: null, banners: [], categories: [], products: [], reviews: [] };

function refreshContent() {
  applyLang();
  if (cachedData.settings) applySiteSettings(cachedData.settings);
  if (cachedData.banners.length) buildHero(cachedData.banners);
  if (cachedData.categories.length) buildCategories(cachedData.categories);
  if (cachedData.products.length) buildProducts(cachedData.products);
  if (cachedData.reviews.length) buildReviews(cachedData.reviews);
  if (cachedData.settings) buildBrand(cachedData.settings);
}

/* ── MAIN INIT ── */
async function init() {
  // Language init
  currentLang = detectLang() || 'ko';
  document.documentElement.lang = currentLang;
  applyLang();
  updateLangBtns();

  // Footer year
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll shadow
  const header = document.getElementById('mainHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // Back to top
  const backTop = document.getElementById('backToTop');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  }

  // Fetch all data in parallel
  try {
    const [settingsRes, bannersRes, categoriesRes, productsRes, reviewsRes] = await Promise.all([
      apiFetch('site_settings'),
      apiFetch('banners', { sort: 'sort_order' }),
      apiFetch('categories', { sort: 'sort_order' }),
      apiFetch('products', { sort: 'sort_order' }),
      apiFetch('reviews'),
    ]);

    // Site settings
    const settingsArr = settingsRes.data || [];
    const settings = settingsArr.length > 0 ? settingsArr[0] : null;
    cachedData.settings = settings;
    if (settings) applySiteSettings(settings);
    if (settings) buildBrand(settings);

    // Banners
    const banners = bannersRes.data || [];
    cachedData.banners = banners;
    buildHero(banners);

    // Categories
    const categories = categoriesRes.data || [];
    cachedData.categories = categories;
    buildCategories(categories);

    // Products
    const products = productsRes.data || [];
    cachedData.products = products;
    buildProducts(products);

    // Reviews
    const reviews = reviewsRes.data || [];
    cachedData.reviews = reviews;
    buildReviews(reviews);

  } catch (err) {
    console.error('[Aestyve] Data load error:', err);
  }
}

/* ── MOBILE MENU ── */
function openMobileMenu() {
  document.getElementById('mobileNav').classList.add('open');
  document.getElementById('mobileOverlay').classList.add('open');
  document.getElementById('mobileMenuBtn').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('open');
  document.getElementById('mobileMenuBtn').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('mobileMenuBtn');
  if (btn) btn.addEventListener('click', openMobileMenu);
  init();
});

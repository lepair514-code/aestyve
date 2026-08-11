/* =============================================
   Aestyve - Main JavaScript
   ============================================= */

'use strict';

// ── State ──────────────────────────────────────
let currentLang = localStorage.getItem('aestyve-lang') || 'ko';
let contentData = null;
let heroTimer = null;
let currentHeroSlide = 0;

// ── Bootstrap ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  initHeader();
  initMobileNav();
  initScrollReveal();
});

// ── Content Load ───────────────────────────────
async function loadContent() {
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error('content.json load failed');
    contentData = await res.json();
  } catch (e) {
    console.warn('content.json not found, using fallback');
    contentData = getFallbackContent();
  }
  renderAllAndReveal();
  applyLang(currentLang);
}

function renderAll() {
  renderHeader();
  renderHero();
  renderTicker();
  renderAbout();
  renderProducts();
  renderScience();
  renderAcademy();
  renderNews();
  renderFooter();
  setTimeout(reInitScrollReveal, 150);
}

// ── Header ─────────────────────────────────────
function renderHeader() {
  const site = contentData.site;
  const logoImg = document.getElementById('header-logo-img');
  const logoText = document.getElementById('header-logo-text');
  if (site.logo && logoImg) {
    logoImg.src = site.logo;
    logoImg.style.display = 'block';
  }
  if (logoText) logoText.textContent = site.name_en || 'AESTYVE';
}

// ── Header Scroll Behavior ──────────────────────
function initHeader() {
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.remove('transparent');
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile Nav ──────────────────────────────────
function initMobileNav() {
  const mobileNav = document.getElementById('mobile-nav');
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      closeMobileNav();
    });
  });
}

function toggleMobile() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
}

function closeMobileNav() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobile-nav').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Hero ────────────────────────────────────────
function renderHero() {
  const slides = contentData.hero;
  const sliderEl = document.getElementById('hero-slider');
  const dotsEl = document.getElementById('hero-dots');
  if (!sliderEl || !slides) return;

  sliderEl.innerHTML = slides.map((slide, i) => {
    const titleText = currentLang === 'ko' ? (slide.title_ko || '') : (slide.title_en || '');
    const descText  = currentLang === 'ko' ? (slide.desc_ko || '')  : (slide.desc_en || '');
    const btnText   = currentLang === 'ko' ? (slide.btn_ko || '')   : (slide.btn_en || '');
    const badge     = currentLang === 'ko' ? (slide.badge_ko || '') : (slide.badge_en || '');

    return `
    <div class="hero-slide${i === 0 ? ' active' : ''}" role="tabpanel" aria-hidden="${i !== 0}">
      <div class="hero-bg">
        ${slide.image
          ? '<img src="' + slide.image + '" alt="' + titleText.replace(/\n/g,'') + '" loading="${i === 0 ? \'eager\' : \'lazy\'}">'
          : ''}
      </div>
      <div class="hero-content">
        <div class="container">
          <div class="hero-text">
            ${badge ? '<span class="hero-badge">' + badge + '</span>' : ''}
            <h1 class="hero-title">${titleText.replace(/\n/g,'<br>')}</h1>
            <p class="hero-desc">${descText}</p>
            ${btnText ? '<a href="' + (slide.btn_link || '#') + '" class="hero-btn">' + btnText + '<span class="arrow">→</span></a>' : ''}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  dotsEl.innerHTML = slides.map((_, i) =>
    `<button class="hero-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})"
      role="tab" aria-label="슬라이드 ${i+1}" aria-selected="${i === 0}"></button>`
  ).join('');

  startHeroAuto();
}

function goToSlide(idx) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === idx);
    s.setAttribute('aria-hidden', i !== idx);
  });
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === idx);
    d.setAttribute('aria-selected', i === idx);
  });
  currentHeroSlide = idx;
}

function startHeroAuto() {
  if (heroTimer) clearInterval(heroTimer);
  const count = (contentData.hero || []).length;
  if (count < 2) return;
  heroTimer = setInterval(() => {
    goToSlide((currentHeroSlide + 1) % count);
  }, 5000);
}

// ── Mission Ticker ──────────────────────────────
function renderTicker() {
  const site   = contentData.site;
  const msg    = currentLang === 'ko' ? site.mission_ko : site.mission_en;
  const labels = ['INNOVATION', 'SAFETY', 'EXCELLENCE', 'CARE', msg, 'RESEARCH', 'TRUST', 'BEAUTY'];
  const track  = document.getElementById('ticker-track');
  if (!track) return;
  // Duplicate for infinite scroll
  const doubled = [...labels, ...labels];
  track.innerHTML = doubled.map(l =>
    `<span class="ticker-item"><span class="dot"></span>${l}</span>`
  ).join('');
}

// ── About ───────────────────────────────────────
function renderAbout() {
  const about = contentData.about;
  if (!about) return;

  // Image
  const imgWrap = document.getElementById('about-image-wrap');
  if (imgWrap) {
    if (about.image) {
      imgWrap.innerHTML = '<img src="' + about.image + '" alt="About Aestyve" loading="lazy">';
    } else {
      imgWrap.innerHTML = '<div class="about-placeholder"><span class="ph-icon">🖼</span><span class="ph-text">IMAGE PLACEHOLDER</span></div>';
    }
  }

  // Text
  setEl('about-title',    currentLang === 'ko' ? about.title_ko    : about.title_en);
  setEl('about-subtitle', currentLang === 'ko' ? about.subtitle_ko : about.subtitle_en);
  setEl('about-text',     currentLang === 'ko' ? about.text_ko     : about.text_en);

  // Stats
  const grid = document.getElementById('stats-grid');
  if (grid && about.stats) {
    grid.innerHTML = about.stats.map(s => `
      <div class="stat-item fade-up">
        <div class="stat-number">${s.number}</div>
        <div class="stat-label">${currentLang === 'ko' ? s.label_ko : s.label_en}</div>
      </div>`
    ).join('');
  }
}

// ── Products ────────────────────────────────────
function renderProducts(filter) {
  const prods = contentData.products;
  if (!prods) return;
  filter = filter || 'all';

  // Featured
  const featuredEl = document.getElementById('featured-product');
  if (featuredEl) {
    const f = prods.featured;
    const show = filter === 'all' || (f.category || '').includes(filter);
    featuredEl.style.display = show ? '' : 'none';

    const name = currentLang === 'ko' ? f.name_ko : f.name_en;
    const desc = currentLang === 'ko' ? f.desc_ko : f.desc_en;
    const badge = currentLang === 'ko' ? f.badge_ko : f.badge_en;
    const btnText = currentLang === 'ko' ? '자세히 보기' : 'Explore';

    featuredEl.innerHTML = `
      <div class="featured-image">
        ${f.image
          ? '<img src="' + f.image + '" alt="' + name + '" loading="lazy">'
          : '<div class="img-placeholder"><span style="font-size:48px;opacity:.3">📦</span></div>'}
      </div>
      <div class="featured-info">
        ${badge ? '<span class="featured-badge">' + badge + '</span>' : ''}
        <h3 class="featured-name">${name}</h3>
        <p class="featured-desc">${desc}</p>
        <a href="${f.link || '#'}" class="featured-btn">
          ${btnText} <span>→</span>
        </a>
      </div>`;
  }

  // Grid
  const gridEl = document.getElementById('product-grid');
  if (gridEl && prods.items) {
    gridEl.innerHTML = prods.items.map(p => {
      const visible = filter === 'all' || (p.category || '').includes(filter);
      const name  = currentLang === 'ko' ? p.name_ko  : p.name_en;
      const desc  = currentLang === 'ko' ? p.desc_ko  : p.desc_en;
      const badge = currentLang === 'ko' ? p.badge_ko : p.badge_en;
      const price = currentLang === 'ko' ? p.price_ko : p.price_en;
      const badgeClass = (p.category || '').includes('best') ? ' best' : '';

      return `
      <div class="product-card${visible ? '' : ' hidden'}" data-category="${p.category || ''}">
        <div class="card-image">
          ${p.image
            ? '<img src="' + p.image + '" alt="' + name + '" loading="lazy">'
            : '<div class="card-img-placeholder">📦</div>'}
          ${badge ? '<span class="card-badge' + badgeClass + '">' + badge + '</span>' : ''}
        </div>
        <div class="card-body">
          <h4 class="card-name">${name}</h4>
          <p class="card-desc">${desc}</p>
          <div class="card-footer">
            <span class="card-price">${price}</span>
            <a href="${p.link || '#'}" class="card-link">
              ${currentLang === 'ko' ? '상세보기' : 'View'} →
            </a>
          </div>
        </div>
      </div>`;
    }).join('');
  }
}

function filterProducts(filter) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === filter);
  });
  renderProducts(filter);
}

// ── Science ─────────────────────────────────────
function renderScience() {
  const science = contentData.science;
  const grid = document.getElementById('science-grid');
  if (!grid || !science) return;

  grid.innerHTML = science.items.map((item, i) => `
    <div class="science-item fade-up delay-${i + 1}">
      <div class="science-icon">${item.icon || '🔬'}</div>
      <h3 class="science-title">${currentLang === 'ko' ? item.title_ko : item.title_en}</h3>
      <p class="science-desc">${currentLang === 'ko' ? item.desc_ko : item.desc_en}</p>
    </div>`
  ).join('');
}

// ── Academy ─────────────────────────────────────
function renderAcademy() {
  const academy = contentData.academy;
  const grid = document.getElementById('academy-grid');
  if (!grid || !academy) return;

  grid.innerHTML = academy.items.map((item, i) => {
    const title = currentLang === 'ko' ? item.title_ko : item.title_en;
    const desc  = currentLang === 'ko' ? item.desc_ko  : item.desc_en;
    const num   = String(i + 1).padStart(2, '0');
    const btnLabel = currentLang === 'ko' ? '자세히 보기' : 'Learn More';

    return `
    <div class="academy-card fade-up delay-${i + 1}">
      <div class="academy-image">
        ${item.image
          ? '<img src="' + item.image + '" alt="' + title + '" loading="lazy">'
          : '<div class="academy-img-placeholder"><span style="font-size:48px;opacity:.2">🎓</span></div>'}
        <div class="academy-overlay">
          <span class="academy-num">${num}</span>
          <h3 class="academy-title">${title}</h3>
          <p class="academy-desc">${desc}</p>
          <a href="${item.link || '#'}" class="academy-link">
            ${btnLabel} <span>→</span>
          </a>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── News ────────────────────────────────────────
function renderNews() {
  const news = contentData.news;
  const list = document.getElementById('news-list');
  if (!list || !news) return;

  list.innerHTML = news.items.map(item => {
    const title    = currentLang === 'ko' ? item.title_ko    : item.title_en;
    const desc     = currentLang === 'ko' ? item.desc_ko     : item.desc_en;
    const category = currentLang === 'ko' ? item.category_ko : item.category_en;
    const date     = formatDate(item.date);

    return `
    <a href="${item.link || '#'}" class="news-item">
      <div class="news-thumb">
        ${item.image
          ? '<img src="' + item.image + '" alt="' + title + '" loading="lazy">'
          : '<div class="news-thumb-placeholder">📰</div>'}
      </div>
      <div class="news-content">
        <div class="news-meta">
          <span class="news-category">${category}</span>
          <span class="news-date">${date}</span>
        </div>
        <h4 class="news-title">${title}</h4>
        <p class="news-desc">${desc}</p>
      </div>
    </a>`;
  }).join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return currentLang === 'ko'
    ? `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Footer ──────────────────────────────────────
function renderFooter() {
  const site   = contentData.site;
  const footer = contentData.footer;
  if (!footer) return;

  const brandEl = document.getElementById('footer-brand-name');
  if (brandEl) brandEl.textContent = site.name_en || 'AESTYVE';

  const tagEl = document.getElementById('footer-tagline');
  if (tagEl) tagEl.textContent = currentLang === 'ko' ? site.mission_ko : site.mission_en;

  // SNS
  const snsEl = document.getElementById('footer-sns');
  if (snsEl && footer.sns) {
    const snsMap = [
      { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
      { key: 'youtube',   icon: 'fab fa-youtube',   label: 'YouTube'   },
      { key: 'facebook',  icon: 'fab fa-facebook-f',label: 'Facebook'  },
      { key: 'linkedin',  icon: 'fab fa-linkedin-in',label: 'LinkedIn' }
    ];
    snsEl.innerHTML = snsMap
      .filter(s => footer.sns[s.key])
      .map(s => `<a href="${footer.sns[s.key]}" class="sns-btn" aria-label="${s.label}" target="_blank" rel="noopener"><i class="${s.icon}"></i></a>`)
      .join('');
  }

  // Links
  const linksEl = document.getElementById('footer-links');
  if (linksEl && footer.groups) {
    linksEl.innerHTML = footer.groups.map(group => `
      <div class="footer-col">
        <h4 class="footer-col-title">${currentLang === 'ko' ? group.title_ko : group.title_en}</h4>
        <ul>
          ${group.links.map(link => `
            <li><a href="${link.url || '#'}">${currentLang === 'ko' ? link.label_ko : link.label_en}</a></li>
          `).join('')}
        </ul>
      </div>`
    ).join('');
  }

  // Copyright
  const copyEl = document.getElementById('footer-copy');
  if (copyEl) copyEl.textContent = currentLang === 'ko' ? footer.copyright_ko : footer.copyright_en;
}

// ── Language ────────────────────────────────────
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('aestyve-lang', lang);
  applyLang(lang);
  if (contentData) renderAll();
}

function applyLang(lang) {
  const isKo = lang === 'ko';

  // lang-ko / lang-en class elements
  document.querySelectorAll('.lang-ko').forEach(el => { el.style.display = isKo ? '' : 'none'; });
  document.querySelectorAll('.lang-en').forEach(el => { el.style.display = isKo ? 'none' : ''; });

  // nav label spans (inside nav-link)
  document.querySelectorAll('.nav-label-ko').forEach(el => { el.style.display = isKo ? '' : 'none'; });
  document.querySelectorAll('.nav-label-en').forEach(el => { el.style.display = isKo ? 'none' : ''; });

  // Active button
  document.getElementById('btn-ko').classList.toggle('active', isKo);
  document.getElementById('btn-en').classList.toggle('active', !isKo);

  // html lang attribute
  document.documentElement.lang = lang;
}

// ── Scroll Reveal ───────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// After rendering, re-observe dynamically added fade-up elements
function reInitScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => observer.observe(el));
}

// Scroll reveal is re-initialized via renderAllAndReveal
function renderAllAndReveal() {
  renderHero();
  renderTicker();
  renderAbout();
  renderProducts();
  renderScience();
  renderAcademy();
  renderNews();
  renderFooter();
  renderHeader();
  setTimeout(reInitScrollReveal, 150);
}

// ── Contact Form ────────────────────────────────
function handleContactSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = currentLang === 'ko' ? '전송 완료! ✓' : 'Sent! ✓';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.textContent = currentLang === 'ko' ? '문의 보내기' : 'Send Message';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}

// ── Helpers ─────────────────────────────────────
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el && text !== undefined) el.textContent = text;
}

// ── Fallback Content (in case content.json fails) ──
function getFallbackContent() {
  return {
    site: {
      name_ko: '에스티브', name_en: 'Aestyve',
      logo: 'https://www.genspark.ai/api/files/s/zhCpFzyq',
      mission_ko: 'Look Better, Feel Better, Live Better',
      mission_en: 'Look Better, Feel Better, Live Better',
      phone: '080-855-4567', email: 'info@aestyve.com',
      address_ko: '서울특별시 강남구 청담동 420 청담스퀘어',
      address_en: 'Cheongdam Square, 420 Cheongdam-dong, Gangnam-gu, Seoul'
    },
    hero: [
      {
        id: 1, image: '',
        badge_ko: 'NEW ARRIVAL', badge_en: 'NEW ARRIVAL',
        title_ko: '자신감을 채우는\n에스테틱 솔루션', title_en: 'Aesthetic Solutions\nfor Your Confidence',
        desc_ko: '에스티브와 함께 당신만의 아름다움을 찾아보세요.',
        desc_en: 'Discover your unique beauty with Aestyve.',
        btn_ko: '자세히 보기', btn_en: 'Learn More', btn_link: '#about'
      }
    ],
    about: {
      title_ko: '에스티브 소개', title_en: 'About Aestyve',
      subtitle_ko: '아름다움의 본질을 탐구하다', subtitle_en: 'Exploring the Essence of Beauty',
      text_ko: '에스티브는 혁신적인 에스테틱 솔루션을 제공하는 글로벌 기업입니다.',
      text_en: 'Aestyve is a global leader in innovative aesthetic solutions.',
      image: '',
      stats: [
        { number: '10+', label_ko: '연구개발 경력', label_en: 'Years of R&D' },
        { number: '30+', label_ko: '글로벌 국가', label_en: 'Global Countries' },
        { number: '500+', label_ko: '파트너 병원', label_en: 'Partner Clinics' },
        { number: '1M+', label_ko: '시술 건수', label_en: 'Procedures' }
      ]
    },
    products: {
      featured: {
        id: 'p1', name_ko: '1906NAD+', name_en: '1906NAD+',
        category: 'best,new', badge_ko: 'BEST', badge_en: 'BEST',
        desc_ko: '맑고 탄탄한 피부 리듬을 채우는 NAD+ 컨센트레이트.',
        desc_en: 'NAD+ concentrate for clear and firm skin.',
        image: 'https://www.genspark.ai/api/files/s/68YDgq7B',
        price_ko: '문의', price_en: 'Inquiry', link: '#'
      },
      items: [
        { id:'p2', name_ko:'Liquid PCL', name_en:'Liquid PCL', category:'new',
          badge_ko:'NEW', badge_en:'NEW',
          desc_ko:'결을 채우고 탄력을 더하는 리퀴드 PCL.',
          desc_en:'Liquid PCL skin booster.',
          image:'https://www.genspark.ai/api/files/s/6cpItebx',
          price_ko:'문의', price_en:'Inquiry', link:'#' },
        { id:'p3', name_ko:'Revibe', name_en:'Revibe', category:'new',
          badge_ko:'NEW', badge_en:'NEW',
          desc_ko:'피부 본연의 리듬을 깨우는 리바이브.',
          desc_en:'Rejuvenation care.',
          image:'https://www.genspark.ai/api/files/s/pQDECzpb',
          price_ko:'문의', price_en:'Inquiry', link:'#' },
        { id:'p4', name_ko:'HA FILLER Series', name_en:'HA FILLER Series', category:'best',
          badge_ko:'BEST', badge_en:'BEST',
          desc_ko:'볼륨은 자연스럽게, 라인은 정교하게.',
          desc_en:'Natural volume, precise lines.',
          image:'https://www.genspark.ai/api/files/s/kuvuKo9K',
          price_ko:'문의', price_en:'Inquiry', link:'#' },
        { id:'p5', name_ko:'INNOFILL PLLA', name_en:'INNOFILL PLLA', category:'new',
          badge_ko:'NEW', badge_en:'NEW',
          desc_ko:'자연스러운 볼륨을 채우는 PLLA 필러.',
          desc_en:'PLLA lifting filler.',
          image:'https://www.genspark.ai/api/files/s/kyWBJBlj',
          price_ko:'문의', price_en:'Inquiry', link:'#' }
      ]
    },
    science: {
      items: [
        { id:'s1', icon:'🔬', title_ko:'임상 연구', title_en:'Clinical Research',
          desc_ko:'30개 이상의 임상 시험으로 입증된 안전성.',
          desc_en:'Proven safety by 30+ clinical trials.' },
        { id:'s2', icon:'⚗️', title_ko:'바이오테크놀로지', title_en:'Biotechnology',
          desc_ko:'차세대 생체 적합 소재 개발.',
          desc_en:'Next-gen biocompatible materials.' },
        { id:'s3', icon:'🛡️', title_ko:'안전성 인증', title_en:'Safety Certification',
          desc_ko:'국제 안전 기준 충족 및 글로벌 인증.',
          desc_en:'International safety standards and certifications.' }
      ]
    },
    academy: {
      items: [
        { id:'a1', image:'', title_ko:'마스터 클래스', title_en:'Master Class',
          desc_ko:'세계적인 전문가와 함께하는 심화 교육.',
          desc_en:'Advanced training with world-class experts.', link:'#' },
        { id:'a2', image:'', title_ko:'국제 심포지엄', title_en:'International Symposium',
          desc_ko:'글로벌 트렌드를 공유하는 국제 행사.',
          desc_en:'International event sharing global trends.', link:'#' },
        { id:'a3', image:'', title_ko:'온라인 웨비나', title_en:'Online Webinar',
          desc_ko:'어디서나 참여 가능한 실시간 교육.',
          desc_en:'Real-time online training.', link:'#' }
      ]
    },
    news: {
      items: [
        { id:'n1', date:'2026-08-01', category_ko:'제품', category_en:'Product',
          title_ko:'신제품 1906NAD+ 출시', title_en:'New Product 1906NAD+ Launch',
          desc_ko:'에스티브의 혁신적인 NAD+ 스킨 부스터가 출시되었습니다.',
          desc_en:'Aestyve\'s innovative NAD+ skin booster has launched.',
          image:'', link:'#' },
        { id:'n2', date:'2026-07-15', category_ko:'이벤트', category_en:'Event',
          title_ko:'국제 심포지엄 성공적 개최', title_en:'International Symposium Held',
          desc_ko:'30개국 의료진이 참여한 심포지엄 성황.',
          desc_en:'Symposium with professionals from 30 countries.',
          image:'', link:'#' },
        { id:'n3', date:'2026-06-20', category_ko:'트렌드', category_en:'Trend',
          title_ko:'2026 에스테틱 트렌드 리포트', title_en:'2026 Aesthetic Trends Report',
          desc_ko:'글로벌 에스테틱 시장의 최신 트렌드 분석.',
          desc_en:'Analysis of latest global aesthetic market trends.',
          image:'', link:'#' }
      ]
    },
    footer: {
      groups: [
        { title_ko:'회사 소개', title_en:'About',
          links:[
            {label_ko:'에스티브 소개',label_en:'About Us',url:'#about'},
            {label_ko:'연혁',label_en:'History',url:'#'},
            {label_ko:'파트너십',label_en:'Partnership',url:'#'}
          ]},
        { title_ko:'제품', title_en:'Products',
          links:[
            {label_ko:'전체 제품',label_en:'All Products',url:'#products'},
            {label_ko:'신제품',label_en:'New',url:'#products'},
            {label_ko:'베스트',label_en:'Best',url:'#products'}
          ]},
        { title_ko:'아카데미', title_en:'Academy',
          links:[
            {label_ko:'마스터 클래스',label_en:'Master Class',url:'#academy'},
            {label_ko:'심포지엄',label_en:'Symposium',url:'#academy'},
            {label_ko:'웨비나',label_en:'Webinar',url:'#academy'}
          ]},
        { title_ko:'고객 지원', title_en:'Support',
          links:[
            {label_ko:'문의하기',label_en:'Contact Us',url:'#contact'},
            {label_ko:'FAQ',label_en:'FAQ',url:'#'},
            {label_ko:'개인정보처리방침',label_en:'Privacy Policy',url:'#'}
          ]}
      ],
      sns:{ instagram:'#', youtube:'#', facebook:'#', linkedin:'#' },
      copyright_ko:'© 2026 Aestyve. All Rights Reserved.',
      copyright_en:'© 2026 Aestyve. All Rights Reserved.'
    }
  };
}

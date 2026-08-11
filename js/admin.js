/* =============================================
   Aestyve Admin JavaScript
   ============================================= */

'use strict';

// ── State ──────────────────────────────────────
let adminData = null;
let editingIndex = null;
let editingType  = null;

// ── Bootstrap ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAdminContent();
});

// ── Content Load ───────────────────────────────
async function loadAdminContent() {
  try {
    const res = await fetch('data/content.json?v=' + Date.now());
    if (!res.ok) throw new Error('Not found');
    adminData = await res.json();
  } catch {
    adminData = getDefaultContent();
    showToast('content.json을 로드하지 못해 기본값을 사용합니다.', 'error');
  }
  populateAll();
  updateDashStats();
  renderJSON();
}

function populateAll() {
  populateSite();
  populateAbout();
  populateFeatured();
  renderHeroList();
  renderProductList();
  renderScienceList();
  renderAcademyList();
  renderNewsList();
  populateFooter();
}

// ── Panel Navigation ───────────────────────────
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  const panelEl = document.getElementById('panel-' + name);
  if (panelEl) panelEl.classList.add('active');
  const sideItems = document.querySelectorAll('.sidebar-item');
  sideItems.forEach(item => {
    if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + name + "'")) {
      item.classList.add('active');
    }
  });

  if (name === 'json') renderJSON();
}

// ── Dashboard Stats ─────────────────────────────
function updateDashStats() {
  if (!adminData) return;
  const pCount = (adminData.products && adminData.products.items ? adminData.products.items.length : 0) + 1;
  const hCount = adminData.hero ? adminData.hero.length : 0;
  const nCount = adminData.news && adminData.news.items ? adminData.news.items.length : 0;
  const aCount = adminData.academy && adminData.academy.items ? adminData.academy.items.length : 0;

  setEl('dash-products', pCount);
  setEl('dash-hero', hCount);
  setEl('dash-news', nCount);
  setEl('dash-academy', aCount);
  setEl('product-badge', pCount);
  setEl('news-badge', nCount);
}

// ── Site Settings ───────────────────────────────
function populateSite() {
  const s = adminData.site || {};
  setInput('site-name-ko', s.name_ko);
  setInput('site-name-en', s.name_en);
  setInput('site-logo', s.logo);
  setInput('site-mission-ko', s.mission_ko);
  setInput('site-mission-en', s.mission_en);
  setInput('site-phone', s.phone);
  setInput('site-email', s.email);
  setInput('site-address-ko', s.address_ko);
  setInput('site-address-en', s.address_en);
  if (s.logo) previewImg('site-logo', 'site-logo-preview');
}

function saveSite() {
  adminData.site = {
    name_ko: getInput('site-name-ko'),
    name_en: getInput('site-name-en'),
    logo:    getInput('site-logo'),
    mission_ko: getInput('site-mission-ko'),
    mission_en: getInput('site-mission-en'),
    phone:   getInput('site-phone'),
    email:   getInput('site-email'),
    address_ko: getInput('site-address-ko'),
    address_en: getInput('site-address-en'),
    primary_color: adminData.site && adminData.site.primary_color ? adminData.site.primary_color : '#1a1a2e',
    accent_color:  adminData.site && adminData.site.accent_color  ? adminData.site.accent_color  : '#c8a97e'
  };
  showToast('사이트 설정이 저장되었습니다.', 'success');
  renderJSON();
}

// ── About ───────────────────────────────────────
function populateAbout() {
  const a = adminData.about || {};
  setInput('about-title-ko', a.title_ko);
  setInput('about-title-en', a.title_en);
  setInput('about-subtitle-ko', a.subtitle_ko);
  setInput('about-subtitle-en', a.subtitle_en);
  setInput('about-text-ko', a.text_ko);
  setInput('about-text-en', a.text_en);
  setInput('about-image', a.image);
  if (a.image) previewImg('about-image', 'about-img-preview');
  renderStatsList();
}

function saveAbout() {
  adminData.about = {
    title_ko:    getInput('about-title-ko'),
    title_en:    getInput('about-title-en'),
    subtitle_ko: getInput('about-subtitle-ko'),
    subtitle_en: getInput('about-subtitle-en'),
    text_ko:     getInput('about-text-ko'),
    text_en:     getInput('about-text-en'),
    image:       getInput('about-image'),
    stats:       readStatsList()
  };
  showToast('회사 소개가 저장되었습니다.', 'success');
  renderJSON();
}

function renderStatsList() {
  const stats = (adminData.about && adminData.about.stats) || [];
  const el = document.getElementById('about-stats-list');
  if (!el) return;
  el.innerHTML = stats.map((s, i) => `
    <div class="item-card" style="align-items:center" data-stat="${i}">
      <div style="flex:0 0 80px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#1a1a2e">${s.number}</div>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <input type="text" class="form-input" placeholder="수치 (10+)" value="${s.number}"
          oninput="updateStat(${i},'number',this.value)">
        <input type="text" class="form-input" placeholder="라벨 (한국어)" value="${esc(s.label_ko)}"
          oninput="updateStat(${i},'label_ko',this.value)">
        <input type="text" class="form-input" placeholder="라벨 (영어)" value="${esc(s.label_en)}"
          oninput="updateStat(${i},'label_en',this.value)" style="grid-column:2">
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeStat(${i})"><i class="fas fa-trash"></i></button>
    </div>`
  ).join('<div style="height:8px"></div>');
}

function updateStat(i, key, val) {
  if (!adminData.about.stats[i]) return;
  adminData.about.stats[i][key] = val;
  // Re-render number display
  const card = document.querySelector('[data-stat="' + i + '"]');
  if (card && key === 'number') {
    const numEl = card.querySelector('div > div');
    if (numEl) numEl.textContent = val;
  }
}

function addStat() {
  if (!adminData.about) adminData.about = { stats: [] };
  if (!adminData.about.stats) adminData.about.stats = [];
  adminData.about.stats.push({ number: '0+', label_ko: '새 항목', label_en: 'New Item' });
  renderStatsList();
}

function removeStat(i) {
  adminData.about.stats.splice(i, 1);
  renderStatsList();
  showToast('항목이 삭제되었습니다.', 'success');
}

function readStatsList() {
  return (adminData.about && adminData.about.stats) || [];
}

// ── Hero Slider ─────────────────────────────────
function renderHeroList() {
  const slides = adminData.hero || [];
  const el = document.getElementById('hero-slides-list');
  if (!el) return;
  if (slides.length === 0) {
    el.innerHTML = '<div class="card"><p style="color:#9ca3af;text-align:center;padding:20px">슬라이드가 없습니다. 추가 버튼을 클릭하세요.</p></div>';
    return;
  }
  el.innerHTML = slides.map((slide, i) => `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><i class="fas fa-image"></i> 슬라이드 ${i+1}</div>
      <div class="form-grid">
        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">배지 (한국어)</label>
            <input type="text" class="form-input" value="${esc(slide.badge_ko || '')}"
              oninput="adminData.hero[${i}].badge_ko=this.value">
          </div>
          <div class="form-group">
            <label class="form-label">배지 (영어)</label>
            <input type="text" class="form-input" value="${esc(slide.badge_en || '')}"
              oninput="adminData.hero[${i}].badge_en=this.value">
          </div>
          <div class="form-group">
            <label class="form-label">제목 (한국어)</label>
            <input type="text" class="form-input" value="${esc(slide.title_ko || '')}"
              oninput="adminData.hero[${i}].title_ko=this.value">
          </div>
          <div class="form-group">
            <label class="form-label">제목 (영어)</label>
            <input type="text" class="form-input" value="${esc(slide.title_en || '')}"
              oninput="adminData.hero[${i}].title_en=this.value">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">설명 (한국어)</label>
          <textarea class="form-textarea" style="min-height:60px" oninput="adminData.hero[${i}].desc_ko=this.value">${esc(slide.desc_ko || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">설명 (영어)</label>
          <textarea class="form-textarea" style="min-height:60px" oninput="adminData.hero[${i}].desc_en=this.value">${esc(slide.desc_en || '')}</textarea>
        </div>
        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">버튼 텍스트 (한국어)</label>
            <input type="text" class="form-input" value="${esc(slide.btn_ko || '')}"
              oninput="adminData.hero[${i}].btn_ko=this.value">
          </div>
          <div class="form-group">
            <label class="form-label">버튼 링크</label>
            <input type="text" class="form-input" value="${esc(slide.btn_link || '#')}"
              oninput="adminData.hero[${i}].btn_link=this.value">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">이미지 URL</label>
          <input type="url" class="form-input" value="${esc(slide.image || '')}" placeholder="https://"
            oninput="adminData.hero[${i}].image=this.value;previewImg(this,'hero-prev-${i}')">
          ${slide.image
            ? '<img id="hero-prev-' + i + '" class="img-preview show" src="' + slide.image + '" alt="미리보기" style="margin-top:8px">'
            : '<div id="hero-prev-' + i + '" class="img-no-preview">이미지 URL 입력 시 미리보기</div>'}
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        ${i > 0 ? '<button class="btn btn-outline btn-sm" onclick="moveHeroSlide(' + i + ',-1)"><i class="fas fa-arrow-up"></i></button>' : ''}
        ${i < slides.length-1 ? '<button class="btn btn-outline btn-sm" onclick="moveHeroSlide(' + i + ',1)"><i class="fas fa-arrow-down"></i></button>' : ''}
        <button class="btn btn-danger btn-sm" onclick="removeHeroSlide(${i})"><i class="fas fa-trash"></i> 삭제</button>
      </div>
    </div>`
  ).join('');
}

function addHeroSlide() {
  if (!adminData.hero) adminData.hero = [];
  adminData.hero.push({
    id: Date.now(), image: '',
    badge_ko: 'NEW', badge_en: 'NEW',
    title_ko: '새 슬라이드 제목', title_en: 'New Slide Title',
    desc_ko: '슬라이드 설명', desc_en: 'Slide description',
    btn_ko: '자세히 보기', btn_en: 'Learn More', btn_link: '#'
  });
  renderHeroList();
  updateDashStats();
}

function removeHeroSlide(i) {
  if (!confirm('이 슬라이드를 삭제하시겠습니까?')) return;
  adminData.hero.splice(i, 1);
  renderHeroList();
  updateDashStats();
  showToast('슬라이드가 삭제되었습니다.', 'success');
}

function moveHeroSlide(i, dir) {
  const arr = adminData.hero;
  const ni = i + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[i], arr[ni]] = [arr[ni], arr[i]];
  renderHeroList();
}

function saveHero() {
  showToast('히어로 슬라이더가 저장되었습니다.', 'success');
  renderJSON();
}

// ── Products ─────────────────────────────────────
function populateFeatured() {
  const f = (adminData.products && adminData.products.featured) || {};
  setInput('feat-name-ko', f.name_ko);
  setInput('feat-name-en', f.name_en);
  setInput('feat-badge-ko', f.badge_ko);
  setInput('feat-category', f.category);
  setInput('feat-desc-ko', f.desc_ko);
  setInput('feat-desc-en', f.desc_en);
  setInput('feat-image', f.image);
  if (f.image) previewImg('feat-image', 'feat-img-preview');
}

function renderProductList() {
  const items = (adminData.products && adminData.products.items) || [];
  const el = document.getElementById('products-list');
  if (!el) return;

  if (items.length === 0) {
    el.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:20px">제품이 없습니다. 추가 버튼을 클릭하세요.</p>';
    return;
  }

  el.innerHTML = items.map((p, i) => {
    const badge = p.badge_ko || '';
    const cat   = p.category || '';
    const catTags = cat.split(',').filter(Boolean).map(c =>
      '<span class="tag ' + (c.trim() === 'best' ? 'tag-gold' : 'tag-navy') + '">' + c.trim().toUpperCase() + '</span>'
    ).join('');

    return `
    <div class="item-card">
      <div class="item-card-thumb">
        ${p.image ? '<img src="' + p.image + '" alt="' + esc(p.name_ko || '') + '">' : '📦'}
      </div>
      <div class="item-card-body">
        <div class="item-card-name">${esc(p.name_ko || '')} <span style="color:#9ca3af;font-weight:400;font-size:13px">/ ${esc(p.name_en || '')}</span></div>
        <div class="item-card-desc">${esc(p.desc_ko || '')}</div>
        <div class="item-card-meta">
          ${badge ? '<span class="tag tag-navy">' + badge + '</span>' : ''}
          ${catTags}
        </div>
      </div>
      <div class="item-card-actions">
        <button class="btn btn-outline btn-sm" onclick="editProduct(${i})"><i class="fas fa-edit"></i> 편집</button>
        ${i > 0 ? '<button class="btn btn-outline btn-sm" onclick="moveProduct(' + i + ',-1)"><i class="fas fa-arrow-up"></i></button>' : ''}
        ${i < items.length-1 ? '<button class="btn btn-outline btn-sm" onclick="moveProduct(' + i + ',1)"><i class="fas fa-arrow-down"></i></button>' : ''}
        <button class="btn btn-danger btn-sm" onclick="removeProduct(${i})"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

function addProduct() {
  editProduct(-1); // -1 means new
}

function editProduct(idx) {
  const isNew = idx === -1;
  const p = isNew
    ? { id: 'p' + Date.now(), name_ko: '', name_en: '', category: 'new',
        badge_ko: 'NEW', badge_en: 'NEW', desc_ko: '', desc_en: '',
        image: '', price_ko: '문의', price_en: 'Inquiry', link: '#' }
    : { ...adminData.products.items[idx] };

  openModal(isNew ? '새 제품 추가' : '제품 편집', `
    <div class="form-grid">
      <div class="form-grid form-grid-2">
        <div class="form-group">
          <label class="form-label">제품명 (한국어) <span>*</span></label>
          <input type="text" class="form-input" id="ep-name-ko" value="${esc(p.name_ko)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">제품명 (영어)</label>
          <input type="text" class="form-input" id="ep-name-en" value="${esc(p.name_en)}">
        </div>
        <div class="form-group">
          <label class="form-label">배지 (한국어)</label>
          <input type="text" class="form-input" id="ep-badge-ko" value="${esc(p.badge_ko)}" placeholder="NEW, BEST">
        </div>
        <div class="form-group">
          <label class="form-label">카테고리</label>
          <input type="text" class="form-input" id="ep-category" value="${esc(p.category)}" placeholder="new, best, new,best">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">설명 (한국어)</label>
        <textarea class="form-textarea" id="ep-desc-ko">${esc(p.desc_ko)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">설명 (영어)</label>
        <textarea class="form-textarea" id="ep-desc-en">${esc(p.desc_en)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">이미지 URL</label>
        <input type="url" class="form-input" id="ep-image" value="${esc(p.image)}" placeholder="https://"
          oninput="previewImg('ep-image','ep-img-prev')">
        <div class="img-preview-wrap">
          ${p.image ? '<img id="ep-img-prev" class="img-preview show" src="' + p.image + '" alt="미리보기">' : '<img id="ep-img-prev" class="img-preview" alt="미리보기"><div id="ep-image-nopreview" class="img-no-preview">이미지 URL 입력 시 미리보기</div>'}
        </div>
      </div>
      <div class="form-grid form-grid-2">
        <div class="form-group">
          <label class="form-label">가격/표시 (한국어)</label>
          <input type="text" class="form-input" id="ep-price-ko" value="${esc(p.price_ko)}" placeholder="문의">
        </div>
        <div class="form-group">
          <label class="form-label">가격/표시 (영어)</label>
          <input type="text" class="form-input" id="ep-price-en" value="${esc(p.price_en)}" placeholder="Inquiry">
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">링크 URL</label>
          <input type="text" class="form-input" id="ep-link" value="${esc(p.link)}" placeholder="#">
        </div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">취소</button>
     <button class="btn btn-gold" onclick="saveProductEdit(${idx})">저장</button>`
  );
}

function saveProductEdit(idx) {
  const isNew = idx === -1;
  const newProd = {
    id: isNew ? 'p' + Date.now() : (adminData.products.items[idx] && adminData.products.items[idx].id || 'p' + Date.now()),
    name_ko:  getInput('ep-name-ko'),
    name_en:  getInput('ep-name-en'),
    category: getInput('ep-category'),
    badge_ko: getInput('ep-badge-ko'),
    badge_en: getInput('ep-badge-ko'), // sync
    desc_ko:  getInput('ep-desc-ko'),
    desc_en:  getInput('ep-desc-en'),
    image:    getInput('ep-image'),
    price_ko: getInput('ep-price-ko'),
    price_en: getInput('ep-price-en'),
    link:     getInput('ep-link')
  };

  if (!newProd.name_ko) { showToast('제품명(한국어)은 필수입니다.', 'error'); return; }

  if (!adminData.products) adminData.products = { featured: {}, items: [] };
  if (!adminData.products.items) adminData.products.items = [];

  if (isNew) {
    adminData.products.items.push(newProd);
  } else {
    adminData.products.items[idx] = newProd;
  }

  closeModal();
  renderProductList();
  updateDashStats();
  showToast(isNew ? '제품이 추가되었습니다.' : '제품이 수정되었습니다.', 'success');
  renderJSON();
}

function removeProduct(i) {
  if (!confirm('이 제품을 삭제하시겠습니까?')) return;
  adminData.products.items.splice(i, 1);
  renderProductList();
  updateDashStats();
  showToast('제품이 삭제되었습니다.', 'success');
  renderJSON();
}

function moveProduct(i, dir) {
  const arr = adminData.products.items;
  const ni = i + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[i], arr[ni]] = [arr[ni], arr[i]];
  renderProductList();
}

function saveProducts() {
  if (!adminData.products) adminData.products = {};
  adminData.products.featured = {
    ...adminData.products.featured,
    name_ko:  getInput('feat-name-ko'),
    name_en:  getInput('feat-name-en'),
    badge_ko: getInput('feat-badge-ko'),
    badge_en: getInput('feat-badge-ko'),
    category: getInput('feat-category'),
    desc_ko:  getInput('feat-desc-ko'),
    desc_en:  getInput('feat-desc-en'),
    image:    getInput('feat-image')
  };
  showToast('제품 정보가 저장되었습니다.', 'success');
  renderJSON();
}

// ── Science ─────────────────────────────────────
function renderScienceList() {
  const items = (adminData.science && adminData.science.items) || [];
  const el = document.getElementById('science-list');
  if (!el) return;

  el.innerHTML = items.map((item, i) => `
    <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:16px 20px;margin-bottom:12px">
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <span style="font-size:24px">${item.icon || '🔬'}</span>
        <strong style="font-size:15px;color:#1a1a2e;align-self:center">${esc(item.title_ko || '')}</strong>
      </div>
      <div class="form-grid form-grid-2" style="margin-bottom:8px">
        <input type="text" class="form-input" placeholder="아이콘(이모지)" value="${esc(item.icon || '')}"
          oninput="adminData.science.items[${i}].icon=this.value">
        <input type="text" class="form-input" placeholder="제목(한국어)" value="${esc(item.title_ko || '')}"
          oninput="adminData.science.items[${i}].title_ko=this.value">
        <input type="text" class="form-input" placeholder="제목(영어)" value="${esc(item.title_en || '')}"
          oninput="adminData.science.items[${i}].title_en=this.value" style="grid-column:2">
      </div>
      <textarea class="form-textarea" style="min-height:60px;margin-bottom:6px" placeholder="설명(한국어)"
        oninput="adminData.science.items[${i}].desc_ko=this.value">${esc(item.desc_ko || '')}</textarea>
      <textarea class="form-textarea" style="min-height:60px;margin-bottom:8px" placeholder="설명(영어)"
        oninput="adminData.science.items[${i}].desc_en=this.value">${esc(item.desc_en || '')}</textarea>
      <button class="btn btn-danger btn-sm" onclick="removeScienceItem(${i})"><i class="fas fa-trash"></i> 삭제</button>
    </div>`
  ).join('');
}

function addScienceItem() {
  if (!adminData.science) adminData.science = { items: [] };
  adminData.science.items.push({ id: 's' + Date.now(), icon: '🔬', title_ko: '새 항목', title_en: 'New Item', desc_ko: '', desc_en: '' });
  renderScienceList();
}

function removeScienceItem(i) {
  adminData.science.items.splice(i, 1);
  renderScienceList();
  showToast('항목이 삭제되었습니다.', 'success');
}

function saveScience() {
  showToast('과학/기술 섹션이 저장되었습니다.', 'success');
  renderJSON();
}

// ── Academy ─────────────────────────────────────
function renderAcademyList() {
  const items = (adminData.academy && adminData.academy.items) || [];
  const el = document.getElementById('academy-list');
  if (!el) return;

  el.innerHTML = items.map((item, i) => `
    <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:16px 20px;margin-bottom:12px">
      <div class="form-grid form-grid-2" style="margin-bottom:8px">
        <input type="text" class="form-input" placeholder="제목(한국어)" value="${esc(item.title_ko || '')}"
          oninput="adminData.academy.items[${i}].title_ko=this.value">
        <input type="text" class="form-input" placeholder="제목(영어)" value="${esc(item.title_en || '')}"
          oninput="adminData.academy.items[${i}].title_en=this.value">
      </div>
      <textarea class="form-textarea" style="min-height:60px;margin-bottom:6px" placeholder="설명(한국어)"
        oninput="adminData.academy.items[${i}].desc_ko=this.value">${esc(item.desc_ko || '')}</textarea>
      <textarea class="form-textarea" style="min-height:60px;margin-bottom:8px" placeholder="설명(영어)"
        oninput="adminData.academy.items[${i}].desc_en=this.value">${esc(item.desc_en || '')}</textarea>
      <div class="form-grid form-grid-2">
        <input type="url" class="form-input" placeholder="이미지 URL" value="${esc(item.image || '')}"
          oninput="adminData.academy.items[${i}].image=this.value">
        <input type="text" class="form-input" placeholder="링크 URL" value="${esc(item.link || '#')}"
          oninput="adminData.academy.items[${i}].link=this.value">
      </div>
      <button class="btn btn-danger btn-sm" style="margin-top:8px" onclick="removeAcademyItem(${i})"><i class="fas fa-trash"></i> 삭제</button>
    </div>`
  ).join('');
}

function addAcademyItem() {
  if (!adminData.academy) adminData.academy = { items: [] };
  adminData.academy.items.push({ id: 'a' + Date.now(), image: '', title_ko: '새 프로그램', title_en: 'New Program', desc_ko: '', desc_en: '', link: '#' });
  renderAcademyList();
}

function removeAcademyItem(i) {
  adminData.academy.items.splice(i, 1);
  renderAcademyList();
  updateDashStats();
  showToast('항목이 삭제되었습니다.', 'success');
}

function saveAcademy() {
  updateDashStats();
  showToast('아카데미 섹션이 저장되었습니다.', 'success');
  renderJSON();
}

// ── News ────────────────────────────────────────
function renderNewsList() {
  const items = (adminData.news && adminData.news.items) || [];
  const el = document.getElementById('news-list');
  if (!el) return;

  if (items.length === 0) {
    el.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:20px">뉴스가 없습니다. 추가 버튼을 클릭하세요.</p>';
    return;
  }

  el.innerHTML = items.map((n, i) => `
    <div class="item-card">
      <div class="item-card-thumb" style="font-size:28px">
        ${n.image ? '<img src="' + n.image + '" alt="' + esc(n.title_ko || '') + '">' : '📰'}
      </div>
      <div class="item-card-body">
        <div class="item-card-name">${esc(n.title_ko || '')}</div>
        <div class="item-card-desc">${esc(n.desc_ko || '')}</div>
        <div class="item-card-meta">
          <span class="tag tag-blue">${esc(n.category_ko || '')}</span>
          <span style="font-size:11px;color:#9ca3af">${n.date || ''}</span>
        </div>
      </div>
      <div class="item-card-actions">
        <button class="btn btn-outline btn-sm" onclick="editNews(${i})"><i class="fas fa-edit"></i> 편집</button>
        <button class="btn btn-danger btn-sm" onclick="removeNews(${i})"><i class="fas fa-trash"></i></button>
      </div>
    </div>`
  ).join('');
}

function addNews() { editNews(-1); }

function editNews(idx) {
  const isNew = idx === -1;
  const n = isNew
    ? { id: 'n' + Date.now(), date: new Date().toISOString().split('T')[0],
        category_ko: '공지', category_en: 'Notice',
        title_ko: '', title_en: '', desc_ko: '', desc_en: '', image: '', link: '#' }
    : { ...adminData.news.items[idx] };

  openModal(isNew ? '뉴스 추가' : '뉴스 편집', `
    <div class="form-grid">
      <div class="form-grid form-grid-2">
        <div class="form-group">
          <label class="form-label">날짜</label>
          <input type="date" class="form-input" id="en-date" value="${esc(n.date)}">
        </div>
        <div class="form-group"></div>
        <div class="form-group">
          <label class="form-label">카테고리 (한국어)</label>
          <input type="text" class="form-input" id="en-cat-ko" value="${esc(n.category_ko)}">
        </div>
        <div class="form-group">
          <label class="form-label">카테고리 (영어)</label>
          <input type="text" class="form-input" id="en-cat-en" value="${esc(n.category_en)}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">제목 (한국어) <span>*</span></label>
        <input type="text" class="form-input" id="en-title-ko" value="${esc(n.title_ko)}">
      </div>
      <div class="form-group">
        <label class="form-label">제목 (영어)</label>
        <input type="text" class="form-input" id="en-title-en" value="${esc(n.title_en)}">
      </div>
      <div class="form-group">
        <label class="form-label">내용 (한국어)</label>
        <textarea class="form-textarea" id="en-desc-ko">${esc(n.desc_ko)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">이미지 URL</label>
        <input type="url" class="form-input" id="en-image" value="${esc(n.image)}" placeholder="https://"
          oninput="previewImg('en-image','en-img-prev')">
        <div class="img-preview-wrap">
          ${n.image ? '<img id="en-img-prev" class="img-preview show" src="' + n.image + '" alt="">' : '<img id="en-img-prev" class="img-preview" alt=""><div id="en-image-nopreview" class="img-no-preview">이미지 URL 입력 시 미리보기</div>'}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">링크 URL</label>
        <input type="text" class="form-input" id="en-link" value="${esc(n.link)}">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">취소</button>
     <button class="btn btn-gold" onclick="saveNewsEdit(${idx})">저장</button>`
  );
}

function saveNewsEdit(idx) {
  const isNew = idx === -1;
  const nn = {
    id: isNew ? 'n' + Date.now() : (adminData.news.items[idx] && adminData.news.items[idx].id || 'n' + Date.now()),
    date:        getInput('en-date'),
    category_ko: getInput('en-cat-ko'),
    category_en: getInput('en-cat-en'),
    title_ko:    getInput('en-title-ko'),
    title_en:    getInput('en-title-en'),
    desc_ko:     getInput('en-desc-ko'),
    desc_en:     getInput('en-desc-ko'), // sync
    image:       getInput('en-image'),
    link:        getInput('en-link')
  };
  if (!nn.title_ko) { showToast('제목(한국어)은 필수입니다.', 'error'); return; }
  if (!adminData.news) adminData.news = { items: [] };
  if (isNew) { adminData.news.items.push(nn); }
  else { adminData.news.items[idx] = nn; }
  closeModal();
  renderNewsList();
  updateDashStats();
  showToast(isNew ? '뉴스가 추가되었습니다.' : '뉴스가 수정되었습니다.', 'success');
  renderJSON();
}

function removeNews(i) {
  if (!confirm('이 뉴스를 삭제하시겠습니까?')) return;
  adminData.news.items.splice(i, 1);
  renderNewsList();
  updateDashStats();
  showToast('뉴스가 삭제되었습니다.', 'success');
  renderJSON();
}

function saveNews() {
  updateDashStats();
  showToast('뉴스 목록이 저장되었습니다.', 'success');
  renderJSON();
}

// ── Footer ──────────────────────────────────────
function populateFooter() {
  const f = adminData.footer || {};
  const sns = f.sns || {};
  setInput('sns-instagram', sns.instagram);
  setInput('sns-youtube',   sns.youtube);
  setInput('sns-facebook',  sns.facebook);
  setInput('sns-linkedin',  sns.linkedin);
  setInput('footer-copy-ko', f.copyright_ko);
  setInput('footer-copy-en', f.copyright_en);
}

function saveFooter() {
  if (!adminData.footer) adminData.footer = { groups: [], sns: {}, copyright_ko: '', copyright_en: '' };
  adminData.footer.sns = {
    instagram: getInput('sns-instagram'),
    youtube:   getInput('sns-youtube'),
    facebook:  getInput('sns-facebook'),
    linkedin:  getInput('sns-linkedin')
  };
  adminData.footer.copyright_ko = getInput('footer-copy-ko');
  adminData.footer.copyright_en = getInput('footer-copy-en');
  showToast('푸터가 저장되었습니다.', 'success');
  renderJSON();
}

// ── JSON Editor ─────────────────────────────────
function renderJSON() {
  const el = document.getElementById('json-editor');
  if (el) el.value = JSON.stringify(adminData, null, 2);
}

function formatJSON() {
  const el = document.getElementById('json-editor');
  if (!el) return;
  try {
    el.value = JSON.stringify(JSON.parse(el.value), null, 2);
    showToast('JSON이 포맷되었습니다.', 'success');
  } catch {
    showToast('JSON 형식 오류입니다. 확인해주세요.', 'error');
  }
}

function applyJSON() {
  const el = document.getElementById('json-editor');
  if (!el) return;
  try {
    adminData = JSON.parse(el.value);
    populateAll();
    updateDashStats();
    showToast('JSON이 적용되었습니다.', 'success');
  } catch {
    showToast('JSON 형식 오류입니다. 확인 후 다시 시도하세요.', 'error');
  }
}

// ── Download / Import / Reset ───────────────────
function downloadJSON() {
  const blob = new Blob([JSON.stringify(adminData, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'content.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('content.json이 다운로드되었습니다. data/ 폴더에 저장하세요.', 'success');
}

function importJSON() {
  document.getElementById('file-import').click();
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      adminData = JSON.parse(ev.target.result);
      populateAll();
      updateDashStats();
      renderJSON();
      showToast('JSON을 성공적으로 가져왔습니다.', 'success');
    } catch {
      showToast('올바르지 않은 JSON 파일입니다.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function confirmReset() {
  openModal('데이터 초기화 확인', `
    <p style="color:#374151;line-height:1.6">
      모든 데이터를 기본값으로 초기화합니다.<br>
      <strong style="color:#ef4444">이 작업은 되돌릴 수 없습니다.</strong>
    </p>`,
    `<button class="btn btn-outline" onclick="closeModal()">취소</button>
     <button class="btn btn-danger" onclick="resetData()">초기화 실행</button>`
  );
}

function resetData() {
  adminData = getDefaultContent();
  populateAll();
  updateDashStats();
  renderJSON();
  closeModal();
  showToast('데이터가 초기화되었습니다.', 'success');
}

// ── Modal ────────────────────────────────────────
function openModal(title, body, footer) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML   = body;
  document.getElementById('modal-footer').innerHTML = footer || '';
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOnOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// ── Image Preview ────────────────────────────────
function previewImg(inputIdOrEl, previewId) {
  const input = typeof inputIdOrEl === 'string' ? document.getElementById(inputIdOrEl) : inputIdOrEl;
  const prev  = document.getElementById(previewId);
  if (!input || !prev) return;
  const url = input.value || input;
  const noPreviewId = (typeof inputIdOrEl === 'string' ? inputIdOrEl : '') + '-nopreview';
  const noPrev = document.getElementById(noPreviewId);

  if (url && typeof url === 'string' && url.startsWith('http')) {
    prev.src = url;
    prev.classList.add('show');
    if (noPrev) noPrev.style.display = 'none';
  } else {
    prev.src = '';
    prev.classList.remove('show');
    if (noPrev) noPrev.style.display = '';
  }
}

// ── Toast ────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.className = 'toast ' + (type || '');
  el.innerHTML = (type === 'success' ? '<i class="fas fa-check-circle"></i>' :
                  type === 'error'   ? '<i class="fas fa-exclamation-circle"></i>' : '') + ' ' + msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── Helpers ──────────────────────────────────────
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setInput(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function getInput(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Default Content ──────────────────────────────
function getDefaultContent() {
  return {
    site: {
      name_ko: '에스티브', name_en: 'Aestyve',
      logo: 'https://www.genspark.ai/api/files/s/zhCpFzyq',
      mission_ko: 'Look Better, Feel Better, Live Better',
      mission_en: 'Look Better, Feel Better, Live Better',
      phone: '080-855-4567', email: 'info@aestyve.com',
      address_ko: '서울특별시 강남구 청담동 420 청담스퀘어',
      address_en: 'Cheongdam Square, 420 Cheongdam-dong, Gangnam-gu, Seoul',
      primary_color: '#1a1a2e', accent_color: '#c8a97e'
    },
    hero: [
      { id:1, image:'', badge_ko:'NEW ARRIVAL', badge_en:'NEW ARRIVAL',
        title_ko:'자신감을 채우는\n에스테틱 솔루션', title_en:'Aesthetic Solutions\nfor Your Confidence',
        desc_ko:'에스티브와 함께 당신만의 아름다움을 찾아보세요.',
        desc_en:'Discover your unique beauty with Aestyve.',
        btn_ko:'자세히 보기', btn_en:'Learn More', btn_link:'#about' }
    ],
    about: {
      title_ko:'에스티브 소개', title_en:'About Aestyve',
      subtitle_ko:'아름다움의 본질을 탐구하다', subtitle_en:'Exploring the Essence of Beauty',
      text_ko:'에스티브는 혁신적인 에스테틱 솔루션을 통해 전 세계 사람들이 더 나은 삶을 살아갈 수 있도록 돕는 글로벌 기업입니다.',
      text_en:'Aestyve is a global company dedicated to helping people worldwide live better through innovative aesthetic solutions.',
      image:'',
      stats:[
        {number:'10+', label_ko:'연구개발 경력', label_en:'Years of R&D'},
        {number:'30+', label_ko:'글로벌 국가',   label_en:'Global Countries'},
        {number:'500+',label_ko:'파트너 병원',   label_en:'Partner Clinics'},
        {number:'1M+', label_ko:'시술 건수',     label_en:'Procedures'}
      ]
    },
    products: {
      featured: {
        id:'p1', name_ko:'1906NAD+', name_en:'1906NAD+', category:'best,new',
        badge_ko:'BEST', badge_en:'BEST',
        desc_ko:'맑고 탄탄한 피부 리듬을 채우는 NAD+ 컨센트레이트.',
        desc_en:'NAD+ concentrate for clear and firm skin rhythm.',
        image:'https://www.genspark.ai/api/files/s/68YDgq7B',
        price_ko:'문의', price_en:'Inquiry', link:'#'
      },
      items:[
        { id:'p2', name_ko:'Liquid PCL', name_en:'Liquid PCL', category:'new',
          badge_ko:'NEW', badge_en:'NEW',
          desc_ko:'결을 채우고 탄력을 더하는 리퀴드 PCL 스킨 부스터.',
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
      items:[
        {id:'s1', icon:'🔬', title_ko:'임상 연구', title_en:'Clinical Research',
          desc_ko:'30개 이상의 임상 시험으로 입증된 안전성.',
          desc_en:'Proven safety by 30+ clinical trials.'},
        {id:'s2', icon:'⚗️', title_ko:'바이오테크놀로지', title_en:'Biotechnology',
          desc_ko:'차세대 생체 적합 소재 개발.',
          desc_en:'Next-gen biocompatible materials.'},
        {id:'s3', icon:'🛡️', title_ko:'안전성 인증', title_en:'Safety Certification',
          desc_ko:'국제 안전 기준 충족 및 글로벌 인증.',
          desc_en:'International safety certifications.'}
      ]
    },
    academy: {
      items:[
        {id:'a1', image:'', title_ko:'마스터 클래스', title_en:'Master Class',
          desc_ko:'세계적인 전문가와 함께하는 심화 교육.',
          desc_en:'Advanced training with world-class experts.', link:'#'},
        {id:'a2', image:'', title_ko:'국제 심포지엄', title_en:'International Symposium',
          desc_ko:'글로벌 트렌드를 공유하는 국제 행사.',
          desc_en:'International event sharing global trends.', link:'#'},
        {id:'a3', image:'', title_ko:'온라인 웨비나', title_en:'Online Webinar',
          desc_ko:'어디서나 참여 가능한 실시간 교육.',
          desc_en:'Real-time online training.', link:'#'}
      ]
    },
    news: {
      items:[
        {id:'n1', date:'2026-08-01', category_ko:'제품', category_en:'Product',
          title_ko:'신제품 1906NAD+ 출시', title_en:'New Product 1906NAD+ Launch',
          desc_ko:'에스티브의 혁신적인 NAD+ 스킨 부스터가 출시되었습니다.',
          desc_en:'Aestyve\'s innovative NAD+ skin booster has launched.',
          image:'', link:'#'},
        {id:'n2', date:'2026-07-15', category_ko:'이벤트', category_en:'Event',
          title_ko:'국제 심포지엄 성공적 개최', title_en:'International Symposium',
          desc_ko:'30개국 의료진이 참여한 심포지엄 성황.',
          desc_en:'Symposium with professionals from 30 countries.',
          image:'', link:'#'},
        {id:'n3', date:'2026-06-20', category_ko:'트렌드', category_en:'Trend',
          title_ko:'2026 에스테틱 트렌드 리포트', title_en:'2026 Aesthetic Trends',
          desc_ko:'글로벌 에스테틱 시장의 최신 트렌드 분석.',
          desc_en:'Latest global aesthetic market trend analysis.',
          image:'', link:'#'},
        {id:'n4', date:'2026-05-10', category_ko:'파트너십', category_en:'Partnership',
          title_ko:'글로벌 파트너십 확대', title_en:'Global Partnership Expansion',
          desc_ko:'에스티브가 동남아시아 5개국과 파트너십을 체결했습니다.',
          desc_en:'Aestyve establishes partnerships with 5 Southeast Asian countries.',
          image:'', link:'#'}
      ]
    },
    footer: {
      groups:[
        {title_ko:'회사 소개', title_en:'About',
          links:[{label_ko:'에스티브 소개',label_en:'About Us',url:'#about'},
                 {label_ko:'연혁',label_en:'History',url:'#'},
                 {label_ko:'파트너십',label_en:'Partnership',url:'#'}]},
        {title_ko:'제품', title_en:'Products',
          links:[{label_ko:'전체 제품',label_en:'All Products',url:'#products'},
                 {label_ko:'신제품',label_en:'New',url:'#products'},
                 {label_ko:'베스트',label_en:'Best',url:'#products'}]},
        {title_ko:'아카데미', title_en:'Academy',
          links:[{label_ko:'마스터 클래스',label_en:'Master Class',url:'#academy'},
                 {label_ko:'심포지엄',label_en:'Symposium',url:'#academy'},
                 {label_ko:'웨비나',label_en:'Webinar',url:'#academy'}]},
        {title_ko:'고객 지원', title_en:'Support',
          links:[{label_ko:'문의하기',label_en:'Contact Us',url:'#contact'},
                 {label_ko:'FAQ',label_en:'FAQ',url:'#'},
                 {label_ko:'개인정보처리방침',label_en:'Privacy Policy',url:'#'}]}
      ],
      sns:{instagram:'#', youtube:'#', facebook:'#', linkedin:'#'},
      copyright_ko:'© 2026 Aestyve. All Rights Reserved.',
      copyright_en:'© 2026 Aestyve. All Rights Reserved.'
    }
  };
}

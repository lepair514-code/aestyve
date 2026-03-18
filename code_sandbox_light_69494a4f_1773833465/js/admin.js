/* =========================================================
   Aestyve - Admin JS
   CRUD for: site_settings | banners | categories | products | reviews
   Lang tabs: ko | en | zh-CN | th
   ========================================================= */

'use strict';

/* ── API HELPERS ── */
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ limit: 100, ...params }).toString();
  const res = await fetch(`tables/${table}?${qs}`);
  if (!res.ok) throw new Error(`GET error: ${res.status}`);
  return await res.json();
}
async function apiPost(table, data) {
  const res = await fetch(`tables/${table}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`POST error: ${res.status}`);
  return await res.json();
}
async function apiPut(table, id, data) {
  const res = await fetch(`tables/${table}/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`PUT error: ${res.status}`);
  return await res.json();
}
async function apiPatch(table, id, data) {
  const res = await fetch(`tables/${table}/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`PATCH error: ${res.status}`);
  return await res.json();
}
async function apiDelete(table, id) {
  const res = await fetch(`tables/${table}/${id}`, { method: 'DELETE' });
  if (res.status !== 204 && !res.ok) throw new Error(`DELETE error: ${res.status}`);
}

/* ── ALERT ── */
function showAlert(type, msg, duration = 3500) {
  const area = document.getElementById('alertArea');
  if (!area) return;
  area.style.display = 'block';
  area.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>${msg}</div>`;
  if (duration > 0) setTimeout(() => { area.style.display = 'none'; area.innerHTML = ''; }, duration);
}

/* ── PANEL NAVIGATION ── */
const PANEL_TITLES = {
  dashboard: '대시보드',
  settings: '사이트 설정',
  banners: '히어로 배너',
  categories: '카테고리',
  products: '제품',
  reviews: '리뷰'
};

function showPanel(name) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add('active');
  const sideItem = document.querySelector(`.sidebar-item[data-panel="${name}"]`);
  if (sideItem) sideItem.classList.add('active');
  const titleEl = document.getElementById('panelTitle');
  if (titleEl) titleEl.textContent = PANEL_TITLES[name] || name;
  // Load data on demand
  if (name === 'settings') loadSettings();
  if (name === 'banners') loadBanners();
  if (name === 'categories') loadCategories();
  if (name === 'products') loadProductsList();
  if (name === 'reviews') loadReviews();
}

/* ── LANGUAGE TAB SWITCHING ── */
// switchLangTab('bm', 'en') activates bm-en tab content
// and the corresponding tab button in the same parent
function switchLangTab(group, lang) {
  // Hide all contents for this group
  document.querySelectorAll(`[id^="${group}-"]`).forEach(el => el.classList.remove('active'));
  // Show target
  const targetContent = document.getElementById(`${group}-${lang}`);
  if (targetContent) targetContent.classList.add('active');
  // Update tab buttons – find the button that called switchLangTab and its siblings
  // We match by onclick attribute pattern
  const allBtns = document.querySelectorAll(`button[onclick*="switchLangTab('${group}',"]`);
  allBtns.forEach(btn => {
    const match = btn.getAttribute('onclick').match(/switchLangTab\('.*?',\s*'(.*?)'\)/);
    if (match) btn.classList.toggle('active', match[1] === lang);
  });
}

/* ── HELPER: read field value ── */
const g = id => { const el = document.getElementById(id); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
const s = (id, val) => { const el = document.getElementById(id); if (!el) return; if (el.type === 'checkbox') el.checked = !!val; else el.value = val || ''; };

/* ── FORMAT: display short text ── */
function shortText(t, n = 40) { return t && t.length > n ? t.slice(0, n) + '…' : (t || '—'); }

/* =========================================================
   SITE SETTINGS
   ========================================================= */
let settingsId = null;

async function loadSettings() {
  try {
    const res = await apiGet('site_settings');
    const arr = res.data || [];
    const data = arr.length > 0 ? arr[0] : {};
    settingsId = data.id || null;

    s('s_brand_name', data.brand_name);
    s('s_primary_color', data.primary_color || '#1A2755');
    s('s_primary_color_hex', data.primary_color || '#1A2755');
    s('s_notice_visible', data.notice_visible !== false);
    s('s_notice_text_ko', data.notice_text_ko);
    s('s_notice_text_en', data.notice_text_en);
    s('s_notice_text_zh_CN', data.notice_text_zh_CN);
    s('s_notice_text_th', data.notice_text_th);
    s('s_slogan_ko', data.slogan_ko);
    s('s_slogan_en', data.slogan_en);
    s('s_slogan_zh_CN', data.slogan_zh_CN);
    s('s_slogan_th', data.slogan_th);
    s('s_brand_story_ko', data.brand_story_ko);
    s('s_brand_story_en', data.brand_story_en);
    s('s_brand_story_zh_CN', data.brand_story_zh_CN);
    s('s_brand_story_th', data.brand_story_th);
    s('s_stat1_number', data.stat1_number);
    s('s_stat2_number', data.stat2_number);
    s('s_stat3_number', data.stat3_number);
    s('s_stat1_label_ko', data.stat1_label_ko);
    s('s_stat2_label_ko', data.stat2_label_ko);
    s('s_stat3_label_ko', data.stat3_label_ko);
    s('s_stat1_label_en', data.stat1_label_en);
    s('s_stat2_label_en', data.stat2_label_en);
    s('s_stat3_label_en', data.stat3_label_en);
    s('s_stat1_label_zh_CN', data.stat1_label_zh_CN);
    s('s_stat2_label_zh_CN', data.stat2_label_zh_CN);
    s('s_stat3_label_zh_CN', data.stat3_label_zh_CN);
    s('s_stat1_label_th', data.stat1_label_th);
    s('s_stat2_label_th', data.stat2_label_th);
    s('s_stat3_label_th', data.stat3_label_th);
    s('s_footer_phone', data.footer_phone);
    s('s_footer_email', data.footer_email);
    s('s_footer_address_ko', data.footer_address_ko);
    s('s_footer_address_en', data.footer_address_en);
    s('s_footer_address_zh_CN', data.footer_address_zh_CN);
    s('s_footer_address_th', data.footer_address_th);
    s('s_sns_instagram', data.sns_instagram);
    s('s_sns_youtube', data.sns_youtube);
    s('s_sns_facebook', data.sns_facebook);
    s('s_sns_tiktok', data.sns_tiktok);

    // Color input sync
    const colorInput = document.getElementById('s_primary_color');
    const colorHex = document.getElementById('s_primary_color_hex');
    if (colorInput && colorHex) {
      colorInput.addEventListener('input', () => { colorHex.value = colorInput.value; });
      colorHex.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(colorHex.value)) colorInput.value = colorHex.value;
      });
    }
  } catch (e) {
    showAlert('error', '설정을 불러오는 데 실패했습니다: ' + e.message);
  }
}

async function saveSettings() {
  const data = {
    brand_name: g('s_brand_name'),
    primary_color: g('s_primary_color_hex') || g('s_primary_color'),
    notice_visible: g('s_notice_visible'),
    notice_text_ko: g('s_notice_text_ko'),
    notice_text_en: g('s_notice_text_en'),
    notice_text_zh_CN: g('s_notice_text_zh_CN'),
    notice_text_th: g('s_notice_text_th'),
    slogan_ko: g('s_slogan_ko'), slogan_en: g('s_slogan_en'),
    slogan_zh_CN: g('s_slogan_zh_CN'), slogan_th: g('s_slogan_th'),
    brand_story_ko: g('s_brand_story_ko'), brand_story_en: g('s_brand_story_en'),
    brand_story_zh_CN: g('s_brand_story_zh_CN'), brand_story_th: g('s_brand_story_th'),
    stat1_number: g('s_stat1_number'), stat2_number: g('s_stat2_number'), stat3_number: g('s_stat3_number'),
    stat1_label_ko: g('s_stat1_label_ko'), stat2_label_ko: g('s_stat2_label_ko'), stat3_label_ko: g('s_stat3_label_ko'),
    stat1_label_en: g('s_stat1_label_en'), stat2_label_en: g('s_stat2_label_en'), stat3_label_en: g('s_stat3_label_en'),
    stat1_label_zh_CN: g('s_stat1_label_zh_CN'), stat2_label_zh_CN: g('s_stat2_label_zh_CN'), stat3_label_zh_CN: g('s_stat3_label_zh_CN'),
    stat1_label_th: g('s_stat1_label_th'), stat2_label_th: g('s_stat2_label_th'), stat3_label_th: g('s_stat3_label_th'),
    footer_phone: g('s_footer_phone'), footer_email: g('s_footer_email'),
    footer_address_ko: g('s_footer_address_ko'), footer_address_en: g('s_footer_address_en'),
    footer_address_zh_CN: g('s_footer_address_zh_CN'), footer_address_th: g('s_footer_address_th'),
    sns_instagram: g('s_sns_instagram'), sns_youtube: g('s_sns_youtube'),
    sns_facebook: g('s_sns_facebook'), sns_tiktok: g('s_sns_tiktok'),
  };
  try {
    if (settingsId) {
      await apiPatch('site_settings', settingsId, data);
    } else {
      data.id = 'site_001';
      await apiPost('site_settings', data);
    }
    showAlert('success', '✅ 설정이 저장되었습니다. 홈페이지를 새로고침하면 반영됩니다.');
  } catch (e) {
    showAlert('error', '저장 실패: ' + e.message);
  }
}

/* =========================================================
   BANNERS
   ========================================================= */
let bannerData = [];

async function loadBanners() {
  try {
    const res = await apiGet('banners', { sort: 'sort_order' });
    bannerData = res.data || [];
    renderBannersList();
    updateDashStats('banners', bannerData.length);
  } catch (e) {
    showAlert('error', '배너 로드 실패: ' + e.message);
  }
}

function renderBannersList() {
  const el = document.getElementById('bannersList');
  if (!el) return;
  if (!bannerData.length) { el.innerHTML = '<p style="color:#888;padding:20px;text-align:center;">등록된 배너가 없습니다.</p>'; return; }
  el.innerHTML = bannerData.map(b => `
    <div class="item-row">
      ${b.image_url ? `<img class="item-thumb" src="${b.image_url}" alt="banner" />` : '<div class="item-thumb" style="background:#ddd;display:flex;align-items:center;justify-content:center;font-size:20px;">🖼</div>'}
      <div class="item-info">
        <div class="item-name">${shortText(b.title_ko || b.title_en || '(제목 없음)', 50)}</div>
        <div class="item-meta">순서: ${b.sort_order||'-'} | ${b.visible!==false?'✅ 노출':'🔴 비노출'}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-secondary btn-sm" onclick="openBannerModal('${b.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteBanner('${b.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function openBannerModal(id) {
  const modal = document.getElementById('bannerModal');
  modal.classList.add('open');
  if (!id) {
    document.getElementById('bannerModalTitle').textContent = '배너 추가';
    document.getElementById('bm_id').value = '';
    ['bm_image_url','bm_bg_color','bm_btn_link','bm_title_ko','bm_title_en','bm_title_zh_CN','bm_title_th',
     'bm_subtitle_ko','bm_subtitle_en','bm_subtitle_zh_CN','bm_subtitle_th',
     'bm_btn_text_ko','bm_btn_text_en','bm_btn_text_zh_CN','bm_btn_text_th'].forEach(fid => s(fid,''));
    s('bm_text_align','left'); s('bm_sort_order','1'); s('bm_visible', true);
  } else {
    const b = bannerData.find(x => x.id === id);
    if (!b) return;
    document.getElementById('bannerModalTitle').textContent = '배너 수정';
    s('bm_id', b.id);
    s('bm_image_url', b.image_url); s('bm_bg_color', b.bg_color);
    s('bm_text_align', b.text_align||'left'); s('bm_btn_link', b.btn_link);
    s('bm_sort_order', b.sort_order); s('bm_visible', b.visible!==false);
    s('bm_title_ko', b.title_ko); s('bm_title_en', b.title_en); s('bm_title_zh_CN', b.title_zh_CN); s('bm_title_th', b.title_th);
    s('bm_subtitle_ko', b.subtitle_ko); s('bm_subtitle_en', b.subtitle_en); s('bm_subtitle_zh_CN', b.subtitle_zh_CN); s('bm_subtitle_th', b.subtitle_th);
    s('bm_btn_text_ko', b.btn_text_ko); s('bm_btn_text_en', b.btn_text_en); s('bm_btn_text_zh_CN', b.btn_text_zh_CN); s('bm_btn_text_th', b.btn_text_th);
  }
  // Reset to ko tab
  switchLangTab('bm', 'ko');
}
function closeBannerModal() { document.getElementById('bannerModal').classList.remove('open'); }

async function saveBanner() {
  const id = g('bm_id');
  const data = {
    image_url: g('bm_image_url'), bg_color: g('bm_bg_color'),
    text_align: g('bm_text_align'), btn_link: g('bm_btn_link'),
    sort_order: parseInt(g('bm_sort_order'))||1, visible: g('bm_visible'),
    title_ko: g('bm_title_ko'), title_en: g('bm_title_en'), title_zh_CN: g('bm_title_zh_CN'), title_th: g('bm_title_th'),
    subtitle_ko: g('bm_subtitle_ko'), subtitle_en: g('bm_subtitle_en'), subtitle_zh_CN: g('bm_subtitle_zh_CN'), subtitle_th: g('bm_subtitle_th'),
    btn_text_ko: g('bm_btn_text_ko'), btn_text_en: g('bm_btn_text_en'), btn_text_zh_CN: g('bm_btn_text_zh_CN'), btn_text_th: g('bm_btn_text_th'),
  };
  try {
    if (id) { await apiPatch('banners', id, data); showAlert('success', '✅ 배너가 수정되었습니다.'); }
    else { await apiPost('banners', data); showAlert('success', '✅ 배너가 추가되었습니다.'); }
    closeBannerModal();
    loadBanners();
  } catch (e) { showAlert('error', '저장 실패: ' + e.message); }
}

async function deleteBanner(id) {
  if (!confirm('이 배너를 삭제하시겠습니까?')) return;
  try { await apiDelete('banners', id); showAlert('success', '✅ 배너가 삭제되었습니다.'); loadBanners(); }
  catch (e) { showAlert('error', '삭제 실패: ' + e.message); }
}

/* =========================================================
   CATEGORIES
   ========================================================= */
let categoryData = [];

async function loadCategories() {
  try {
    const res = await apiGet('categories', { sort: 'sort_order' });
    categoryData = res.data || [];
    renderCategoriesList();
    updateDashStats('categories', categoryData.length);
  } catch (e) { showAlert('error', '카테고리 로드 실패: ' + e.message); }
}

function renderCategoriesList() {
  const el = document.getElementById('categoriesList');
  if (!el) return;
  if (!categoryData.length) { el.innerHTML = '<p style="color:#888;padding:20px;text-align:center;">등록된 카테고리가 없습니다.</p>'; return; }
  el.innerHTML = categoryData.map(c => `
    <div class="item-row">
      ${c.image_url ? `<img class="item-thumb" src="${c.image_url}" alt="cat" />` : '<div class="item-thumb" style="background:#ddd;display:flex;align-items:center;justify-content:center;font-size:20px;">🏷</div>'}
      <div class="item-info">
        <div class="item-name">${c.name_ko||c.name_en||'(이름 없음)'}</div>
        <div class="item-meta">${c.skin_concern_ko||''} | ${c.visible!==false?'✅ 노출':'🔴 비노출'}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-secondary btn-sm" onclick="openCategoryModal('${c.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteCategory('${c.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function openCategoryModal(id) {
  document.getElementById('categoryModal').classList.add('open');
  if (!id) {
    document.getElementById('categoryModalTitle').textContent = '카테고리 추가';
    document.getElementById('cm_id').value = '';
    ['cm_image_url','cm_link_url','cm_name_ko','cm_name_en','cm_name_zh_CN','cm_name_th',
     'cm_skin_concern_ko','cm_skin_concern_en','cm_skin_concern_zh_CN','cm_skin_concern_th',
     'cm_label_ko','cm_label_en','cm_label_zh_CN','cm_label_th'].forEach(fid => s(fid,''));
    s('cm_sort_order','1'); s('cm_visible', true);
  } else {
    const c = categoryData.find(x => x.id === id);
    if (!c) return;
    document.getElementById('categoryModalTitle').textContent = '카테고리 수정';
    s('cm_id',c.id); s('cm_image_url',c.image_url); s('cm_link_url',c.link_url);
    s('cm_sort_order',c.sort_order); s('cm_visible',c.visible!==false);
    s('cm_name_ko',c.name_ko); s('cm_name_en',c.name_en); s('cm_name_zh_CN',c.name_zh_CN); s('cm_name_th',c.name_th);
    s('cm_skin_concern_ko',c.skin_concern_ko); s('cm_skin_concern_en',c.skin_concern_en); s('cm_skin_concern_zh_CN',c.skin_concern_zh_CN); s('cm_skin_concern_th',c.skin_concern_th);
    s('cm_label_ko',c.label_ko); s('cm_label_en',c.label_en); s('cm_label_zh_CN',c.label_zh_CN); s('cm_label_th',c.label_th);
  }
  switchLangTab('cm', 'ko');
}
function closeCategoryModal() { document.getElementById('categoryModal').classList.remove('open'); }

async function saveCategory() {
  const id = g('cm_id');
  const data = {
    image_url: g('cm_image_url'), link_url: g('cm_link_url'),
    sort_order: parseInt(g('cm_sort_order'))||1, visible: g('cm_visible'),
    name_ko: g('cm_name_ko'), name_en: g('cm_name_en'), name_zh_CN: g('cm_name_zh_CN'), name_th: g('cm_name_th'),
    skin_concern_ko: g('cm_skin_concern_ko'), skin_concern_en: g('cm_skin_concern_en'), skin_concern_zh_CN: g('cm_skin_concern_zh_CN'), skin_concern_th: g('cm_skin_concern_th'),
    label_ko: g('cm_label_ko'), label_en: g('cm_label_en'), label_zh_CN: g('cm_label_zh_CN'), label_th: g('cm_label_th'),
  };
  try {
    if (id) { await apiPatch('categories', id, data); showAlert('success', '✅ 카테고리가 수정되었습니다.'); }
    else { await apiPost('categories', data); showAlert('success', '✅ 카테고리가 추가되었습니다.'); }
    closeCategoryModal(); loadCategories();
  } catch (e) { showAlert('error', '저장 실패: ' + e.message); }
}

async function deleteCategory(id) {
  if (!confirm('이 카테고리를 삭제하시겠습니까?')) return;
  try { await apiDelete('categories', id); showAlert('success', '✅ 삭제되었습니다.'); loadCategories(); }
  catch (e) { showAlert('error', '삭제 실패: ' + e.message); }
}

/* =========================================================
   PRODUCTS
   ========================================================= */
let productData = [];

async function loadProductsList() {
  try {
    const res = await apiGet('products', { sort: 'sort_order' });
    productData = res.data || [];
    renderProductsList();
    updateDashStats('products', productData.length);
  } catch (e) { showAlert('error', '제품 로드 실패: ' + e.message); }
}

function renderProductsList() {
  const el = document.getElementById('productsList');
  if (!el) return;
  if (!productData.length) { el.innerHTML = '<p style="color:#888;padding:20px;text-align:center;">등록된 제품이 없습니다.</p>'; return; }
  el.innerHTML = productData.map(p => `
    <div class="item-row">
      ${p.image_url ? `<img class="item-thumb" src="${p.image_url}" alt="prod" />` : '<div class="item-thumb" style="background:#ddd;display:flex;align-items:center;justify-content:center;font-size:20px;">📦</div>'}
      <div class="item-info">
        <div class="item-name">${p.name_ko||p.name_en||'(이름 없음)'}</div>
        <div class="item-meta">₩${p.price?Number(p.price).toLocaleString():'-'} | ${p.tab_category||'-'} | ${p.visible!==false?'✅ 노출':'🔴 비노출'}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-secondary btn-sm" onclick="openProductModal('${p.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function openProductModal(id) {
  document.getElementById('productModal').classList.add('open');
  if (!id) {
    document.getElementById('productModalTitle').textContent = '제품 추가';
    document.getElementById('pm_id').value = '';
    ['pm_image_url','pm_link_url','pm_name_ko','pm_name_en','pm_name_zh_CN','pm_name_th',
     'pm_desc_ko','pm_desc_en','pm_desc_zh_CN','pm_desc_th',
     'pm_badge_ko','pm_badge_en','pm_badge_zh_CN','pm_badge_th'].forEach(fid => s(fid,''));
    s('pm_price',''); s('pm_sort_order','1'); s('pm_visible', true); s('pm_tab_category','all');
  } else {
    const p = productData.find(x => x.id === id);
    if (!p) return;
    document.getElementById('productModalTitle').textContent = '제품 수정';
    s('pm_id',p.id); s('pm_image_url',p.image_url); s('pm_link_url',p.link_url);
    s('pm_price',p.price); s('pm_tab_category',p.tab_category||'all');
    s('pm_sort_order',p.sort_order); s('pm_visible',p.visible!==false);
    s('pm_name_ko',p.name_ko); s('pm_name_en',p.name_en); s('pm_name_zh_CN',p.name_zh_CN); s('pm_name_th',p.name_th);
    s('pm_desc_ko',p.desc_ko); s('pm_desc_en',p.desc_en); s('pm_desc_zh_CN',p.desc_zh_CN); s('pm_desc_th',p.desc_th);
    s('pm_badge_ko',p.badge_ko); s('pm_badge_en',p.badge_en); s('pm_badge_zh_CN',p.badge_zh_CN); s('pm_badge_th',p.badge_th);
  }
  switchLangTab('pm', 'ko');
}
function closeProductModal() { document.getElementById('productModal').classList.remove('open'); }

async function saveProduct() {
  const id = g('pm_id');
  const data = {
    image_url: g('pm_image_url'), link_url: g('pm_link_url'),
    price: parseFloat(g('pm_price'))||0, tab_category: g('pm_tab_category'),
    sort_order: parseInt(g('pm_sort_order'))||1, visible: g('pm_visible'),
    name_ko: g('pm_name_ko'), name_en: g('pm_name_en'), name_zh_CN: g('pm_name_zh_CN'), name_th: g('pm_name_th'),
    desc_ko: g('pm_desc_ko'), desc_en: g('pm_desc_en'), desc_zh_CN: g('pm_desc_zh_CN'), desc_th: g('pm_desc_th'),
    badge_ko: g('pm_badge_ko'), badge_en: g('pm_badge_en'), badge_zh_CN: g('pm_badge_zh_CN'), badge_th: g('pm_badge_th'),
  };
  try {
    if (id) { await apiPatch('products', id, data); showAlert('success', '✅ 제품이 수정되었습니다.'); }
    else { await apiPost('products', data); showAlert('success', '✅ 제품이 추가되었습니다.'); }
    closeProductModal(); loadProductsList();
  } catch (e) { showAlert('error', '저장 실패: ' + e.message); }
}

async function deleteProduct(id) {
  if (!confirm('이 제품을 삭제하시겠습니까?')) return;
  try { await apiDelete('products', id); showAlert('success', '✅ 삭제되었습니다.'); loadProductsList(); }
  catch (e) { showAlert('error', '삭제 실패: ' + e.message); }
}

/* =========================================================
   REVIEWS
   ========================================================= */
let reviewData = [];

async function loadReviews() {
  try {
    const res = await apiGet('reviews');
    reviewData = res.data || [];
    renderReviewsList();
    updateDashStats('reviews', reviewData.length);
  } catch (e) { showAlert('error', '리뷰 로드 실패: ' + e.message); }
}

function renderReviewsList() {
  const el = document.getElementById('reviewsList');
  if (!el) return;
  if (!reviewData.length) { el.innerHTML = '<p style="color:#888;padding:20px;text-align:center;">등록된 리뷰가 없습니다.</p>'; return; }
  el.innerHTML = reviewData.map(r => {
    const stars = '★'.repeat(Math.min(5, r.rating||5));
    return `<div class="item-row">
      <div class="review-avatar" style="width:44px;height:44px;border-radius:50%;background:#1A2755;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;">${(r.author||'?')[0].toUpperCase()}</div>
      <div class="item-info">
        <div class="item-name">${r.author||''} <span style="color:#f5a623;font-size:12px;">${stars}</span></div>
        <div class="item-meta">${shortText(r.content_ko||r.content_en||'')} | ${r.visible!==false?'✅ 노출':'🔴 비노출'}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-secondary btn-sm" onclick="openReviewModal('${r.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteReview('${r.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

function openReviewModal(id) {
  document.getElementById('reviewModal').classList.add('open');
  if (!id) {
    document.getElementById('reviewModalTitle').textContent = '리뷰 추가';
    document.getElementById('rm_id').value = '';
    ['rm_author','rm_content_ko','rm_content_en','rm_content_zh_CN','rm_content_th',
     'rm_product_ko','rm_product_en','rm_product_zh_CN','rm_product_th'].forEach(fid => s(fid,''));
    s('rm_rating', '5'); s('rm_visible', true);
  } else {
    const r = reviewData.find(x => x.id === id);
    if (!r) return;
    document.getElementById('reviewModalTitle').textContent = '리뷰 수정';
    s('rm_id',r.id); s('rm_author',r.author); s('rm_rating',r.rating||5); s('rm_visible',r.visible!==false);
    s('rm_content_ko',r.content_ko); s('rm_content_en',r.content_en); s('rm_content_zh_CN',r.content_zh_CN); s('rm_content_th',r.content_th);
    s('rm_product_ko',r.product_ko); s('rm_product_en',r.product_en); s('rm_product_zh_CN',r.product_zh_CN); s('rm_product_th',r.product_th);
  }
  switchLangTab('rm', 'ko');
}
function closeReviewModal() { document.getElementById('reviewModal').classList.remove('open'); }

async function saveReview() {
  const id = g('rm_id');
  const data = {
    author: g('rm_author'), rating: parseInt(g('rm_rating'))||5, visible: g('rm_visible'),
    content_ko: g('rm_content_ko'), content_en: g('rm_content_en'), content_zh_CN: g('rm_content_zh_CN'), content_th: g('rm_content_th'),
    product_ko: g('rm_product_ko'), product_en: g('rm_product_en'), product_zh_CN: g('rm_product_zh_CN'), product_th: g('rm_product_th'),
  };
  try {
    if (id) { await apiPatch('reviews', id, data); showAlert('success', '✅ 리뷰가 수정되었습니다.'); }
    else { await apiPost('reviews', data); showAlert('success', '✅ 리뷰가 추가되었습니다.'); }
    closeReviewModal(); loadReviews();
  } catch (e) { showAlert('error', '저장 실패: ' + e.message); }
}

async function deleteReview(id) {
  if (!confirm('이 리뷰를 삭제하시겠습니까?')) return;
  try { await apiDelete('reviews', id); showAlert('success', '✅ 삭제되었습니다.'); loadReviews(); }
  catch (e) { showAlert('error', '삭제 실패: ' + e.message); }
}

/* ── DASHBOARD STATS ── */
const dashCache = {};
function updateDashStats(key, count) {
  dashCache[key] = count;
  const map = { banners: 'statBanners', categories: 'statCategories', products: 'statProducts', reviews: 'statReviews' };
  const el = document.getElementById(map[key]);
  if (el) el.textContent = count;
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  // Load all for dashboard stats
  try {
    const [b, c, p, r] = await Promise.all([
      apiGet('banners'), apiGet('categories'), apiGet('products'), apiGet('reviews')
    ]);
    updateDashStats('banners', (b.data||[]).length);
    updateDashStats('categories', (c.data||[]).length);
    updateDashStats('products', (p.data||[]).length);
    updateDashStats('reviews', (r.data||[]).length);
    // Cache for lists (avoid double fetching when first visiting these panels)
    bannerData = b.data || [];
    categoryData = c.data || [];
    productData = p.data || [];
    reviewData = r.data || [];
  } catch(e) { console.warn('[Admin] Dashboard stats load failed:', e); }

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
});

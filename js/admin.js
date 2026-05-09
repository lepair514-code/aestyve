/**
 * Aestyve — admin.js v3
 * Hero 비디오 URL + Products 이미지/이름/설명 직접 수정
 */

const STORAGE_KEY = 'aestyve_content';
const LANGS = ['ko', 'en', 'zh-CN', 'th'];
const LANG_LABELS = { ko: '한국어', en: 'English', 'zh-CN': '中文', th: 'ภาษาไทย' };

let DATA = null;
let modalProductIdx = -1; // -1 = 신규

/* ─── 유틸 ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const uid = () => 'p_' + Math.random().toString(36).slice(2, 9);

function toast(msg, type = 'success', dur = 2800) {
  const el = $('#admin-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = type === 'error' ? 'error' : '';
  requestAnimationFrame(() => {
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur);
  });
}

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── 데이터 로드 ─── */
async function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { DATA = JSON.parse(stored); renderAll(); return; }
    catch (e) { console.warn('[Admin] localStorage 파싱 오류'); }
  }
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    DATA = await res.json();
    saveToStorage();
    renderAll();
  } catch (err) {
    console.error('[Admin] content.json 로드 실패:', err);
    DATA = getDefaultData();
    saveToStorage();
    renderAll();
    toast('content.json을 찾을 수 없어 기본값으로 시작합니다.', 'error', 5000);
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
}

/* ─── 기본 데이터 ─── */
function getDefaultData() {
  return {
    settings: {
      brandName: 'Aestyve',
      primaryColor: '#1A2755',
      noticeBar: { visible: false, text: { ko: '', en: '', 'zh-CN': '', th: '' } },
      slogan: { ko: '피부과학의 혁신', en: 'Innovation in Dermatology', 'zh-CN': '皮肤科学的创新', th: 'นวัตกรรมผิวหนัง' },
      brandStory: { ko: 'Aestyve는 최첨단 피부과학으로 탄생했습니다.', en: 'Aestyve was born from cutting-edge dermatology.', 'zh-CN': 'Aestyve诞生于尖端皮肤科学。', th: 'Aestyve เกิดจากวิทยาศาสตร์ผิวหนังขั้นสูง' },
      stats: [],
      contact: { phone: '', email: '', address: '' },
      social: { instagram: '', youtube: '', facebook: '', tiktok: '' },
    },
    nav: [
      { id: 'nav1', label: { ko: 'PRODUCTS', en: 'PRODUCTS', 'zh-CN': '产品', th: 'สินค้า' }, href: '#products' },
      { id: 'nav2', label: { ko: 'BRAND', en: 'BRAND', 'zh-CN': '品牌', th: 'แบรนด์' }, href: '#brand' },
      { id: 'nav3', label: { ko: 'CONTACT', en: 'CONTACT', 'zh-CN': '联系', th: 'ติดต่อ' }, href: '#contact' },
    ],
    heroes: [],
    categories: [],
    products: [],
    reviews: [],
  };
}

/* ─── 전체 렌더 ─── */
function renderAll() {
  renderDashboard();
  renderHeroForm();
  renderProductAdminList();
  renderSettingsForm();
}

/* ─── Dashboard ─── */
function renderDashboard() {
  const prodCount = $('#dash-prod-count');
  if (prodCount) prodCount.textContent = DATA.products?.length || 0;

  const heroStatus = $('#dash-hero-status');
  if (heroStatus) {
    const h = DATA.heroes?.[0];
    heroStatus.textContent = h?.bgVideo ? '✅' : h?.bgImage ? '🖼️' : '없음';
  }
}

/* ─── Hero 폼 렌더 ─── */
function renderHeroForm() {
  const h = DATA.heroes?.[0] || {};

  // YouTube URL
  const ytInput = $('#hero-yt-url');
  if (ytInput) ytInput.value = h.bgVideo || '';

  // YouTube 미리보기 (저장된 URL이 있으면 표시)
  if (h.bgVideo) {
    showYoutubePreview(h.bgVideo);
  }

  // 텍스트 오버레이
  const setVal = (id, val) => { const el = $(id); if (el) el.value = val || ''; };
  setVal('#hero-title-ko',   (h.title    || {}).ko   || '');
  setVal('#hero-title-en',   (h.title    || {}).en   || '');
  setVal('#hero-subtitle-ko',(h.subtitle || {}).ko   || '');
  setVal('#hero-btn-ko',     (h.btnText  || {}).ko   || '');
  setVal('#hero-btn-href',   h.btnHref                || '#products');
}

/* YouTube 미리보기 */
function showYoutubePreview(url) {
  if (!url) return;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!ytMatch) { toast('올바른 YouTube URL을 입력해주세요.', 'error'); return; }
  const videoId = ytMatch[1];
  const wrap = $('#hero-yt-preview');
  const iframe = $('#hero-yt-iframe-preview');
  if (wrap && iframe) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    wrap.style.display = '';
  }
}
window.previewYoutube = function() {
  const url = ($('#hero-yt-url') || {}).value?.trim() || '';
  if (!url) { toast('YouTube URL을 입력해주세요.', 'error'); return; }
  showYoutubePreview(url);
};

/* Hero 동영상 파일 업로드 (ObjectURL — 임시) */
window.handleHeroVideo = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 500 * 1024 * 1024) { toast('500MB 이하 파일만 지원합니다.', 'error'); input.value = ''; return; }
  const url = URL.createObjectURL(file);
  const preview = $('#hero-video-preview');
  if (preview) preview.innerHTML = `<video src="${url}" style="width:100%;max-height:200px;object-fit:cover;" controls muted playsinline></video>`;
  const area = $('#hero-video-upload-area');
  if (area) area.classList.add('has-media');
  // ObjectURL은 임시 — hero bgVideo는 YouTube URL만 영구 저장
  toast('✅ 미리보기 완료! 영구 적용은 YouTube URL을 사용하세요.', 'success', 4000);
};

/* Hero 저장 */
window.saveHero = function() {
  const ytUrl   = ($('#hero-yt-url') || {}).value?.trim() || '';
  const titleKo = ($('#hero-title-ko') || {}).value?.trim() || '';
  const titleEn = ($('#hero-title-en') || {}).value?.trim() || '';
  const subKo   = ($('#hero-subtitle-ko') || {}).value?.trim() || '';
  const btnKo   = ($('#hero-btn-ko') || {}).value?.trim() || '';
  const btnHref = ($('#hero-btn-href') || {}).value?.trim() || '#products';

  const hero = {
    id: 'h1',
    bgVideo:     ytUrl,
    bgImage:     DATA.heroes?.[0]?.bgImage || '',
    bgColor:     DATA.heroes?.[0]?.bgColor || '#1A2755',
    accentColor: DATA.heroes?.[0]?.accentColor || '#A8B9FF',
    label:    { ko: 'AESTYVE', en: 'AESTYVE', 'zh-CN': 'AESTYVE', th: 'AESTYVE' },
    title:    { ko: titleKo, en: titleEn, 'zh-CN': titleKo, th: titleKo },
    subtitle: { ko: subKo,  en: subKo,  'zh-CN': subKo,  th: subKo  },
    btnText:  { ko: btnKo,  en: btnKo || 'Shop Now', 'zh-CN': btnKo || '立即购买', th: btnKo || 'ช้อปเลย' },
    btnHref,
  };

  DATA.heroes = [hero];
  saveToStorage();
  renderDashboard();
  toast('✅ 메인 영상 설정이 저장되었습니다! 홈페이지를 새로고침하면 반영됩니다.');
};

/* ─── Products 관리자 리스트 렌더 ─── */
function renderProductAdminList() {
  const list = $('#product-admin-list');
  if (!list) return;
  const prods = DATA.products || [];

  if (!prods.length) {
    list.innerHTML = `<div style="padding:32px;text-align:center;color:var(--gray-600);font-size:.85rem;">
      등록된 제품이 없습니다. <strong>제품 추가</strong> 버튼으로 추가하세요.</div>`;
    return;
  }

  list.innerHTML = prods.map((p, i) => {
    const name = getLangStr(p.name, 'ko') || `제품 ${i + 1}`;
    const desc = getLangStr(p.desc, 'ko') || '';
    const thumbHtml = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(name)}" />`
      : `<div class="no-img">📦</div>`;

    return `
    <div class="prod-admin-card">
      <div class="prod-admin-thumb">${thumbHtml}</div>
      <div class="prod-admin-info">
        <div class="prod-admin-name">${esc(name)}</div>
        <div class="prod-admin-desc">${esc(desc)}</div>
      </div>
      <div class="prod-admin-actions">
        <button class="btn btn-outline btn-sm" onclick="openProductModal(${i})"><i class="fas fa-edit"></i> 편집</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${i})"><i class="fas fa-trash"></i></button>
        ${i > 0              ? `<button class="btn btn-outline btn-sm" title="위로" onclick="moveProduct(${i},-1)">▲</button>` : ''}
        ${i < prods.length-1 ? `<button class="btn btn-outline btn-sm" title="아래로" onclick="moveProduct(${i},1)">▼</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function getLangStr(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj['ko'] || obj['en'] || '';
}

/* ─── Product Modal (편집/추가) ─── */
window.openProductModal = function(idx) {
  modalProductIdx = idx;
  const p = idx >= 0 ? (DATA.products || [])[idx] : null;
  buildProductModal(p);
  $('#modal-title').textContent = idx >= 0 ? '제품 편집' : '새 제품 추가';
  $('#modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.addProduct = function() {
  openProductModal(-1);
};

function buildProductModal(p) {
  const body = $('#modal-body');
  if (!body) return;

  const currentImg = p?.image || '';
  const imgPreviewHtml = currentImg
    ? `<img src="${esc(currentImg)}" style="width:100%;max-height:180px;object-fit:cover;border-radius:6px;display:block;" />`
    : `<div class="upload-placeholder"><span class="icon">🖼️</span><p>이미지를 업로드하거나 URL을 입력하세요</p></div>`;

  const nameKo   = getLangStr(p?.name, 'ko');
  const nameEn   = getLangStr(p?.name, 'en');
  const nameZhCN = (p?.name || {})['zh-CN'] || '';
  const nameTh   = (p?.name || {})['th'] || '';

  // 상세 내용 (모달에 표시되는 본문)
  const detailKo   = getLangStr(p?.detail, 'ko');
  const detailEn   = getLangStr(p?.detail, 'en');
  const detailZhCN = (p?.detail || {})['zh-CN'] || '';
  const detailTh   = (p?.detail || {})['th'] || '';

  body.innerHTML = `
    <!-- 이미지 -->
    <div class="form-group" style="margin-bottom:20px;">
      <label class="form-label">제품 이미지 (썸네일)</label>
      <div class="media-tabs">
        <button type="button" class="media-tab active" id="modal-tab-file" onclick="switchModalTab('file')">📁 파일 업로드</button>
        <button type="button" class="media-tab" id="modal-tab-url" onclick="switchModalTab('url')">🔗 URL 입력</button>
      </div>
      <div id="modal-pane-file">
        <div class="upload-area" id="modal-img-upload-area" onclick="document.getElementById('modal-img-file').click()">
          <div class="upload-preview" id="modal-img-preview">${imgPreviewHtml}</div>
          <div class="upload-footer">JPG · PNG · WebP — 클릭하여 선택</div>
        </div>
        <input type="file" id="modal-img-file" accept="image/*" style="display:none" onchange="handleModalImage(this)" />
      </div>
      <div id="modal-pane-url" style="display:none;">
        <div class="url-row">
          <input type="url" class="form-control" id="modal-img-url" placeholder="https://example.com/product.jpg" value="${esc(currentImg.startsWith('http') ? currentImg : '')}" />
          <button type="button" class="btn btn-accent btn-sm" onclick="applyModalImgUrl()">적용</button>
        </div>
        <div style="margin-top:8px;border-radius:var(--radius);overflow:hidden;background:var(--gray-100);">
          <div id="modal-img-url-preview" style="min-height:80px;display:flex;align-items:center;justify-content:center;">
            ${currentImg.startsWith('http') ? `<img src="${esc(currentImg)}" style="width:100%;max-height:160px;object-fit:cover;display:block;" />` : `<span style="color:var(--gray-400);font-size:.8rem;">미리보기</span>`}
          </div>
        </div>
      </div>
      <input type="hidden" id="modal-img-value" value="${esc(currentImg)}" />
    </div>

    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0 20px;" />

    <!-- 제품 이름 -->
    <div style="margin-bottom:16px;">
      <div style="font-size:.78rem;font-weight:700;color:var(--gray-600);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">제품 이름</div>
      <div class="form-row" style="margin-bottom:8px;">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇰🇷 한국어</label>
          <input type="text" class="form-control" id="m-name-ko" value="${esc(nameKo)}" placeholder="제품명" />
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇺🇸 English</label>
          <input type="text" class="form-control" id="m-name-en" value="${esc(nameEn)}" placeholder="Product Name" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇨🇳 中文</label>
          <input type="text" class="form-control" id="m-name-zhcn" value="${esc(nameZhCN)}" placeholder="产品名称" />
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇹🇭 ภาษาไทย</label>
          <input type="text" class="form-control" id="m-name-th" value="${esc(nameTh)}" placeholder="ชื่อผลิตภัณฑ์" />
        </div>
      </div>
    </div>

    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0 20px;" />

    <!-- 상세 내용 (클릭 시 모달에 표시) -->
    <div>
      <div style="font-size:.78rem;font-weight:700;color:var(--gray-600);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">상세 내용 <span style="font-weight:400;text-transform:none;letter-spacing:0;">(제품 클릭 시 표시되는 설명)</span></div>
      <div class="form-row" style="margin-bottom:8px;">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇰🇷 한국어</label>
          <textarea class="form-control" id="m-detail-ko" rows="4" placeholder="제품 상세 설명을 입력하세요">${esc(detailKo)}</textarea>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇺🇸 English</label>
          <textarea class="form-control" id="m-detail-en" rows="4" placeholder="Enter product detail">${esc(detailEn)}</textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇨🇳 中文</label>
          <textarea class="form-control" id="m-detail-zhcn" rows="4" placeholder="产品详细说明">${esc(detailZhCN)}</textarea>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">🇹🇭 ภาษาไทย</label>
          <textarea class="form-control" id="m-detail-th" rows="4" placeholder="รายละเอียดสินค้า">${esc(detailTh)}</textarea>
        </div>
      </div>
    </div>
  `;
}

/* 탭 전환 */
window.switchModalTab = function(tab) {
  const fileTab  = $('#modal-tab-file');
  const urlTab   = $('#modal-tab-url');
  const filePane = $('#modal-pane-file');
  const urlPane  = $('#modal-pane-url');
  if (!fileTab) return;
  if (tab === 'file') {
    fileTab.classList.add('active'); urlTab.classList.remove('active');
    filePane.style.display = ''; urlPane.style.display = 'none';
  } else {
    urlTab.classList.add('active'); fileTab.classList.remove('active');
    urlPane.style.display = ''; filePane.style.display = 'none';
  }
};

/* 파일 업로드 → Base64 */
window.handleModalImage = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { toast('10MB 이하 이미지만 지원합니다.', 'error'); input.value = ''; return; }
  const reader = new FileReader();
  reader.onload = e => {
    const b64 = e.target.result;
    const preview = $('#modal-img-preview');
    if (preview) preview.innerHTML = `<img src="${b64}" style="width:100%;max-height:180px;object-fit:cover;display:block;" />`;
    const hidden = $('#modal-img-value');
    if (hidden) hidden.value = b64;
    const area = $('#modal-img-upload-area');
    if (area) area.classList.add('has-media');
    toast('✅ 이미지 업로드 완료! 저장 버튼을 눌러 반영하세요.');
  };
  reader.readAsDataURL(file);
};

/* URL 적용 */
window.applyModalImgUrl = function() {
  const urlInput = $('#modal-img-url');
  if (!urlInput) return;
  const url = urlInput.value.trim();
  if (!url || (!url.startsWith('http') && !url.startsWith('/'))) {
    toast('올바른 URL을 입력해주세요.', 'error'); return;
  }
  const urlPreview = $('#modal-img-url-preview');
  if (urlPreview) urlPreview.innerHTML = `<img src="${esc(url)}" style="width:100%;max-height:160px;object-fit:cover;display:block;" onerror="this.parentElement.innerHTML='<span style=color:var(--danger);padding:12px;font-size:.8rem;>이미지를 불러올 수 없습니다.</span>'" />`;
  const hidden = $('#modal-img-value');
  if (hidden) hidden.value = url;
  toast('✅ URL 적용! 저장 버튼을 눌러 반영하세요.');
};

/* Modal 저장 */
window.saveProductModal = function() {
  const imgVal  = ($('#modal-img-value') || {}).value || '';
  // URL 탭에 직접 입력한 값이 있으면 우선 사용
  const urlInput = ($('#modal-img-url') || {}).value?.trim() || '';
  const finalImg = urlInput && urlInput.startsWith('http') ? urlInput : imgVal;

  const obj = {
    id: modalProductIdx >= 0 ? (DATA.products[modalProductIdx]?.id || uid()) : uid(),
    image: finalImg,
    category: modalProductIdx >= 0 ? (DATA.products[modalProductIdx]?.category || 'all') : 'all',
    name: {
      ko:      ($('#m-name-ko') || {}).value?.trim() || '',
      en:      ($('#m-name-en') || {}).value?.trim() || '',
      'zh-CN': ($('#m-name-zhcn') || {}).value?.trim() || '',
      th:      ($('#m-name-th') || {}).value?.trim() || '',
    },
    detail: {
      ko:      ($('#m-detail-ko') || {}).value?.trim() || '',
      en:      ($('#m-detail-en') || {}).value?.trim() || '',
      'zh-CN': ($('#m-detail-zhcn') || {}).value?.trim() || '',
      th:      ($('#m-detail-th') || {}).value?.trim() || '',
    },
  };

  if (!DATA.products) DATA.products = [];

  if (modalProductIdx >= 0) {
    DATA.products[modalProductIdx] = obj;
  } else {
    DATA.products.push(obj);
  }

  saveToStorage();
  closeModal();
  renderProductAdminList();
  renderDashboard();
  toast('✅ 제품이 저장되었습니다! 홈페이지에 즉시 반영됩니다.');
};

window.closeModal = function() {
  $('#modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  modalProductIdx = -1;
};

/* 삭제 */
window.deleteProduct = function(idx) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  DATA.products.splice(idx, 1);
  saveToStorage();
  renderProductAdminList();
  renderDashboard();
  toast('🗑️ 삭제 완료');
};

/* 순서 이동 */
window.moveProduct = function(idx, dir) {
  const arr = DATA.products;
  const ni = idx + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
  saveToStorage();
  renderProductAdminList();
};

/* ─── Settings 폼 ─── */
function renderSettingsForm() {
  const s = DATA.settings || {};
  const set = (id, val) => { const el = $(id); if (el) el.value = val || ''; };
  set('#set-brandName',  s.brandName);
  set('#set-phone',      s.contact?.phone);
  set('#set-email',      s.contact?.email);
  set('#set-address',    s.contact?.address);
  set('#set-instagram',  s.social?.instagram);
}

window.saveSettings = function() {
  if (!DATA.settings) DATA.settings = {};
  const s = DATA.settings;
  s.brandName = $('#set-brandName')?.value || s.brandName;
  s.contact = {
    phone:   $('#set-phone')?.value   || '',
    email:   $('#set-email')?.value   || '',
    address: $('#set-address')?.value || '',
  };
  s.social = s.social || {};
  s.social.instagram = $('#set-instagram')?.value || '';
  saveToStorage();
  toast('✅ 설정이 저장되었습니다.');
};

/* ─── Import / Export ─── */
window.showJsonPreview = function() {
  const ta = $('#json-preview');
  if (ta) ta.value = JSON.stringify(DATA, null, 2);
};

window.exportJson = function() {
  const json = JSON.stringify(DATA, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'content.json'; a.click();
  URL.revokeObjectURL(url);
  toast('✅ content.json 다운로드 완료! GitHub data/content.json을 교체하세요.');
};

window.importFromFile = function() {
  const file = $('#import-file')?.files?.[0];
  if (!file) { toast('파일을 선택해주세요.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    try { DATA = JSON.parse(e.target.result); saveToStorage(); renderAll(); toast('✅ Import 완료!'); }
    catch (err) { toast('JSON 파싱 오류: ' + err.message, 'error'); }
  };
  reader.readAsText(file);
};

window.importFromText = function() {
  const text = $('#import-text')?.value?.trim() || '';
  if (!text) { toast('JSON을 입력해주세요.', 'error'); return; }
  try { DATA = JSON.parse(text); saveToStorage(); renderAll(); toast('✅ Import 완료!'); }
  catch (err) { toast('JSON 파싱 오류: ' + err.message, 'error'); }
};

window.resetToDefault = function() {
  if (!confirm('모든 데이터를 초기화하시겠습니까?\n(되돌릴 수 없습니다.)')) return;
  localStorage.removeItem(STORAGE_KEY);
  DATA = getDefaultData();
  saveToStorage(); renderAll();
  toast('✅ 초기화 완료');
};

/* ─── 전체 저장 버튼 ─── */
function initSaveAllBtn() {
  const btn = $('#save-all-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    saveToStorage();
    toast('✅ 전체 저장 완료! 홈페이지를 새로고침하면 반영됩니다.');
  });
}

/* ─── Sidebar 내비게이션 ─── */
const SECTION_ICONS = {
  dashboard: 'fas fa-home',
  hero:      'fas fa-film',
  products:  'fas fa-images',
  settings:  'fas fa-cog',
  data:      'fas fa-database',
};
const SECTION_TITLES = {
  dashboard: '대시보드',
  hero:      '메인 영상',
  products:  '제품 이미지',
  settings:  '사이트 설정',
  data:      'Import / Export',
};

function initSidebar() {
  $$('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (!section) return;
      $$('.sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.section-view').forEach(el => el.classList.remove('active'));
      const target = $(`#section-${section}`);
      if (target) target.classList.add('active');
      const titleEl = $('#topbar-title');
      if (titleEl) {
        const icon = SECTION_ICONS[section] || 'fas fa-circle';
        titleEl.innerHTML = `<i class="${icon}" style="color:var(--accent)"></i> ${SECTION_TITLES[section] || section}`;
      }
    });
  });
}

/* ─── Modal 닫기 ─── */
function initModal() {
  const overlay = $('#modal-overlay');
  if (!overlay) return;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ─── Init ─── */
function init() {
  initSidebar();
  initModal();
  initSaveAllBtn();
  loadData();
}

document.addEventListener('DOMContentLoaded', init);

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
  /* 구 localStorage _dimgs → IndexedDB 마이그레이션 (최초 1회) */
  await ImageStore.migrateFromLocalStorage();

  /* 1) IndexedDB에서 detailImages 맵 로드 */
  const imgMap = await ImageStore.getAll();

  /* 2) content.json fetch */
  let fresh = null;
  try {
    const res = await fetch('data/content.json?v=' + Date.now());
    if (res.ok) fresh = await res.json();
  } catch (e) {}

  /* 3) localStorage slim 데이터 (이름·카테고리 등) 로드 */
  if (fresh) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const cached = JSON.parse(stored);
        if (cached && typeof cached === 'object') {
          DATA = {
            ...fresh,
            heroes:   cached.heroes   || fresh.heroes,
            settings: cached.settings || fresh.settings,
            nav:      cached.nav      || fresh.nav,
            products: (fresh.products || []).map(fp => {
              const cp = (cached.products || []).find(p => p.id === fp.id);
              if (!cp) return { ...fp, detailImages: imgMap[fp.id] || [] };
              return {
                ...fp,
                name:         cp.name         || fp.name,
                detail:       cp.detail       || fp.detail,
                category:     cp.category     || fp.category,
                detailImages: imgMap[fp.id]   || [],
              };
            }),
            categories: fresh.categories || cached.categories,
          };
          _saveSlimOnly();
          renderAll();
          return;
        }
      }
    } catch (e) { console.warn('[Admin] localStorage 파싱 오류'); }
    /* localStorage 없으면 fresh 그대로 */
    DATA = {
      ...fresh,
      products: (fresh.products || []).map(p => ({
        ...p, detailImages: imgMap[p.id] || [],
      })),
    };
    _saveSlimOnly();
    renderAll();
    return;
  }

  /* 4) fetch 실패 → localStorage 폴백 */
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      DATA = JSON.parse(stored);
      /* detailImages를 IndexedDB에서 복원 */
      (DATA.products || []).forEach(p => {
        if (p.id) p.detailImages = imgMap[p.id] || [];
      });
      renderAll();
      return;
    }
  } catch (e) {}

  /* 5) 완전 실패 → 기본값 */
  DATA = getDefaultData();
  _saveSlimOnly();
  renderAll();
  toast('content.json을 찾을 수 없어 기본값으로 시작합니다.', 'error', 5000);
}

/* slim 저장: detailImages 제외한 텍스트 데이터만 localStorage에 저장 */
function _saveSlimOnly() {
  try {
    const slim = {
      ...DATA,
      products: (DATA.products || []).map(p => {
        const { detailImages, ...rest } = p;
        return rest;
      }),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch(e) {
    toast('텍스트 데이터 저장 실패', 'error', 5000);
    console.error('[Admin] localStorage 저장 실패', e);
  }
}

/* 텍스트 데이터(slim) + 이미지(IndexedDB) 함께 저장 + GitHub 자동 배포 */
function saveToStorage({ deploy = true } = {}) {
  /* 1) detailImages → IndexedDB (용량 제한 없음) */
  const savePromises = (DATA.products || []).map(p => {
    if (!p.id) return Promise.resolve();
    return ImageStore.set(p.id, p.detailImages || []);
  });
  Promise.all(savePromises).catch(e =>
    console.warn('[Admin] IndexedDB 저장 오류', e)
  );
  /* 2) 텍스트 데이터 → localStorage */
  _saveSlimOnly();
  /* 3) GitHub 자동 배포 (설정이 있을 때만) */
  if (deploy) {
    const cfg = loadGhConfig();
    if (cfg.owner && cfg.repo && cfg.token) {
      pushToGitHub({ silent: false });
    }
  }
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
  renderCategoryList();
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
    const catObj = (DATA.categories || []).find(c => c.id === p.category);
    const catLabel = catObj ? (getLangStr(catObj.label, 'ko') || p.category) : (p.category || '-');
    const thumbHtml = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(name)}" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=no-img>📦</div>'" />`
      : `<div class="no-img">📦</div>`;

    return `
    <div class="prod-admin-card">
      <div class="prod-admin-thumb">${thumbHtml}</div>
      <div class="prod-admin-info">
        <div class="prod-admin-name">${esc(name)}</div>
        <div class="prod-admin-desc" style="display:flex;gap:6px;align-items:center;">
          <span style="font-size:.7rem;font-weight:600;background:#eef2ff;color:var(--accent);padding:2px 7px;border-radius:10px;">${esc(catLabel)}</span>
          <span style="color:var(--gray-400);font-size:.75rem;">${esc(p.id)}</span>
        </div>
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
  /* 드롭존 이벤트 바인딩 (innerHTML 교체 후 재등록 필요) */
  requestAnimationFrame(_initDetailImgDropzone);
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

  /* ── 상세 필드 값 추출 ── */
  const purposeKo   = getLangStr(p?.purpose, 'ko')   || getLangStr(p?.detail, 'ko');
  const purposeEn   = getLangStr(p?.purpose, 'en')   || getLangStr(p?.detail, 'en');
  const purposeZhCN = (p?.purpose || p?.detail || {})['zh-CN'] || '';
  const purposeTh   = (p?.purpose || p?.detail || {})['th']    || '';
  const storageKo   = getLangStr(p?.storage, 'ko');
  const storageEn   = getLangStr(p?.storage, 'en');
  const storageZhCN = (p?.storage || {})['zh-CN'] || '';
  const storageTh   = (p?.storage || {})['th']    || '';
  const badgesStr   = (p?.badges || []).join(', ');
  const composition = p?.composition || '';
  const rawMaterial = p?.rawMaterial  || '';

  const HR = `<hr style="border:none;border-top:1px solid var(--border);margin:4px 0 20px;" />`;
  const SECTION = (title, sub='') => `
    <div style="font-size:.78rem;font-weight:700;color:var(--gray-600);text-transform:uppercase;letter-spacing:.06em;margin-bottom:${sub?'4px':'10px'};">${title}</div>
    ${sub ? `<div style="font-size:.72rem;color:var(--gray-400);margin-bottom:10px;">${sub}</div>` : ''}`;

  body.innerHTML = `
    <!-- ① 썸네일 이미지 -->
    ${SECTION('제품 이미지 (썸네일)')}
    <div class="form-group" style="margin-bottom:20px;">
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
    ${HR}

    <!-- ② 카테고리 -->
    ${SECTION('카테고리')}
    <div class="form-group" style="margin-bottom:20px;">
      <div class="cat-select-wrap">
        <select id="m-category">
          ${(DATA.categories || []).map(c => {
            const label = getLangStr(c.label, 'ko') || c.id;
            const sel = (p?.category || 'all') === c.id ? 'selected' : '';
            return `<option value="${esc(c.id)}" ${sel}>${esc(label)}</option>`;
          }).join('')}
        </select>
      </div>
    </div>
    ${HR}

    <!-- ③ 제품 이름 -->
    ${SECTION('제품 이름')}
    <div style="margin-bottom:20px;">
      <div class="form-row" style="margin-bottom:8px;">
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇰🇷 한국어</label>
          <input type="text" class="form-control" id="m-name-ko" value="${esc(nameKo)}" placeholder="제품명" /></div>
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇺🇸 English</label>
          <input type="text" class="form-control" id="m-name-en" value="${esc(nameEn)}" placeholder="Product Name" /></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇨🇳 中文</label>
          <input type="text" class="form-control" id="m-name-zhcn" value="${esc(nameZhCN)}" placeholder="产品名称" /></div>
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇹🇭 ภาษาไทย</label>
          <input type="text" class="form-control" id="m-name-th" value="${esc(nameTh)}" placeholder="ชื่อผลิตภัณฑ์" /></div>
      </div>
    </div>
    ${HR}

    <!-- ④ 배지 (예: 의료기기, Single Use) -->
    ${SECTION('배지 태그', '쉼표(,)로 구분 — 예: 의료기기, Medical Device, Single Use')}
    <div class="form-group" style="margin-bottom:20px;">
      <input type="text" class="form-control" id="m-badges" value="${esc(badgesStr)}" placeholder="의료기기, Medical Device, Single Use" />
    </div>
    ${HR}

    <!-- ⑤ 스펙 (용량, 원료) -->
    ${SECTION('제품 스펙')}
    <div class="form-row" style="margin-bottom:20px;">
      <div class="form-group" style="margin-bottom:0;"><label class="form-label">용량 / 구성 (Composition)</label>
        <input type="text" class="form-control" id="m-composition" value="${esc(composition)}" placeholder="2mL / Vial" /></div>
      <div class="form-group" style="margin-bottom:0;"><label class="form-label">원료 (Raw Material)</label>
        <input type="text" class="form-control" id="m-rawmaterial" value="${esc(rawMaterial)}" placeholder="Liquid PCL with HA" /></div>
    </div>
    ${HR}

    <!-- ⑥ 제품 설명 (purpose) -->
    ${SECTION('제품 설명', '상세페이지 메인 설명')}
    <div style="margin-bottom:20px;">
      <div class="form-row" style="margin-bottom:8px;">
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇰🇷 한국어</label>
          <textarea class="form-control" id="m-purpose-ko" rows="3" placeholder="제품 목적/설명">${esc(purposeKo)}</textarea></div>
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇺🇸 English</label>
          <textarea class="form-control" id="m-purpose-en" rows="3" placeholder="Product purpose/description">${esc(purposeEn)}</textarea></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇨🇳 中文</label>
          <textarea class="form-control" id="m-purpose-zhcn" rows="3" placeholder="产品目的/说明">${esc(purposeZhCN)}</textarea></div>
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇹🇭 ภาษาไทย</label>
          <textarea class="form-control" id="m-purpose-th" rows="3" placeholder="วัตถุประสงค์ของผลิตภัณฑ์">${esc(purposeTh)}</textarea></div>
      </div>
    </div>
    ${HR}

    <!-- ⑦ 보관 방법 -->
    ${SECTION('보관 방법')}
    <div style="margin-bottom:20px;">
      <div class="form-row" style="margin-bottom:8px;">
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇰🇷 한국어</label>
          <input type="text" class="form-control" id="m-storage-ko" value="${esc(storageKo)}" placeholder="직사광선을 피해 서늘하고 건조한 곳에 보관" /></div>
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇺🇸 English</label>
          <input type="text" class="form-control" id="m-storage-en" value="${esc(storageEn)}" placeholder="Store in a cool, dry place" /></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇨🇳 中文</label>
          <input type="text" class="form-control" id="m-storage-zhcn" value="${esc(storageZhCN)}" placeholder="存放在阴凉干燥处" /></div>
        <div class="form-group" style="margin-bottom:0;"><label class="form-label">🇹🇭 ภาษาไทย</label>
          <input type="text" class="form-control" id="m-storage-th" value="${esc(storageTh)}" placeholder="เก็บในที่เย็นและแห้ง" /></div>
      </div>
    </div>
    ${HR}

    <!-- ⑧ 카탈로그 이미지 -->
    ${SECTION('카탈로그 이미지', '상세페이지 하단에 표시 · 최대 10장 · JPG, PNG, WebP')}
    <div>
      <div id="detail-img-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
        ${(p?.detailImages || []).map((src, idx) => `
        <div class="detail-img-row" data-idx="${idx}" style="display:flex;align-items:center;gap:10px;background:var(--gray-100);border-radius:var(--radius);padding:8px 10px;">
          <img src="${esc(src)}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0;" onerror="this.style.background='#ddd'" />
          <span style="flex:1;font-size:.73rem;color:var(--gray-500);">카탈로그 이미지 ${idx + 1}</span>
          <button type="button" onclick="removeDetailImg(${idx})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1.1rem;padding:4px 6px;" title="삭제">✕</button>
        </div>`).join('')}
      </div>
      <label id="detail-img-dropzone" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px 20px;border:2px dashed var(--border);border-radius:var(--radius);cursor:pointer;transition:border-color .2s,background .2s;"
        onmouseover="this.style.borderColor='var(--accent)';this.style.background='#f0f4ff'"
        onmouseout="this.style.borderColor='var(--border)';this.style.background=''">
        <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:var(--accent);"></i>
        <div style="text-align:center;">
          <div style="font-size:.85rem;font-weight:600;color:var(--gray-700);">클릭하거나 이미지를 여기에 끌어다 놓으세요</div>
          <div style="font-size:.72rem;color:var(--gray-400);margin-top:4px;">JPG · PNG · WebP · 원본 화질 그대로 저장 · 최대 10장</div>
        </div>
        <input type="file" id="detail-img-file-input" accept="image/*" multiple style="display:none" onchange="addDetailImgFiles(this)" />
      </label>
      <input type="hidden" id="m-detail-images" value="${esc(JSON.stringify(p?.detailImages || []))}" />
    </div>
  `;
}

/* ─── Detail Images 헬퍼 ─── */
function _getDetailImgs() {
  try { return JSON.parse($('#m-detail-images')?.value || '[]'); } catch(e) { return []; }
}
function _setDetailImgs(arr) {
  const hidden = $('#m-detail-images');
  if (hidden) hidden.value = JSON.stringify(arr);
  _renderDetailImgList(arr);
}
function _renderDetailImgList(arr) {
  const list = $('#detail-img-list');
  if (!list) return;
  if (!arr.length) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = arr.map((src, idx) => `
    <div class="detail-img-row" data-idx="${idx}" style="display:flex;align-items:center;gap:10px;background:var(--gray-100);border-radius:var(--radius);padding:8px 10px;">
      <img src="${esc(src)}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0;" onerror="this.style.background='#ddd'" />
      <span style="flex:1;font-size:.73rem;color:var(--gray-500);">이미지 ${idx + 1}</span>
      <button type="button" onclick="removeDetailImg(${idx})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1.1rem;padding:4px 6px;" title="삭제">✕</button>
    </div>`).join('');
}
window.removeDetailImg = function(idx) {
  const arr = _getDetailImgs();
  arr.splice(idx, 1);
  _setDetailImgs(arr);
};
window.addDetailImgFiles = function(input) {
  _processDetailImgFiles([...(input.files || [])]);
  input.value = '';
};
function _processDetailImgFiles(files) {
  if (!files.length) return;
  const existing = _getDetailImgs();
  const slots = 10 - existing.length;
  if (slots <= 0) { toast('이미지는 최대 10장까지 추가할 수 있습니다.', 'error'); return; }
  const toLoad = files.slice(0, slots);
  if (files.length > slots) toast(`${files.length - slots}장은 한도 초과로 건너뜁니다.`, 'error');

  /* Promise 기반으로 변환 — 모든 파일 로드 완료 후 한 번에 반영 */
  const promises = toLoad.map(file => new Promise(resolve => {
    if (!file.type.startsWith('image/')) { resolve(null); return; }
    /* 원본 화질 그대로 저장 — 크기 제한 없음 (IndexedDB는 수특 MB 가능) */
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => { toast(`${file.name} 읽기 실패`, 'error'); resolve(null); };
    reader.readAsDataURL(file);
  }));

  Promise.all(promises).then(results => {
    const newImgs = results.filter(Boolean);
    if (!newImgs.length) return;
    /* 최신 상태를 다시 읽어 병합 (다른 Promise가 앞서 추가했을 경우 대비) */
    const merged = [..._getDetailImgs(), ...newImgs].slice(0, 10);
    _setDetailImgs(merged);
  });
}
/* 드롭존 초기화 (모달 열릴 때마다 호출) */
function _initDetailImgDropzone() {
  const zone = $('#detail-img-dropzone');
  if (!zone) return;
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.style.borderColor = 'var(--accent)';
    zone.style.background = '#f0f4ff';
  });
  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = 'var(--border)';
    zone.style.background = '';
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = 'var(--border)';
    zone.style.background = '';
    const files = [...(e.dataTransfer.files || [])].filter(f => f.type.startsWith('image/'));
    _processDetailImgFiles(files);
  });
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
  /* 활성 탭 기준으로 이미지 값 결정 */
  const urlTabActive = $('#modal-tab-url')?.classList.contains('active');
  let finalImg = '';
  if (urlTabActive) {
    /* URL 탭: 입력 필드 값 사용 */
    const urlInput = ($('#modal-img-url') || {}).value?.trim() || '';
    if (urlInput && (urlInput.startsWith('http') || urlInput.startsWith('/'))) {
      finalImg = urlInput;
    } else {
      /* URL이 비어있으면 hidden value(기존 값) 유지 */
      finalImg = ($('#modal-img-value') || {}).value || '';
    }
  } else {
    /* 파일 탭: hidden value 사용 (base64 또는 기존 경로) */
    finalImg = ($('#modal-img-value') || {}).value || '';
  }

  const gv = id => ($(`#${id}`) || {}).value?.trim() || '';
  const badgesRaw = gv('m-badges');
  const badges = badgesRaw ? badgesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const obj = {
    id: modalProductIdx >= 0 ? (DATA.products[modalProductIdx]?.id || uid()) : uid(),
    image: finalImg,
    category:    gv('m-category') || 'all',
    badges,
    composition: gv('m-composition'),
    rawMaterial: gv('m-rawmaterial'),
    name: {
      ko: gv('m-name-ko'), en: gv('m-name-en'),
      'zh-CN': gv('m-name-zhcn'), th: gv('m-name-th'),
    },
    purpose: {
      ko: gv('m-purpose-ko'), en: gv('m-purpose-en'),
      'zh-CN': gv('m-purpose-zhcn'), th: gv('m-purpose-th'),
    },
    /* detail = purpose 와 동기화 (기존 호환) */
    detail: {
      ko: gv('m-purpose-ko'), en: gv('m-purpose-en'),
      'zh-CN': gv('m-purpose-zhcn'), th: gv('m-purpose-th'),
    },
    storage: {
      ko: gv('m-storage-ko'), en: gv('m-storage-en'),
      'zh-CN': gv('m-storage-zhcn'), th: gv('m-storage-th'),
    },
    detailImages: (() => { try { return JSON.parse($('#m-detail-images')?.value || '[]'); } catch(e) { return []; } })(),
  };

  if (!DATA.products) DATA.products = [];

  if (modalProductIdx >= 0) {
    DATA.products[modalProductIdx] = obj;
  } else {
    DATA.products.push(obj);
  }

  /* detailImages → IndexedDB 직접 저장 (localStorage 용량 한도 우회) */
  ImageStore.set(obj.id, obj.detailImages)
    .catch(e => console.warn('[Admin] IndexedDB 저장 실패', e));

  /* 텍스트 데이터 → localStorage */
  _saveSlimOnly();

  /* GitHub 자동 배포 (설정이 있을 때만) */
  const _ghCfg = loadGhConfig();
  if (_ghCfg.owner && _ghCfg.repo && _ghCfg.token) {
    pushToGitHub({ silent: false });
    toast('✅ 제품이 저장되었습니다! GitHub에 배포 중… 잠시 후 모든 기기에 반영됩니다.');
  } else {
    toast('✅ 제품이 저장되었습니다! 모든 기기에 반영하려면 설정 탭에서 GitHub를 연결하세요.');
  }

  closeModal();
  renderProductAdminList();
  renderDashboard();
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
  /* WeChat QR 이미지 복원 */
  _renderWechatQrPreview();
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

/* ─── WeChat QR 코드 관리 ─── */
const WECHAT_QR_KEY = 'aestyve_wechat_qr';

/** 현재 저장된 QR 이미지를 Admin UI에 렌더 */
function _renderWechatQrPreview() {
  const stored = DATA.settings?.wechatQr || localStorage.getItem(WECHAT_QR_KEY) || '';
  const preview  = $('#wechat-qr-preview');
  const ph       = $('#wechat-qr-ph');
  const area     = $('#wechat-qr-upload-area');
  const delBtn   = $('#wechat-qr-delete-btn');
  const statusEl = $('#wechat-qr-status');

  if (!preview) return;

  if (stored) {
    /* QR 이미지 존재 → 미리보기 표시 */
    preview.innerHTML = `<img src="${stored}" alt="WeChat QR" style="width:100%;height:160px;object-fit:contain;display:block;padding:8px;" />`;
    if (area) area.classList.add('has-media');
    if (delBtn) delBtn.style.display = '';
    if (statusEl) { statusEl.textContent = '✅ QR 이미지 저장됨'; statusEl.style.color = 'var(--success)'; }
  } else {
    /* QR 없음 → placeholder */
    preview.innerHTML = `
      <div class="upload-placeholder" id="wechat-qr-ph">
        <span class="icon" style="font-size:2.4rem;">📱</span>
        <p style="font-size:.74rem;text-align:center;">QR 이미지<br>클릭하여 업로드</p>
      </div>`;
    if (area) area.classList.remove('has-media');
    if (delBtn) delBtn.style.display = 'none';
    if (statusEl) { statusEl.textContent = ''; }
  }
}

/** 파일 선택 → Base64 변환 → 미리보기 */
window.handleWechatQr = function(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('이미지 파일만 업로드 가능합니다.', 'error'); input.value = ''; return; }
  if (file.size > 5 * 1024 * 1024) { toast('5MB 이하 이미지만 지원합니다.', 'error'); input.value = ''; return; }

  const reader = new FileReader();
  reader.onload = e => {
    const b64 = e.target.result;
    /* 임시 미리보기 표시 */
    const preview = $('#wechat-qr-preview');
    if (preview) preview.innerHTML = `<img src="${b64}" alt="WeChat QR" style="width:100%;height:160px;object-fit:contain;display:block;padding:8px;" />`;
    const area = $('#wechat-qr-upload-area');
    if (area) area.classList.add('has-media');
    /* hidden 값에 임시 저장 */
    const statusEl = $('#wechat-qr-status');
    if (statusEl) { statusEl.textContent = '이미지 선택됨 — 저장 버튼을 눌러 반영하세요'; statusEl.style.color = '#d97706'; }
    /* 데이터 속성으로 임시 보관 */
    if (area) area.dataset.pendingQr = b64;
    const delBtn = $('#wechat-qr-delete-btn');
    if (delBtn) delBtn.style.display = '';
    toast('✅ QR 이미지 선택 완료! "QR 저장" 버튼을 눌러주세요.');
  };
  reader.readAsDataURL(file);
  input.value = '';
};

/** QR 저장 — localStorage + DATA.settings.wechatQr + GitHub 배포 */
window.saveWechatQr = function() {
  const area = $('#wechat-qr-upload-area');
  const pendingQr = area?.dataset?.pendingQr || '';

  /* 새 이미지가 선택된 경우 */
  if (pendingQr) {
    localStorage.setItem(WECHAT_QR_KEY, pendingQr);
    if (!DATA.settings) DATA.settings = {};
    DATA.settings.wechatQr = pendingQr;
    if (area) delete area.dataset.pendingQr;
    _renderWechatQrPreview();
    saveToStorage();
    toast('✅ WeChat QR 이미지가 저장되었습니다!');
    return;
  }

  /* 이미 저장된 이미지가 있는 경우 */
  const existing = DATA.settings?.wechatQr || localStorage.getItem(WECHAT_QR_KEY) || '';
  if (existing) {
    toast('✅ QR 이미지가 이미 저장되어 있습니다.');
  } else {
    toast('먼저 QR 이미지를 선택해주세요.', 'error');
  }
};

/** QR 삭제 */
window.deleteWechatQr = function() {
  if (!confirm('WeChat QR 이미지를 삭제하시겠습니까?')) return;
  localStorage.removeItem(WECHAT_QR_KEY);
  if (DATA.settings) DATA.settings.wechatQr = '';
  const area = $('#wechat-qr-upload-area');
  if (area) delete area.dataset.pendingQr;
  _renderWechatQrPreview();
  saveToStorage();
  toast('🗑️ WeChat QR 이미지가 삭제되었습니다.');
};

/* ─── GitHub 설정 키 ─── */
const GH_KEY = 'aestyve_gh_cfg';

function loadGhConfig() {
  try { return JSON.parse(localStorage.getItem(GH_KEY) || '{}'); } catch(e) { return {}; }
}
function saveGhConfig(cfg) {
  localStorage.setItem(GH_KEY, JSON.stringify(cfg));
}

/* GitHub 설정 폼 렌더 */
function renderGhConfigForm() {
  const cfg = loadGhConfig();
  const set = (id, val) => { const el = $(id); if (el) el.value = val || ''; };
  set('#gh-owner',  cfg.owner);
  set('#gh-repo',   cfg.repo);
  set('#gh-branch', cfg.branch || 'main');
  set('#gh-token',  cfg.token);
  _updateGhStatus();
}

function _updateGhStatus() {
  const cfg = loadGhConfig();
  const el = $('#gh-status');
  if (!el) return;
  const ok = cfg.owner && cfg.repo && cfg.token;
  el.textContent = ok
    ? `✅ 연결됨 — github.com/${cfg.owner}/${cfg.repo} (${cfg.branch || 'main'})`
    : '⚠️ GitHub 설정이 필요합니다';
  el.style.color = ok ? 'var(--success)' : '#d97706';
}

window.saveGhConfig = function() {
  const get = id => ($(id) || {}).value?.trim() || '';
  const cfg = {
    owner:  get('#gh-owner'),
    repo:   get('#gh-repo'),
    branch: get('#gh-branch') || 'main',
    token:  get('#gh-token'),
  };
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    toast('Owner, Repo, Token을 모두 입력해주세요.', 'error'); return;
  }
  saveGhConfig(cfg);
  _updateGhStatus();
  toast('✅ GitHub 설정이 저장되었습니다.');
};

window.testGhConnection = async function() {
  const cfg = loadGhConfig();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    toast('먼저 GitHub 설정을 저장해주세요.', 'error'); return;
  }
  const btn = $('#gh-test-btn');
  if (btn) { btn.disabled = true; btn.textContent = '확인 중…'; }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`,
      { headers: { Authorization: `token ${cfg.token}`, Accept: 'application/vnd.github.v3+json' } }
    );
    if (res.ok) {
      toast('✅ 연결 성공! 저장소에 접근할 수 있습니다.');
    } else {
      const err = await res.json().catch(() => ({}));
      toast(`❌ 연결 실패: ${err.message || res.status}`, 'error', 5000);
    }
  } catch(e) {
    toast('❌ 네트워크 오류: ' + e.message, 'error', 5000);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔌 연결 테스트'; }
  }
};

/* ─── GitHub API push ─── */
/**
 * DATA에서 detailImages(Base64)를 제거한 슬림 JSON을
 * GitHub API로 data/content.json에 push한다.
 * → Vercel 자동 배포 트리거 → 모든 기기에 즉시 반영
 */
async function pushToGitHub({ silent = false } = {}) {
  const cfg = loadGhConfig();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    if (!silent) toast('GitHub 설정이 없습니다. 설정 탭에서 입력해주세요.', 'error', 4000);
    return false;
  }

  /* 1) push할 JSON 생성 — detailImages(Base64) 제거 */
  const slim = {
    ...DATA,
    products: (DATA.products || []).map(p => {
      const { detailImages, ...rest } = p;
      return rest;
    }),
  };
  const content = JSON.stringify(slim, null, 2);
  const contentB64 = btoa(unescape(encodeURIComponent(content)));

  const branch = cfg.branch || 'main';
  const apiBase = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`;
  const filePath = 'data/content.json';
  const headers = {
    Authorization: `token ${cfg.token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    /* 2) 현재 파일 SHA 조회 (업데이트에 필요) */
    let sha = null;
    try {
      const getRes = await fetch(`${apiBase}/contents/${filePath}?ref=${branch}`, { headers });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch(e) {}

    /* 3) 파일 push (PUT) */
    const body = {
      message: `chore: admin update content.json [${new Date().toISOString().slice(0,16).replace('T',' ')}]`,
      content: contentB64,
      branch,
      ...(sha ? { sha } : {}),
    };

    const putRes = await fetch(`${apiBase}/contents/${filePath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (putRes.ok) {
      if (!silent) toast('🚀 GitHub에 배포 완료! 1~2분 후 모든 기기에 반영됩니다.');
      _updateGhDeployStatus('success');
      return true;
    } else {
      const err = await putRes.json().catch(() => ({}));
      if (!silent) toast(`❌ GitHub 배포 실패: ${err.message || putRes.status}`, 'error', 6000);
      _updateGhDeployStatus('error', err.message || putRes.status);
      return false;
    }
  } catch(e) {
    if (!silent) toast('❌ 네트워크 오류로 배포 실패: ' + e.message, 'error', 6000);
    _updateGhDeployStatus('error', e.message);
    return false;
  }
}

function _updateGhDeployStatus(state, msg) {
  const el = $('#gh-deploy-status');
  if (!el) return;
  if (state === 'success') {
    el.innerHTML = `✅ 마지막 배포: ${new Date().toLocaleString('ko-KR')} — 모든 기기에 반영 중`;
    el.style.color = 'var(--success)';
  } else if (state === 'error') {
    el.innerHTML = `❌ 배포 실패: ${msg || '알 수 없는 오류'}`;
    el.style.color = 'var(--danger)';
  }
}

/* 수동 배포 버튼 */
window.deployToGitHub = async function() {
  const btn = $('#gh-deploy-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 배포 중…'; }
  try {
    await pushToGitHub({ silent: false });
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-rocket"></i> 지금 배포'; }
  }
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

/* ─── 카테고리 관리 ─── */
function renderCategoryList() {
  const list = $('#category-list');
  if (!list) return;
  const cats = DATA.categories || [];

  if (!cats.length) {
    list.innerHTML = `<div style="padding:24px;text-align:center;color:var(--gray-600);font-size:.84rem;">등록된 카테고리가 없습니다. <strong>카테고리 추가</strong> 버튼으로 추가하세요.</div>`;
    return;
  }

  list.innerHTML = cats.map((c, i) => {
    const labelKo = getLangStr(c.label, 'ko') || c.id;
    const labelEn = getLangStr(c.label, 'en') || c.id;
    const prodCount = (DATA.products || []).filter(p => p.category === c.id).length;
    return `
    <div class="cat-admin-row">
      <div class="cat-admin-id">${esc(c.id)}</div>
      <div class="cat-admin-labels">
        <span class="cat-lbl-ko">${esc(labelKo)}</span>
        <span class="cat-lbl-sep">·</span>
        <span class="cat-lbl-en">${esc(labelEn)}</span>
        <span class="cat-prod-badge">${prodCount}개 제품</span>
      </div>
      <div class="cat-admin-actions">
        <button class="btn btn-outline btn-sm" onclick="openCatModal(${i})"><i class="fas fa-edit"></i> 편집</button>
        ${c.id !== 'all' ? `<button class="btn btn-danger btn-sm" onclick="deleteCat(${i})"><i class="fas fa-trash"></i></button>` : ''}
        ${i > 0              ? `<button class="btn btn-outline btn-sm" title="위로" onclick="moveCat(${i},-1)">▲</button>` : ''}
        ${i < cats.length-1  ? `<button class="btn btn-outline btn-sm" title="아래로" onclick="moveCat(${i},1)">▼</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

window.addCategory = function() { openCatModal(-1); };

window.openCatModal = function(idx) {
  const c = idx >= 0 ? (DATA.categories || [])[idx] : null;
  const body = $('#cat-modal-body');
  if (!body) return;

  const idVal   = c?.id || '';
  const koVal   = getLangStr(c?.label, 'ko');
  const enVal   = getLangStr(c?.label, 'en');
  const zhVal   = (c?.label || {})['zh-CN'] || '';
  const thVal   = (c?.label || {})['th'] || '';

  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">카테고리 ID <span style="color:var(--gray-400);font-weight:400;">(영문 소문자·숫자, 변경 불가)</span></label>
      <input type="text" class="form-control" id="cat-id" value="${esc(idVal)}"
        placeholder="예: filler, booster" ${idx >= 0 ? 'readonly style="background:var(--gray-100);color:var(--gray-600);"' : ''} />
    </div>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0 16px;" />
    <div style="font-size:.78rem;font-weight:700;color:var(--gray-600);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">카테고리 이름 (다국어)</div>
    <div class="form-row" style="margin-bottom:8px;">
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label">🇰🇷 한국어</label>
        <input type="text" class="form-control" id="cat-ko" value="${esc(koVal)}" placeholder="전체" />
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label">🇺🇸 English</label>
        <input type="text" class="form-control" id="cat-en" value="${esc(enVal)}" placeholder="All" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label">🇨🇳 中文</label>
        <input type="text" class="form-control" id="cat-zhcn" value="${esc(zhVal)}" placeholder="全部" />
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label">🇹🇭 ภาษาไทย</label>
        <input type="text" class="form-control" id="cat-th" value="${esc(thVal)}" placeholder="ทั้งหมด" />
      </div>
    </div>`;

  $('#cat-modal-title').textContent = idx >= 0 ? '카테고리 편집' : '카테고리 추가';
  $('#cat-modal-save-btn').onclick = () => saveCatModal(idx);
  $('#cat-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

function saveCatModal(idx) {
  const idVal = ($('#cat-id') || {}).value?.trim().toLowerCase().replace(/\s+/g, '-') || '';
  const ko    = ($('#cat-ko') || {}).value?.trim() || '';
  const en    = ($('#cat-en') || {}).value?.trim() || '';
  const zhcn  = ($('#cat-zhcn') || {}).value?.trim() || '';
  const th    = ($('#cat-th') || {}).value?.trim() || '';

  if (!idVal) { toast('카테고리 ID를 입력해주세요.', 'error'); return; }
  if (!ko && !en) { toast('카테고리 이름을 한 개 이상 입력해주세요.', 'error'); return; }

  if (!DATA.categories) DATA.categories = [];

  /* 신규 추가 시 ID 중복 체크 */
  if (idx < 0) {
    const dup = DATA.categories.find(c => c.id === idVal);
    if (dup) { toast('이미 존재하는 카테고리 ID입니다.', 'error'); return; }
  }

  const obj = {
    id: idx >= 0 ? DATA.categories[idx].id : idVal,
    label: { ko, en, 'zh-CN': zhcn, th },
  };

  if (idx >= 0) {
    DATA.categories[idx] = obj;
  } else {
    DATA.categories.push(obj);
  }

  saveToStorage();
  closeCatModal();
  renderCategoryList();
  toast('✅ 카테고리가 저장되었습니다!');
}

window.deleteCat = function(idx) {
  const cat = (DATA.categories || [])[idx];
  if (!cat) return;
  if (cat.id === 'all') { toast('"전체" 카테고리는 삭제할 수 없습니다.', 'error'); return; }
  const usedBy = (DATA.products || []).filter(p => p.category === cat.id);
  const msg = usedBy.length
    ? `이 카테고리를 사용하는 제품이 ${usedBy.length}개 있습니다.\n삭제하면 해당 제품의 카테고리가 초기화됩니다.\n계속하시겠습니까?`
    : '정말 삭제하시겠습니까?';
  if (!confirm(msg)) return;
  /* 해당 카테고리 제품 → all로 초기화 */
  (DATA.products || []).forEach(p => { if (p.category === cat.id) p.category = 'all'; });
  DATA.categories.splice(idx, 1);
  saveToStorage();
  renderCategoryList();
  renderProductAdminList();
  toast('🗑️ 카테고리 삭제 완료');
};

window.moveCat = function(idx, dir) {
  const arr = DATA.categories;
  const ni = idx + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
  saveToStorage();
  renderCategoryList();
};

window.closeCatModal = function() {
  $('#cat-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
};

/* ─── Modal 닫기 ─── */
function initModal() {
  const overlay = $('#modal-overlay');
  if (!overlay) return;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ─── 전체 저장 버튼 (GitHub 배포 포함) ─── */
function initSaveAllBtn() {
  const btn = $('#save-all-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    saveToStorage({ deploy: false }); // 로컬 먼저 저장
    const cfg = loadGhConfig();
    if (cfg.owner && cfg.repo && cfg.token) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 배포 중…';
      await pushToGitHub({ silent: false });
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> 전체 저장';
    } else {
      toast('✅ 전체 저장 완료! (모든 기기 반영은 설정 탭에서 GitHub 연결 후 가능)');
    }
  });
}

/* ─── Sidebar 섹션 이동 시 GitHub 설정 폼 렌더 ─── */
const SECTION_ICONS = {
  dashboard:  'fas fa-home',
  hero:       'fas fa-film',
  products:   'fas fa-images',
  categories: 'fas fa-tags',
  settings:   'fas fa-cog',
  data:       'fas fa-database',
};
const SECTION_TITLES = {
  dashboard:  '대시보드',
  hero:       '메인 영상',
  products:   '제품 이미지',
  categories: '카테고리 관리',
  settings:   '사이트 설정',
  data:       'Import / Export',
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
      /* 설정 섹션 진입 시 GitHub 설정 폼 렌더 */
      if (section === 'settings') renderGhConfigForm();
    });
  });
}

/* ─── Init ─── */
function init() {
  initSidebar();
  initModal();
  initSaveAllBtn();
  loadData();
}

document.addEventListener('DOMContentLoaded', init);

/**
 * Aestyve — admin.js
 * 기능: localStorage 기반 CRUD, Import/Export/Reset, 다국어 폼, 모달 편집
 */

/* ─── 상수 ─── */
const STORAGE_KEY = 'aestyve_content';
const LANGS = ['ko', 'en', 'zh-CN', 'th'];
const LANG_LABELS = { ko: '한국어', en: 'English', 'zh-CN': '中文', th: 'ภาษาไทย' };
const SECTIONS = ['dashboard', 'settings', 'hero', 'categories', 'products', 'reviews', 'data'];
const TOPBAR_TITLES = {
  dashboard: '대시보드',
  settings: '사이트 설정',
  hero: '히어로 배너',
  categories: '카테고리',
  products: '제품',
  reviews: '리뷰',
  data: 'Import / Export',
};

/* ─── 상태 ─── */
let DATA = null;          // 현재 편집 중인 content.json 전체
let currentLang = 'ko';   // 다국어 폼 활성 언어
let modalCtx = null;      // { type, idx }

/* ─── 유틸 ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const uid = () => 'id_' + Math.random().toString(36).slice(2, 10);

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

function getLangField(obj, field) {
  return (obj?.[field] && typeof obj[field] === 'object') ? obj[field] : {};
}
function getStr(obj, field, lang) {
  const f = getLangField(obj, field);
  return f[lang] || f['ko'] || '';
}

/* ─── 데이터 로드 ─── */
async function loadData() {
  // 1) localStorage 우선
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      DATA = JSON.parse(stored);
      renderAll();
      return;
    } catch (e) {
      console.warn('[Admin] localStorage 파싱 오류, content.json 로드');
    }
  }
  // 2) content.json fetch
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
    saveToStorage();
    renderAll();
  } catch (err) {
    console.error('[Admin] content.json 로드 실패:', err);
    toast('content.json을 찾을 수 없습니다. Import 메뉴에서 파일을 불러오세요.', 'error', 5000);
    DATA = getDefaultData();
    renderAll();
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
}

/* ─── 기본값 ─── */
function getDefaultData() {
  return {
    settings: {
      brandName: 'Aestyve',
      primaryColor: '#1A2755',
      accentColor: '#2F3C86',
      noticeBar: { visible: true, text: { ko: '신규 회원가입 시 10% 할인 쿠폰 증정!', en: 'Get 10% off on sign-up!', 'zh-CN': '新会员注册即享9折优惠券！', th: 'สมัครสมาชิกรับส่วนลด 10%!' } },
      slogan: { ko: '피부과학의 혁신', en: 'Innovation in Dermatology', 'zh-CN': '皮肤科学的创新', th: 'นวัตกรรมผิวหนัง' },
      brandStory: { ko: 'Aestyve는 최첨단 피부과학으로 탄생했습니다.', en: 'Aestyve was born from cutting-edge dermatology.', 'zh-CN': 'Aestyve诞生于尖端皮肤科学。', th: 'Aestyve เกิดจากวิทยาศาสตร์ผิวหนังขั้นสูง' },
      stats: [
        { number: '500+', label: { ko: '임상 검증 성분', en: 'Clinically Tested', 'zh-CN': '临床验证', th: 'ส่วนผสมทดสอบ' } },
        { number: '98%', label: { ko: '고객 만족도', en: 'Satisfaction', 'zh-CN': '客户满意度', th: 'ความพึงพอใจ' } },
        { number: '30+', label: { ko: '피부과 전문의', en: 'Dermatologists', 'zh-CN': '皮肤科医生', th: 'ผู้เชี่ยวชาญ' } },
      ],
      contact: { phone: '+82-2-1234-5678', email: 'hello@aestyve.com', address: '서울특별시 강남구' },
      social: { instagram: '', youtube: '', facebook: '', tiktok: '' }
    },
    nav: [
      { id: 'nav1', label: { ko: 'NEW', en: 'NEW', 'zh-CN': '新品', th: 'ใหม่' }, href: '#products' },
      { id: 'nav2', label: { ko: 'PRODUCTS', en: 'PRODUCTS', 'zh-CN': '产品', th: 'สินค้า' }, href: '#products' },
      { id: 'nav3', label: { ko: 'BRAND', en: 'BRAND', 'zh-CN': '品牌', th: 'แบรนด์' }, href: '#brand' },
      { id: 'nav4', label: { ko: 'CONTACT', en: 'CONTACT', 'zh-CN': '联系', th: 'ติดต่อ' }, href: '#contact' },
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
  renderSettings();
  renderList('hero', DATA.heroes || []);
  renderList('category', DATA.categories || []);
  renderList('product', DATA.products || []);
  renderList('review', DATA.reviews || []);
}

/* ─── Dashboard ─── */
function renderDashboard() {
  const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };
  set('#dash-hero-count', DATA.heroes?.length || 0);
  set('#dash-cat-count', DATA.categories?.length || 0);
  set('#dash-prod-count', DATA.products?.length || 0);
  set('#dash-rev-count', DATA.reviews?.length || 0);
}

/* ─── Settings 렌더 ─── */
function renderSettings() {
  const s = DATA.settings || {};
  const setVal = (id, val) => { const el = $(id); if (el) el.value = val || ''; };

  setVal('#set-brandName', s.brandName);
  setVal('#set-primaryColor', s.primaryColor || '#1A2755');
  const picker = $('#set-primaryColorPicker');
  if (picker) picker.value = s.primaryColor || '#1A2755';
  const noticeChk = $('#set-noticeVisible');
  if (noticeChk) noticeChk.checked = !!s.noticeBar?.visible;

  // 다국어 필드 생성 함수
  function buildLangFields(containerId, dataObj, fieldKey, isTextarea = false) {
    const wrap = $(containerId);
    if (!wrap) return;
    wrap.innerHTML = '';
    const tabRow = document.createElement('div');
    tabRow.className = 'lang-tabs';
    LANGS.forEach(lc => {
      const btn = document.createElement('button');
      btn.className = 'lang-tab' + (lc === 'ko' ? ' active' : '');
      btn.textContent = LANG_LABELS[lc];
      btn.type = 'button';
      btn.dataset.lang = lc;
      btn.onclick = () => {
        tabRow.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        wrap.querySelectorAll('.lang-input-block').forEach(b => {
          b.style.display = b.dataset.lang === lc ? '' : 'none';
        });
      };
      tabRow.appendChild(btn);
    });
    wrap.appendChild(tabRow);

    const val = dataObj?.[fieldKey] || {};
    LANGS.forEach((lc, i) => {
      const block = document.createElement('div');
      block.className = 'lang-input-block';
      block.dataset.lang = lc;
      block.style.display = i === 0 ? '' : 'none';
      const ctrl = document.createElement(isTextarea ? 'textarea' : 'input');
      ctrl.className = 'form-control';
      ctrl.dataset.field = fieldKey;
      ctrl.dataset.lang = lc;
      if (!isTextarea) ctrl.type = 'text';
      ctrl.value = val[lc] || '';
      if (isTextarea) ctrl.rows = 3;
      block.appendChild(ctrl);
      wrap.appendChild(block);
    });
  }

  buildLangFields('#notice-lang-fields', s.noticeBar, 'text');
  buildLangFields('#slogan-lang-fields', s, 'slogan');
  buildLangFields('#story-lang-fields', s, 'brandStory', true);

  // Stats
  const statsWrap = $('#stats-fields');
  if (statsWrap) {
    const stats = s.stats || [{},{},{}];
    statsWrap.innerHTML = stats.map((st, i) => `
      <div style="display:grid;grid-template-columns:120px 1fr;gap:8px;margin-bottom:12px;align-items:start;">
        <div>
          <label class="form-label">수치 ${i+1}</label>
          <input type="text" class="form-control" id="stat-num-${i}" value="${st.number||''}" placeholder="예: 500+" />
        </div>
        <div>
          <label class="form-label">라벨 (${LANG_LABELS[currentLang]})</label>
          <input type="text" class="form-control" id="stat-label-${i}" value="${(st.label||{})[currentLang]||''}" placeholder="라벨" />
        </div>
      </div>`
    ).join('');
  }

  setVal('#set-phone', s.contact?.phone);
  setVal('#set-email', s.contact?.email);
  setVal('#set-address', s.contact?.address);
  setVal('#set-instagram', s.social?.instagram);
  setVal('#set-youtube', s.social?.youtube);
  setVal('#set-facebook', s.social?.facebook);
  setVal('#set-tiktok', s.social?.tiktok);
}

/* ─── Settings 저장 ─── */
function saveSection(section) {
  if (section !== 'settings') return;
  const s = DATA.settings = DATA.settings || {};

  s.brandName = $('#set-brandName')?.value || s.brandName;
  s.primaryColor = $('#set-primaryColor')?.value || s.primaryColor;
  s.noticeBar = s.noticeBar || {};
  s.noticeBar.visible = !!$('#set-noticeVisible')?.checked;

  // 다국어 값 수집
  function collectLangField(containerId) {
    const result = {};
    $$(`.lang-input-block`, $(containerId) || document).forEach(block => {
      const ctrl = block.querySelector('[data-lang]');
      if (ctrl) result[ctrl.dataset.lang] = ctrl.value;
    });
    return result;
  }
  s.noticeBar.text = collectLangField('#notice-lang-fields');
  s.slogan = collectLangField('#slogan-lang-fields');
  s.brandStory = collectLangField('#story-lang-fields');

  // Stats
  s.stats = (s.stats || [{},{},{}]).map((st, i) => ({
    number: $(`#stat-num-${i}`)?.value || st.number,
    label: LANGS.reduce((acc, lc) => {
      // 현재 UI는 currentLang만 수정 가능하므로 기존 값 유지하고 현재 lang만 덮어씀
      acc[lc] = (st.label || {})[lc] || '';
      return acc;
    }, { ...(st.label||{}) })
  }));
  // 현재 표시된 라벨만 반영
  (s.stats || []).forEach((st, i) => {
    const v = $(`#stat-label-${i}`)?.value;
    if (v !== undefined) st.label[currentLang] = v;
  });

  s.contact = {
    phone: $('#set-phone')?.value || '',
    email: $('#set-email')?.value || '',
    address: $('#set-address')?.value || '',
  };
  s.social = {
    instagram: $('#set-instagram')?.value || '',
    youtube: $('#set-youtube')?.value || '',
    facebook: $('#set-facebook')?.value || '',
    tiktok: $('#set-tiktok')?.value || '',
  };

  saveToStorage();
  toast('✅ 사이트 설정이 저장되었습니다. 홈페이지에 즉시 반영됩니다.');
}

/* ─── List 렌더 (Hero / Category / Product / Review) ─── */
function renderList(type, items) {
  const listId = `${type}-list`;
  const list = $(`#${listId}`);
  if (!list) return;
  if (!items.length) {
    list.innerHTML = `<p style="color:var(--gray-600);font-size:.85rem;padding:12px 0;">데이터가 없습니다. + 추가 버튼으로 항목을 추가하세요.</p>`;
    return;
  }
  list.innerHTML = items.map((item, i) => {
    const bgColor = item.bgColor || '#E8ECF8';
    const accentColor = item.accentColor || '#1A2755';
    let icon = '📋', title = '', meta = '';

    if (type === 'hero') {
      icon = '🖼️';
      title = getStr(item, 'title', 'ko') || `히어로 ${i+1}`;
      meta = getStr(item, 'label', 'ko');
    } else if (type === 'category') {
      icon = item.icon || '✨';
      title = getStr(item, 'title', 'ko') || `카테고리 ${i+1}`;
      meta = getStr(item, 'desc', 'ko');
    } else if (type === 'product') {
      icon = '📦';
      title = getStr(item, 'name', 'ko') || `제품 ${i+1}`;
      meta = `${item.price || ''} · ${item.category || ''}`;
    } else if (type === 'review') {
      icon = '⭐';
      title = getStr(item, 'name', 'ko') || `리뷰 ${i+1}`;
      meta = `${'★'.repeat(item.rating||5)} · ${(getStr(item, 'text', 'ko')||'').slice(0,40)}...`;
    }

    return `
    <div class="item-card" data-type="${type}" data-idx="${i}">
      <div class="item-color-block" style="background:${bgColor};color:${accentColor};">${icon}</div>
      <div class="item-info">
        <div class="item-title">${title}</div>
        <div class="item-meta">${meta}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openEditModal('${type}', ${i})"><i class="fas fa-edit"></i> 편집</button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('${type}', ${i})"><i class="fas fa-trash"></i></button>
        ${i > 0 ? `<button class="btn btn-outline btn-sm" onclick="moveItem('${type}', ${i}, -1)" title="위로">▲</button>` : ''}
        ${i < items.length-1 ? `<button class="btn btn-outline btn-sm" onclick="moveItem('${type}', ${i}, 1)" title="아래로">▼</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ─── Modal (Add / Edit) ─── */
function openAddModal(type) {
  modalCtx = { type, idx: -1 };
  buildModal(type, null);
  openModal(`${typeLabel(type)} 추가`);
}
function openEditModal(type, idx) {
  const items = getItems(type);
  modalCtx = { type, idx };
  buildModal(type, items[idx]);
  openModal(`${typeLabel(type)} 편집`);
}

function typeLabel(type) {
  return { hero:'히어로 배너', category:'카테고리', product:'제품', review:'리뷰' }[type] || type;
}
function getItems(type) {
  return { hero: DATA.heroes, category: DATA.categories, product: DATA.products, review: DATA.reviews }[type] || [];
}

function openModal(title) {
  $('#modal-title').textContent = title;
  $('#modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('#modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  modalCtx = null;
}

/* ─── Modal Body Builder ─── */
function buildModal(type, item) {
  const body = $('#modal-body');
  if (!type) return;
  let html = '';

  const li = (id, label, val='', type='text', note='') => `
    <div class="form-group" style="margin-bottom:12px;">
      <label class="form-label">${label}</label>
      <input type="${type}" class="form-control" id="m-${id}" value="${esc(val)}" />
      ${note ? `<div class="form-note">${note}</div>` : ''}
    </div>`;
  const lt = (id, label, val='') => `
    <div class="form-group" style="margin-bottom:12px;">
      <label class="form-label">${label}</label>
      <textarea class="form-control" id="m-${id}" rows="3">${esc(val)}</textarea>
    </div>`;
  const lc = (id, label, val='') => `
    <div class="form-group" style="margin-bottom:12px;">
      <label class="form-label">${label}</label>
      <div class="color-row">
        <input type="color" id="m-${id}-picker" value="${val||'#1A2755'}" oninput="document.getElementById('m-${id}').value=this.value" />
        <input type="text" class="form-control" id="m-${id}" value="${esc(val)}" oninput="document.getElementById('m-${id}-picker').value=this.value" />
      </div>
    </div>`;

  // Lang tabs helper (multilingual text fields)
  const langFields = (id, obj, isTA=false) => {
    const tabs = LANGS.map((lc,i) => `<button type="button" class="lang-tab${i===0?' active':''}" onclick="switchModalLang(this,'modal-lf-${id}')" data-lang="${lc}">${LANG_LABELS[lc]}</button>`).join('');
    const fields = LANGS.map((lc,i) => {
      const v = (obj||{})[lc] || '';
      if (isTA) return `<div class="lang-input-block" data-lang="${lc}" id="modal-lf-${id}-${lc}" style="display:${i===0?'':'none'};"><textarea class="form-control" id="m-${id}-${lc}" rows="3">${esc(v)}</textarea></div>`;
      return `<div class="lang-input-block" data-lang="${lc}" id="modal-lf-${id}-${lc}" style="display:${i===0?'':'none'};"><input type="text" class="form-control" id="m-${id}-${lc}" value="${esc(v)}" /></div>`;
    }).join('');
    return `<div class="form-group" style="margin-bottom:12px;"><label class="form-label">${id.replace(/-/g,' ')} (다국어)</label><div class="lang-tabs">${tabs}</div>${fields}</div>`;
  };

  if (type === 'hero') {
    html = `
      ${lc('bgColor','배경 색상', item?.bgColor||'#1A2755')}
      ${lc('accentColor','강조 색상', item?.accentColor||'#4F7EF7')}
      ${langFields('label', item?.label)}
      ${langFields('title', item?.title, true)}
      ${langFields('subtitle', item?.subtitle)}
      ${langFields('btnText', item?.btnText)}
      ${li('btnHref','버튼 링크', item?.btnHref||'#products','url')}`;
  } else if (type === 'category') {
    html = `
      ${li('icon','이모지 아이콘', item?.icon||'✨','text','이모지 1개 입력 (예: ✨, 🔬, 🌿, ⚡)')}
      ${lc('bgColor','배경 색상', item?.bgColor||'#E8ECF8')}
      ${lc('accentColor','텍스트/강조 색상', item?.accentColor||'#1A2755')}
      ${langFields('title', item?.title)}
      ${langFields('desc', item?.desc)}`;
  } else if (type === 'product') {
    html = `
      ${langFields('name', item?.name)}
      ${li('price','가격', item?.price||'')}
      <div class="form-group" style="margin-bottom:12px;">
        <label class="form-label">카테고리 (필터용)</label>
        <select class="form-control" id="m-category">
          <option value="all"${(item?.category||'')==='all'?' selected':''}>전체(all)</option>
          <option value="new"${(item?.category||'')==='new'?' selected':''}>신제품(new)</option>
          <option value="best"${(item?.category||'')==='best'?' selected':''}>베스트(best)</option>
        </select>
      </div>
      ${langFields('badge', item?.badge)}
      ${lc('bgColor','배경 색상', item?.bgColor||'#E8ECF8')}
      ${lc('accentColor','강조 색상', item?.accentColor||'#1A2755')}
      ${langFields('desc', item?.desc, true)}`;
  } else if (type === 'review') {
    html = `
      ${langFields('name', item?.name)}
      <div class="form-group" style="margin-bottom:12px;">
        <label class="form-label">별점 (1-5)</label>
        <input type="number" class="form-control" id="m-rating" min="1" max="5" value="${item?.rating||5}" />
      </div>
      ${langFields('text', item?.text, true)}`;
  }

  body.innerHTML = html;
}

// Modal lang tab switch
function switchModalLang(btn, groupId) {
  const parent = btn.closest('.form-group');
  parent.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const lang = btn.dataset.lang;
  parent.querySelectorAll('.lang-input-block').forEach(b => {
    b.style.display = b.dataset.lang === lang ? '' : 'none';
  });
}
window.switchModalLang = switchModalLang;

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─── Modal 저장 ─── */
function saveModal() {
  if (!modalCtx) return;
  const { type, idx } = modalCtx;
  const items = getItems(type);

  // 다국어 값 수집 헬퍼
  const collectLang = (id) => {
    const result = {};
    LANGS.forEach(lc => {
      const el = $(`#m-${id}-${lc}`);
      if (el) result[lc] = el.value;
    });
    return result;
  };
  const val = (id) => $(`#m-${id}`)?.value || '';

  let obj = {};

  if (type === 'hero') {
    obj = {
      id: (idx >= 0 ? items[idx]?.id : null) || uid(),
      bgColor: val('bgColor'),
      accentColor: val('accentColor'),
      label: collectLang('label'),
      title: collectLang('title'),
      subtitle: collectLang('subtitle'),
      btnText: collectLang('btnText'),
      btnHref: val('btnHref') || '#products',
    };
  } else if (type === 'category') {
    obj = {
      id: (idx >= 0 ? items[idx]?.id : null) || uid(),
      icon: val('icon') || '✨',
      bgColor: val('bgColor'),
      accentColor: val('accentColor'),
      title: collectLang('title'),
      desc: collectLang('desc'),
    };
  } else if (type === 'product') {
    obj = {
      id: (idx >= 0 ? items[idx]?.id : null) || uid(),
      category: val('category') || 'all',
      price: val('price'),
      bgColor: val('bgColor'),
      accentColor: val('accentColor'),
      name: collectLang('name'),
      badge: collectLang('badge'),
      desc: collectLang('desc'),
    };
  } else if (type === 'review') {
    obj = {
      id: (idx >= 0 ? items[idx]?.id : null) || uid(),
      rating: parseInt($('#m-rating')?.value || '5') || 5,
      name: collectLang('name'),
      text: collectLang('text'),
    };
  }

  if (idx >= 0) {
    items[idx] = obj;
  } else {
    items.push(obj);
  }

  // Write back
  if (type === 'hero') DATA.heroes = items;
  else if (type === 'category') DATA.categories = items;
  else if (type === 'product') DATA.products = items;
  else if (type === 'review') DATA.reviews = items;

  saveToStorage();
  closeModal();
  renderList(type, items);
  renderDashboard();
  toast(`✅ ${typeLabel(type)} 저장 완료! 홈페이지에 즉시 반영됩니다.`);
}

/* ─── 삭제 / 순서 이동 ─── */
function deleteItem(type, idx) {
  if (!confirm(`정말 삭제하시겠습니까?`)) return;
  const items = getItems(type);
  items.splice(idx, 1);
  if (type === 'hero') DATA.heroes = items;
  else if (type === 'category') DATA.categories = items;
  else if (type === 'product') DATA.products = items;
  else if (type === 'review') DATA.reviews = items;
  saveToStorage();
  renderList(type, items);
  renderDashboard();
  toast(`🗑️ 삭제 완료`);
}
window.deleteItem = deleteItem;

function moveItem(type, idx, dir) {
  const items = getItems(type);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= items.length) return;
  [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
  if (type === 'hero') DATA.heroes = items;
  else if (type === 'category') DATA.categories = items;
  else if (type === 'product') DATA.products = items;
  else if (type === 'review') DATA.reviews = items;
  saveToStorage();
  renderList(type, items);
}
window.moveItem = moveItem;

/* ─── Import / Export / Reset ─── */
function showJsonPreview() {
  const ta = $('#json-preview');
  if (ta) ta.value = JSON.stringify(DATA, null, 2);
}

function exportJson() {
  const json = JSON.stringify(DATA, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('✅ content.json 다운로드 완료! GitHub의 data/content.json을 교체하세요.');
}

function importFromFile() {
  const file = $('#import-file')?.files?.[0];
  if (!file) { toast('파일을 선택해주세요.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      DATA = parsed;
      saveToStorage();
      renderAll();
      toast('✅ JSON 파일 Import 완료!');
    } catch (err) {
      toast('JSON 파싱 오류: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function importFromText() {
  const text = $('#import-text')?.value?.trim();
  if (!text) { toast('JSON 텍스트를 입력해주세요.', 'error'); return; }
  try {
    const parsed = JSON.parse(text);
    DATA = parsed;
    saveToStorage();
    renderAll();
    toast('✅ JSON 텍스트 Import 완료!');
  } catch (err) {
    toast('JSON 파싱 오류: ' + err.message, 'error');
  }
}

function resetToDefault() {
  if (!confirm('모든 데이터를 기본값으로 초기화하시겠습니까?\n(이 작업은 되돌릴 수 없습니다.)')) return;
  localStorage.removeItem(STORAGE_KEY);
  DATA = getDefaultData();
  saveToStorage();
  renderAll();
  toast('✅ 기본값으로 초기화되었습니다.');
}

window.exportJson = exportJson;
window.importFromFile = importFromFile;
window.importFromText = importFromText;
window.resetToDefault = resetToDefault;
window.showJsonPreview = showJsonPreview;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.saveModal = saveModal;
window.saveSection = saveSection;

/* ─── 전체 저장 버튼 ─── */
function initSaveAllBtn() {
  const btn = $('#save-all-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    saveSection('settings');
    saveToStorage();
    toast('✅ 저장 완료! 홈페이지에 즉시 반영됩니다.');
  });
}

/* ─── Sidebar 내비게이션 ─── */
function initSidebar() {
  $$('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (!section) return;

      // Active 클래스
      $$('.sidebar-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Section View
      $$('.section-view').forEach(el => el.classList.remove('active'));
      const target = $(`#section-${section}`);
      if (target) target.classList.add('active');

      // Topbar title
      const title = $('#topbar-title');
      if (title) {
        const icons = {
          dashboard: 'fas fa-home', settings: 'fas fa-cog', hero: 'fas fa-images',
          categories: 'fas fa-th-large', products: 'fas fa-box',
          reviews: 'fas fa-star', data: 'fas fa-database',
        };
        title.innerHTML = `<i class="${icons[section]||'fas fa-circle'}" style="margin-right:8px;color:var(--accent)"></i>${TOPBAR_TITLES[section]||section}`;
      }
    });
  });
}

/* ─── Modal Overlay 클릭 닫기 ─── */
function initModal() {
  const overlay = $('#modal-overlay');
  if (!overlay) return;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
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

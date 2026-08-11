/* ============================================================
   Aestyve – admin.js
   Full CMS: Site / Hero / About / Products / Science / Academy / News
============================================================ */
(function () {
  'use strict';

  /* ── State ───────────────────────────────────────────── */
  let data = null;
  const DEFAULT_DATA_URL = 'data/content.json';

  /* ── Helpers ─────────────────────────────────────────── */
  const qs  = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const uid = () => 'id-' + Math.random().toString(36).slice(2, 9);

  function toast(msg, type = 'success') {
    const el = qs('#toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show ' + type;
    setTimeout(() => el.classList.remove('show'), 3000);
  }

  function previewImg(inputId, previewId) {
    const src  = qs('#' + inputId)?.value.trim();
    const wrap = qs('#' + previewId);
    if (!wrap) return;
    wrap.innerHTML = src
      ? `<img src="${src}" alt="preview" onerror="this.parentElement.innerHTML='<span class=\\'img-preview-placeholder\\'>이미지 없음</span>'" />`
      : '<span class="img-preview-placeholder">미리보기</span>';
  }
  window.previewImg = previewImg;

  /* ── Load Data ───────────────────────────────────────── */
  async function loadData() {
    // Try localStorage first, then server
    const saved = localStorage.getItem('aestyve-admin-data');
    if (saved) {
      try { data = JSON.parse(saved); renderAll(); return; } catch (e) { /* fallthrough */ }
    }
    try {
      const r = await fetch(DEFAULT_DATA_URL + '?v=' + Date.now());
      data = r.ok ? await r.json() : getDefaultData();
    } catch (e) {
      data = getDefaultData();
    }
    renderAll();
  }

  function saveToStorage() {
    localStorage.setItem('aestyve-admin-data', JSON.stringify(data, null, 2));
  }

  /* ── Default Data (fallback) ─────────────────────────── */
  function getDefaultData() {
    return {
      site: {
        brandKo: '에스티브', brandEn: 'Aestyve',
        logo: 'images/logo.png',
        phone: '080-855-4567', email: 'info@aestyve.com',
        addressKo: '서울시 강남구 도산대로 420', addressEn: '420 Dosan-daero, Gangnam-gu, Seoul',
        hoursKo: '평일 09:00 – 18:00', hoursEn: 'Mon–Fri 09:00–18:00'
      },
      hero: [
        { id: uid(), eyebrow: 'Innovation in Aesthetics',
          titleKo: '자신감을 채우는<br>에스테틱 솔루션', titleEn: 'Aesthetic Solutions<br>for Confidence',
          descKo: '에스티브와 함께 당신만의 아름다움을 찾아보세요', descEn: 'Discover your unique beauty with Aestyve',
          ctaKo: '제품 보기', ctaEn: 'View Products', ctaLink: '#products', image: '', bgColor: '#1a2755' }
      ],
      about: {
        eyebrow: 'About Aestyve',
        titleKo: '에스티브 소개', titleEn: 'About Us',
        bodyKo: '에스티브는 혁신적인 에스테틱 솔루션을 제공하는 글로벌 기업입니다.',
        bodyEn: 'Aestyve is a global leader in innovative aesthetic solutions.',
        image: '',
        stats: [
          { number: '10+', labelKo: '연구개발 경력', labelEn: 'Years of R&D' },
          { number: '30+', labelKo: '글로벌 국가',   labelEn: 'Global Countries' },
          { number: '500+', labelKo: '파트너 병원',  labelEn: 'Partner Clinics' },
          { number: '1M+',  labelKo: '시술 건수',    labelEn: 'Procedures' }
        ]
      },
      products: [
        { id: uid(), nameKo: '1906NAD+', nameEn: '1906NAD+', subKo: 'Skin Booster · Cosmeceutical', subEn: 'Skin Booster · Cosmeceutical',
          descKo: '맑고 탄탄한 피부 리듬을 채우는 NAD+ 컨센트레이트', descEn: 'NAD+ concentrate for clear and firm skin rhythm',
          image: 'images/products/1906nad.jpg', badge: 'best', badgeKo: 'BEST', badgeEn: 'BEST', category: 'new best', featured: true, order: 1 },
        { id: uid(), nameKo: 'Liquid PCL', nameEn: 'Liquid PCL', subKo: 'Skin Booster · Single Use', subEn: 'Skin Booster · Single Use',
          descKo: '결을 채우고 탄력을 더하는 리퀴드 PCL', descEn: 'Liquid PCL that fills texture and adds elasticity',
          image: 'images/products/liquid-pcl.jpg', badge: 'new', badgeKo: 'NEW', badgeEn: 'NEW', category: 'new', featured: false, order: 2 },
        { id: uid(), nameKo: 'Revibe', nameEn: 'Revibe', subKo: 'Medical Device · Single Use', subEn: 'Medical Device · Single Use',
          descKo: '피부 본연의 리듬을 깨우는 리바이브 케어', descEn: "Revive care that awakens the skin's natural rhythm",
          image: 'images/products/revibe.jpg', badge: 'new', badgeKo: 'NEW', badgeEn: 'NEW', category: 'new', featured: false, order: 3 },
        { id: uid(), nameKo: 'HA FILLER Series', nameEn: 'HA FILLER Series', subKo: 'Medical Device · Advanced Cross-linked HA', subEn: 'Medical Device · Advanced Cross-linked HA',
          descKo: '볼륨은 자연스럽게, 라인은 정교하게', descEn: 'Natural volume, precise contour',
          image: 'images/products/ha-filler.jpg', badge: 'best', badgeKo: 'BEST', badgeEn: 'BEST', category: 'best', featured: false, order: 4 },
        { id: uid(), nameKo: 'INNOFILL PLLA', nameEn: 'INNOFILL PLLA', subKo: 'PLLA Filler · 200mg/vial', subEn: 'PLLA Filler · 200mg/vial',
          descKo: '자연스러운 볼륨을 채우는 정교한 리프팅 케어', descEn: 'Precise lifting care for natural volume',
          image: 'images/products/innofill-plla.jpg', badge: 'new', badgeKo: 'NEW', badgeEn: 'NEW', category: 'new', featured: false, order: 5 }
      ],
      science: [
        { id: uid(), icon: '🔬', titleKo: '임상 연구', titleEn: 'Clinical Research', descKo: '30+ 임상 시험으로 입증된 안전성과 효과', descEn: 'Safety and efficacy proven by 30+ clinical trials' },
        { id: uid(), icon: '🧬', titleKo: '바이오 기술', titleEn: 'Biotechnology', descKo: '차세대 생체 적합 소재 개발 및 적용', descEn: 'Next-generation biocompatible material development' },
        { id: uid(), icon: '✅', titleKo: '안전성', titleEn: 'Safety', descKo: '국제 안전 기준 충족 및 글로벌 인증', descEn: 'International safety standards and global certification' }
      ],
      academy: [
        { id: uid(), titleKo: '마스터 클래스', titleEn: 'Master Class', descKo: '세계적인 전문가와 함께하는 심화 교육', descEn: 'Advanced training with global experts', image: '', link: '#contact' },
        { id: uid(), titleKo: '국제 심포지엄', titleEn: 'International Symposium', descKo: '최신 트렌드와 기술을 공유하는 글로벌 행사', descEn: 'Global event sharing latest trends and techniques', image: '', link: '#contact' },
        { id: uid(), titleKo: '웨비나', titleEn: 'Webinar', descKo: '온라인으로 참여하는 실시간 교육 프로그램', descEn: 'Real-time online training sessions', image: '', link: '#contact' }
      ],
      news: [
        { id: uid(), catKo: '제품', catEn: 'Product', date: '2026. 08. 01', titleKo: '신제품 1906NAD+ 공식 출시', titleEn: 'New Product 1906NAD+ Official Launch', link: '#' },
        { id: uid(), catKo: '이벤트', catEn: 'Event', date: '2026. 07. 15', titleKo: '국제 에스테틱 심포지엄 성공적 개최', titleEn: 'International Aesthetic Symposium Successfully Held', link: '#' },
        { id: uid(), catKo: '트렌드', catEn: 'Trend', date: '2026. 06. 20', titleKo: '2026 에스테틱 트렌드 리포트', titleEn: '2026 Aesthetic Trend Report', link: '#' },
        { id: uid(), catKo: '파트너십', catEn: 'Partnership', date: '2026. 05. 30', titleKo: '아시아 주요 병원 파트너십 체결', titleEn: 'Partnership with Major Asian Hospitals', link: '#' }
      ]
    };
  }

  /* ── Render All ──────────────────────────────────────── */
  function renderAll() {
    renderSite();
    renderHero();
    renderAbout();
    renderProducts();
    renderScience();
    renderAcademy();
    renderNews();
    updateDashboard();
  }

  /* ── Dashboard Stats ─────────────────────────────────── */
  function updateDashboard() {
    if (!data) return;
    const nums = [
      (data.products || []).length,
      (data.hero || []).length,
      (data.news || []).length,
      (data.academy || []).length
    ];
    qsa('#dashboard-stats .stat-box-num').forEach((el, i) => {
      el.textContent = nums[i] || 0;
    });
  }

  /* ── Site ────────────────────────────────────────────── */
  function renderSite() {
    if (!data?.site) return;
    const s = data.site;
    const fields = ['brandKo','brandEn','logo','phone','email','addressKo','addressEn','hoursKo','hoursEn'];
    fields.forEach(f => {
      const el = qs('#site-' + f);
      if (el) el.value = s[f] || '';
    });
    previewImg('site-logo', 'site-logo-preview');
  }

  window.saveSite = function () {
    if (!data) return;
    data.site = data.site || {};
    const fields = ['brandKo','brandEn','logo','phone','email','addressKo','addressEn','hoursKo','hoursEn'];
    fields.forEach(f => {
      const el = qs('#site-' + f);
      if (el) data.site[f] = el.value.trim();
    });
    saveToStorage();
    toast('사이트 설정이 저장되었습니다.');
  };

  /* ── Hero ────────────────────────────────────────────── */
  function renderHero() {
    const list = qs('#hero-list');
    if (!list || !data?.hero) return;
    list.innerHTML = '';
    data.hero.forEach((slide, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.dataset.id = slide.id;
      row.innerHTML = `
        <div class="item-row-header">
          <span class="item-row-title">슬라이드 ${idx + 1} – ${slide.titleKo || ''}</span>
          <div class="item-row-actions">
            <button class="btn btn-secondary btn-sm" onclick="toggleRow(this)">편집</button>
            <button class="btn btn-danger btn-sm" onclick="deleteHero('${slide.id}')">삭제</button>
          </div>
        </div>
        <div class="item-row-body">
          <div class="form-grid-2">
            <div class="form-group"><label>아이콘 레이블</label><input class="form-control" data-field="eyebrow" value="${esc(slide.eyebrow || '')}" /></div>
            <div class="form-group"><label>배경 색상</label><input class="form-control" type="color" data-field="bgColor" value="${slide.bgColor || '#1a2755'}" /></div>
          </div>
          <div class="form-grid-2">
            <div class="form-group"><label>제목 (한국어)</label><input class="form-control" data-field="titleKo" value="${esc(slide.titleKo || '')}" /></div>
            <div class="form-group"><label>제목 (영어)</label><input class="form-control" data-field="titleEn" value="${esc(slide.titleEn || '')}" /></div>
          </div>
          <div class="form-grid-2">
            <div class="form-group"><label>설명 (한국어)</label><input class="form-control" data-field="descKo" value="${esc(slide.descKo || '')}" /></div>
            <div class="form-group"><label>설명 (영어)</label><input class="form-control" data-field="descEn" value="${esc(slide.descEn || '')}" /></div>
          </div>
          <div class="form-grid-2">
            <div class="form-group"><label>버튼 텍스트 (한국어)</label><input class="form-control" data-field="ctaKo" value="${esc(slide.ctaKo || '')}" /></div>
            <div class="form-group"><label>버튼 텍스트 (영어)</label><input class="form-control" data-field="ctaEn" value="${esc(slide.ctaEn || '')}" /></div>
          </div>
          <div class="form-group"><label>버튼 링크</label><input class="form-control" data-field="ctaLink" value="${esc(slide.ctaLink || '#')}" /></div>
          <div class="form-group">
            <label>이미지 URL (비워두면 색상 배경)</label>
            <input class="form-control" data-field="image" value="${esc(slide.image || '')}" oninput="previewImg(this.id,'hero-preview-${slide.id}')" id="hero-img-${slide.id}" />
            <div class="img-preview-wrap"><div class="img-preview" id="hero-preview-${slide.id}">${slide.image ? '<img src="' + esc(slide.image) + '" />' : '<span class="img-preview-placeholder">미리보기</span>'}</div></div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="saveHeroSlide('${slide.id}', this)">저장</button>
        </div>`;
      list.appendChild(row);
    });
  }

  window.addHeroSlide = function () {
    if (!data) return;
    data.hero = data.hero || [];
    data.hero.push({
      id: uid(), eyebrow: 'New Slide',
      titleKo: '새 슬라이드', titleEn: 'New Slide',
      descKo: '설명을 입력하세요', descEn: 'Enter description',
      ctaKo: '자세히 보기', ctaEn: 'Learn More',
      ctaLink: '#', image: '', bgColor: '#1a2755'
    });
    renderHero(); updateDashboard();
  };

  window.deleteHero = function (id) {
    if (!data?.hero) return;
    if (!confirm('슬라이드를 삭제하시겠습니까?')) return;
    data.hero = data.hero.filter(h => h.id !== id);
    saveToStorage(); renderHero(); updateDashboard();
    toast('슬라이드가 삭제되었습니다.');
  };

  window.saveHeroSlide = function (id, btn) {
    if (!data?.hero) return;
    const row = btn.closest('.item-row');
    const slide = data.hero.find(h => h.id === id);
    if (!slide || !row) return;
    row.querySelectorAll('[data-field]').forEach(el => {
      slide[el.dataset.field] = el.value;
    });
    saveToStorage(); renderHero();
    toast('슬라이드가 저장되었습니다.');
  };

  /* ── About ───────────────────────────────────────────── */
  function renderAbout() {
    if (!data?.about) return;
    const a = data.about;
    qs('#about-eyebrow').value  = a.eyebrow  || '';
    qs('#about-titleKo').value  = a.titleKo  || '';
    qs('#about-titleEn').value  = a.titleEn  || '';
    qs('#about-bodyKo').value   = a.bodyKo   || '';
    qs('#about-bodyEn').value   = a.bodyEn   || '';
    qs('#about-image').value    = a.image    || '';
    previewImg('about-image', 'about-img-preview');

    // Stats
    const statsEl = qs('#about-stats-list');
    if (statsEl) {
      statsEl.innerHTML = '';
      (a.stats || []).forEach((st, i) => {
        const div = document.createElement('div');
        div.style = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px;align-items:center';
        div.innerHTML = `
          <input class="form-control form-control-sm" placeholder="숫자 (예: 10+)" value="${esc(st.number || '')}" data-stat-idx="${i}" data-stat-field="number" />
          <input class="form-control form-control-sm" placeholder="라벨 (한국어)" value="${esc(st.labelKo || '')}" data-stat-idx="${i}" data-stat-field="labelKo" />
          <input class="form-control form-control-sm" placeholder="라벨 (영어)" value="${esc(st.labelEn || '')}" data-stat-idx="${i}" data-stat-field="labelEn" />`;
        statsEl.appendChild(div);
      });
    }
  }

  window.saveAbout = function () {
    if (!data) return;
    data.about = data.about || {};
    data.about.eyebrow = qs('#about-eyebrow')?.value.trim() || '';
    data.about.titleKo = qs('#about-titleKo')?.value.trim() || '';
    data.about.titleEn = qs('#about-titleEn')?.value.trim() || '';
    data.about.bodyKo  = qs('#about-bodyKo')?.value.trim()  || '';
    data.about.bodyEn  = qs('#about-bodyEn')?.value.trim()  || '';
    data.about.image   = qs('#about-image')?.value.trim()   || '';
    // stats
    qsa('[data-stat-idx]').forEach(el => {
      const idx = +el.dataset.statIdx;
      const field = el.dataset.statField;
      if (data.about.stats?.[idx]) data.about.stats[idx][field] = el.value.trim();
    });
    saveToStorage();
    toast('회사 소개가 저장되었습니다.');
  };

  /* ── Products ────────────────────────────────────────── */
  function renderProducts() {
    const list = qs('#products-list');
    if (!list || !data?.products) return;
    list.innerHTML = '';
    [...data.products].sort((a, b) => (a.order || 0) - (b.order || 0)).forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.dataset.id = p.id;
      row.innerHTML = `
        <div class="item-row-header">
          <span class="item-row-title">${idx + 1}. ${p.nameKo || 'Unnamed'} ${p.featured ? '⭐ Featured' : ''}</span>
          <div class="item-row-actions">
            <button class="btn btn-secondary btn-sm" onclick="toggleRow(this)">편집</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">삭제</button>
          </div>
        </div>
        <div class="item-row-body">
          <div class="form-grid-2">
            <div class="form-group"><label>제품명 (한국어)</label><input class="form-control" data-field="nameKo" value="${esc(p.nameKo || '')}" /></div>
            <div class="form-group"><label>제품명 (영어)</label><input class="form-control" data-field="nameEn" value="${esc(p.nameEn || '')}" /></div>
          </div>
          <div class="form-grid-2">
            <div class="form-group"><label>서브타이틀 (한국어)</label><input class="form-control" data-field="subKo" value="${esc(p.subKo || '')}" /></div>
            <div class="form-group"><label>서브타이틀 (영어)</label><input class="form-control" data-field="subEn" value="${esc(p.subEn || '')}" /></div>
          </div>
          <div class="form-grid-2">
            <div class="form-group"><label>설명 (한국어)</label><textarea class="form-control" data-field="descKo" rows="3">${esc(p.descKo || '')}</textarea></div>
            <div class="form-group"><label>설명 (영어)</label><textarea class="form-control" data-field="descEn" rows="3">${esc(p.descEn || '')}</textarea></div>
          </div>
          <div class="form-group">
            <label>이미지 URL</label>
            <input class="form-control" data-field="image" id="prod-img-${p.id}" value="${esc(p.image || '')}" oninput="previewImg('prod-img-${p.id}','prod-preview-${p.id}')" />
            <div class="img-preview-wrap"><div class="img-preview" id="prod-preview-${p.id}">${p.image ? '<img src="' + esc(p.image) + '" />' : '<span class="img-preview-placeholder">미리보기</span>'}</div></div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>배지</label>
              <select class="form-control" data-field="badge">
                <option value=""${p.badge===''?' selected':''}>없음</option>
                <option value="new"${p.badge==='new'?' selected':''}>NEW</option>
                <option value="best"${p.badge==='best'?' selected':''}>BEST</option>
              </select>
            </div>
            <div class="form-group">
              <label>카테고리 (all / new / best 조합)</label>
              <input class="form-control" data-field="category" value="${esc(p.category || 'new')}" />
              <div class="form-hint">예: "new" / "best" / "new best"</div>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>표시 순서</label>
              <input class="form-control" type="number" data-field="order" value="${p.order || idx + 1}" />
            </div>
            <div class="form-group">
              <label>Featured (상단 강조)</label>
              <select class="form-control" data-field="featured">
                <option value="false"${!p.featured?' selected':''}>일반 카드</option>
                <option value="true"${p.featured?' selected':''}>Featured ⭐</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="saveProduct('${p.id}', this)">저장</button>
        </div>`;
      list.appendChild(row);
    });
  }

  window.addProduct = function () {
    if (!data) return;
    data.products = data.products || [];
    data.products.push({
      id: uid(), nameKo: '새 제품', nameEn: 'New Product',
      subKo: '', subEn: '', descKo: '', descEn: '',
      image: '', badge: 'new', badgeKo: 'NEW', badgeEn: 'NEW',
      category: 'new', featured: false,
      order: data.products.length + 1
    });
    renderProducts(); updateDashboard();
  };

  window.deleteProduct = function (id) {
    if (!data?.products) return;
    if (!confirm('제품을 삭제하시겠습니까?')) return;
    data.products = data.products.filter(p => p.id !== id);
    saveToStorage(); renderProducts(); updateDashboard();
    toast('제품이 삭제되었습니다.');
  };

  window.saveProduct = function (id, btn) {
    if (!data?.products) return;
    const row = btn.closest('.item-row');
    const prod = data.products.find(p => p.id === id);
    if (!prod || !row) return;
    row.querySelectorAll('[data-field]').forEach(el => {
      const val = el.tagName === 'SELECT' ? el.value : el.value.trim();
      if (el.dataset.field === 'featured') {
        prod.featured = val === 'true';
      } else if (el.dataset.field === 'order') {
        prod.order = parseInt(val) || 1;
      } else {
        prod[el.dataset.field] = val;
      }
    });
    // sync badge labels
    if (prod.badge === 'new')  { prod.badgeKo = 'NEW';  prod.badgeEn = 'NEW'; }
    if (prod.badge === 'best') { prod.badgeKo = 'BEST'; prod.badgeEn = 'BEST'; }
    saveToStorage(); renderProducts();
    toast('제품이 저장되었습니다.');
  };

  /* ── Science ─────────────────────────────────────────── */
  function renderScience() {
    const list = qs('#science-list');
    if (!list || !data?.science) return;
    list.innerHTML = '';
    data.science.forEach((s, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-row-header">
          <span class="item-row-title">${s.icon || ''} ${s.titleKo || ''}</span>
          <div class="item-row-actions">
            <button class="btn btn-secondary btn-sm" onclick="toggleRow(this)">편집</button>
            <button class="btn btn-danger btn-sm" onclick="deleteScience(${idx})">삭제</button>
          </div>
        </div>
        <div class="item-row-body">
          <div class="form-grid-2">
            <div class="form-group"><label>아이콘 (이모지)</label><input class="form-control" data-field="icon" value="${esc(s.icon || '')}" /></div>
            <div class="form-group"><label>제목 (한국어)</label><input class="form-control" data-field="titleKo" value="${esc(s.titleKo || '')}" /></div>
          </div>
          <div class="form-group"><label>제목 (영어)</label><input class="form-control" data-field="titleEn" value="${esc(s.titleEn || '')}" /></div>
          <div class="form-grid-2">
            <div class="form-group"><label>설명 (한국어)</label><textarea class="form-control" data-field="descKo" rows="2">${esc(s.descKo || '')}</textarea></div>
            <div class="form-group"><label>설명 (영어)</label><textarea class="form-control" data-field="descEn" rows="2">${esc(s.descEn || '')}</textarea></div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="saveScience(${idx}, this)">저장</button>
        </div>`;
      list.appendChild(row);
    });
  }

  window.addScience = function () {
    if (!data) return;
    data.science = data.science || [];
    data.science.push({ id: uid(), icon: '🔬', titleKo: '새 항목', titleEn: 'New Item', descKo: '', descEn: '' });
    renderScience();
  };

  window.deleteScience = function (idx) {
    if (!data?.science) return;
    data.science.splice(idx, 1);
    saveToStorage(); renderScience();
    toast('항목이 삭제되었습니다.');
  };

  window.saveScience = function (idx, btn) {
    if (!data?.science) return;
    const row = btn.closest('.item-row');
    row.querySelectorAll('[data-field]').forEach(el => {
      data.science[idx][el.dataset.field] = el.tagName === 'TEXTAREA' ? el.value : el.value.trim();
    });
    saveToStorage(); renderScience();
    toast('과학/기술 항목이 저장되었습니다.');
  };

  /* ── Academy ─────────────────────────────────────────── */
  function renderAcademy() {
    const list = qs('#academy-list');
    if (!list || !data?.academy) return;
    list.innerHTML = '';
    data.academy.forEach((a, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-row-header">
          <span class="item-row-title">${a.titleKo || ''}</span>
          <div class="item-row-actions">
            <button class="btn btn-secondary btn-sm" onclick="toggleRow(this)">편집</button>
            <button class="btn btn-danger btn-sm" onclick="deleteAcademy(${idx})">삭제</button>
          </div>
        </div>
        <div class="item-row-body">
          <div class="form-grid-2">
            <div class="form-group"><label>제목 (한국어)</label><input class="form-control" data-field="titleKo" value="${esc(a.titleKo || '')}" /></div>
            <div class="form-group"><label>제목 (영어)</label><input class="form-control" data-field="titleEn" value="${esc(a.titleEn || '')}" /></div>
          </div>
          <div class="form-grid-2">
            <div class="form-group"><label>설명 (한국어)</label><textarea class="form-control" data-field="descKo" rows="2">${esc(a.descKo || '')}</textarea></div>
            <div class="form-group"><label>설명 (영어)</label><textarea class="form-control" data-field="descEn" rows="2">${esc(a.descEn || '')}</textarea></div>
          </div>
          <div class="form-group">
            <label>이미지 URL</label>
            <input class="form-control" data-field="image" id="aca-img-${idx}" value="${esc(a.image || '')}" oninput="previewImg('aca-img-${idx}','aca-preview-${idx}')" />
            <div class="img-preview-wrap"><div class="img-preview" id="aca-preview-${idx}">${a.image ? '<img src="' + esc(a.image) + '" />' : '<span class="img-preview-placeholder">미리보기</span>'}</div></div>
          </div>
          <div class="form-group"><label>링크</label><input class="form-control" data-field="link" value="${esc(a.link || '#')}" /></div>
          <button class="btn btn-primary btn-sm" onclick="saveAcademy(${idx}, this)">저장</button>
        </div>`;
      list.appendChild(row);
    });
  }

  window.addAcademy = function () {
    if (!data) return;
    data.academy = data.academy || [];
    data.academy.push({ id: uid(), titleKo: '새 프로그램', titleEn: 'New Program', descKo: '', descEn: '', image: '', link: '#' });
    renderAcademy(); updateDashboard();
  };

  window.deleteAcademy = function (idx) {
    if (!data?.academy) return;
    data.academy.splice(idx, 1);
    saveToStorage(); renderAcademy(); updateDashboard();
    toast('항목이 삭제되었습니다.');
  };

  window.saveAcademy = function (idx, btn) {
    if (!data?.academy) return;
    const row = btn.closest('.item-row');
    row.querySelectorAll('[data-field]').forEach(el => {
      data.academy[idx][el.dataset.field] = el.tagName === 'TEXTAREA' ? el.value : el.value.trim();
    });
    saveToStorage(); renderAcademy();
    toast('아카데미 항목이 저장되었습니다.');
  };

  /* ── News ────────────────────────────────────────────── */
  function renderNews() {
    const list = qs('#news-list');
    if (!list || !data?.news) return;
    list.innerHTML = '';
    data.news.forEach((n, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-row-header">
          <span class="item-row-title">${n.catKo || ''} – ${n.titleKo || ''}</span>
          <div class="item-row-actions">
            <button class="btn btn-secondary btn-sm" onclick="toggleRow(this)">편집</button>
            <button class="btn btn-danger btn-sm" onclick="deleteNews(${idx})">삭제</button>
          </div>
        </div>
        <div class="item-row-body">
          <div class="form-grid-2">
            <div class="form-group"><label>카테고리 (한국어)</label><input class="form-control" data-field="catKo" value="${esc(n.catKo || '')}" /></div>
            <div class="form-group"><label>카테고리 (영어)</label><input class="form-control" data-field="catEn" value="${esc(n.catEn || '')}" /></div>
          </div>
          <div class="form-group"><label>날짜</label><input class="form-control" data-field="date" value="${esc(n.date || '')}" /></div>
          <div class="form-grid-2">
            <div class="form-group"><label>제목 (한국어)</label><input class="form-control" data-field="titleKo" value="${esc(n.titleKo || '')}" /></div>
            <div class="form-group"><label>제목 (영어)</label><input class="form-control" data-field="titleEn" value="${esc(n.titleEn || '')}" /></div>
          </div>
          <div class="form-group"><label>링크</label><input class="form-control" data-field="link" value="${esc(n.link || '#')}" /></div>
          <button class="btn btn-primary btn-sm" onclick="saveNews(${idx}, this)">저장</button>
        </div>`;
      list.appendChild(row);
    });
  }

  window.addNews = function () {
    if (!data) return;
    data.news = data.news || [];
    data.news.unshift({ id: uid(), catKo: '새소식', catEn: 'News', date: new Date().toLocaleDateString('ko-KR'), titleKo: '새 뉴스 제목', titleEn: 'New Article', link: '#' });
    renderNews(); updateDashboard();
  };

  window.deleteNews = function (idx) {
    if (!data?.news) return;
    data.news.splice(idx, 1);
    saveToStorage(); renderNews(); updateDashboard();
    toast('뉴스가 삭제되었습니다.');
  };

  window.saveNews = function (idx, btn) {
    if (!data?.news) return;
    const row = btn.closest('.item-row');
    row.querySelectorAll('[data-field]').forEach(el => {
      data.news[idx][el.dataset.field] = el.value.trim();
    });
    saveToStorage(); renderNews();
    toast('뉴스가 저장되었습니다.');
  };

  /* ── JSON Editor ──────────────────────────────────────── */
  window.loadJsonEditor = function () {
    const ed = qs('#json-editor');
    if (ed) ed.value = JSON.stringify(data, null, 2);
  };

  window.applyJsonEditor = function () {
    const ed = qs('#json-editor');
    if (!ed) return;
    try {
      data = JSON.parse(ed.value);
      saveToStorage();
      renderAll();
      toast('JSON이 적용되었습니다.');
    } catch (e) {
      toast('JSON 형식 오류: ' + e.message, 'error');
    }
  };

  /* ── Export / Import / Reset ─────────────────────────── */
  qs('#btn-export')?.addEventListener('click', () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('content.json 파일이 다운로드됩니다.');
  });

  qs('#btn-import')?.addEventListener('click', () => qs('#import-file')?.click());
  qs('#import-file')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        data = JSON.parse(ev.target.result);
        saveToStorage(); renderAll();
        toast('데이터를 가져왔습니다.');
      } catch (err) {
        toast('파일 형식 오류입니다.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  qs('#btn-reset')?.addEventListener('click', () => {
    if (!confirm('모든 편집 내용이 초기화됩니다. 계속하시겠습니까?')) return;
    localStorage.removeItem('aestyve-admin-data');
    loadData();
    toast('초기화되었습니다.');
  });

  /* ── Panel Switch ─────────────────────────────────────── */
  const panelTitles = {
    dashboard: '대시보드', site: '사이트 설정', hero: '히어로 슬라이더',
    about: '회사 소개', products: '제품 관리', science: '과학/기술',
    academy: '아카데미', news: '뉴스', contact: '연락처', jsonEdit: 'JSON 직접 편집'
  };

  window.switchPanel = function (panelId) {
    qsa('.admin-panel').forEach(p => p.classList.remove('active'));
    qsa('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    const panel = qs('#panel-' + panelId);
    if (panel) panel.classList.add('active');
    const link = qs(`.sidebar-nav a[data-panel="${panelId}"]`);
    if (link) link.classList.add('active');
    const titleEl = qs('#topbar-title');
    if (titleEl) titleEl.textContent = panelTitles[panelId] || panelId;
    // JSON editor auto-load
    if (panelId === 'jsonEdit') window.loadJsonEditor();
  };

  qsa('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.switchPanel(a.dataset.panel);
      // Close mobile sidebar
      qs('#sidebar')?.classList.remove('open');
      qs('#sidebar-overlay')?.classList.remove('visible');
    });
  });

  /* ── Row Toggle ──────────────────────────────────────── */
  window.toggleRow = function (btn) {
    const body = btn.closest('.item-row')?.querySelector('.item-row-body');
    if (!body) return;
    body.classList.toggle('open');
    btn.textContent = body.classList.contains('open') ? '닫기' : '편집';
  };

  /* ── Mobile Sidebar ──────────────────────────────────── */
  const sidebarToggle  = qs('#sidebar-toggle');
  const sidebarOverlay = qs('#sidebar-overlay');
  const sidebar        = qs('#sidebar');

  sidebarToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    sidebarOverlay?.classList.toggle('visible');
  });
  sidebarOverlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('visible');
  });

  /* ── Escape HTML ─────────────────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ── Init ────────────────────────────────────────────── */
  loadData();

})();

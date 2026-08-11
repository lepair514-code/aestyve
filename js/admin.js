/**
 * Aestyve Admin JavaScript
 * 에스코어 드림 폰트 기반 관리자 패널
 */

/* ─────────────────────────────────────
   기본 데이터 (content.json 초기값)
───────────────────────────────────── */
const DEFAULT_DATA = {
  site: {
    name_ko: "에스티브", name_en: "Aestyve",
    tagline_ko: "Aesthetic Solutions for Confidence",
    tagline_en: "Aesthetic Solutions for Confidence",
    phone: "080-855-4567", email: "info@aestyve.com",
    address_ko: "서울시 강남구 테헤란로 123, 에스티브빌딩",
    address_en: "Aestyve Building, 123 Teheran-ro, Gangnam-gu, Seoul",
    business_hours_ko: "평일 09:00 - 18:00 (주말 및 공휴일 휴무)",
    business_hours_en: "Weekdays 09:00 - 18:00 (Closed on weekends and holidays)",
    primary_color: "#0D1B3E", accent_color: "#C8A97A"
  },
  hero: [
    { id:"h1", badge_ko:"Aesthetic Innovation", badge_en:"Aesthetic Innovation",
      title_ko:"자신감을 채우는\n에스테틱 솔루션", title_en:"Feel Better,\nLive Better",
      desc_ko:"에스티브와 함께 당신만의 아름다움을 찾아보세요.", desc_en:"Discover your unique beauty with Aestyve.",
      btn1_ko:"제품 보기", btn1_en:"View Products", btn1_link:"#products",
      btn2_ko:"브랜드 소개", btn2_en:"About Us", btn2_link:"#about", image:"" },
    { id:"h2", badge_ko:"Clinical Excellence", badge_en:"Clinical Excellence",
      title_ko:"혁신적인\n에스테틱 기술", title_en:"Innovation in\nAesthetic Science",
      desc_ko:"글로벌 표준을 만드는 프리미엄 솔루션.", desc_en:"Premium solutions setting global standards.",
      btn1_ko:"기술 보기", btn1_en:"Our Science", btn1_link:"#science",
      btn2_ko:"아카데미", btn2_en:"Academy", btn2_link:"#academy", image:"" },
    { id:"h3", badge_ko:"Global Partnership", badge_en:"Global Partnership",
      title_ko:"전문가와 함께하는\n뷰티 여정", title_en:"Your Beauty Journey\nWith Professionals",
      desc_ko:"전 세계 의료진이 신뢰하는 브랜드, 에스티브.", desc_en:"Trusted by medical professionals worldwide.",
      btn1_ko:"문의하기", btn1_en:"Contact Us", btn1_link:"#contact",
      btn2_ko:"아카데미 보기", btn2_en:"Academy", btn2_link:"#academy", image:"" }
  ],
  about: {
    label_ko:"브랜드 소개", label_en:"About Aestyve",
    title_ko:"10년 이상의 혁신으로 만들어진 에스테틱의 미래",
    title_en:"The Future of Aesthetics Built on 10+ Years of Innovation",
    desc_ko:"에스티브는 혁신적인 에스테틱 솔루션을 제공하는 글로벌 기업입니다.",
    desc_en:"Aestyve is a global leader in innovative aesthetic solutions.", image:"",
    stats:[
      { num:"10+", label_ko:"연구개발 경력", label_en:"Years of R&D" },
      { num:"30+", label_ko:"글로벌 국가", label_en:"Global Countries" },
      { num:"500+", label_ko:"파트너 병원", label_en:"Partner Clinics" },
      { num:"1M+", label_ko:"시술 건수", label_en:"Procedures" }
    ]
  },
  products: {
    featured: {
      id:"p0", name:"1906NAD+",
      badge_ko:"BEST · FEATURED", badge_en:"BEST · FEATURED",
      desc_ko:"맑고 탄탄한 피부 리듬을 채우는 NAD+ 컨센트레이트.",
      desc_en:"NAD+ concentrate for clear and firm skin rhythm.",
      image:"https://www.genspark.ai/api/files/s/68YDgq7B",
      link:"#", category:"best"
    },
    list: [
      { id:"p1", name:"Liquid PCL", badge_ko:"NEW", badge_en:"NEW",
        desc_ko:"결을 채우고 탄력을 더하는 리퀴드 PCL.",
        desc_en:"Liquid PCL for improved skin texture and elasticity.",
        image:"https://www.genspark.ai/api/files/s/6cpItebx", link:"#", category:"new" },
      { id:"p2", name:"Revibe", badge_ko:"NEW", badge_en:"NEW",
        desc_ko:"피부 본연의 리듬을 깨우는 리바이브 케어.",
        desc_en:"Revibe care that awakens skin's natural rhythm.",
        image:"https://www.genspark.ai/api/files/s/pQDECzpb", link:"#", category:"new" },
      { id:"p3", name:"HA FILLER Series", badge_ko:"BEST", badge_en:"BEST",
        desc_ko:"볼륨은 자연스럽게, 라인은 정교하게.",
        desc_en:"Natural volume, precise lines.",
        image:"https://www.genspark.ai/api/files/s/kuvuKo9K", link:"#", category:"best" },
      { id:"p4", name:"INNOFILL PLLA", badge_ko:"NEW", badge_en:"NEW",
        desc_ko:"자연스러운 볼륨을 채우는 정교한 리프팅 케어.",
        desc_en:"Precise lifting care for natural volume.",
        image:"https://www.genspark.ai/api/files/s/kyWBJBlj", link:"#", category:"new" }
    ]
  },
  science: [
    { id:"s1", icon:"🔬", title_ko:"임상 연구", title_en:"Clinical Research",
      desc_ko:"30건 이상의 임상 시험으로 입증된 안전성과 효과.",
      desc_en:"Safety and efficacy proven by 30+ clinical trials." },
    { id:"s2", icon:"🧬", title_ko:"바이오 기술", title_en:"Biotechnology",
      desc_ko:"차세대 생체 적합 소재 개발.",
      desc_en:"Next-generation biocompatible materials." },
    { id:"s3", icon:"🛡️", title_ko:"안전성", title_en:"Safety",
      desc_ko:"국제 안전 기준 충족 및 CE, ISO 인증 획득.",
      desc_en:"International safety standards, CE and ISO certified." }
  ],
  academy: [
    { id:"a1", num:"01", title_ko:"마스터 클래스", title_en:"Master Class",
      desc_ko:"세계적인 전문가와 함께하는 심화 교육 프로그램", desc_en:"Advanced training program with world-class experts", image:"", link:"#" },
    { id:"a2", num:"02", title_ko:"국제 심포지엄", title_en:"International Symposium",
      desc_ko:"최신 트렌드와 기술을 공유하는 글로벌 행사", desc_en:"Global event sharing latest trends and techniques", image:"", link:"#" },
    { id:"a3", num:"03", title_ko:"웨비나", title_en:"Webinar",
      desc_ko:"온라인으로 참여하는 실시간 전문 교육 세션", desc_en:"Real-time professional training sessions online", image:"", link:"#" }
  ],
  news: [
    { id:"n1", category_ko:"제품", category_en:"Product",
      title_ko:"에스티브, 신제품 1906NAD+ 공식 출시",
      title_en:"Aestyve Officially Launches New Product 1906NAD+",
      date:"2026. 08. 01", image:"", link:"#", featured:true },
    { id:"n2", category_ko:"이벤트", category_en:"Event",
      title_ko:"에스티브 국제 심포지엄 성공적 개최",
      title_en:"Aestyve International Symposium Successfully Held",
      date:"2026. 07. 15", image:"", link:"#", featured:false },
    { id:"n3", category_ko:"트렌드", category_en:"Trend",
      title_ko:"에스테틱 트렌드 2026: 자연스러운 아름다움의 시대",
      title_en:"Aesthetic Trends 2026: The Era of Natural Beauty",
      date:"2026. 06. 20", image:"", link:"#", featured:false },
    { id:"n4", category_ko:"파트너십", category_en:"Partnership",
      title_ko:"에스티브, 글로벌 파트너십 50개 신규 체결",
      title_en:"Aestyve Signs 50 New Global Partnerships",
      date:"2026. 05. 28", image:"", link:"#", featured:false }
  ]
};

/* ─────────────────────────────────────
   상태 관리
───────────────────────────────────── */
let DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
let editingProductId = null;
let editingHeroId = null;
let editingNewsId = null;
let editingScienceId = null;
let editingAcademyId = null;

function loadData() {
  const saved = localStorage.getItem('aestyve_admin_data');
  if (saved) {
    try { DATA = JSON.parse(saved); } catch(e) { DATA = JSON.parse(JSON.stringify(DEFAULT_DATA)); }
  }
  renderAll();
}

function saveData() {
  localStorage.setItem('aestyve_admin_data', JSON.stringify(DATA));
  showToast('저장되었습니다.', 'success');
}

function genId(prefix) {
  return prefix + '_' + Date.now();
}

/* ─────────────────────────────────────
   패널 전환
───────────────────────────────────── */
function switchPanel(name) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
  const btn = document.querySelector('[data-panel="' + name + '"]');
  if (btn) btn.classList.add('active');
  const titles = {
    dashboard:'대시보드', site:'사이트 설정', hero:'히어로 슬라이더', about:'브랜드 소개',
    products:'제품 관리', science:'과학/기술', academy:'아카데미', news:'뉴스 관리', json:'JSON 편집기'
  };
  document.getElementById('topbarTitle').textContent = titles[name] || name;
  if (name === 'json') refreshJsonEditor();
  if (name === 'site') populateSiteForm();
  if (name === 'about') populateAboutForm();
}

window.switchPanel = switchPanel;

document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    switchPanel(this.dataset.panel);
  });
});

/* ─────────────────────────────────────
   렌더링
───────────────────────────────────── */
function renderAll() {
  renderProducts();
  renderHero();
  renderAbout();
  renderScience();
  renderAcademy();
  renderNews();
}

/* ── 제품 ── */
function renderProducts() {
  const f = DATA.products.featured;
  const fv = document.getElementById('featuredProductView');
  if (fv) {
    fv.innerHTML = `
      <div class="list-item">
        <img class="list-item-img" src="${f.image || ''}" alt="${f.name}" onerror="this.style.background='#f0f2f5';this.src='';">
        <div class="list-item-body">
          <div class="list-item-name">${f.name} <span class="badge badge-best">FEATURED</span></div>
          <div class="list-item-meta">${f.desc_ko}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn-edit" onclick="openProductModal('featured')">수정</button>
        </div>
      </div>`;
  }

  const list = document.getElementById('productList');
  if (!list) return;
  list.innerHTML = DATA.products.list.map((p, i) => `
    <div class="list-item">
      <img class="list-item-img" src="${p.image || ''}" alt="${p.name}" onerror="this.style.background='#f0f2f5';this.src='';">
      <div class="list-item-body">
        <div class="list-item-name">${p.name}
          ${p.category.includes('new') ? '<span class="badge badge-new">NEW</span>' : ''}
          ${p.category.includes('best') ? '<span class="badge badge-best">BEST</span>' : ''}
        </div>
        <div class="list-item-meta">${p.desc_ko}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" onclick="openProductModal('${p.id}')">수정</button>
        <button class="btn-delete" onclick="deleteProduct('${p.id}')">삭제</button>
      </div>
    </div>`).join('');
}

/* ── 히어로 ── */
function renderHero() {
  const list = document.getElementById('heroList');
  if (!list) return;
  list.innerHTML = DATA.hero.map((h, i) => `
    <div class="list-item">
      <div class="list-item-body">
        <div class="list-item-name">슬라이드 ${i+1}: ${h.badge_ko}</div>
        <div class="list-item-meta">${(h.title_ko || '').replace(/\n/g, ' ')}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" onclick="openHeroModal('${h.id}')">수정</button>
        <button class="btn-delete" onclick="deleteHero('${h.id}')">삭제</button>
      </div>
    </div>`).join('');
}

/* ── About ── */
function renderAbout() {
  populateAboutForm();
  const sl = document.getElementById('aboutStatsList');
  if (!sl) return;
  const stats = DATA.about.stats || [];
  sl.innerHTML = stats.map((s, i) => `
    <div class="list-item">
      <div class="list-item-body">
        <div class="list-item-name">${s.num} <span style="font-weight:400; color:var(--gray-500);">${s.label_ko}</span></div>
        <div class="list-item-meta">${s.label_en}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" onclick="editStat(${i})">수정</button>
      </div>
    </div>`).join('');
}

/* ── Science ── */
function renderScience() {
  const list = document.getElementById('scienceList');
  if (!list) return;
  list.innerHTML = DATA.science.map(s => `
    <div class="list-item">
      <div style="font-size:1.8rem; margin-right:8px;">${s.icon}</div>
      <div class="list-item-body">
        <div class="list-item-name">${s.title_ko}</div>
        <div class="list-item-meta">${s.desc_ko}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" onclick="openScienceModal('${s.id}')">수정</button>
        <button class="btn-delete" onclick="deleteScience('${s.id}')">삭제</button>
      </div>
    </div>`).join('');
}

/* ── Academy ── */
function renderAcademy() {
  const list = document.getElementById('academyList');
  if (!list) return;
  list.innerHTML = DATA.academy.map(a => `
    <div class="list-item">
      <div class="list-item-body">
        <div class="list-item-name">${a.num}. ${a.title_ko}</div>
        <div class="list-item-meta">${a.desc_ko}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" onclick="openAcademyModal('${a.id}')">수정</button>
        <button class="btn-delete" onclick="deleteAcademy('${a.id}')">삭제</button>
      </div>
    </div>`).join('');
}

/* ── News ── */
function renderNews() {
  const list = document.getElementById('newsList');
  if (!list) return;
  list.innerHTML = DATA.news.map(n => `
    <div class="list-item">
      <div class="list-item-body">
        <div class="list-item-name">
          ${n.featured ? '<span class="badge badge-best">FEATURED</span>' : ''}
          ${n.title_ko}
        </div>
        <div class="list-item-meta">${n.category_ko} · ${n.date}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" onclick="openNewsModal('${n.id}')">수정</button>
        <button class="btn-delete" onclick="deleteNews('${n.id}')">삭제</button>
      </div>
    </div>`).join('');
}

/* ─────────────────────────────────────
   폼 채우기
───────────────────────────────────── */
function populateSiteForm() {
  const s = DATA.site;
  setVal('site_name_ko', s.name_ko);
  setVal('site_name_en', s.name_en);
  setVal('site_phone', s.phone);
  setVal('site_email', s.email);
  setVal('site_address_ko', s.address_ko);
  setVal('site_address_en', s.address_en);
  setVal('site_hours_ko', s.business_hours_ko);
  setVal('site_hours_en', s.business_hours_en);
  setVal('site_primary_color', s.primary_color);
  setVal('site_accent_color', s.accent_color);
}

function populateAboutForm() {
  const a = DATA.about;
  setVal('about_title_ko', a.title_ko);
  setVal('about_title_en', a.title_en);
  setVal('about_desc_ko', a.desc_ko);
  setVal('about_desc_en', a.desc_en);
  setVal('about_image', a.image);
  updateImgPreview('about_image', 'about_img_preview');
}

/* ─────────────────────────────────────
   사이트 설정 저장
───────────────────────────────────── */
function saveSite() {
  DATA.site.name_ko = getVal('site_name_ko');
  DATA.site.name_en = getVal('site_name_en');
  DATA.site.phone = getVal('site_phone');
  DATA.site.email = getVal('site_email');
  DATA.site.address_ko = getVal('site_address_ko');
  DATA.site.address_en = getVal('site_address_en');
  DATA.site.business_hours_ko = getVal('site_hours_ko');
  DATA.site.business_hours_en = getVal('site_hours_en');
  DATA.site.primary_color = getVal('site_primary_color');
  DATA.site.accent_color = getVal('site_accent_color');
  saveData();
}
window.saveSite = saveSite;

/* ─────────────────────────────────────
   About 저장
───────────────────────────────────── */
function saveAbout() {
  DATA.about.title_ko = getVal('about_title_ko');
  DATA.about.title_en = getVal('about_title_en');
  DATA.about.desc_ko = getVal('about_desc_ko');
  DATA.about.desc_en = getVal('about_desc_en');
  DATA.about.image = getVal('about_image');
  saveData();
  renderAbout();
}
window.saveAbout = saveAbout;

/* ─────────────────────────────────────
   통계 수정
───────────────────────────────────── */
function editStat(i) {
  const s = DATA.about.stats[i];
  const num = prompt('숫자 (예: 10+):', s.num);
  if (!num) return;
  const labelKo = prompt('라벨 (한국어):', s.label_ko);
  const labelEn = prompt('라벨 (영어):', s.label_en);
  DATA.about.stats[i] = { num, label_ko: labelKo || s.label_ko, label_en: labelEn || s.label_en };
  saveData();
  renderAbout();
}
window.editStat = editStat;

/* ─────────────────────────────────────
   제품 모달
───────────────────────────────────── */
function openProductModal(id) {
  editingProductId = id;
  const isFeatured = id === 'featured';
  document.getElementById('productModalTitle').textContent = isFeatured ? 'Featured 제품 수정' : (id === 'new' ? '제품 추가' : '제품 수정');

  let p = {};
  if (isFeatured) {
    p = DATA.products.featured;
  } else if (id !== 'new') {
    p = DATA.products.list.find(x => x.id === id) || {};
  }

  setVal('product_id', p.id || '');
  setVal('product_name', p.name || '');
  setVal('product_badge_ko', p.badge_ko || '');
  setVal('product_badge_en', p.badge_en || '');
  setVal('product_desc_ko', p.desc_ko || '');
  setVal('product_desc_en', p.desc_en || '');
  setVal('product_image', p.image || '');
  setVal('product_category', p.category || 'new');
  setVal('product_link', p.link || '#');
  updateImgPreview('product_image', 'product_img_preview');
  openModal('productModal');
}
window.openProductModal = openProductModal;

function saveProduct() {
  const p = {
    id: getVal('product_id') || genId('p'),
    name: getVal('product_name'),
    badge_ko: getVal('product_badge_ko'),
    badge_en: getVal('product_badge_en'),
    desc_ko: getVal('product_desc_ko'),
    desc_en: getVal('product_desc_en'),
    image: getVal('product_image'),
    category: getVal('product_category'),
    link: getVal('product_link') || '#'
  };
  if (!p.name) { showToast('제품명을 입력해주세요.', 'error'); return; }

  if (editingProductId === 'featured') {
    DATA.products.featured = p;
  } else if (editingProductId === 'new') {
    DATA.products.list.push(p);
  } else {
    const idx = DATA.products.list.findIndex(x => x.id === editingProductId);
    if (idx > -1) DATA.products.list[idx] = p;
  }

  saveData();
  renderProducts();
  closeModal('productModal');
}
window.saveProduct = saveProduct;

function deleteProduct(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  DATA.products.list = DATA.products.list.filter(p => p.id !== id);
  saveData();
  renderProducts();
}
window.deleteProduct = deleteProduct;

/* ─────────────────────────────────────
   히어로 모달
───────────────────────────────────── */
function openHeroModal(id) {
  editingHeroId = id || 'new';
  document.getElementById('heroModalTitle').textContent = id ? '슬라이드 수정' : '슬라이드 추가';

  let h = {};
  if (id && id !== 'new') {
    h = DATA.hero.find(x => x.id === id) || {};
  }

  setVal('hero_id', h.id || '');
  setVal('hero_badge_ko', h.badge_ko || '');
  setVal('hero_badge_en', h.badge_en || '');
  setVal('hero_title_ko', h.title_ko || '');
  setVal('hero_title_en', h.title_en || '');
  setVal('hero_desc_ko', h.desc_ko || '');
  setVal('hero_desc_en', h.desc_en || '');
  setVal('hero_image', h.image || '');
  openModal('heroModal');
}
window.openHeroModal = openHeroModal;

function saveHero() {
  const h = {
    id: getVal('hero_id') || genId('h'),
    badge_ko: getVal('hero_badge_ko'),
    badge_en: getVal('hero_badge_en'),
    title_ko: getVal('hero_title_ko'),
    title_en: getVal('hero_title_en'),
    desc_ko: getVal('hero_desc_ko'),
    desc_en: getVal('hero_desc_en'),
    image: getVal('hero_image')
  };

  if (editingHeroId === 'new') {
    DATA.hero.push(h);
  } else {
    const idx = DATA.hero.findIndex(x => x.id === editingHeroId);
    if (idx > -1) DATA.hero[idx] = h;
  }

  saveData();
  renderHero();
  closeModal('heroModal');
}
window.saveHero = saveHero;

function deleteHero(id) {
  if (DATA.hero.length <= 1) { showToast('슬라이드는 최소 1개 이상 필요합니다.', 'error'); return; }
  if (!confirm('삭제하시겠습니까?')) return;
  DATA.hero = DATA.hero.filter(h => h.id !== id);
  saveData();
  renderHero();
}
window.deleteHero = deleteHero;

/* ─────────────────────────────────────
   뉴스 모달
───────────────────────────────────── */
function openNewsModal(id) {
  editingNewsId = id || 'new';
  document.getElementById('newsModalTitle').textContent = id ? '뉴스 수정' : '뉴스 추가';

  let n = {};
  if (id && id !== 'new') {
    n = DATA.news.find(x => x.id === id) || {};
  }

  setVal('news_id', n.id || '');
  setVal('news_category_ko', n.category_ko || '');
  setVal('news_category_en', n.category_en || '');
  setVal('news_title_ko', n.title_ko || '');
  setVal('news_title_en', n.title_en || '');
  setVal('news_date', n.date || '');
  setVal('news_image', n.image || '');
  setVal('news_link', n.link || '#');
  setVal('news_featured', n.featured ? 'true' : 'false');
  openModal('newsModal');
}
window.openNewsModal = openNewsModal;

function saveNews() {
  const n = {
    id: getVal('news_id') || genId('n'),
    category_ko: getVal('news_category_ko'),
    category_en: getVal('news_category_en'),
    title_ko: getVal('news_title_ko'),
    title_en: getVal('news_title_en'),
    date: getVal('news_date'),
    image: getVal('news_image'),
    link: getVal('news_link') || '#',
    featured: getVal('news_featured') === 'true'
  };
  if (!n.title_ko) { showToast('제목을 입력해주세요.', 'error'); return; }

  if (editingNewsId === 'new') {
    DATA.news.unshift(n);
  } else {
    const idx = DATA.news.findIndex(x => x.id === editingNewsId);
    if (idx > -1) DATA.news[idx] = n;
  }

  saveData();
  renderNews();
  closeModal('newsModal');
}
window.saveNews = saveNews;

function deleteNews(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  DATA.news = DATA.news.filter(n => n.id !== id);
  saveData();
  renderNews();
}
window.deleteNews = deleteNews;

/* ─────────────────────────────────────
   과학 모달
───────────────────────────────────── */
function openScienceModal(id) {
  editingScienceId = id || 'new';
  document.getElementById('scienceModalTitle').textContent = id ? '항목 수정' : '항목 추가';
  let s = {};
  if (id && id !== 'new') s = DATA.science.find(x => x.id === id) || {};
  setVal('science_id', s.id || '');
  setVal('science_icon', s.icon || '');
  setVal('science_title_ko', s.title_ko || '');
  setVal('science_title_en', s.title_en || '');
  setVal('science_desc_ko', s.desc_ko || '');
  setVal('science_desc_en', s.desc_en || '');
  openModal('scienceModal');
}
window.openScienceModal = openScienceModal;

function saveScience() {
  const s = {
    id: getVal('science_id') || genId('s'),
    icon: getVal('science_icon'),
    title_ko: getVal('science_title_ko'),
    title_en: getVal('science_title_en'),
    desc_ko: getVal('science_desc_ko'),
    desc_en: getVal('science_desc_en')
  };
  if (!s.title_ko) { showToast('제목을 입력해주세요.', 'error'); return; }
  if (editingScienceId === 'new') {
    DATA.science.push(s);
  } else {
    const idx = DATA.science.findIndex(x => x.id === editingScienceId);
    if (idx > -1) DATA.science[idx] = s;
  }
  saveData(); renderScience(); closeModal('scienceModal');
}
window.saveScience = saveScience;

function deleteScience(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  DATA.science = DATA.science.filter(s => s.id !== id);
  saveData(); renderScience();
}
window.deleteScience = deleteScience;

/* ─────────────────────────────────────
   아카데미 모달
───────────────────────────────────── */
function openAcademyModal(id) {
  editingAcademyId = id || 'new';
  document.getElementById('academyModalTitle').textContent = id ? '아카데미 수정' : '아카데미 추가';
  let a = {};
  if (id && id !== 'new') a = DATA.academy.find(x => x.id === id) || {};
  setVal('academy_id', a.id || '');
  setVal('academy_num', a.num || '');
  setVal('academy_title_ko', a.title_ko || '');
  setVal('academy_title_en', a.title_en || '');
  setVal('academy_desc_ko', a.desc_ko || '');
  setVal('academy_desc_en', a.desc_en || '');
  setVal('academy_image', a.image || '');
  openModal('academyModal');
}
window.openAcademyModal = openAcademyModal;

function saveAcademy() {
  const a = {
    id: getVal('academy_id') || genId('a'),
    num: getVal('academy_num'),
    title_ko: getVal('academy_title_ko'),
    title_en: getVal('academy_title_en'),
    desc_ko: getVal('academy_desc_ko'),
    desc_en: getVal('academy_desc_en'),
    image: getVal('academy_image'),
    link: '#'
  };
  if (!a.title_ko) { showToast('제목을 입력해주세요.', 'error'); return; }
  if (editingAcademyId === 'new') {
    DATA.academy.push(a);
  } else {
    const idx = DATA.academy.findIndex(x => x.id === editingAcademyId);
    if (idx > -1) DATA.academy[idx] = a;
  }
  saveData(); renderAcademy(); closeModal('academyModal');
}
window.saveAcademy = saveAcademy;

function deleteAcademy(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  DATA.academy = DATA.academy.filter(a => a.id !== id);
  saveData(); renderAcademy();
}
window.deleteAcademy = deleteAcademy;

/* ─────────────────────────────────────
   JSON 편집기
───────────────────────────────────── */
function refreshJsonEditor() {
  const el = document.getElementById('jsonEditor');
  if (el) el.value = JSON.stringify(DATA, null, 2);
}

function applyJsonEditor() {
  try {
    const val = document.getElementById('jsonEditor').value;
    DATA = JSON.parse(val);
    saveData();
    renderAll();
    showToast('JSON이 적용되었습니다.', 'success');
  } catch(e) {
    showToast('JSON 형식이 잘못되었습니다: ' + e.message, 'error');
  }
}
window.refreshJsonEditor = refreshJsonEditor;
window.applyJsonEditor = applyJsonEditor;

/* ─────────────────────────────────────
   Export / Import / Reset
───────────────────────────────────── */
document.getElementById('btnExport').addEventListener('click', function() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('content.json이 다운로드되었습니다.', 'success');
});

document.getElementById('btnImport').addEventListener('click', function() {
  document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      DATA = JSON.parse(ev.target.result);
      saveData();
      renderAll();
      showToast('데이터가 가져와졌습니다.', 'success');
    } catch(err) {
      showToast('파일 형식이 잘못되었습니다.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('btnReset').addEventListener('click', function() {
  if (!confirm('모든 데이터를 초기 상태로 돌리겠습니까?')) return;
  DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
  localStorage.removeItem('aestyve_admin_data');
  renderAll();
  showToast('초기화 완료', 'success');
});

/* ─────────────────────────────────────
   모달 열기/닫기
───────────────────────────────────── */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
window.closeModal = closeModal;

// 오버레이 클릭 시 닫기
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

/* ─────────────────────────────────────
   이미지 미리보기
───────────────────────────────────── */
function previewImg(url, previewId) {
  updateImgPreview(null, previewId, url);
}

function updateImgPreview(inputId, previewId, forcedUrl) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  const url = forcedUrl || (inputId ? getVal(inputId) : '');
  if (url) {
    preview.innerHTML = '<img src="' + url + '" onerror="this.parentElement.innerHTML=\'<span class=\\\'img-preview-empty\\\'>이미지를 불러올 수 없습니다.</span>\'">';
  } else {
    preview.innerHTML = '<span class="img-preview-empty">이미지 URL 입력 후 미리보기</span>';
  }
}

window.previewImg = previewImg;

// About 이미지 URL 변경 감지
const aboutImgInput = document.getElementById('about_image');
if (aboutImgInput) {
  aboutImgInput.addEventListener('input', function() {
    updateImgPreview('about_image', 'about_img_preview');
  });
}

/* ─────────────────────────────────────
   유틸리티
───────────────────────────────────── */
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function showToast(msg, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { el.classList.add('show'); });
  });

  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

/* ─────────────────────────────────────
   초기화
───────────────────────────────────── */
loadData();

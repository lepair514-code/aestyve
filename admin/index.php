<?php
// 세션 존재 여부만 서버에서 확인해 초기 화면을 결정합니다.
// 실제 인증 검증은 api.php가 매 요청마다 다시 수행합니다.
session_start();
$loggedIn = !empty($_SESSION['aestyve_admin']);
?>
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Aestyve 관리자</title>
<style>
:root{--navy:#052b42;--apricot:#d8956f;--cream:#fbfaf7;--ink:#102331;--muted:#6d777d;--line:#e4dfd8;--danger:#c0503f;--ok:#2f7a4f}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Noto Sans KR",sans-serif;background:var(--cream);color:var(--ink);line-height:1.5}
.topbar{background:var(--navy);color:#fff;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.topbar b{font-size:15px;letter-spacing:.02em}
.topbar .tabs{display:flex;gap:6px}
.topbar button.tab{background:transparent;border:1px solid rgba(255,255,255,.3);color:#fff;padding:7px 14px;border-radius:999px;font-size:12px;cursor:pointer}
.topbar button.tab.active{background:#fff;color:var(--navy);font-weight:700}
.topbar .logout{background:transparent;border:0;color:rgba(255,255,255,.7);font-size:12px;cursor:pointer;text-decoration:underline}
.wrap{max-width:960px;margin:0 auto;padding:26px 18px 120px}
.login-wrap{max-width:360px;margin:80px auto;background:#fff;border:1px solid var(--line);border-radius:18px;padding:34px}
.login-wrap h1{font-size:19px;margin:0 0 6px}
.login-wrap p{font-size:12px;color:var(--muted);margin:0 0 20px}
input[type=password],input[type=text]{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:10px;font-size:14px;background:#fff}
button.primary{background:var(--navy);color:#fff;border:0;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;margin-top:12px;width:100%}
button.primary:hover{opacity:.92}
.err{color:var(--danger);font-size:12px;margin-top:10px;min-height:14px}
.page-group{background:#fff;border:1px solid var(--line);border-radius:16px;margin-bottom:14px;overflow:hidden}
.page-group summary{padding:14px 18px;cursor:pointer;font-weight:700;font-size:13px;display:flex;justify-content:space-between;background:#faf7f3}
.page-group summary .count{color:var(--muted);font-weight:400;font-size:11px}
.field{padding:14px 18px;border-top:1px solid var(--line)}
.field label{display:block;font-size:11px;color:var(--muted);margin-bottom:6px;letter-spacing:.02em}
.field textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:9px 11px;font-size:13px;font-family:inherit;resize:vertical;min-height:44px}
.field .tools{display:flex;gap:6px;margin-top:6px}
.field .tools button{font-size:11px;border:1px solid var(--line);background:#fff;border-radius:7px;padding:4px 9px;cursor:pointer}
.field.changed textarea{border-color:var(--apricot);background:#fffaf5}
.savebar{position:fixed;left:0;right:0;bottom:0;background:var(--navy);color:#fff;padding:13px 22px;display:none;align-items:center;justify-content:space-between;gap:14px;z-index:60}
.savebar.show{display:flex}
.savebar button{background:#fff;color:var(--navy);border:0;padding:10px 18px;border-radius:999px;font-weight:700;font-size:13px;cursor:pointer}
.savebar span{font-size:12px;opacity:.85}
.img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
.img-card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;position:relative}
.img-card .thumb{height:130px;background:#f2ede7;display:flex;align-items:center;justify-content:center;overflow:hidden}
.img-card .thumb img{max-width:100%;max-height:100%;object-fit:contain}
.img-card .meta{padding:10px 12px;font-size:11px;color:var(--muted);word-break:break-all}
.img-card .drop{position:absolute;inset:0;background:rgba(5,43,66,.82);color:#fff;display:none;align-items:center;justify-content:center;font-size:12px;text-align:center;padding:10px}
.img-card.dragover .drop{display:flex}
.img-card label.upbtn{position:absolute;right:8px;bottom:44px;background:var(--navy);color:#fff;font-size:10px;padding:6px 10px;border-radius:999px;cursor:pointer}
.img-card input[type=file]{display:none}
.toast{position:fixed;right:18px;bottom:18px;background:var(--ok);color:#fff;padding:11px 16px;border-radius:10px;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.2);opacity:0;transform:translateY(8px);transition:.25s;pointer-events:none;z-index:80}
.toast.err{background:var(--danger)}
.toast.show{opacity:1;transform:none}
.settings-box{background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px;max-width:420px}
.settings-box h3{margin-top:0;font-size:14px}
.settings-box input{margin-bottom:10px}
.hint{font-size:11px;color:var(--muted);margin:10px 0 0}
</style>
</head>
<body>

<div id="login-screen" class="login-wrap" style="display:none">
  <h1>Aestyve 관리자</h1>
  <p>비밀번호를 입력해 주세요.</p>
  <input type="password" id="pw" placeholder="비밀번호" autofocus>
  <button class="primary" id="loginBtn">로그인</button>
  <div class="err" id="loginErr"></div>
</div>

<div id="app" style="display:none">
  <div class="topbar">
    <b>Aestyve 관리자</b>
    <div class="tabs">
      <button class="tab active" data-tab="text">텍스트 편집</button>
      <button class="tab" data-tab="images">이미지 관리</button>
      <button class="tab" data-tab="settings">설정</button>
    </div>
    <button class="logout" id="logoutBtn">로그아웃</button>
  </div>

  <div class="wrap">
    <div id="tab-text"></div>
    <div id="tab-images" style="display:none">
      <p class="hint" style="margin-bottom:16px">이미지를 클릭하거나 파일을 끌어다 놓으면 즉시 실제 홈페이지 이미지가 교체됩니다. (같은 파일명을 그대로 유지하며 내용만 바뀝니다)</p>
      <div class="img-grid" id="imgGrid"></div>
    </div>
    <div id="tab-settings" style="display:none">
      <div class="settings-box">
        <h3>비밀번호 변경</h3>
        <input type="password" id="oldPw" placeholder="현재 비밀번호">
        <input type="password" id="newPw" placeholder="새 비밀번호 (8자 이상)">
        <button class="primary" id="changePwBtn">변경하기</button>
        <div class="err" id="pwErr"></div>
      </div>
    </div>
  </div>

  <div class="savebar" id="savebar">
    <span id="changeCount">0개 항목 변경됨</span>
    <button id="saveBtn">변경사항 저장</button>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const API = 'api.php';
let CSRF = '';
let CONTENT = {};
let CHANGES = {};

function toast(msg, isErr){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  setTimeout(()=> t.className = 'toast', 2200);
}

async function api(action, opts){
  opts = opts || {};
  const res = await fetch(API + '?action=' + action, opts);
  return res.json();
}

async function checkSession(){
  const r = await api('session');
  if(r.loggedIn){
    CSRF = r.csrf;
    showApp();
  } else {
    document.getElementById('login-screen').style.display = 'block';
  }
}

document.getElementById('loginBtn').onclick = async () => {
  const password = document.getElementById('pw').value;
  const r = await api('login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({password})
  });
  if(r.ok){ CSRF = r.csrf; showApp(); }
  else document.getElementById('loginErr').textContent = '비밀번호가 올바르지 않습니다.';
};
document.getElementById('pw').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('loginBtn').click(); });

document.getElementById('logoutBtn').onclick = async () => {
  await api('logout');
  location.reload();
};

async function showApp(){
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  const res = await fetch('/content.json?t=' + Date.now());
  CONTENT = await res.json();
  renderText();
  loadImages();
}

document.querySelectorAll('.tab').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    ['text','images','settings'].forEach(t => {
      document.getElementById('tab-'+t).style.display = (t === btn.dataset.tab) ? 'block' : 'none';
    });
  };
});

function pageLabel(fname){
  const map = {'index.html':'홈 (index)','company.html':'회사소개','brands.html':'브랜드','science.html':'사이언스',
  'distribution.html':'유통','partnership.html':'파트너십','contact.html':'문의','404.html':'404 페이지'};
  if(map[fname]) return map[fname];
  return fname.replace('.html','');
}

function renderText(){
  const groups = {};
  Object.entries(CONTENT).forEach(([key, item]) => {
    (groups[item.page] = groups[item.page] || []).push([key, item]);
  });
  const order = Object.keys(groups).sort();
  const el = document.getElementById('tab-text');
  el.innerHTML = order.map(page => {
    const items = groups[page];
    const rows = items.map(([key, item]) => `
      <div class="field" data-key="${key}">
        <label>${item.label || key}</label>
        <textarea data-key="${key}">${escapeHtml(item.value)}</textarea>
        ${item.type === 'rich' ? `<div class="tools">
          <button type="button" data-act="br">줄바꿈 추가</button>
          <button type="button" data-act="em">선택 강조색 적용</button>
        </div>` : ''}
      </div>`).join('');
    return `<details class="page-group"><summary>${pageLabel(page)} <span class="count">${items.length}개 항목</span></summary>${rows}</details>`;
  }).join('');

  el.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', () => {
      const key = ta.dataset.key;
      CHANGES[key] = ta.value;
      ta.closest('.field').classList.add('changed');
      updateSavebar();
    });
  });
  el.querySelectorAll('button[data-act]').forEach(btn => {
    btn.onclick = () => {
      const ta = btn.closest('.field').querySelector('textarea');
      const s = ta.selectionStart, e = ta.selectionEnd;
      if(btn.dataset.act === 'br'){
        ta.value = ta.value.slice(0,s) + '<br>' + ta.value.slice(e);
      } else {
        const sel = ta.value.slice(s,e) || '강조할 텍스트';
        ta.value = ta.value.slice(0,s) + '<em>' + sel + '</em>' + ta.value.slice(e);
      }
      ta.dispatchEvent(new Event('input'));
    };
  });
}

function escapeHtml(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function updateSavebar(){
  const n = Object.keys(CHANGES).length;
  document.getElementById('changeCount').textContent = n + '개 항목 변경됨';
  document.getElementById('savebar').classList.toggle('show', n > 0);
}

document.getElementById('saveBtn').onclick = async () => {
  const r = await api('save_text', {
    method:'POST',
    headers:{'Content-Type':'application/json','X-CSRF-Token':CSRF},
    body: JSON.stringify(CHANGES)
  });
  if(r.ok){
    Object.keys(CHANGES).forEach(k => CONTENT[k].value = CHANGES[k]);
    CHANGES = {};
    document.querySelectorAll('.field.changed').forEach(f=>f.classList.remove('changed'));
    updateSavebar();
    toast('저장되었습니다. 홈페이지에 즉시 반영됩니다.');
  } else {
    toast('저장에 실패했습니다.', true);
  }
};

async function loadImages(){
  const r = await api('images', {headers:{'X-CSRF-Token':CSRF}});
  if(!r.ok) return;
  const grid = document.getElementById('imgGrid');
  grid.innerHTML = r.files.map(f => `
    <div class="img-card" data-name="${f.name}">
      <div class="thumb"><img src="/assets/${f.name}?v=${f.mtime}" alt="${f.name}"></div>
      <div class="meta">${f.name}<br>${(f.size/1024).toFixed(0)} KB</div>
      <label class="upbtn">교체
        <input type="file" accept="image/*,.svg">
      </label>
      <div class="drop">여기에 놓아<br>바로 교체</div>
    </div>`).join('');

  grid.querySelectorAll('.img-card').forEach(card => {
    const name = card.dataset.name;
    const fileInput = card.querySelector('input[type=file]');
    fileInput.addEventListener('change', () => {
      if(fileInput.files[0]) doUpload(card, name, fileInput.files[0]);
    });
    card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('dragover'); });
    card.addEventListener('dragleave', () => card.classList.remove('dragover'));
    card.addEventListener('drop', e => {
      e.preventDefault();
      card.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if(file) doUpload(card, name, file);
    });
  });
}

async function doUpload(card, target, file){
  const fd = new FormData();
  fd.append('image', file);
  fd.append('target', target);
  const res = await fetch(API + '?action=upload_image', {
    method:'POST', headers:{'X-CSRF-Token':CSRF}, body: fd
  });
  const r = await res.json();
  if(r.ok){
    card.querySelector('.thumb img').src = '/assets/' + r.name + '?v=' + r.mtime;
    toast(target + ' 이미지가 교체되었습니다.');
  } else {
    toast('업로드 실패: ' + (r.error||''), true);
  }
}

document.getElementById('changePwBtn').onclick = async () => {
  const old = document.getElementById('oldPw').value;
  const nw = document.getElementById('newPw').value;
  const r = await api('change_password', {
    method:'POST', headers:{'Content-Type':'application/json','X-CSRF-Token':CSRF},
    body: JSON.stringify({old, new: nw})
  });
  if(r.ok){
    toast('비밀번호가 변경되었습니다.');
    document.getElementById('oldPw').value = document.getElementById('newPw').value = '';
    document.getElementById('pwErr').textContent = '';
  } else {
    document.getElementById('pwErr').textContent = '변경 실패: ' + (r.error||'');
  }
};

checkSession();
</script>
</body>
</html>

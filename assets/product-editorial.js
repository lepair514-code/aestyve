(() => {
'use strict';
const ui=({"ko": {"loading": "영상 준비 중", "play": "자동 재생", "pause": "일시 정지", "error": "영상을 불러오지 못했습니다", "retry": "재생 버튼을 다시 눌러주세요", "subject": "Revibe PN 제품·공급 검토 문의", "market": "대상 국가", "type": "사업 유형", "company": "회사 / 기관", "plan": "예상 수량 / 도입 시점", "request": "요청 자료 및 질문"}, "en": {"loading": "Loading video", "play": "Play", "pause": "Pause", "error": "Unable to load video", "retry": "Please press Play again", "subject": "Revibe PN product and supply inquiry", "market": "Target country", "type": "Business type", "company": "Company / institution", "plan": "Expected quantity / timing", "request": "Documents and questions"}, "zh-CN": {"loading": "视频加载中", "play": "播放", "pause": "暂停", "error": "视频无法加载", "retry": "请再次点击播放", "subject": "Revibe PN 产品与供应咨询", "market": "目标国家", "type": "业务类型", "company": "公司 / 机构", "plan": "预计数量 / 引进时间", "request": "所需资料与问题"}})[document.documentElement.lang] || {"loading": "Loading video", "play": "Play", "pause": "Pause", "error": "Unable to load video", "retry": "Please press Play again", "subject": "Revibe PN product and supply inquiry", "market": "Target country", "type": "Business type", "company": "Company / institution", "plan": "Expected quantity / timing", "request": "Documents and questions"};
const subject = ui.subject.replace('Revibe PN', document.body.dataset.product);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const scene = document.querySelector('.rv-stage');
if (scene.querySelector('video')) {
const video = scene.querySelector('video');
const playback = document.querySelector('#rv-play');
const indicator = document.querySelector('#rv-status');
let pausedByUser = false;
let autoplayBlocked = false;
let visible = false;
let pointer;

function refreshPlayback() {
  playback.textContent = video.paused ? ui.play : ui.pause;
}
function syncVideo() {
  if (!visible || document.hidden || pausedByUser || pointer?.dragging) {
    video.pause();
    return;
  }
  video.play().catch(error => {
    if (error.name !== 'AbortError') {
      autoplayBlocked = true;
      refreshPlayback();
      indicator.textContent = ui.retry;
    }
  });
}
function seek(time) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = Math.min(Math.max(0, time), video.duration - 0.02);
}
playback.addEventListener('click', () => {
  pausedByUser = !video.paused;
  autoplayBlocked = false;
  syncVideo();
});
video.addEventListener('play', refreshPlayback);
video.addEventListener('pause', refreshPlayback);
video.addEventListener('playing', () => { indicator.textContent = ''; autoplayBlocked = false; });
video.addEventListener('error', () => { indicator.textContent = ui.error; });
scene.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || !Number.isFinite(video.duration)) return;
  pointer = {id:event.pointerId, x:event.clientX, y:event.clientY, time:video.currentTime, dragging:false};
  scene.setPointerCapture(event.pointerId);
});
scene.addEventListener('pointermove', event => {
  if (pointer?.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  if (!pointer.dragging && (Math.abs(dx) < 7 || Math.abs(dx) <= Math.abs(dy))) return;
  pointer.dragging = true;
  video.pause();
  const time = pointer.time + dx / scene.clientWidth * video.duration;
  seek((time % video.duration + video.duration) % video.duration);
  scene.style.setProperty('--scan', Math.max(0, Math.min(100, (event.clientX - scene.getBoundingClientRect().left) / scene.clientWidth * 100)) + '%');
});
function finish(event) {
  if (pointer?.id !== event.pointerId) return;
  const wasDragging = pointer.dragging;
  pointer = undefined;
  scene.style.removeProperty('--scan');
  if (wasDragging && !autoplayBlocked) syncVideo();
}
['pointerup','pointercancel','lostpointercapture'].forEach(name => scene.addEventListener(name, finish));
scene.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  seek(video.currentTime + (event.key === 'ArrowLeft' ? -0.5 : 0.5));
});
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  syncVideo();
}, {threshold:0.15}).observe(scene);
document.addEventListener('visibilitychange', syncVideo);

} else {
  const reset = document.querySelector('#rv-play');
  function move(event) {
    const rect = scene.getBoundingClientRect();
    scene.style.setProperty('--tilt-x', ((event.clientX - rect.left) / rect.width - 0.5) * 16 + 'deg');
    scene.style.setProperty('--tilt-y', ((event.clientY - rect.top) / rect.height - 0.5) * -12 + 'deg');
  }
  function clear() {
    scene.style.removeProperty('--tilt-x');
    scene.style.removeProperty('--tilt-y');
  }
  scene.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' || scene.hasPointerCapture(event.pointerId)) move(event);
  });
  scene.addEventListener('pointerdown', event => {
    if (event.isPrimary && event.button === 0) scene.setPointerCapture(event.pointerId);
  });
  ['pointerleave','pointerup','pointercancel','lostpointercapture'].forEach(name => scene.addEventListener(name, clear));
  scene.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') clear();
    else scene.style.setProperty('--tilt-x', event.key === 'ArrowLeft' ? '-9deg' : '9deg');
  });
  reset.addEventListener('click', clear);
}
document.querySelectorAll('video[data-loop]').forEach(film => {
  let manuallyPaused = false;
  let onScreen = false;
  const button = film.parentElement.querySelector('button');
  function sync() {
    if (!onScreen || document.hidden || manuallyPaused) film.pause();
    else film.play().catch(() => {});
  }
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }, {threshold:0.2}).observe(film);
  document.addEventListener('visibilitychange', sync);
  button.addEventListener('click', () => { manuallyPaused = !film.paused; sync(); });
  film.addEventListener('play', () => { button.textContent = ui.pause; });
  film.addEventListener('pause', () => { button.textContent = ui.play; });
});
const track = document.querySelector('.rv-track');
const previous = document.querySelector('#rv-prev');
const next = document.querySelector('#rv-next');
const cards = [...track.children];
const scrollOptions = () => ({behavior:reduced.matches ? 'instant' : 'smooth'});
const cardOffset = card => card.offsetLeft - cards[0].offsetLeft;
function syncCards() {
  const center = track.getBoundingClientRect().left + track.clientWidth / 2;
  const distance = card => { const r = card.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - center); };
  const active = cards.reduce((nearest, card) => distance(card) < distance(nearest) ? card : nearest);
  cards.forEach(card => card.classList.toggle('is-active', card === active));
  previous.disabled = track.scrollLeft < 2;
  next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
}
function step(direction) {
  const offsets = cards.map(cardOffset);
  const target = direction > 0 ? offsets.find(offset => offset > track.scrollLeft + 4) : offsets.reverse().find(offset => offset < track.scrollLeft - 4);
  track.scrollTo({left:target ?? (direction > 0 ? track.scrollWidth - track.clientWidth : 0), ...scrollOptions()});
}
previous.addEventListener('click', () => step(-1));
next.addEventListener('click', () => step(1));
track.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  step(event.key === 'ArrowRight' ? 1 : -1);
});
track.addEventListener('scroll', syncCards, {passive:true});
window.addEventListener('resize', syncCards);
syncCards();
let grip;
track.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  grip = {id:event.pointerId, x:event.clientX, left:track.scrollLeft};
  track.setPointerCapture(event.pointerId);
  track.classList.add('is-dragging');
});
track.addEventListener('pointermove', event => {
  if (event.pointerId === grip?.id) track.scrollLeft = grip.left + grip.x - event.clientX;
});
function release() {
  if (!grip) return;
  grip = undefined;
  track.classList.remove('is-dragging');
}
['pointerup','pointercancel','lostpointercapture'].forEach(name => track.addEventListener(name, release));

const highlights = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
}, {rootMargin:'-12% 0px -17% 0px'});
document.querySelectorAll('.rv-reveal').forEach(element => highlights.observe(element));

const links = [...document.querySelectorAll('.rv-nav a')];
const sections = links.map(link => document.querySelector(link.hash));
const header = document.querySelector('.rv-header');
let pending = false;
function syncPage() {
  pending = false;
  const height = document.documentElement.scrollHeight - innerHeight;
  header.style.setProperty('--progress', height > 0 ? Math.min(1, scrollY / height) : 0);
  const active = sections.reduce((current, section, index) => section.getBoundingClientRect().top <= innerHeight * 0.36 ? index : current, -1);
  links.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', () => {
  if (!pending) { pending = true; requestAnimationFrame(syncPage); }
}, {passive:true});
syncPage();
(()=>{const f=document.querySelector('#buyer-form');f?.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;const d=new FormData(f);const body=[subject,'',...['market','type','company','plan','request'].map(k=>ui[k]+': '+d.get(k))].join('\n');location.href='mailto:info@aestyve.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)})})();
})();

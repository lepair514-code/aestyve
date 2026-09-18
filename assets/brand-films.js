const triggers = [...document.querySelectorAll('[data-ae-films]')];
if (triggers.length && typeof HTMLDialogElement !== 'undefined') {
  const lang = document.documentElement.lang.split('-')[0];
  const copy = {
    ko: {title: 'Aestyve · Motion Gallery', close: '영상 닫기', group: '재생할 영상', brand: '브랜드', note: '브랜드 연출 영상입니다. 제품 표기는 ', specs: '패키지 사진과 사양 안내', end: '를 확인하세요.', error: '영상을 불러오지 못했습니다. 아래에서 다른 영상을 선택하거나 ', file: '영상 파일 열기'},
    en: {title: 'Aestyve · Motion Gallery', close: 'Close films', group: 'Choose a film', brand: 'Brand', note: 'Brand motion films. For product labeling, see ', specs: 'package photography and specifications', end: '.', error: 'This film could not load. Choose another below or ', file: 'open the video file'},
    zh: {title: 'Aestyve · 动态影像', close: '关闭影像', group: '选择影像', brand: '品牌', note: '品牌创意影像。产品标识请参阅', specs: '包装照片与产品规格', end: '。', error: '影像未能加载。请选择其他影像或', file: '打开视频文件'}
  }[lang] || null;
  if (copy) {
    const base = new URL('./brand-films/', import.meta.url);
    const films = ['brand', 'alpha', 'beta', 'gamma'];
    const dialog = document.createElement('dialog');
    dialog.className = 'ae-films-dialog';
    dialog.setAttribute('aria-labelledby', 'ae-films-title');
    // All interpolated strings below are authored locale strings, not external data.
    dialog.innerHTML = `<header class="ae-films-head"><h2 id="ae-films-title">${copy.title}</h2><button type="button" class="ae-films-close" aria-label="${copy.close}" autofocus>×</button></header><div class="ae-films-stage"><video controls playsinline muted preload="none" aria-label="Aestyve Brand"></video></div><p class="ae-films-error" role="status" hidden>${copy.error}<a>${copy.file}</a></p><div class="ae-films-selector" role="group" aria-label="${copy.group}">${films.map((film, i) => `<button type="button" data-film="${film}" aria-pressed="${i === 0}">${i === 0 ? copy.brand : film[0].toUpperCase() + film.slice(1)}</button>`).join('')}</div><p class="ae-films-note">${copy.note}<a href="product-ha.html#collection">${copy.specs}</a>${copy.end}</p>`;
    document.body.append(dialog);
    const video = dialog.querySelector('video');
    const error = dialog.querySelector('.ae-films-error');
    const buttons = [...dialog.querySelectorAll('[data-film]')];
    let opener;
    function select(film, play = true) {
      video.pause();
      error.hidden = true;
      video.poster = new URL(`${film}.webp`, base).href;
      video.src = new URL(`${film}.mp4`, base).href;
      video.setAttribute('aria-label', `Aestyve ${film[0].toUpperCase() + film.slice(1)}`);
      error.querySelector('a').href = video.src;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.film === film)));
      video.load();
      // Playback only follows a real activation. Native controls remain available
      // if a browser or data-saving setting declines it.
      if (play) video.play().catch(() => {});
    }
    triggers.forEach(trigger => trigger.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = trigger;
      dialog.showModal();
      document.documentElement.classList.add('ae-film-open');
      select('brand');
    }));
    buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.film)));
    dialog.querySelector('.ae-films-close').addEventListener('click', () => dialog.close());
    // Close only a click which both begins and ends on the backdrop, never a
    // pointer drag from native media controls onto it.
    let backdropDown = false;
    const outside = event => {
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog && outside(event); });
    dialog.addEventListener('click', event => {
      if (backdropDown && event.target === dialog && outside(event)) dialog.close();
      backdropDown = false;
    });
    dialog.addEventListener('close', () => {
      video.pause();
      video.removeAttribute('src');
      video.removeAttribute('poster');
      video.load();
      error.hidden = true;
      document.documentElement.classList.remove('ae-film-open');
      opener?.focus({preventScroll: true});
    });
    video.addEventListener('error', () => { if (dialog.open && video.hasAttribute('src')) error.hidden = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
    window.addEventListener('pagehide', () => video.pause());
  }
}

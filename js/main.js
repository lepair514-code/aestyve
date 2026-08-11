/**
 * Aestyve Main JavaScript
 * 폰트: S-Core Dream 적용
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     1. 헤더 스크롤 처리
  ───────────────────────────────────── */
  const header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.remove('transparent');
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────────────────────────────────
     2. 모바일 메뉴
  ───────────────────────────────────── */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      this.classList.toggle('open');
    });

    // 모바일 메뉴 링크 클릭 시 닫기
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('open');
      });
    });
  }

  /* ─────────────────────────────────────
     3. 히어로 슬라이더
  ───────────────────────────────────── */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startAutoPlay() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    clearInterval(slideInterval);
  }

  if (slides.length > 0) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stopAutoPlay();
        goToSlide(i);
        startAutoPlay();
      });
    });
    startAutoPlay();
  }

  /* ─────────────────────────────────────
     4. 제품 탭 필터
  ───────────────────────────────────── */
  const productTabs = document.querySelectorAll('.product-tab');
  const productCards = document.querySelectorAll('.product-card');

  productTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      productTabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      var filter = this.dataset.filter;
      productCards.forEach(function (card) {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else {
          var cats = (card.dataset.category || '').split(',');
          if (cats.includes(filter)) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });

  /* ─────────────────────────────────────
     5. 언어 토글 (KOR / ENG)
  ───────────────────────────────────── */
  var currentLang = localStorage.getItem('aestyve_lang') || 'ko';
  var langBtns = document.querySelectorAll('.lang-btn');

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('aestyve_lang', lang);

    // lang-btn 활성화
    langBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // data-ko / data-en 속성이 있는 요소 텍스트 교체
    document.querySelectorAll('[data-ko][data-en]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text) el.textContent = text;
    });

    // placeholder 처리
    document.querySelectorAll('[data-placeholder-ko][data-placeholder-en]').forEach(function (el) {
      var ph = el.getAttribute('data-placeholder-' + lang);
      if (ph) el.placeholder = ph;
    });

    // 히어로 제목 한/영 토글 (title-main-ko / title-main-en)
    document.querySelectorAll('.title-main-ko').forEach(function (el) {
      el.style.display = lang === 'ko' ? 'block' : 'none';
    });
    document.querySelectorAll('.title-main-en').forEach(function (el) {
      el.style.display = lang === 'en' ? 'block' : 'none';
    });

    // hero-badge 텍스트는 data-ko / data-en으로 이미 처리됨
  }

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(this.dataset.lang);
    });
  });

  // 페이지 로드 시 적용
  applyLang(currentLang);

  /* ─────────────────────────────────────
     6. 스무스 스크롤 (앵커 링크)
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = 80; // 헤더 높이
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────────
     7. 문의 폼 처리
  ───────────────────────────────────── */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast(currentLang === 'ko' ? '문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.' : 'Your inquiry has been received. We will contact you soon.', 'success');
      contactForm.reset();
    });
  }

  /* ─────────────────────────────────────
     8. 스크롤 애니메이션 (Intersection Observer)
  ───────────────────────────────────── */
  var animatedEls = document.querySelectorAll(
    '.science-card, .academy-card, .news-item, .stat-item, .product-card, .product-featured'
  );

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  animatedEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });

  /* ─────────────────────────────────────
     9. 토스트 유틸
  ───────────────────────────────────── */
  function showToast(msg, type) {
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    document.body.appendChild(el);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('show');
      });
    });

    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 400);
    }, 3000);
  }

  // 전역에서 사용 가능하도록
  window.showToast = showToast;

})();

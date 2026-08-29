/**
 * Aestyve CMS Bridge
 * localStorage 'aestyve_admin_data' → 홈페이지 DOM 실시간 반영
 * admin 저장 → StorageEvent → 홈페이지 자동 업데이트
 */

(function() {
  'use strict';

  /* ── 연락처 / 푸터 업데이트 ── */
  function applyContact(data) {
    if (!data || !data.site) return;
    const s = data.site;

    // 푸터 이메일
    const footerEmail = document.querySelector('.footer-contact-email');
    if (footerEmail && s.email) footerEmail.textContent = s.email;

    // 푸터 주소
    const footerAddr = document.querySelector('.footer-contact-address');
    if (footerAddr && s.address_ko) footerAddr.textContent = s.address_ko;

    // 푸터 전화
    const footerPhone = document.querySelector('.footer-contact-phone');
    if (footerPhone && s.phone) footerPhone.textContent = s.phone;
  }

  /* ── 히어로 섹션 업데이트 ── */
  function applyHero(data) {
    if (!data || !data.hero || !data.hero[0]) return;
    const h = data.hero[0];

    const heroEyebrow = document.querySelector('.hero .eyebrow');
    if (heroEyebrow && h.badge_ko) heroEyebrow.textContent = 'AESTYVE · ' + h.badge_ko.toUpperCase();

    const heroLead = document.querySelector('.hero-lead');
    if (heroLead && h.desc_ko) heroLead.textContent = h.desc_ko;
  }

  /* ── 전체 반영 ── */
  function applyAll(data) {
    try {
      applyContact(data);
      applyHero(data);
    } catch(e) {
      console.warn('[CMS Bridge] applyAll error:', e);
    }
  }

  /* ── 초기 로드 ── */
  function init() {
    const saved = localStorage.getItem('aestyve_admin_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        applyAll(data);
      } catch(e) {
        console.warn('[CMS Bridge] init parse error:', e);
      }
    }
  }

  /* ── StorageEvent 실시간 반영 ── */
  window.addEventListener('storage', function(e) {
    if (e.key === 'aestyve_admin_data' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        applyAll(data);
      } catch(e2) {
        console.warn('[CMS Bridge] storage event parse error:', e2);
      }
    }
  });

  /* ── DOMContentLoaded 후 실행 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

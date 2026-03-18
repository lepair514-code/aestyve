# Aestyve — 공식 홈페이지 (3CE 스타일 리뉴얼)

## 프로젝트 개요
- **브랜드**: Aestyve (에스티브) — 피부과학 기반 뷰티 브랜드
- **스타일**: 3CE 공식 홈페이지 무드 (미니멀, 타이포 중심, 컬러 블록)
- **구성**: 정적 HTML/CSS/JS + LocalStorage 기반 관리자 CMS
- **다국어**: 한국어(ko) / 영어(en) / 중국어 간체(zh-CN) / 태국어(th)

---

## 파일 구조
```
index.html          ← 메인 홈페이지
admin.html          ← 관리자 CMS
css/
  style.css         ← 3CE 스타일 미니멀 CSS
js/
  main.js           ← 홈페이지 렌더 + 기능
  admin.js          ← 관리자 CRUD + Import/Export
data/
  content.json      ← 콘텐츠 데이터 (이 파일을 교체해 전체 수정)
images/
  logo.png          ← Aestyve 로고
README.md
```

---

## 완성된 기능

### 홈페이지 (index.html)
- ✅ 공지 바 (노출 on/off, 다국어)
- ✅ 스티키 헤더 + 데스크탑 네비게이션
- ✅ 햄버거 메뉴 (모바일)
- ✅ 언어 토글 (🇰🇷🇺🇸🇨🇳🇹🇭) → localStorage 저장, URL ?lang= 지원
- ✅ 히어로 슬라이더 (자동 5.5초, 수동 화살표/닷 내비게이션, 터치 스와이프)
- ✅ 신뢰 배지 바
- ✅ 카테고리 그리드 (컬러 블록 기반)
- ✅ 제품 그리드 + ALL/NEW/BEST 탭 필터
- ✅ 브랜드 스토리 + 통계
- ✅ 리뷰 슬라이더 (자동 4초)
- ✅ 연락처 섹션
- ✅ 푸터
- ✅ 토스트 알림
- ✅ content.json 로드 실패 시 에러 메시지 표시

### 관리자 (admin.html)
- ✅ 사이드바 내비게이션 + 섹션 전환
- ✅ 사이트 설정 (브랜드명, 색상, 공지바, 슬로건, 브랜드 스토리, 통계, 연락처, SNS)
- ✅ 히어로 배너 CRUD + 순서 변경
- ✅ 카테고리 CRUD + 순서 변경
- ✅ 제품 CRUD + 순서 변경 + 카테고리 설정
- ✅ 리뷰 CRUD + 순서 변경
- ✅ 모달 편집 (다국어 탭 기반)
- ✅ JSON Export (다운로드)
- ✅ JSON Import (파일 업로드 / 텍스트 붙여넣기)
- ✅ Reset (기본값 초기화)
- ✅ localStorage 자동 저장

---

## 콘텐츠 수정 방법

### 관리자 페이지에서 수정
1. `admin.html` 열기
2. 원하는 섹션 선택 후 수정
3. 저장 버튼 클릭 → localStorage에 즉시 반영
4. **다른 기기/사용자에게 반영하려면**: Import/Export 메뉴에서 JSON 다운로드 → GitHub `data/content.json` 교체 → Vercel 자동 재배포

### 직접 파일 수정
`data/content.json`을 직접 편집 후 GitHub에 푸시하면 Vercel이 자동 재배포합니다.

---

## 배포 (Vercel)
1. GitHub 저장소에 이 폴더 내용물 업로드
2. Vercel → Add New Project → 해당 저장소 선택 → Deploy
3. **Root Directory**: 파일들이 있는 폴더명 (예: `aestyve-site`)
4. Framework Preset: **Other** (빌드 명령 없음)
5. `www.aestyve.com` 연결: Settings → Domains → Add

### 로컬 테스트
```bash
# content.json fetch가 필요하므로 반드시 서버 실행 필요
python -m http.server 8080
# 또는
npx serve .
```

---

## 다국어 언어 코드
| 코드 | 언어 | 플래그 |
|------|------|--------|
| `ko` | 한국어 | 🇰🇷 |
| `en` | English | 🇺🇸 |
| `zh-CN` | 中文(简体) | 🇨🇳 |
| `th` | ภาษาไทย | 🇹🇭 |

URL 예시: `https://www.aestyve.com?lang=zh-CN`

---

## 미구현 / 향후 개선 항목
- [ ] admin.html 비밀번호 보호 (Vercel Edge Middleware 필요)
- [ ] 제품 상세 페이지
- [ ] 장바구니 / 주문 기능
- [ ] 이미지 업로드 (서버 필요)
- [ ] 팝업 공지
- [ ] 블로그/뉴스 섹션

---

*마지막 업데이트: 2025*

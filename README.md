# Aestyve (에스티브) Official Website

> 멀츠에스테틱(merz.co.kr) 구조를 기반으로 제작된 에스티브 공식 홈페이지

---

## 🌐 라이브 URL

- **홈페이지**: `https://www.aestyve.com`
- **관리자 페이지**: `https://www.aestyve.com/admin.html`

---

## 📁 파일 구조

```
/
├── index.html          ← 메인 홈페이지
├── admin.html          ← 관리자 패널
├── css/
│   └── style.css       ← 전체 스타일
├── js/
│   ├── main.js         ← 홈페이지 스크립트 (콘텐츠 렌더링, 슬라이더, 다국어)
│   └── admin.js        ← 관리자 스크립트 (CRUD, JSON 편집)
├── data/
│   └── content.json    ← CMS 콘텐츠 데이터 (이 파일로 모든 내용 관리)
└── README.md
```

---

## ✅ 구현된 섹션 (멀츠에스테틱 구조 기반)

| 섹션 | 설명 |
|------|------|
| **Header** | 투명 → 스크롤 시 화이트 전환, 드롭다운 메뉴, KOR/ENG 토글, ADMIN 버튼 |
| **Hero** | 자동재생 슬라이더 (3개 슬라이드), 도트 컨트롤, 스크롤 인디케이터 |
| **Mission Ticker** | 무한 스크롤 미션 밴드 (Navy 배경) |
| **About** | 브랜드 소개 + 통계 수치 4개, 이미지 placeholder |
| **Products** | Featured 1906NAD+ + Grid 4개 (Liquid PCL, Revibe, HA FILLER, INNOFILL PLLA) |
| **Science** | 임상연구/바이오테크/안전성 3항목 |
| **Academy** | 마스터클래스/심포지엄/웨비나 3카드 (다크 배경) |
| **News** | 스티키 헤더 + 뉴스 리스트 |
| **Contact** | 연락처 정보 + 문의 폼 |
| **Footer** | 4컬럼 링크 + SNS + 저작권 + Admin 접근 링크 |

---

## 🎨 디자인 시스템

- **Primary**: `#1a1a2e` (딥 네이비)
- **Accent**: `#c8a97e` (골드)
- **Font**: Noto Sans KR (한국어), Playfair Display (영어 serif)
- **반응형**: Desktop (1280px) / Tablet (1024px) / Mobile (768px / 480px)

---

## 🛠 관리자 패널 기능

### 편집 가능 섹션 (9개)
1. 대시보드
2. 사이트 설정 (브랜드명, 로고, 연락처)
3. 히어로 슬라이더 (추가/삭제/순서변경)
4. 회사 소개 (텍스트, 이미지, 통계)
5. 제품 관리 (Featured + Grid, CRUD)
6. 과학/기술
7. 아카데미
8. 뉴스 관리 (CRUD)
9. 푸터 (SNS, 저작권)

### 데이터 관리
- **JSON 다운로드**: 수정된 콘텐츠를 `content.json`으로 내보내기
- **JSON 가져오기**: 기존 `content.json` 파일 불러오기
- **JSON 직접 편집**: 코드 에디터로 직접 수정
- **초기화**: 기본값으로 리셋

### 관리자 접근 방법
1. 헤더 우측 **ADMIN** 버튼
2. 푸터 하단 **Admin** 링크
3. 모바일 메뉴 **ADMIN** 항목
4. 직접 URL: `/admin.html`

---

## 📦 제품 데이터 (5개)

| 제품 | 이미지 | 카테고리 |
|------|--------|----------|
| 1906NAD+ (Featured) | https://www.genspark.ai/api/files/s/68YDgq7B | BEST, NEW |
| Liquid PCL | https://www.genspark.ai/api/files/s/6cpItebx | NEW |
| Revibe | https://www.genspark.ai/api/files/s/pQDECzpb | NEW |
| HA FILLER Series | https://www.genspark.ai/api/files/s/kuvuKo9K | BEST |
| INNOFILL PLLA | https://www.genspark.ai/api/files/s/kyWBJBlj | NEW |

---

## 🚀 배포 방법 (Vercel)

### 요구사항 체크
- `index.html`이 루트에 위치
- `data/content.json` 반드시 포함
- Vercel Root Directory: 비어 있음 (`.`)

### 배포 단계
1. GitHub 저장소에 모든 파일 업로드
2. Vercel에서 자동 배포
3. `www.aestyve.com` 도메인 연결 확인

---

## 🔄 콘텐츠 업데이트 방법

```
1. admin.html 접속
   ↓
2. 원하는 섹션 편집
   ↓
3. JSON 다운로드 클릭
   ↓
4. GitHub에 data/content.json 업로드 (덮어쓰기)
   ↓
5. Vercel 자동 재배포 (1~3분)
   ↓
6. www.aestyve.com 확인
```

---

## 🔮 추후 개발 예정

- [ ] 이미지 업로드 직접 기능 (현재: URL 입력 방식)
- [ ] 다국어 추가 (중국어, 일본어, 태국어)
- [ ] 제품 상세 페이지
- [ ] 아카데미 신청 폼
- [ ] 뉴스 상세 페이지
- [ ] 검색 기능

---

© 2026 Aestyve. All Rights Reserved.

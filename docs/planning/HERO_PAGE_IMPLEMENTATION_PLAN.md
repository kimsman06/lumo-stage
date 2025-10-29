# Hero 페이지 상세 구현 계획

**기준 문서:** `HERO_PAGE_STRATEGY.md`

## 목표
- 전략 문서에 명시된 디자인과 기능에 따라 Hero 페이지를 컴포넌트 단위로 나누어 체계적으로 구현합니다.
- `framer-motion`을 활용하여 사용자 경험을 향상시키는 동적 애니메이션을 적용합니다.

## 작업 계획 (To-Do List)

- [ ] **1. 파일 구조 생성**: `HERO_PAGE_STRATEGY.md`에 명시된 대로 `components/hero` 디렉토리와 하위 컴포넌트 파일(`Navbar.jsx`, `HeroSection.jsx`, `FeatureSection.jsx`, `Footer.jsx`)을 생성합니다. 기존 `pages/HeroPage.jsx`는 `pages/HomePage.jsx`로 이름을 변경하고 내용을 초기화합니다.
- [ ] **2. Navbar 구현**: `lucide-react` 아이콘과 `Button`을 사용하여 네비게이션 바를 구현합니다.
- [ ] **3. HeroSection 구현**: 헤드라인, 소제목, 2개의 CTA 버튼 그룹을 포함하는 Hero 섹션을 구현합니다.
- [ ] **4. FeatureSection 구현**: 3개의 `Card` 컴포넌트를 사용하여 주요 기능 소개 섹션을 구현합니다.
- [ ] **5. Footer 구현**: 저작권 정보와 소셜 미디어 링크를 포함하는 푸터를 구현합니다.
- [ ] **6. HomePage 조합 및 애니메이션**: 생성된 모든 컴포넌트를 `HomePage.jsx`로 가져와 최종 레이아웃을 완성하고, `framer-motion`을 사용해 페이지 로드 애니메이션을 적용합니다.
- [ ] **7. Git 커밋**: 완성된 Hero 페이지 작업을 커밋합니다.

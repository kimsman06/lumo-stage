# Hero Page 디자인 및 라우팅 리팩토링 계획

## 목표
- 서비스의 첫인상을 결정하는 Hero Page를 `shadcn/ui` 컴포넌트를 활용하여 디자인합니다.
- 기존 3D 에디터 기능을 `/editor` 경로로 분리하고, 루트 경로(`/`)에는 Hero Page가 표시되도록 라우팅 구조를 재설계합니다.

## 작업 계획 (To-Do List)

- [ ] **1. 라우터 및 페이지 구조 설정**: `react-router-dom`을 사용하여 `/`와 `/editor` 경로를 설정합니다. 기존 `App.jsx`의 3D 에디터 내용은 `/editor` 경로의 `EditorPage` 컴포넌트로 분리합니다.
- [ ] **2. Hero Page 컴포넌트 생성**: `shadcn/ui`의 `Button`과 `Card` 등을 사용하여 Hero Page의 기본 레이아웃과 CTA 버튼을 포함하는 `HeroPage` 컴포넌트를 생성합니다.
- [ ] **3. 라우팅 적용**: 생성된 `HeroPage`를 `/` 경로에, `EditorPage`를 `/editor` 경로에 연결하여 전체 라우팅 시스템을 완성합니다.
- [ ] **4. Git 커밋**: 완료된 작업을 커밋하여 버전 관리를 합니다.

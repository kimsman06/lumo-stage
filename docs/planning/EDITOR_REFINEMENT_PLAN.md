# 에디터 패널 UI 개선 계획

**기준 문서:** `DesignStargey.md`

## 목표
- 현재 분리된 에디터 패널 컴포넌트들을 `shadcn/ui`를 사용하여 현대적이고 통합된 디자인으로 재구축합니다.
- `/editor-panel-test` 경로에서 UI를 안전하게 개발하고, 완료 후 실제 에디터에 적용합니다.

## 작업 계획 (To-Do List)

- [ ] **1. 테스트 환경 구축**
    -   `pages/EditorPanelTestPage.jsx` 파일을 생성합니다.
    -   `App.jsx`에 `/editor-panel-test` 라우트를 추가하여 위 페이지를 렌더링하도록 설정합니다.
    -   테스트 페이지에 UI 개발에 필요한 가짜 데이터(mock data)를 정의합니다. (예: 조명, 카메라, 마네킹 상태)

- [ ] **2. 신규 에디터 컴포넌트 구조 설계 및 생성**
    -   `components/editor` 디렉토리를 생성합니다.
    -   `LightCard.jsx`: 개별 조명 제어 UI (`Card`, `Slider`, `Popover` 활용).
    -   `LightsControl.jsx`: 조명 목록 및 '조명 추가' 기능.
    -   `CameraControl.jsx`: 카메라 위치, 타겟, 렌즈(FOV) 제어.
    -   `MannequinControl.jsx`: 마네킹 포즈 프리셋 및 개별 관절 제어.
    -   `NewEditorPanel.jsx`: 위 컴포넌트들을 `Tabs`와 `ScrollArea`로 조합하는 메인 패널.

- [ ] **3. 테스트 페이지에서 UI 컴포넌트 구현**
    -   `NewEditorPanel.jsx`을 `EditorPanelTestPage.jsx`에서 렌더링합니다.
    -   가짜 데이터를 사용하여 각 UI 컴포넌트(`LightCard`, `CameraControl` 등)의 레이아웃과 스타일을 `shadcn/ui`로 구현합니다.

- [ ] **4. 실제 에디터에 통합**
    -   `EditorPanel.jsx`의 내용을 `NewEditorPanel.jsx`으로 교체합니다.
    -   가짜 데이터 대신 `zustand` 스토어의 실제 데이터를 사용하도록 로직을 연결합니다.

- [ ] **5. 정리 작업**
    -   `App.jsx`에서 `/editor-panel-test` 라우트를 제거합니다.
    -   `pages/EditorPanelTestPage.jsx` 파일을 삭제합니다.
    -   더 이상 사용하지 않는 구버전 에디터 컴포넌트(`Controls.jsx` 등)를 정리합니다.

- [ ] **6. Git 커밋**: 완성된 에디터 패널 개선 작업을 커밋합니다.

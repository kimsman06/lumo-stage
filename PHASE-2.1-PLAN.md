# LumoStage: Phase 2.1 Plan

- [x] **1. `zustand` 스토어 확장:**
    - `selectedLight` 상태(초기값: `null`)와 `setSelectedLight` 액션을 추가하여 현재 선택된 조명을 관리합니다.
- [x] **2. `App.jsx` 리팩토링:**
    - **`Light` 컴포넌트 분리:** 3D Scene 내에서 각 조명을 렌더링하는 로직을 별도의 `Light` 컴포넌트로 분리하여 코드 가독성을 높입니다.
    - **조명 시각화 및 선택:** `Light` 컴포넌트 내에 작은 `<Sphere>`를 추가하여 조명의 위치를 시각적으로 표시하고, 클릭 시 `setSelectedLight` 액션을 호출하여 자신을 선택된 조명으로 설정하는 로직을 구현합니다.
    - **`<TransformControls>` 연동:**
        - `Scene` 컴포넌트에서 `selectedLight` 상태를 구독합니다.
        - 선택된 조명이 있을 경우, 해당 조명에 `<TransformControls>`를 붙여 3D 이동 도구를 활성화합니다.
        - 사용자가 이동 도구를 조작하여 드래그를 멈추는 시점에(`onMouseUp`), 변경된 위치를 `zustand` 스토어에 업데이트하는 로직을 추가합니다.
- [x] **3. Git 커밋:** 완료된 Phase 2.1 작업을 커밋합니다.
# LumoStage: Phase 3 Plan (카메라 제어 기능)

## 목표
- 사용자가 3D Scene의 가상 카메라를 UI 컨트롤을 통해 제어할 수 있도록 합니다.
- PRD 문서의 "4.3. 카메라 제어 (Camera Controls)" 기능 명세를 구현합니다.

## 세부 계획

- [ ] **1. `zustand` 스토어 확장 (Store Extension):**
    - 카메라 상태를 관리하기 위한 `cameraState` 객체를 스토어에 추가합니다.
    - `cameraState`는 다음 속성을 포함합니다:
        - `position`: `[x, y, z]` 형태의 배열
        - `target`: `[x, y, z]` 형태의 배열
        - `fov`: 숫자 (화각)
    - `cameraState`를 업데이트하기 위한 `updateCameraState(property, value)` 액션을 새로 구현합니다.

- [ ] **2. `Controls.jsx` UI 업데이트 (UI Update):**
    - 컨트롤 패널에 "카메라 제어" 섹션을 새로 추가합니다.
    - "카메라 제어" 섹션 내에 다음 UI 요소들을 추가합니다:
        - **카메라 위치 (Position):** X, Y, Z 축을 제어하는 슬라이더 3개.
        - **카메라 타겟 (Target):** X, Y, Z 축을 제어하는 슬라이더 3개.
        - **화각 (Field of View):** FOV 값을 제어하는 슬라이더 1개.
    - 각 슬라이더는 `updateCameraState` 액션을 호출하여 스토어의 상태를 업데이트합니다.

- [ ] **3. `Scene.jsx` 3D 렌더링 업데이트 (Scene Update):**
    - `<Canvas>` 컴포넌트의 `camera` prop을 스토어의 `cameraState`와 연동합니다.
    - `OrbitControls`가 사용자가 직접 카메라를 조작할 때와 UI 컨트롤을 통해 카메라가 변경될 때 충돌하지 않도록 `makeDefault`와 `target` prop을 설정하고, 필요 시 `useEffect`를 통해 `OrbitControls`의 상태를 동기화합니다.

- [ ] **4. Git 커밋 (Git Commit):**
    - Phase 3의 모든 변경 사항을 커밋합니다.

# LumoStage: Phase 4 Plan (고급 카메라 컨트롤 및 UX 개선)

## 목표
- 실제 카메라 워크플로우와 유사한 경험을 제공하기 위해 카메라 뷰 모드를 추가합니다.
- FOV 단위를 각도(degree)에서 초점 거리(mm)로 변경하여 더 직관적인 제어를 제공합니다.
- 'w', 'e' 단축키를 도입하여 이동/회전 모드 전환을 빠르게 할 수 있도록 UX를 개선합니다.

## 세부 계획

- [ ] **1. `zustand` 스토어 확장 (Store Extension):**
    - **뷰 모드 상태:** `viewMode` 상태를 추가합니다. (값: `'free'` 또는 `'camera'`)
    - **뷰 모드 액션:** `setViewMode(mode)` 액션을 새로 구현합니다.
    - **카메라 상태 수정:** `cameraState`의 `fov`를 `focalLength` (mm)로 변경하고, 기본값을 설정합니다. (예: `50mm`)
    - **카메라 업데이트 액션:** `updateCameraState`가 `focalLength`를 처리하도록 수정합니다.

- [ ] **2. `Controls.jsx` UI 업데이트 (UI Update):**
    - **뷰 모드 전환 UI:** "자유 시점 (Free View)"과 "카메라 시점 (Camera View)"을 전환할 수 있는 버튼 그룹을 추가합니다.
    - **FOV 컨트롤 수정:** "Field of View" 슬라이더의 라벨과 단위를 "초점 거리 (Focal Length)" (mm)로 변경하고, 그에 맞는 `min`, `max`, `step` 값을 설정합니다. (예: 18mm ~ 200mm)

- [ ] **3. 단축키 기능 구현 (`App.jsx`):**
    - `App.jsx`에 전역 `keydown` 이벤트 리스너를 추가합니다.
    - 'w' 키를 누르면 `setTransformMode('translate')` 액션을 호출합니다.
    - 'e' 키를 누르면 `setTransformMode('rotate')` 액션을 호출합니다.

- [ ] **4. `Scene.jsx` 3D 렌더링 업데이트 (Scene Update):**
    - **초점 거리 -> FOV 변환:** `CameraManager` 컴포넌트 내에서 스토어의 `focalLength` (mm) 값을 `THREE.PerspectiveCamera`가 사용하는 수직 FOV(degree) 값으로 변환하는 로직을 추가합니다. (공식: `fov = 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI)`)
    - **뷰 모드 로직:**
        - `viewMode`가 `'camera'`일 때:
            - `OrbitControls`를 비활성화합니다.
            - Scene의 렌더링 카메라를 스토어의 `cameraState`에 따라 설정된 가상 카메라로 고정합니다.
        - `viewMode`가 `'free'`일 때:
            - `OrbitControls`를 활성화합니다.
            - 사용자가 자유롭게 Scene을 탐색할 수 있도록 합니다.
    - **카메라 시점 시각화:** 자유 시점 모드일 때, Scene 안에 있는 가상 카메라의 위치와 방향을 시각적으로 보여주는 `CameraHelper`를 추가합니다.

- [ ] **5. Git 커밋 (Git Commit):**
    - Phase 4의 모든 변경 사항을 커밋합니다.

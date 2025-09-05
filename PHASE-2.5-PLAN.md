# LumoStage: Phase 2.5 Plan (직관적인 조명 컨트롤)

## 목표
- 조명 컨트롤을 더 직관적이고 현실 세계와 유사하게 개선합니다.
- 조명의 시각적 모델(아이콘)이 항상 타겟을 정확히 향하도록 수정합니다.

## 세부 계획

- [ ] **1. 조명 모델 방향 수정 (`lookAt` 문제 해결):**
    - `Scene.jsx`의 `useFrame` 로직을 수정하여, `Cone`과 `arrowHelper`의 기본 축을 보정한 후 `lookAt`을 적용하여 항상 타겟을 정확히 향하도록 수정합니다.

- [ ] **2. `TransformControls` 모드 전환 기능 구현:**
    - `zustand` 스토어에 `transformMode` 상태(`'translate'` 또는 `'rotate'`)를 추가합니다.
    - `Controls.jsx`에 이동 모드와 회전 모드를 전환할 수 있는 UI 버튼을 추가합니다.
    - `Scene.jsx`의 `TransformControls`가 스토어의 `transformMode`에 따라 이동 기즈모 또는 회전 기즈모를 표시하도록 설정합니다.

- [ ] **3. 기즈모를 이용한 회전 기능 구현:**
    - 회전 모드에서 조명의 시각적 모델(원뿔, 화살표)을 회전시키면, 그 회전 값에 따라 빛이 향하는 `targetPosition`이 자동으로 계산되어 업데이트되도록 구현합니다.
    - 이를 통해 사용자는 조명 자체를 회전시켜 빛의 방향을 바꿀 수 있게 됩니다.

- [ ] **4. Git 커밋 (Git Commit):**
    - Phase 2.5의 모든 변경 사항을 커밋합니다.

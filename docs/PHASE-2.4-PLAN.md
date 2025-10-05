# LumoStage: Phase 2.4 Plan (고급 조명 제어 및 삭제 기능)

## 목표

- 조명 제어 기능을 고도화하여 현실적인 라이팅 시뮬레이션 환경 제공.
- 사용자 편의를 위해 조명 삭제 기능 추가.

## 세부 계획

- [ ] **1. `zustand` 스토어 확장 (Store Extension):**

  - `rotation`, `distance`, `decay` 속성을 조명 객체에 다시 추가합니다.
  - `deleteLight(id)` 액션을 새로 구현합니다. 이 액션은 `lights` 배열에서 해당 `id`를 가진 조명 객체를 필터링하여 제거합니다.

- [ ] **2. `Controls.jsx` UI 업데이트 (UI Update):**

  - 각 조명 제어 카드에 '삭제' 버튼을 추가합니다. 이 버튼은 `deleteLight(light.id)` 액션을 호출합니다.
  - `rotation`, `distance`, `decay` 속성을 제어할 수 있는 UI 슬라이더를 다시 추가합니다.

- [ ] **3. `Scene.jsx` 3D 렌더링 업데이트 (Scene Update):**

  - `rotation`, `distance`, `decay` 속성을 스토어에서 받아와 해당 Three.js 조명 컴포넌트에 적용합니다.
  - `TransformControls`가 헬퍼의 `position`과 `rotation`을 조작할 수 있도록 구현하고, 변경 사항이 스토어에 반영되도록 합니다.

- [ ] **4. Git 커밋 (Git Commit):**
  - Phase 2.4의 모든 변경 사항을 커밋합니다.

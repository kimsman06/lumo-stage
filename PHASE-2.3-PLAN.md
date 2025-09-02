# LumoStage: Phase 2.3 Plan (고급 조명 제어 및 시각적 조명 기구)

- [ ] **1. `zustand` 스토어 확장:**
    - 각 조명 객체에 `rotation` 속성(Euler angles or Quaternion)을 추가합니다.
    - `PointLight` 및 `SpotLight`에 `distance` 및 `decay` 속성을 추가합니다.

- [ ] **2. `Controls.jsx` UI 업데이트:**
    - 각 조명 카드에 `rotation` (X, Y, Z) 슬라이더를 추가합니다.
    - `PointLight` 및 `SpotLight`에 `distance` 및 `decay` 슬라이더를 추가합니다.

- [ ] **3. `Scene.jsx` 3D 렌더링 업데이트:**
    - 각 조명에 `rotation` 속성을 적용합니다.
    - `PointLight` 및 `SpotLight`에 `distance` 및 `decay` 속성을 적용합니다.
    - **(New)** `SpotLightHelper` 및 `DirectionalLightHelper`를 추가하여 조명의 투영을 시각화합니다. 이 헬퍼들은 조명과 함께 움직이고 회전해야 합니다.
    - **(New)** `TransformControls`가 조명의 `rotation`도 제어할 수 있도록 `mode`를 확장합니다.

- [ ] **4. Git 커밋:**
    - Phase 2.3의 모든 변경 사항을 커밋합니다.
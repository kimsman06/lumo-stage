# LumoStage 아키텍처: 상태 및 이벤트 흐름

이 문서는 LumoStage 애플리케이션의 핵심 아키텍처, 특히 **Zustand를 사용한 상태 관리**와 **사용자 상호작용에 따른 이벤트 흐름**을 설명합니다.

---

## 최근 작업 요약 (2025-11-03)

- `editorStore`는 조명·디퓨저·마네킹·객체·카메라·배경·OrbitControls 상태와 선택 정보를 하나의 슬라이스로 통합했고, `projectStore`는 Scene 정규화/저장을 담당하도록 분리했습니다.
- Scene.jsx, Outliner, Properties Panel, Toolbar가 동일한 스토어를 구독하도록 리팩터링해 TransformControls와 UI가 항상 동기화됩니다.
- 저장/로드 흐름은 projectStore → API 클라이언트 → Express MVCS → MongoDB 순으로 확정되었고, 실패 시 토스트 및 재시도 로직까지 반영되었습니다.

## 1. 중앙 상태 관리: Zustand (`store.js`)

애플리케이션의 모든 핵심 데이터는 `store.js` 파일에 정의된 단일 Zustand 스토어에서 관리됩니다. 컴포넌트들은 이 스토어를 "구독"하고, 스토어의 데이터가 변경되면 자동으로 리렌더링됩니다.

`store.js`에는 마네킹, 선택 상태, 조명 배열, Transform 모드 등 장면 구성 요소가 모두 들어 있으며, EditorPanel·Scene·Mannequin 등 주요 컴포넌트가 이를 구독합니다. 변경은 `setBoneRotation`, `setSelectedLight`, `updateLight`와 같은 액션으로만 허용되며, 액션 호출 → 상태 업데이트 → 구독 컴포넌트 리렌더 순으로 흐릅니다.

- **상태 (State)**: 마네킹, 조명, 현재 선택된 객체, UI 모드 등 모든 정보가 객체 형태로 저장됩니다.
- **액션 (Actions)**: 상태를 변경할 수 있는 유일한 방법입니다. 예를 들어 `setBoneRotation` 액션은 특정 마네킹의 특정 뼈 회전 값을 업데이트합니다.
- **구독 (Subscription)**: `EditorPanel.jsx`은 마네킹과 조명 목록을 구독하여 UI를 그리고, `Scene.jsx`는 동일한 데이터를 구독하여 3D 객체를 렌더링합니다.

---

## 2. 사용자 이벤트 흐름 (Event Propagation)

사용자가 3D 씬이나 UI와 상호작용할 때 이벤트가 발생하고, 이는 상태 변경으로 이어집니다. 대표적인 두 가지 시나리오입니다.

### 시나리오 1: 사용자가 UI 슬라이더로 뼈를 회전시킬 때

1. 사용자가 `EditorPanel.jsx`의 뼈 회전 슬라이더를 조작한다.
2. 패널은 `setBoneRotation(id, boneName, axis, value)` 액션을 호출해 `mannequins` 슬라이스를 갱신한다.
3. Zustand 스토어는 변경된 `pose` 값을 구독 중인 `Mannequin.jsx`에 전달해 리렌더링을 트리거한다.
4. 마네킹 컴포넌트는 새로운 `pose` 데이터를 실제 3D 모델의 각 본에 반영해 화면을 업데이트한다.

### 시나리오 2: 사용자가 기즈모(Gizmo)로 조명을 움직일 때

1. 사용자가 Scene에서 조명 헬퍼를 클릭하면 `setSelectedLight`와 `selectMannequin(null)` 액션이 호출되어 선택 상태가 갱신된다.
2. 선택 변경을 감지한 Scene.jsx는 TransformControls를 해당 조명에 부착한다.
3. TransformControls 드래그 이벤트가 발생하면 Scene.jsx는 `updateLight(id, 'position', newPosition)`을 호출해 위치를 업데이트한다.
4. 스토어가 갱신되면 Scene.jsx가 다시 렌더링되며, 헬퍼와 실제 조명 모두 새로운 좌표를 반영한다.

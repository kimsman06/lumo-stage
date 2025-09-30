# PHASE 5: 마네킹 모델 통합 및 포즈 제어 기능 구현

## 목표
기존의 구(Sphere) 객체를 제거하고, 리깅(rigging)된 나무 마네킹 3D 모델을 장면에 렌더링합니다. 사용자가 마네킹의 주요 관절(joint)을 제어하여 원하는 포즈를 만들 수 있도록, 화면 좌측에 전용 컨트롤러 UI를 추가합니다.

---

### TO-DO LIST

#### 1. 기본 환경 설정 및 모델 로드
- [ ] **`@react-three/gltf` 설치**: `gltf` 파일을 React 컴포넌트로 변환해주는 `gltfjsx` CLI를 사용하기 위해 라이브러리를 설치합니다.
- [ ] **GLTF 모델 변환**: `npx gltfjsx client/public/wooden_mannequine/scene.gltf` 명령어를 실행하여 `scene.gltf` 파일을 재사용 가능한 React 컴포넌트(`Scene.jsx` -> `Mannequin.jsx` 등으로 이름 변경)로 변환합니다.
- [ ] **기존 컴포넌트 정리**: `Scene.jsx`에서 기존에 사용하던 구(Sphere)와 관련 코드를 제거합니다.
- [ ] **마네킹 컴포넌트 렌더링**: `Scene.jsx`에서 변환된 마네킹 컴포넌트를 import 하여 렌더링하고, 화면에 정상적으로 표시되는지 확인합니다.
- [ ] **저작권 정보 표시**: `license.txt`의 요구사항에 따라, 컨트롤러 UI 또는 화면 한 켠에 모델 저작권 정보를 명시하는 텍스트를 추가합니다.

#### 2. 포즈 관리를 위한 상태(State) 설계
- [ ] **Zustand Store 확장**: `client/src/store.js` 파일에 마네킹 포즈를 관리하기 위한 새로운 상태(state)를 추가합니다.
- [ ] **포즈 데이터 구조 정의**: 마네킹의 주요 관절(예: `head`, `leftArm`, `rightLeg` 등)의 `rotation` (x, y, z) 값을 저장할 수 있는 객체 형태의 `mannequinPose` 상태를 정의합니다.
- [ ] **액션(Action) 함수 생성**: 특정 관절의 회전 값을 업데이트하는 `setBoneRotation`과 같은 액션 함수를 store에 추가합니다.

#### 3. 마네킹 컨트롤러 UI 컴포넌트 개발
- [ ] **`MannequinControls.jsx` 파일 생성**: `client/src/components/` 디렉토리에 새로운 컨트롤러 UI 컴포넌트 파일을 생성합니다.
- [ ] **UI 레이아웃 구성**: 컴포넌트 내에 각 관절을 제어할 섹션을 만들고, 각 섹션에는 X, Y, Z 축 회전을 위한 3개의 슬라이더(`<input type="range">`)를 배치합니다.
- [ ] **상태와 UI 연동**: 각 슬라이더의 값(value)을 Zustand store의 `mannequinPose` 상태와 연결하고, 슬라이더를 조작(`onChange` 이벤트)하면 `setBoneRotation` 액션을 호출하여 상태를 업데이트하도록 구현합니다.

#### 4. 3D 모델과 상태 연동
- [ ] **마네킹 컴포넌트 수정**: `gltfjsx`로 생성된 마네킹 컴포넌트(`Mannequin.jsx`)를 수정합니다.
- [ ] **Zustand 상태 구독**: 컴포넌트 내에서 `useStore`를 사용하여 `mannequinPose` 상태를 구독합니다.
- [ ] **관절(Bone)에 상태 적용**: `useFrame` 훅을 사용하여 매 프레임마다 `mannequinPose` 상태 객체를 순회하며, 해당 관절(bone)의 `rotation` 값을 스토어의 값으로 업데이트합니다. 이를 통해 UI 조작이 3D 모델에 실시간으로 반영되도록 합니다.

#### 5. 전체 레이아웃 조정
- [ ] **`App.jsx` 레이아웃 수정**: 기존의 2단 레이아웃(Canvas | Controls)을 3단 레이아웃으로 변경합니다.
- [ ] **컨트롤러 배치**: Tailwind CSS의 flexbox 또는 grid를 사용하여 `[마네킹 컨트롤러] - [3D 캔버스] - [조명/카메라 컨트롤러]` 순서로 컴포넌트를 배치합니다.
- [ ] **너비 조정**: 각 영역의 너비(`width` 또는 `flex-basis`)를 적절하게 조절하여 균형 잡힌 화면 레이아웃을 완성합니다. (예: `w-1/5`, `w-3/5`, `w-1/5`)

---

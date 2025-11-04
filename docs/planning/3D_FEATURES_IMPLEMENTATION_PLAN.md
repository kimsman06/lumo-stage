# LumoStage 3D 기능 구현 계획

## 개요

이 문서는 LumoStage의 4가지 핵심 3D 기능 구현 계획을 정의합니다. React-Three-Fiber의 선언적 패턴과 Zustand 중앙 상태 관리를 유지하며, 단방향 데이터 흐름을 준수합니다.

**우선순위:**
- Phase 1 (긴급): OrbitControl 카메라 위치 저장, OrbitControl-카메라 시점 연결
- Phase 2: 배경 시스템, 3D Object 관리 시스템

---

## Phase 1-1: OrbitControl 카메라 위치 저장

### 문제 정의
현재 OrbitControls의 카메라 위치와 타겟이 Zustand store에 저장되지 않아, 프로젝트 저장 후 다시 로드하면 초기 위치로 리셋됩니다.

### 아키텍처 설계

#### 1. 상태 관리 구조 (Zustand Store 확장)

**editorStore.js에 추가할 상태:**

```javascript
{
  // 기존 cameraState는 "Camera View" 모드에서 사용하는 가상 카메라 상태
  cameraState: {
    position: [0, 2, 8],
    target: [0, 2, 0],
    focalLength: 50,
  },

  // 새로 추가: OrbitControls의 상태 (Free View 모드에서 사용)
  orbitControlState: {
    cameraPosition: [0, 3, 10],    // OrbitControls가 제어하는 실제 Three.js 카메라 위치
    target: [0, 1, 0],              // OrbitControls의 target (lookAt 지점)
    zoom: 1,                         // 카메라 줌 (PerspectiveCamera의 경우 거리로 표현됨)
  },

  // 액션
  updateOrbitControlState: (property, value) => set((state) => ({
    orbitControlState: { ...state.orbitControlState, [property]: value }
  })),

  setOrbitControlState: (newState) => set({ orbitControlState: newState }),
}
```

**getSceneData에 추가:**

```javascript
getSceneData: () => {
  const state = get();
  return {
    mannequins: state.mannequins,
    lights: state.lights,
    diffusers: state.diffusers,
    cameraState: state.cameraState,
    orbitControlState: state.orbitControlState, // 추가
    aspectRatio: state.aspectRatio,
  };
},
```

**loadSceneData에 추가:**

```javascript
loadSceneData: (sceneData) => {
  if (!sceneData) return;

  set((state) => {
    const updates = { /* 기존 로직 */ };

    // OrbitControls 상태 로드
    if (sceneData.orbitControlState) {
      updates.orbitControlState = sceneData.orbitControlState;
    }

    return updates;
  });
},
```

#### 2. 컴포넌트 구조

**Scene.jsx - Experience 컴포넌트 수정:**

- `OrbitControls`의 `onChange` 이벤트를 구독하여 카메라 위치 변경 감지
- 변경 시 `updateOrbitControlState` 액션 호출
- `orbitControlState` 구독하여 초기 위치 설정 및 프로젝트 로드 시 복원

**구현 패턴:**

```javascript
// Scene.jsx - Experience 내부
const orbitControlState = useStore((state) => state.orbitControlState);
const updateOrbitControlState = useStore((state) => state.updateOrbitControlState);
const orbitControlsRef = useRef(null);

// OrbitControls 상태 복원 (프로젝트 로드 시)
useEffect(() => {
  const orbit = orbitControlsRef.current;
  if (!orbit) return;

  // Zustand에서 로드한 상태로 OrbitControls 초기화
  orbit.object.position.set(...orbitControlState.cameraPosition);
  orbit.target.set(...orbitControlState.target);
  orbit.update();
}, [orbitControlState]); // 의존성: 프로젝트 로드 시 상태 변경 감지

// OrbitControls 변경 시 Zustand에 저장
useEffect(() => {
  const orbit = orbitControlsRef.current;
  if (!orbit) return;

  const handleChange = () => {
    const { position } = orbit.object;
    const target = orbit.target;

    updateOrbitControlState('cameraPosition', [position.x, position.y, position.z]);
    updateOrbitControlState('target', [target.x, target.y, target.z]);
  };

  orbit.addEventListener('change', handleChange);
  return () => orbit.removeEventListener('change', handleChange);
}, [updateOrbitControlState]);

// JSX
<OrbitControls ref={orbitControlsRef} makeDefault />
```

#### 3. 백엔드 스키마 변경

**Project.js (MongoDB Schema):**

현재 `sceneData`는 `Object` 타입으로 정의되어 있어 별도 스키마 변경 불필요. 클라이언트가 `orbitControlState`를 포함한 `sceneData`를 전송하면 자동으로 저장됨.

검증이 필요한 경우 스키마에 명시적 구조 추가 가능:

```javascript
sceneData: {
  type: Object,
  required: true,
  default: {
    mannequins: [],
    lights: [],
    diffusers: [],
    cameraState: {},
    orbitControlState: {},  // 명시적 정의
    aspectRatio: '16:9',
  }
}
```

#### 4. 데이터 흐름

```
[사용자 OrbitControls 조작]
  ↓
[OrbitControls 'change' 이벤트 발생]
  ↓
[Scene.jsx: handleChange → updateOrbitControlState 액션 호출]
  ↓
[Zustand Store: orbitControlState 업데이트]
  ↓
[프로젝트 저장 시: getSceneData() → orbitControlState 포함하여 서버로 전송]
  ↓
[서버: sceneData에 orbitControlState 저장]

---

[프로젝트 로드 시]
  ↓
[서버: sceneData 응답 (orbitControlState 포함)]
  ↓
[클라이언트: loadSceneData(sceneData) 호출]
  ↓
[Zustand Store: orbitControlState 업데이트]
  ↓
[Scene.jsx useEffect 트리거: OrbitControls 위치 복원]
```

#### 5. 기술적 고려사항

**성능:**
- OrbitControls의 `change` 이벤트는 드래그 중 매우 빈번하게 발생
- Debounce 또는 Throttle 적용하여 Zustand 업데이트 빈도 제한 권장 (lodash.throttle 사용)
- 예: 100ms마다 한 번만 업데이트

**상태 동기화:**
- `viewMode`가 'free'일 때만 OrbitControls 활성화되므로, 'camera' 모드에서는 OrbitControls 상태 저장 안 함
- 모드 전환 시 상태 충돌 방지: 'free' 모드로 돌아올 때 마지막 저장된 `orbitControlState` 복원

**초기 상태:**
- 새 프로젝트 생성 시 `orbitControlState`는 기본값 사용
- 기존 프로젝트에서 `orbitControlState`가 없는 경우 fallback: 현재 OrbitControls 상태 사용

---

## Phase 1-2: OrbitControl-카메라 시점 연결

### 문제 정의
Cinema 4D와 같이 현재 OrbitControls로 탐색 중인 시점을 카메라 시점으로 설정하거나, 반대로 카메라 시점으로 OrbitControls를 이동하는 기능이 필요합니다.

### 아키텍처 설계

#### 1. 상태 관리 구조

**액션 추가 (editorStore.js):**

```javascript
{
  // 액션 1: 현재 OrbitControls 위치를 Camera View의 cameraState로 복사
  setOrbitToCameraView: () => {
    const state = get();
    set({
      cameraState: {
        position: [...state.orbitControlState.cameraPosition],
        target: [...state.orbitControlState.target],
        focalLength: state.cameraState.focalLength, // focalLength는 유지
      }
    });
  },

  // 액션 2: Camera View의 cameraState를 OrbitControls로 복사하고 viewMode를 'free'로 전환
  setCameraViewToOrbit: () => {
    const state = get();
    set({
      orbitControlState: {
        cameraPosition: [...state.cameraState.position],
        target: [...state.cameraState.target],
        zoom: state.orbitControlState.zoom, // zoom은 유지
      },
      viewMode: 'free', // OrbitControls 모드로 자동 전환
    });
  },
}
```

#### 2. 컴포넌트 구조

**새 컴포넌트: CameraOrbitSync.jsx**

CameraControl.jsx와 유사한 위치에 배치 (client/src/components/editor/)

```
client/src/components/editor/
  ├── CameraControl.jsx          (기존)
  ├── CameraOrbitSync.jsx        (신규)
  ├── LightsControl.jsx
  └── ...
```

**UI 구조:**

- 버튼 2개로 구성된 카드 형태
- "Set Camera to View": 현재 OrbitControls 위치 → 카메라 시점 설정
- "View from Camera": 카메라 시점 → OrbitControls 이동

**컴포넌트 스켈레톤:**

```javascript
import useStore from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Eye } from "lucide-react";

function CameraOrbitSync() {
  const viewMode = useStore((state) => state.viewMode);
  const setOrbitToCameraView = useStore((state) => state.setOrbitToCameraView);
  const setCameraViewToOrbit = useStore((state) => state.setCameraViewToOrbit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Camera-Orbit Sync</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={setOrbitToCameraView}
          disabled={viewMode !== 'free'}
          className="w-full"
        >
          <Camera className="mr-2 h-4 w-4" />
          Set Camera to View
        </Button>

        <Button
          onClick={setCameraViewToOrbit}
          variant="outline"
          className="w-full"
        >
          <Eye className="mr-2 h-4 w-4" />
          View from Camera
        </Button>
      </CardContent>
    </Card>
  );
}

export default CameraOrbitSync;
```

**EditorPanel.jsx 통합:**

CameraControl 아래에 배치하여 논리적 그룹화

```javascript
// EditorPanel.jsx
import CameraOrbitSync from './editor/CameraOrbitSync';

// JSX
<ScrollArea>
  <CameraControl />
  <CameraOrbitSync />  {/* 추가 */}
  <LightsControl />
  {/* ... */}
</ScrollArea>
```

#### 3. 데이터 흐름

**시나리오 1: Set Camera to View**

```
[사용자가 OrbitControls로 원하는 시점 탐색]
  ↓
[Set Camera to View 버튼 클릭]
  ↓
[setOrbitToCameraView 액션 호출]
  ↓
[orbitControlState.cameraPosition/target → cameraState.position/target 복사]
  ↓
[사용자가 viewMode를 'camera'로 전환]
  ↓
[Scene.jsx: cameraState로 virtualCamera 설정 → 사용자가 탐색한 시점 렌더링]
```

**시나리오 2: View from Camera**

```
[사용자가 Camera View 모드에서 카메라 위치 설정]
  ↓
[View from Camera 버튼 클릭]
  ↓
[setCameraViewToOrbit 액션 호출]
  ↓
[cameraState.position/target → orbitControlState.cameraPosition/target 복사]
  ↓
[viewMode 자동으로 'free'로 전환]
  ↓
[Scene.jsx useEffect: OrbitControls 위치 복원 → 카메라 시점으로 이동]
```

#### 4. 기술적 고려사항

**버튼 활성화 조건:**
- "Set Camera to View": `viewMode === 'free'`일 때만 활성화 (OrbitControls 사용 중일 때)
- "View from Camera": 항상 활성화 (어느 모드에서든 카메라 시점으로 이동 가능)

**애니메이션 (Optional):**
- OrbitControls의 현재 위치에서 목표 위치로 부드럽게 이동하는 트윈 애니메이션 고려
- `gsap` 또는 `react-spring` 사용 가능
- 초기 구현은 즉시 이동으로 처리, 추후 UX 개선으로 애니메이션 추가

**focalLength 처리:**
- focalLength는 Camera View 전용 속성이므로 OrbitControls와 직접 매핑 불가
- "Set Camera to View" 시 focalLength는 현재 값 유지
- FOV를 기반으로 focalLength를 계산하는 것은 복잡하므로 초기 버전에서는 제외

---

## Phase 2-1: 배경 시스템

### 문제 정의
현재 씬의 배경이 검은색 고정이며, HDRI 환경 맵이나 단색 배경 설정 기능이 없습니다. Ground plane도 회색 고정입니다.

### 아키텍처 설계

#### 1. 상태 관리 구조

**editorStore.js에 추가:**

```javascript
{
  backgroundSettings: {
    type: 'color',                // 'color' | 'hdri' | 'none'
    color: '#1a1a1a',             // 단색 배경 색상
    hdriUrl: null,                // HDRI 파일 URL (업로드된 파일 경로)
    hdriIntensity: 1,             // HDRI 환경광 강도
    showGround: true,             // Ground plane 표시 여부
    groundColor: '#808080',       // Ground plane 색상
    groundReflectivity: 0.3,      // Ground 반사도 (0~1)
  },

  // 액션
  updateBackgroundSettings: (property, value) => set((state) => ({
    backgroundSettings: { ...state.backgroundSettings, [property]: value }
  })),
}
```

**getSceneData/loadSceneData 업데이트:**

`backgroundSettings`를 sceneData에 포함

#### 2. 컴포넌트 구조

**새 컴포넌트:**

- `BackgroundControl.jsx`: 배경 설정 UI (EditorPanel에 추가)
- `SceneBackground.jsx`: Three.js 배경 렌더링 로직 (Scene.jsx의 Experience 내부에 추가)

**BackgroundControl.jsx 스켈레톤:**

```javascript
// client/src/components/editor/BackgroundControl.jsx

import useStore from "@/store/editorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

function BackgroundControl() {
  const backgroundSettings = useStore((state) => state.backgroundSettings);
  const updateBackgroundSettings = useStore((state) => state.updateBackgroundSettings);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Type 선택 */}
        <div>
          <Label>Type</Label>
          <Select
            value={backgroundSettings.type}
            onValueChange={(value) => updateBackgroundSettings('type', value)}
          >
            <option value="color">Solid Color</option>
            <option value="hdri">HDRI</option>
            <option value="none">None</option>
          </Select>
        </div>

        {/* 단색 배경 */}
        {backgroundSettings.type === 'color' && (
          <div>
            <Label>Color</Label>
            <Input
              type="color"
              value={backgroundSettings.color}
              onChange={(e) => updateBackgroundSettings('color', e.target.value)}
            />
          </div>
        )}

        {/* HDRI 배경 */}
        {backgroundSettings.type === 'hdri' && (
          <>
            <div>
              <Label>HDRI File</Label>
              <Input type="file" accept=".hdr,.exr" onChange={handleHdriUpload} />
            </div>
            <div>
              <Label>Intensity</Label>
              <Slider
                value={[backgroundSettings.hdriIntensity]}
                onValueChange={([value]) => updateBackgroundSettings('hdriIntensity', value)}
                min={0}
                max={2}
                step={0.1}
              />
            </div>
          </>
        )}

        {/* Ground Plane 설정 */}
        <div>
          <Label>Show Ground</Label>
          <Switch
            checked={backgroundSettings.showGround}
            onCheckedChange={(checked) => updateBackgroundSettings('showGround', checked)}
          />
        </div>

        {backgroundSettings.showGround && (
          <>
            <div>
              <Label>Ground Color</Label>
              <Input
                type="color"
                value={backgroundSettings.groundColor}
                onChange={(e) => updateBackgroundSettings('groundColor', e.target.value)}
              />
            </div>
            <div>
              <Label>Reflectivity</Label>
              <Slider
                value={[backgroundSettings.groundReflectivity]}
                onValueChange={([value]) => updateBackgroundSettings('groundReflectivity', value)}
                min={0}
                max={1}
                step={0.05}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BackgroundControl;
```

**SceneBackground.jsx:**

```javascript
// client/src/components/SceneBackground.jsx (Scene.jsx에 인라인 가능)

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as THREE from "three";
import useStore from "@/store/editorStore";

function SceneBackground() {
  const { scene } = useThree();
  const backgroundSettings = useStore((state) => state.backgroundSettings);

  useEffect(() => {
    if (backgroundSettings.type === 'color') {
      scene.background = new THREE.Color(backgroundSettings.color);
      scene.environment = null;
    } else if (backgroundSettings.type === 'hdri' && backgroundSettings.hdriUrl) {
      const loader = new RGBELoader();
      loader.load(backgroundSettings.hdriUrl, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        scene.environment.intensity = backgroundSettings.hdriIntensity;
      });
    } else {
      scene.background = null;
      scene.environment = null;
    }
  }, [scene, backgroundSettings]);

  return null; // 렌더링할 JSX 없음
}

export default SceneBackground;
```

**Scene.jsx 통합:**

```javascript
// Scene.jsx - Experience 컴포넌트 내부
<Experience>
  <SceneBackground />
  {/* 기존 조명, 마네킹 등 */}

  {/* Ground Plane 조건부 렌더링 */}
  {backgroundSettings.showGround && (
    <Plane
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.5, 0]}
      args={[100, 100]}
    >
      <meshStandardMaterial
        color={backgroundSettings.groundColor}
        metalness={backgroundSettings.groundReflectivity}
        roughness={1 - backgroundSettings.groundReflectivity}
      />
    </Plane>
  )}
</Experience>
```

#### 3. 파일 업로드 처리

**HDRI 파일 업로드:**

- 클라이언트에서 파일 선택 → `FileReader`로 로컬 읽기 → Base64 인코딩 또는 Blob URL 생성
- 프로젝트 저장 시 서버로 전송하여 저장 (또는 AWS S3 등 스토리지 사용)
- 서버에서 HDRI 파일 경로 반환 → `backgroundSettings.hdriUrl`에 저장

**간단한 로컬 구현 (초기 버전):**

- `FileReader` + Blob URL 사용하여 클라이언트에서만 처리
- 프로젝트 저장 시에는 HDRI URL만 저장 (파일 자체는 저장 안 함)
- 추후 서버 파일 업로드 API로 확장

**handleHdriUpload 예시:**

```javascript
const handleHdriUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  updateBackgroundSettings('hdriUrl', url);

  // Optional: 프로젝트 저장 시 파일을 서버로 전송하는 로직 추가
};
```

#### 4. 기술적 고려사항

**HDRI 파일 크기:**
- HDRI 파일은 수 MB~수십 MB로 큼
- 로딩 시간 고려하여 로딩 인디케이터 표시
- Suspense + lazy loading 활용

**성능:**
- HDRI 환경광은 GPU 부하 증가 가능
- 저사양 기기에서는 단색 배경 권장

**메모리 관리:**
- HDRI 텍스처는 사용 후 dispose 처리 필요
- 배경 타입 변경 시 기존 텍스처 해제

**브라우저 호환성:**
- RGBELoader는 WebGL 지원 브라우저에서 동작
- `.hdr` 형식 우선 지원, `.exr`은 추가 로더 필요 (EXRLoader)

---

## Phase 2-2: 3D Object 관리 시스템

### 문제 정의
현재 마네킹만 씬에 배치 가능하며, 추가 3D 객체 (GLTF 모델, 프리미티브 오브젝트 등)를 배치하고 조작하는 기능이 없습니다.

### 아키텍처 설계

#### 1. 상태 관리 구조

**editorStore.js에 추가:**

```javascript
{
  objects: [
    {
      id: 'obj_abc123',
      name: 'Cube 1',
      type: 'primitive',           // 'primitive' | 'gltf'
      primitiveType: 'box',        // 'box', 'sphere', 'cylinder', 'plane' (primitive인 경우)
      gltfUrl: null,               // GLTF 파일 URL (gltf인 경우)
      position: [0, 0, 0],
      rotation: [0, 0, 0],         // Euler angles (radians)
      scale: [1, 1, 1],
      material: {
        color: '#ffffff',
        metalness: 0.5,
        roughness: 0.5,
      },
      castShadow: true,
      receiveShadow: true,
    },
  ],
  selectedObjectId: null,

  // 액션
  addObject: (type, primitiveType = 'box') => set((state) => {
    const newObject = {
      id: nanoid(),
      name: `${primitiveType} ${state.objects.length + 1}`,
      type,
      primitiveType: type === 'primitive' ? primitiveType : null,
      gltfUrl: null,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: { color: '#ffffff', metalness: 0.5, roughness: 0.5 },
      castShadow: true,
      receiveShadow: true,
    };
    return { objects: [...state.objects, newObject] };
  }),

  deleteObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
    selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
  })),

  selectObject: (id) => set({ selectedObjectId: id }),

  updateObject: (id, property, value) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, [property]: value } : obj
    ),
  })),

  setObjectPosition: (id, position) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, position } : obj
    ),
  })),

  setObjectRotation: (id, rotation) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, rotation } : obj
    ),
  })),

  setObjectScale: (id, scale) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, scale } : obj
    ),
  })),

  uploadGltf: (file) => {
    // 파일 업로드 처리 로직
    // 서버로 파일 전송 → URL 받아서 새 object 생성
  },
}
```

**getSceneData/loadSceneData 업데이트:**

`objects`를 sceneData에 포함

#### 2. 컴포넌트 구조

**새 컴포넌트:**

- `ObjectsControl.jsx`: 3D 객체 목록 및 추가/삭제 UI
- `ObjectCard.jsx`: 개별 객체 설정 카드 (LightCard.jsx와 유사)
- `SceneObject.jsx`: 3D 객체 렌더링 컴포넌트

**ObjectsControl.jsx:**

```
client/src/components/editor/
  ├── ObjectsControl.jsx   (신규)
  ├── ObjectCard.jsx       (신규)
  └── ...
```

**ObjectsControl 스켈레톤:**

```javascript
import useStore from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";
import ObjectCard from "./ObjectCard";

function ObjectsControl() {
  const objects = useStore((state) => state.objects);
  const addObject = useStore((state) => state.addObject);
  const uploadGltf = useStore((state) => state.uploadGltf);

  const handleAddPrimitive = (primitiveType) => {
    addObject('primitive', primitiveType);
  };

  const handleGltfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadGltf(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Objects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 프리미티브 추가 버튼 */}
        <div className="flex gap-2">
          <Button onClick={() => handleAddPrimitive('box')} size="sm">
            <Plus className="mr-1 h-3 w-3" /> Cube
          </Button>
          <Button onClick={() => handleAddPrimitive('sphere')} size="sm">
            <Plus className="mr-1 h-3 w-3" /> Sphere
          </Button>
          <Button onClick={() => handleAddPrimitive('cylinder')} size="sm">
            <Plus className="mr-1 h-3 w-3" /> Cylinder
          </Button>
          <Button onClick={() => handleAddPrimitive('plane')} size="sm">
            <Plus className="mr-1 h-3 w-3" /> Plane
          </Button>
        </div>

        {/* GLTF 업로드 */}
        <div>
          <Label htmlFor="gltf-upload">Upload GLTF</Label>
          <Input
            id="gltf-upload"
            type="file"
            accept=".gltf,.glb"
            onChange={handleGltfUpload}
          />
        </div>

        {/* 객체 목록 */}
        <div className="space-y-2">
          {objects.map((obj) => (
            <ObjectCard key={obj.id} object={obj} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ObjectsControl;
```

**ObjectCard.jsx:**

LightCard.jsx와 유사한 구조로, 개별 객체의 이름, 위치, 회전, 스케일, 재질 설정 UI 제공

**SceneObject.jsx:**

```javascript
// client/src/components/SceneObject.jsx

import React, { forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const SceneObject = forwardRef(({ object, onPointerDown }, ref) => {
  const { id, type, primitiveType, gltfUrl, position, rotation, scale, material, castShadow, receiveShadow } = object;

  if (type === 'primitive') {
    let geometry;
    switch (primitiveType) {
      case 'box':
        geometry = <boxGeometry args={[1, 1, 1]} />;
        break;
      case 'sphere':
        geometry = <sphereGeometry args={[0.5, 32, 32]} />;
        break;
      case 'cylinder':
        geometry = <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
        break;
      case 'plane':
        geometry = <planeGeometry args={[2, 2]} />;
        break;
      default:
        geometry = <boxGeometry args={[1, 1, 1]} />;
    }

    return (
      <mesh
        ref={ref}
        position={position}
        rotation={rotation}
        scale={scale}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
        onPointerDown={onPointerDown}
      >
        {geometry}
        <meshStandardMaterial
          color={material.color}
          metalness={material.metalness}
          roughness={material.roughness}
        />
      </mesh>
    );
  } else if (type === 'gltf' && gltfUrl) {
    const gltf = useGLTF(gltfUrl);
    return (
      <primitive
        ref={ref}
        object={gltf.scene.clone()}
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerDown={onPointerDown}
      />
    );
  }

  return null;
});

export default SceneObject;
```

**Scene.jsx 통합:**

```javascript
// Scene.jsx - Experience 내부

const objects = useStore((state) => state.objects);
const selectedObjectId = useStore((state) => state.selectedObjectId);
const objectRefs = useRef(new Map());

const registerObjectHandle = useCallback((id, node) => {
  if (!id) return;
  if (node) {
    objectRefs.current.set(id, node);
  } else {
    objectRefs.current.delete(id);
  }
}, []);

const { handleObjectPointerDown } = useSceneSelection(); // 객체 선택 로직

// JSX
{objects.map((obj) => (
  <SceneObject
    key={obj.id}
    object={obj}
    ref={(el) => registerObjectHandle(obj.id, el)}
    onPointerDown={(event) => handleObjectPointerDown(event, obj.id)}
  />
))}

// TransformControls objectToControl 로직 확장
const objectToControl = selectedLight
  ? lightToControl
  : selectedDiffuser
  ? diffuserToControl
  : selectedObjectId
  ? objectRefs.current.get(selectedObjectId)
  : mannequinToControl;

// TransformControls onObjectChange에 객체 위치/회전/스케일 업데이트 로직 추가
if (state.selectedObjectId) {
  const newPosition = [obj.position.x, obj.position.y, obj.position.z];
  setObjectPosition(state.selectedObjectId, newPosition);
  // rotation, scale도 transformMode에 따라 처리
}
```

#### 3. 파일 업로드 처리

**GLTF 업로드:**

- 클라이언트에서 파일 선택 → 서버로 전송 (`/api/projects/:id/upload-gltf`)
- 서버에서 파일 저장 (로컬 스토리지 또는 S3) → URL 반환
- 클라이언트에서 반환된 URL로 새 object 추가

**uploadGltf 액션 구현:**

```javascript
uploadGltf: async (file) => {
  const formData = new FormData();
  formData.append('gltf', file);

  // 예시 API 호출
  const response = await fetch('/api/projects/current/upload-gltf', {
    method: 'POST',
    body: formData,
  });

  const { url } = await response.json();

  set((state) => ({
    objects: [...state.objects, {
      id: nanoid(),
      name: file.name,
      type: 'gltf',
      primitiveType: null,
      gltfUrl: url,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {},
      castShadow: true,
      receiveShadow: true,
    }]
  }));
},
```

**백엔드 API 추가 필요:**

```
POST /api/projects/:id/upload-gltf
- Multipart form-data로 GLTF 파일 수신
- 파일을 서버 스토리지에 저장
- 파일 URL 반환
```

#### 4. 기술적 고려사항

**GLTF 파일 크기:**
- GLTF는 수 MB~수십 MB 가능
- 업로드 진행 상태 표시
- 파일 크기 제한 (예: 50MB)

**TransformControls 확장:**
- 객체 선택 시 TransformControls가 해당 객체에 연결
- 조명, 디퓨저, 마네킹, 객체 등 여러 타입의 객체를 하나의 TransformControls로 관리
- 선택 우선순위: selectedLight > selectedDiffuser > selectedObjectId > selectedMannequinId

**SceneSelection 로직 확장:**
- `useSceneSelection` 훅에 `handleObjectPointerDown` 추가
- 객체 클릭 시 `selectObject` 액션 호출하고 다른 선택 해제

**메모리 관리:**
- GLTF 모델은 복잡도에 따라 메모리 사용량 큼
- 객체 삭제 시 Three.js geometry/material dispose 필요
- `useGLTF`의 캐싱 활용

**충돌 처리:**
- 여러 객체가 겹칠 경우 Raycaster의 첫 번째 교차점만 선택
- Z-fighting 방지를 위해 객체 간 간격 유지

---

## 구현 순서 및 의존성

### Phase 1 (긴급 - 1주차)

1. **OrbitControl 카메라 위치 저장** (1-2일)
   - editorStore.js 확장 (`orbitControlState` 추가)
   - Scene.jsx 수정 (OrbitControls 이벤트 리스너, 상태 복원)
   - 테스트: 프로젝트 저장/로드 시 OrbitControls 위치 유지 확인

2. **OrbitControl-카메라 시점 연결** (1-2일)
   - editorStore.js 액션 추가 (`setOrbitToCameraView`, `setCameraViewToOrbit`)
   - CameraOrbitSync.jsx 컴포넌트 생성
   - EditorPanel.jsx 통합
   - 테스트: 버튼 클릭 시 시점 전환 확인

**의존성:** Phase 1-1 완료 후 Phase 1-2 시작 (orbitControlState 필요)

### Phase 2 (2-3주차)

3. **배경 시스템** (3-4일)
   - editorStore.js 확장 (`backgroundSettings` 추가)
   - BackgroundControl.jsx 컴포넌트 생성
   - SceneBackground.jsx 컴포넌트 생성 및 Scene.jsx 통합
   - HDRI 파일 업로드 로직 (로컬 Blob URL)
   - 테스트: 단색/HDRI 배경 전환, Ground plane 설정 확인

4. **3D Object 관리 시스템** (5-7일)
   - editorStore.js 확장 (`objects`, 관련 액션 추가)
   - ObjectsControl.jsx, ObjectCard.jsx 컴포넌트 생성
   - SceneObject.jsx 컴포넌트 생성
   - Scene.jsx 통합 (객체 렌더링, TransformControls 확장)
   - useSceneSelection 확장 (객체 선택 로직)
   - 백엔드 API 추가 (GLTF 업로드 엔드포인트)
   - 테스트: 프리미티브 추가/삭제, GLTF 업로드/배치, TransformControls 조작 확인

**의존성:** Phase 2의 두 기능은 독립적이므로 병렬 개발 가능

### 테스트 전략

**단위 테스트:**
- Zustand 액션 함수 단위 테스트 (Jest)
- 컴포넌트 렌더링 테스트 (Vitest + Testing Library)

**통합 테스트:**
- 프로젝트 저장/로드 시 모든 상태 복원 확인
- TransformControls 상호작용 테스트
- 파일 업로드 플로우 테스트

**E2E 테스트:**
- Playwright로 전체 사용자 시나리오 테스트
  - OrbitControls로 시점 이동 → 저장 → 로드 → 위치 유지 확인
  - 배경 설정 변경 → 저장 → 로드 → 배경 유지 확인
  - 3D 객체 추가/조작 → 저장 → 로드 → 객체 상태 유지 확인

---

## 추가 고려사항

### 성능 최적화

- **OrbitControls 업데이트:** Throttle 적용 (100ms)
- **HDRI 로딩:** Suspense + lazy loading, 로딩 인디케이터
- **GLTF 모델:** Draco 압축 활용, LOD(Level of Detail) 고려
- **메모리 관리:** 사용하지 않는 텍스처/geometry dispose

### 사용성 개선

- **Undo/Redo 기능:** 상태 히스토리 스택 구현 (추후 Phase)
- **키보드 단축키:** Q/W/E (translate/rotate/scale), Delete (객체 삭제)
- **아웃라이너(Outliner):** 씬 내 모든 객체 계층 구조 표시 (추후 Phase)
- **애니메이션:** OrbitControls 시점 전환 시 부드러운 트윈 애니메이션

### 확장 가능성

- **다중 카메라:** 여러 카메라 시점 저장 및 전환
- **라이트 프리셋:** 조명 설정 프리셋 저장/불러오기
- **씬 템플릿:** 자주 사용하는 배경/객체 조합 템플릿화
- **협업 기능:** 여러 사용자가 동시에 씬 편집 (WebSocket 활용)

---

## 요약

이 계획은 LumoStage의 3D 기능을 점진적으로 확장하는 로드맵입니다. Phase 1에서는 즉시 필요한 OrbitControls 관련 기능을 구현하여 사용자 경험을 개선하고, Phase 2에서는 배경과 3D 객체 시스템을 추가하여 씬 구성의 유연성을 높입니다.

모든 구현은 기존의 Zustand 중앙 상태 관리와 React-Three-Fiber의 선언적 패턴을 유지하며, 단방향 데이터 흐름을 준수합니다. 각 기능은 독립적으로 테스트 가능하며, 점진적으로 확장할 수 있는 아키텍처를 제공합니다.

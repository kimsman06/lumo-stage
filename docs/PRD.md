# LumoStage: 3D 조명 시뮬레이션 웹 앱 (MVP) - 제품 요구사항 문서

**문서 버전:** 1.1
**작성일:** 2025년 9월 2일
**프로젝트 오너:** (사용자 이름)

## 1. 개요 (Overview)

### 1.1. 프로젝트명: LumoStage

### 1.2. 비전

영상 및 영화 제작자들이 실제 촬영에 들어가기 전, 웹 브라우저에서 간편하게 조명과 카메라 구도를 시뮬레이션하여 시간과 비용을 절약하고 창의적인 결과물을 만들 수 있도록 돕는 3D 시뮬레이션 툴.

### 1.3. 문제점

- 실제 촬영 현장에서 조명을 설치하고 테스트하는 데 많은 시간과 인력이 소모된다.
- 고가의 3D 소프트웨어는 사용법이 복잡하고 접근성이 낮아, 독립 영화 제작자나 학생, 유튜버들이 사용하기 어렵다.
- 팀원 간의 조명/카메라 구도에 대한 커뮤니케이션이 텍스트나 그림만으로는 명확하지 않다.

### 1.4. 해결 방안 (MVP)

MERN 스택과 Three.js (React-Three-Fiber)를 활용하여, 사용자가 웹에서 실시간으로 3D 공간에 오브젝트를 배치하고, 여러 개의 조명을 설치하며, 가상 카메라를 통해 결과물을 확인할 수 있는 핵심 기능에 집중한 웹 애플리케이션을 개발한다.

### 1.5. 타겟 사용자

- 영화/영상 전공 학생
- 독립 영화 제작자 및 감독
- 영상 콘텐츠 크리에이터 (유튜버 등)

## 2. 목표 (Goals)

### 2.1. 제품 목표

- 사용자는 3D 공간에서 기본적인 조명(Key, Fill, Back) 설정을 시뮬레이션할 수 있다.
- 사용자는 가상 카메라의 위치와 각도를 조절하여 원하는 샷을 미리 볼 수 있다.
- 모든 시뮬레이션 과정은 실시간으로 렌더링되어 즉각적인 피드백을 제공한다.

### 2.2. 기술 목표

- React와 React-Three-Fiber를 사용하여 인터랙티브한 3D UI/UX를 구현한다.
- Node.js/Express로 Scene(장면) 데이터를 저장하고 불러올 수 있는 안정적인 API를 구축한다.
- MongoDB를 사용하여 유연한 구조의 Scene 데이터를 관리한다.

## 3. 사용자 스토리 (User Stories)

- (연출가로서) 나는 3D 공간에 기본 모델(인물 흉상)을 배치하여, 조명이 피사체에 어떻게 영향을 미치는지 확인하고 싶다.
- (촬영감독으로서) 나는 여러 종류의 조명(점 조명, 스포트라이트, 주변광)을 추가하고, 각 조명의 위치, 색상, 강도를 조절하여 원하는 분위기를 만들고 싶다.
- (감독으로서) 나는 가상 카메라를 자유롭게 움직이고 렌즈 화각(FOV)을 조절하여, 다양한 앵글과 샷 사이즈를 테스트하고 싶다.
- (사용자로서) 나는 내가 작업한 조명 및 카메라 설정을 'Scene'으로 저장하고, 나중에 다시 불러와서 수정하고 싶다.

## 4. MVP 기능 명세 (MVP Feature Specifications)

### 4.1. 3D 뷰포트 (Viewport)

- Three.js 기반의 3D 캔버스가 화면의 중심을 차지한다.
- 마우스를 이용한 기본 화면 제어(Orbit Controls): 궤도 회전, 확대/축소, 이동(Pan)이 가능하다.
- 기본적인 3D 환경: 바닥(Plane)과 중심에 고정된 피사체 모델(예: Sphere, Box, 인물 흉상 Glb 모델)이 존재한다.

### 4.2. 조명 제어 (Light Controls)

**UI:** 화면 사이드바에 위치한 컨트롤 패널.

**기능:**

- **조명 추가:** '조명 추가' 버튼 클릭 시, 조명 타입(Point Light, Spot Light, Ambient Light)을 선택할 수 있다.
- **조명 목록:** 현재 Scene에 추가된 조명들이 목록으로 표시된다. 목록에서 특정 조명을 선택하여 속성을 수정할 수 있다.
- **조명 삭제:** 각 조명 제어 카드에 '삭제' 버튼을 추가하여, Scene에서 해당 조명을 제거할 수 있다.
- **기본 속성 제어:** 선택된 조명의 아래 속성을 슬라이더와 컬러 피커로 실시간 제어할 수 있다.
  - 위치 (Position): X, Y, Z 축 슬라이더
  - 색상 (Color): 컬러 피커
  - 강도 (Intensity): 0-10 사이의 슬라이더
- **고급 속성 제어 (현실감 강화):**
  - **회전 (Rotation):** `SpotLight`와 `DirectionalLight`의 방향을 제어하기 위한 X, Y, Z 축 회전 슬라이더.
  - **감쇠 (Decay):** `PointLight`와 `SpotLight`의 빛이 거리에 따라 어떻게 약해지는지를 제어하는 슬라이더.
  - **거리 (Distance):** 빛이 도달하는 최대 거리를 제어하는 슬라이더.
  - (Spot Light 전용) 각도 (Angle), 반감 감쇠 (Penumbra) 슬라이더
- **시각적 헬퍼 (Visual Helpers):**
  - 선택된 `SpotLight`와 `DirectionalLight`는 빛의 범위와 방향을 나타내는 시각적 도우미(Helper)를 표시한다.
  - 이 헬퍼는 3D 뷰포트에서 직접 선택하고 `TransformControls`를 통해 위치와 회전을 조작할 수 있다.

### 4.3. 카메라 제어 (Camera Controls)

**UI:** 컨트롤 패널 내 별도 탭.

**기능:**

- **카메라 위치 (Position):** X, Y, Z 축 슬라이더로 카메라의 위치를 조정한다.
- **카메라 타겟 (Target):** 카메라가 바라보는 지점의 X, Y, Z 좌표를 조정한다.
- **화각 (Field of View):** 슬라이더를 통해 렌즈의 화각을 조절하여 광각/망원 효과를 시뮬레이션한다.

### 4.4. Scene 저장 및 불러오기

**UI:** 상단 네비게이션 바에 '저장' 버튼.

**기능:**

- **저장:** 현재 3D 뷰포트의 모든 정보(오브젝트, 조명, 카메라의 속성 값)를 하나의 JSON 객체로 묶어 서버에 전송한다. 서버는 이 정보를 MongoDB에 저장하고, 해당 Scene의 고유 ID를 반환한다.
- **불러오기:** 사용자가 고유 ID(URL 파라미터 ?scene=SCENE_ID 형태)를 통해 접속하면, 서버에서 해당 Scene 데이터를 불러와 3D 뷰포트에 그대로 복원한다.

## 5. 기술 스택 및 아키텍처 (Tech Stack & Architecture)

**Frontend:** React, Vite, Three.js, React-Three-Fiber, React-Three-Drei, Tailwind CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose ODM 사용)
**Deployment:** Vercel (Frontend), Heroku/Fly.io (Backend & DB)

### 아키텍처:

**클라이언트 (React):**

- UI 컴포넌트(컨트롤 패널, 뷰포트)와 상태 관리(Zustand 또는 React Context)를 담당.
- React-Three-Fiber를 사용하여 3D Scene을 선언적으로 렌더링.
- 사용자의 모든 인터랙션(슬라이더 조작 등)은 React State를 변경하며, 이는 즉시 3D Scene에 반영된다.

**서버 (Express):**

- RESTful API 엔드포인트 제공.
- POST /api/scenes: 클라이언트로부터 받은 Scene JSON 데이터를 받아 MongoDB에 저장.
- GET /api/scenes/:id: ID에 해당하는 Scene 데이터를 MongoDB에서 조회하여 클라이언트에 반환.

**데이터베이스 (MongoDB):**

- scenes 컬렉션: Scene 문서를 저장.
- Scene 문서 스키마:

```json
{
  "lights": [
    { "type": "point", "position": [x,y,z], "color": "#ffffff", "intensity": 1.0, ... }
  ],
  "camera": {
    "position": [x,y,z],
    "target": [x,y,z],
    "fov": 75
  },
  "objects": [
    { "type": "bust", "position": [0,0,0], "rotation": [0,0,0], "scale": 1.0 }
  ]
}
```

## 6. 개발 로드맵 (Development Roadmap)

### Phase 1: 3D Scene 기본 환경 구축 (Frontend Only)

- Vite + React 프로젝트 설정.
- three, @react-three/fiber, @react-three/drei 라이브러리 설치.
- 기본 3D 캔버스, 바닥(Plane), 중앙 오브젝트(Sphere) 렌더링.
- 마우스를 이용한 OrbitControls 구현.

### Phase 2: 핵심 기능 UI 및 로직 구현 (Frontend Only)

- Tailwind CSS를 사용하여 기본 레이아웃 및 컨트롤 패널 UI 구현.
- useState 또는 Zustand를 사용하여 조명, 카메라 상태 관리 로직 구현.
- 컨트롤 패널의 슬라이더, 컬러 피커를 상태(State)와 연동.
- 상태(State)가 변경될 때마다 React-Three-Fiber가 3D Scene을 실시간으로 다시 렌더링하도록 구현.

### Phase 3: 백엔드 연동 (MERN Full-stack)

- Node.js/Express 서버 기본 설정 및 Mongoose를 이용한 MongoDB 연결.
- Scene 저장을 위한 API 엔드포인트 (POST /api/scenes) 개발.
- Scene 불러오기를 위한 API 엔드포인트 (GET /api/scenes/:id) 개발.
- React 앱에서 fetch 또는 axios를 사용하여 '저장'/'불러오기' 기능과 API 연동.

### Phase 4: 배포 및 테스트

- Frontend 코드를 Vercel에 배포.
- Backend 코드를 Heroku(또는 유사 서비스)에 배포.
- CORS(Cross-Origin Resource Sharing) 문제 해결 및 전체 기능 테스트.

## 7. 성공 지표 (Success Metrics)

- **작업 완료율:** 사용자가 웹사이트에 방문하여 Scene을 성공적으로 저장하는 비율.
- **성능:** 3개 이상의 조명이 설치된 환경에서도 초당 30프레임 이상을 유지하는가.
- **사용자 피드백:** 타겟 사용자들이 "쉽다", "직관적이다", "유용하다"와 같은 긍정적인 피드백을 남기는가.
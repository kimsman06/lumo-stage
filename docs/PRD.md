# LumoStage: 3D 조명 시뮬레이션 웹 앱 (MVP) - 제품 요구사항 문서

**문서 버전:** 1.2
**최종 수정일:** 2025년 10월 5일
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

- (연출가로서) 나는 3D 공간에 **마네킹 모델**을 배치하여, 조명이 피사체에 어떻게 영향을 미치는지 확인하고 싶다.
- (촬영감독으로서) 나는 여러 종류의 조명(점 조명, 스포트라이트, 주변광)을 추가하고, 각 조명의 위치, 색상, 강도를 조절하여 원하는 분위기를 만들고 싶다.
- (감독으로서) 나는 가상 카메라를 자유롭게 움직이고 렌즈 화각(FOV)을 조절하여, 다양한 앵글과 샷 사이즈를 테스트하고 싶다.
- (사용자로서) 나는 내가 작업한 조명 및 카메라 설정을 'Scene'으로 저장하고, 나중에 다시 불러와서 수정하고 싶다.

## 4. MVP 기능 명세 (MVP Feature Specifications)

### 4.1. 3D 뷰포트 (Viewport)

- Three.js 기반의 3D 캔버스가 화면의 중심을 차지한다.
- `@react-three/drei`의 `OrbitControls`를 통해 마우스로 화면 제어(궤도 회전, 확대/축소, 이동)가 가능하다.
- 기본적인 3D 환경: 바닥(Plane)과 중심에 **나무 마네킹(Wooden Mannequine) GLTF 모델**이 존재한다.

### 4.2. 조명 제어 (Light Controls)

**UI:** 화면 우측에 위치한 컨트롤 패널 (`EditorPanel.jsx`).
**상태 관리:** `Zustand`를 사용한 중앙 집중식 상태 관리 (`store.js`).

**기능:**

- **조명 추가:** '조명 추가' 버튼 클릭 시, Scene에 새로운 `pointLight`가 추가된다.
- **조명 목록:** 현재 Scene에 추가된 조명들이 카드 형태로 표시된다.
- **조명 삭제:** 각 조명 카드에서 '삭제' 버튼으로 Scene의 조명을 제거할 수 있다.
- **속성 제어:** 선택된 조명의 아래 속성을 슬라이더와 컬러 피커로 실시간 제어한다. 모든 변경사항은 `Zustand` Store를 통해 3D Scene에 즉시 반영된다.
  - 위치 (Position): X, Y, Z 축 슬라이더
  - 색상 (Color): 컬러 피커
  - 강도 (Intensity): 슬라이더

### 4.3. 카메라 제어 (Camera Controls)

**UI:** 컨트롤 패널 내 별도 섹션.
**상태 관리:** **`Zustand`** Store에서 카메라 상태 관리.

**기능:**

- **카메라 위치 (Position):** X, Y, Z 축 슬라이더로 카메라의 위치를 조정한다.
- **화각 (Field of View):** 슬라이더를 통해 렌즈의 화각을 조절한다.

### 4.4. Scene 저장 및 불러오기

**UI:** 컨트롤 패널 상단에 '저장' 버튼.

**기능:**

- **저장:** '저장' 버튼 클릭 시, 현재 `Zustand` Store의 `lights`, `camera` 상태를 JSON 객체로 만들어 `POST /api/scenes` API로 전송한다. 서버는 저장 후 고유 ID를 반환하며, 클라이언트는 이 ID를 URL에 `?scene=<ID>` 형태로 반영한다.
- **불러오기:** 페이지 로드 시 URL의 `scene` 파라미터를 확인한다. ID가 존재하면 `GET /api/scenes/:id` API를 호출하여 Scene 데이터를 가져온 후, `Zustand` Store의 상태를 업데이트하여 3D Scene을 복원한다.

## 5. 기술 스택 및 아키텍처 (Tech Stack & Architecture)

### 5.1. 기술 스택

- **Frontend**: React, Vite, Zustand
- **3D**: Three.js, React-Three-Fiber, React-Three-Drei
- **Styling**: Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM 사용)

### 5.2. 아키텍처

LumoStage는 클라이언트-서버 아키텍처를 따릅니다.

#### 📁 클라이언트 (Client)

- **`Zustand`**를 중심으로 한 단방향 데이터 흐름 아키텍처.
- UI 컴포넌트 (`EditorPanel.jsx`)는 사용자 입력을 받아 **`Zustand` Store**의 상태 변경 함수를 호출.
- 3D 컴포넌트 (`Scene.jsx`)는 **`Zustand` Store**의 상태를 구독(subscribe)하고, 상태 변경 시 자동으로 리렌더링.

#### 🗄️ 서버 (Server)

- **MVCS (Model-View-Controller-Service)** 패턴을 적용하여 역할과 책임을 분리.
- **`routes`**: API 엔드포인트 정의 및 `Controller` 연결.
- **`controllers`**: HTTP 요청/응답 처리 및 `Service` 호출.
- **`services`**: 핵심 비즈니스 로직 수행 및 `Model`을 통한 DB 작업.
- **`models`**: Mongoose를 사용한 데이터베이스 스키마 정의.

```
server/
├── controllers/
│   └── scene.controller.js
├── services/
│   └── scene.service.js
├── models/
│   └── Scene.js
├── routes/
│   └── index.js
└── server.js
```

### 5.3. 데이터베이스 스키마

- **`scenes` 컬렉션**: Scene 문서를 저장.
- **Scene 문서 스키마 예시:**

```json
{
  "lights": [
    { "id": "...", "type": "point", "position": [x,y,z], "color": "#ffffff", "intensity": 1.0 }
  ],
  "camera": {
    "position": [x,y,z],
    "fov": 75
  },
  "objects": [
    { "id": "...", "type": "mannequin", "position": [0,0,0], "rotation": [0,0,0] }
  ]
}
```

## 6. 개발 로드맵 (Development Roadmap)

### ✅ Phase 1: 3D Scene 기본 환경 구축 (Frontend Only) - 완료

- **결과**: Vite+React 프로젝트 설정, R3F/Drei 라이브러리 연동 완료. `OrbitControls`가 적용된 기본 3D 캔버스에 바닥과 구(Sphere)를 렌더링함.

### ✅ Phase 2: 핵심 기능 UI 및 로직 구현 (Frontend Only) - 완료

- **결과**: Tailwind CSS 기반의 `EditorPanel` UI 구현. `Zustand`를 도입하여 조명과 카메라의 상태를 전역으로 관리. UI 컨트롤(슬라이더, 컬러 피커)과 3D Scene이 `Zustand`를 통해 실시간으로 연동됨. 기본 객체를 마네킹 모델로 교체.

### ➡️ Phase 3: 백엔드 연동 (MERN Full-stack) - 진행 중

- **목표**: Scene 저장 및 불러오기 기능 구현.
- **세부 계획**:
  1. Node.js/Express 기반의 MVCS 패턴으로 서버 구조 설계.
  2. Mongoose를 사용하여 `Scene` 모델 정의.
  3. Scene 저장을 위한 API 엔드포인트 (`POST /api/scenes`) 개발.
  4. Scene 불러오기를 위한 API 엔드포인트 (`GET /api/scenes/:id`) 개발.
  5. React 앱에서 `axios` 또는 `fetch`를 사용하여 '저장'/'불러오기' 기능과 API 연동.

### Phase 4: 배포 및 테스트

- **목표**: 개발된 애플리케이션을 웹에 배포하여 누구나 접근할 수 있도록 함.
- **세부 계획**:
  - Frontend 코드를 Vercel 또는 Netlify에 배포.
  - Backend 코드를 Heroku 또는 Fly.io와 같은 PaaS에 배포.
  - CORS(Cross-Origin Resource Sharing) 문제 해결 및 전체 기능 E2E 테스트.

## 7. 성공 지표 (Success Metrics)

- **작업 완료율:** 사용자가 웹사이트에 방문하여 Scene을 성공적으로 저장하는 비율.
- **성능:** 3개 이상의 조명이 설치된 환경에서도 초당 30프레임 이상을 유지하는가.
- **사용자 피드백:** 타겟 사용자들이 "쉽다", "직관적이다", "유용하다"와 같은 긍정적인 피드백을 남기는가.

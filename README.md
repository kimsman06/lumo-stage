# LumoStage

LumoStage는 웹 기반의 실시간 3D 조명 시뮬레이션 애플리케이션입니다. 사용자는 가상의 3D 공간에서 조명, 객체, 카메라를 직접 제어하며 원하는 장면을 연출하고, 그 결과를 즉시 확인할 수 있습니다.

## ✨ 주요 기능 (Key Features)

- **실시간 3D 뷰포트**: Three.js와 React-Three-Fiber를 사용한 고품질 3D 렌더링
- **직관적인 컨트롤**: 마우스를 이용한 3D 공간 탐색 및 객체 조작
- **동적 조명 제어**: 다양한 유형의 조명(Point, Spot, Directional)을 추가하고 속성(위치, 색상, 강도)을 실시간으로 변경
- **카메라 제어**: 카메라 위치, 시야각(FOV) 등 상세 설정 가능
- **Scene 저장 및 공유**: 연출한 3D 장면을 서버에 저장하고, 고유 URL을 통해 다른 사람과 공유

## 🛠 기술 스택 (Tech Stack)

- **Frontend**: React, Vite, Zustand
- **3D**: Three.js, React-Three-Fiber, React-Three-Drei
- **Styling**: Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB

## 🏗️ 아키텍처 (Architecture)

LumoStage는 클라이언트-서버 아키텍처를 따릅니다.

### 📁 클라이언트 (Client)

클라이언트는 React를 기반으로 한 SPA(Single Page Application)입니다. 3D 렌더링과 상태 관리를 중심으로 다음과 같이 구성됩니다.

- **`App.jsx`**: 애플리케이션의 메인 진입점. 전체 레이아웃과 핵심 컴포넌트들을 포함.
- **`components/`**: 재사용 가능한 UI 및 3D 컴포넌트.
  - **`Scene.jsx`**: 3D 렌더링이 일어나는 주된 캔버스. 조명, 객체, 카메라 등 모든 3D 요소를 포함.
  - **`EditorPanel.jsx`**: 사용자가 조명, 카메라 등을 제어하는 UI 컨트롤 패널.
  - **`Controls.jsx`**: `EditorPanel` 내에서 사용되는 개별 UI 요소(슬라이더, 컬러 피커 등).
  - **`Mannequin.jsx`**: 3D 마네킹 모델을 렌더링하는 컴포넌트.
- **`store.js`**: Zustand를 사용한 전역 상태 관리 저장소. 3D Scene의 모든 상태(조명, 카메라, 객체 위치 등)를 중앙에서 관리.

### 🗄️ 서버 (Server)

서버는 Node.js와 Express를 기반으로 하며, **MVCS (Model-View-Controller-Service)** 패턴을 적용하여 유지보수성과 확장성을 높입니다.

```
server/
├── controllers/  # 요청(Request)을 받아 서비스(Service)에 전달
│   └── scene.controller.js
├── services/     # 핵심 비즈니스 로직 처리
│   └── scene.service.js
├── models/       # 데이터베이스 스키마 정의 (Mongoose)
│   └── Scene.js
├── routes/       # URL 엔드포인트와 컨트롤러(Controller)를 매핑
│   └── index.js
└── server.js     # 서버 시작 및 기본 설정
```

- **Model**: MongoDB의 Scene 컬렉션에 대한 Mongoose 스키마를 정의합니다. Scene에 포함될 조명, 카메라, 객체 데이터 구조를 명시합니다.
- **View**: REST API 서버이므로 전통적인 View는 없으며, 클라이언트에 JSON 형태로 데이터를 응답하는 것이 View의 역할을 대신합니다.
- **Controller**: API 엔드포인트의 직접적인 처리기입니다. HTTP 요청(request)을 받아 유효성을 검사하고, 비즈니스 로직을 처리하기 위해 적절한 서비스(Service) 함수를 호출한 후, 그 결과를 클라이언트에 응답(response)합니다.
- **Service**: 애플리케이션의 핵심 비즈니스 로직을 담당합니다. 예를 들어, 'Scene 저장' 요청이 들어오면, Controller로부터 데이터를 받아 데이터베이스에 실제로 저장하는 로직을 수행합니다. 데이터베이스와의 상호작용은 주로 이 레이어에서 Model을 통해 이루어집니다.

## 🔄 컴포넌트 상호작용 및 데이터 흐름 (Component Interaction & Data Flow)

LumoStage의 데이터 흐름은 **단방향 데이터 흐름** 원칙을 따르며, `Zustand`가 중앙 허브 역할을 합니다.

**쉽게 비유하자면:**

- `EditorPanel`(UI)는 "방송 조정실의 컨트롤 보드"입니다.
- `Zustand Store`는 "모든 설정을 기억하고 지시를 내리는 중앙 컴퓨터"입니다.
- `Scene` (3D 캔버스)은 "실제 방송이 나가는 무대"입니다.

**작동 순서:**

1.  **사용자 입력**: 사용자가 `EditorPanel`의 슬라이더를 움직여 조명의 밝기를 조절합니다.
2.  **상태 업데이트 요청**: `EditorPanel` 컴포넌트는 `Zustand` Store에 정의된 함수(예: `updateLightIntensity(id, value)`)를 호출하여 "중앙 컴퓨터"에 상태 변경을 요청합니다.
3.  **중앙 상태 변경**: `Zustand` Store는 요청받은 대로 특정 조명의 밝기 값을 업데이트합니다.
4.  **자동 전파 및 리렌더링**: "무대"인 `Scene` 컴포넌트는 "중앙 컴퓨터"(`Zustand` Store)의 상태를 항상 지켜보고(구독) 있습니다. 조명 밝기 값이 변경된 것을 감지하면, React-Three-Fiber가 자동으로 해당 조명 컴포넌트만 새로운 밝기 값으로 다시 렌더링합니다.

이러한 구조 덕분에 UI(EditorPanel)와 3D Scene은 직접적으로 서로를 알 필요가 없으며, 오직 중앙 상태(`Zustand` Store)에만 의존하게 됩니다. 이는 코드의 복잡도를 낮추고 예측 가능한 동작을 보장합니다.

```
[사용자 입력 in EditorPanel.jsx] ---> [Zustand Store의 상태 업데이트 함수 호출] ---> [Store 상태 변경] ---> [Scene.jsx가 변경을 감지하고 자동 리렌더링]
```

## 🚀 시작하기 (Getting Started)

### 전제 조건

- Node.js (v18.x 이상)
- npm

### 설치 및 실행

1.  **프로젝트 클론 및 의존성 설치**:

    ```bash
    # 클라이언트 의존성 설치
    cd client
    npm install

    # 서버 의존성 설치
    cd ../server
    npm install
    ```

2.  **클라이언트 실행**:

    ```bash
    # /client 디렉터리에서 실행
    npm run dev
    ```

    - 브라우저에서 `http://localhost:5173`으로 접속합니다.

3.  **서버 실행**:
    ```bash
    # /server 디렉터리에서 실행
    npm start
    ```
    - API 서버가 `http://localhost:3001`에서 실행됩니다.

## 📄 라이선스 (License)

본 프로젝트는 MIT 라이선스를 따릅니다.

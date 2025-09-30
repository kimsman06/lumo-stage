# LumoStage 프로젝트를 위한 Gemini CLI 설정 파일

## 0. 절대 유의사항

- 절대 파일을 삭제하지 않습니다. 덮어쓰기를 하거나 주석 처리를 합니다.
- 코딩 전 사용자에게 계획을 .md 형식의 to-do list를 작성하고, 해당 파일을 프로젝트 루트에 저장합니다.
- 각 단계를 실행기 전 꼭 사용자에게 묻습니다.
- 복잡한 작업의 경우 sequential-thinking mcp를 최대한 사용합니다.
- 각 to-do list의 태스크를 완료 한 후에는 git을 이용에 커밋을 해줍니다. 커밋 메시지도 작성해줍니다.
- 커밋 메시지 스타일은 보편적인 Git Commit Message Style Guide를 따릅니다.

## 1. 프로젝트 정의

```yaml
project:
  name: "LumoStage"
  description: "PRD 문서에 명시된 MERN 스택 기반의 3D 조명 시뮬레이션 웹 앱입니다. 사용자는 웹에서 실시간으로 조명과 카메라를 설정하고 그 결과를 확인할 수 있습니다."
  version: "1.0.0"
  author: "(사용자 이름)"
```

## 2. 기술 스택 정의

```yaml
stack:
  - React
  - Vite
  - Three.js
  - React-Three-Fiber
  - Node.js
  - Express
  - MongoDB
  - Tailwind CSS
```

## 3. 파일 구조 정의 (생성될 파일의 기본 위치)

```yaml
file_structure:
  root: "/"
  client: "client/"
  server: "server/"
  components: "client/src/components/"
  models: "server/models/"
```

## 4. 사용자 정의 명령어 (CLI에서 'gemini run <command_name>'으로 실행)

```yaml
commands:
```

### PHASE 1: 3D Scene 기본 환경 구축

```yaml
phase1:
  description: "PRD 6단계(개발 로드맵)의 Phase 1을 실행합니다. React-Three-Fiber를 사용하여 기본 3D 뷰포트와 컨트롤을 생성합니다."
  prompt: |
    'LumoStage_PRD.md' 파일의 "6. 개발 로드맵 - Phase 1" 섹션을 참고하여, 다음 요구사항을 만족하는 단일 React 파일 src/App.jsx를 생성해줘.

    1.  **기술 스택:** React, Vite, `@react-three/fiber`, `@react-three/drei`, `tailwindcss`를 사용해야 함.
    2.  **전체 레이아웃:** Tailwind CSS를 사용하여 전체 화면을 차지하는 검은색 배경의 컨테이너를 만들어줘.
    3.  **3D 캔버스:** `@react-three/fiber`의 `<Canvas>` 컴포넌트를 사용하여 3D 렌더링 영역을 생성해줘. 그림자(shadows)를 활성화해줘.
    4.  **기본 객체:**
        -   회색 바닥(Plane)을 `y= -1.5` 위치에 생성하고, 그림자를 받을 수 있도록 설정해줘.
        -   중앙에 반짝이는 재질(metallic)의 구(Sphere)를 배치하고, 그림자를 생성하도록 설정해줘.
    5.  **기본 조명:**
        -   전체적으로 은은한 빛을 제공하는 `<ambientLight>`를 추가해줘. (강도: 0.5)
        -   특정 방향에서 강한 빛을 비추는 `<directionalLight>`를 추가하고, 그림자를 생성하도록 설정해줘. (위치: [10, 10, 5])
    6.  **카메라 컨트롤:** `@react-three/drei`의 `<OrbitControls>`를 추가하여 사용자가 마우스로 3D Scene을 회전, 확대/축소, 이동할 수 있게 해줘.
    7.  **코드 구조:** 모든 코드는 `App.jsx` 단일 파일 내에 functional component 형태로 작성해줘. 별도의 파일로 분리하지 마.
```

### PHASE 2: 핵심 기능 UI 및 로직 구현

```yaml
phase2:
  description: "PRD 6단계의 Phase 2를 실행합니다. 조명과 카메라를 제어할 수 있는 UI와 상태 관리 로직을 추가합니다."
  prompt: |
    'LumoStage_PRD.md' 파일의 "4.2. 조명 제어", "4.3. 카메라 제어", "6. 개발 로드맵 - Phase 2" 섹션을 참고하여, 이전 단계에서 생성된 src/App.jsx 파일을 다음과 같이 수정해줘.

    1.  **상태 관리:** `zustand` 라이브러리를 사용하여 조명과 카메라의 상태를 전역으로 관리하는 `useStore`를 만들어줘.
        -   `lights` 상태: 조명 객체들의 배열. 각 객체는 `id`, `type`, `position`, `color`, `intensity` 등의 속성을 가짐.
        -   `camera` 상태: 카메라의 `position`, `fov` 등의 속성을 가짐.
    2.  **UI 레이아웃:**
        -   화면을 좌우로 분할하여 왼쪽에는 3D 캔버스를, 오른쪽에는 컨트롤 패널을 배치해줘. (Tailwind CSS flex 사용)
        -   컨트롤 패널은 스크롤이 가능한 영역이어야 함.
    3.  **컨트롤 패널 구현:**
        -   '조명 추가' 버튼을 만들고, 클릭 시 `zustand` store에 새로운 'point' 타입 조명 객체를 추가하도록 구현해줘.
        -   `lights` 배열을 순회하며 각 조명을 제어할 수 있는 UI(카드 형태)를 렌더링해줘.
        -   각 조명 카드에는 조명의 `position` (X, Y, Z), `intensity`를 조절할 수 있는 슬라이더(input type=range)와 `color`를 변경할 수 있는 컬러 피커(input type=color)를 포함해줘.
        -   모든 UI 컨트롤은 `zustand` store의 상태와 양방향으로 바인딩되어야 함. (값 변경 시 store 업데이트 -> 3D Scene 자동 업데이트)
    4.  **3D Scene 연동:**
        -   `<Canvas>` 내부에서 `zustand` store를 구독(subscribe)해줘.
        -   `lights` 배열을 map()으로 순회하여 상태에 따라 동적으로 `<pointLight>`, `<spotLight>` 등의 조명 컴포넌트를 렌더링해줘. 각 조명의 속성(위치, 색상 등)은 store의 값을 그대로 사용해야 함.
        -   `<Canvas>`의 `camera` 속성을 store의 카메라 상태와 연결하여 UI로 카메라를 제어할 수 있게 해줘.
```

### PHASE 3: 백엔드 연동

```yaml
phase3:
  description: "PRD 6단계의 Phase 3를 실행합니다. Scene 데이터를 저장하고 불러오는 Node.js/Express API 서버를 구축하고 프론트엔드와 연동합니다."
  prompt: |
    'LumoStage_PRD.md' 파일의 "5. 기술 스택 및 아키텍처", "6. 개발 로드맵 - Phase 3" 섹션을 참고하여, 다음의 백엔드 파일 2개와 프론트엔드 수정사항을 생성/적용해줘.

    **1. Mongoose 모델 파일 생성 (`server/models/Scene.js`):**
    -   `mongoose`를 사용하여 `SceneSchema`를 정의해줘.
    -   PRD의 "Scene 문서 스키마"에 명시된 대로 `lights`, `camera`, `objects` 필드를 포함해야 함. 각 필드의 타입은 `Object` 또는 `Array`로 유연하게 설정해줘.
    -   스키마를 기반으로 'Scene' 모델을 export 해줘.

    **2. Express 서버 파일 생성 (`server/server.js`):**
    -   `express`, `mongoose`, `cors` 라이브러리를 사용해줘.
    -   MongoDB 데이터베이스에 연결하는 로직을 포함해줘. (연결 문자열은 환경 변수 `MONGODB_URI`를 사용하도록 설정)
    -   `cors` 미들웨어를 사용하여 모든 도메인의 요청을 허용해줘.
    -   `express.json()` 미들웨어를 사용하여 JSON 요청 본문을 파싱할 수 있게 해줘.
    -   **API 엔드포인트 구현:**
        -   `POST /api/scenes`: 요청 본문의 Scene 데이터를 받아 위에서 만든 `Scene` 모델을 사용하여 MongoDB에 저장한 후, 생성된 문서의 `_id`를 반환해줘.
        -   `GET /api/scenes/:id`: URL 파라미터로 받은 `id`를 사용하여 MongoDB에서 해당 Scene 문서를 찾아 JSON 형태로 반환해줘.
    -   서버가 3001 포트에서 실행되도록 설정해줘.

    **3. 프론트엔드 수정 (`src/App.jsx`):**
    -   컨트롤 패널 상단에 '저장' 버튼을 추가해줘.
    -   '저장' 버튼 클릭 시, 현재 `zustand` store의 `lights`와 `camera` 상태를 JSON 객체로 만들어 `axios` 또는 `fetch`를 사용하여 `http://localhost:3001/api/scenes`로 POST 요청을 보내는 함수를 구현해줘.
    -   요청 성공 시, 반환받은 `_id`를 사용하여 현재 URL을 `/?scene=<_id>` 형태로 변경해줘 (`window.history.pushState`).
    -   컴포넌트가 처음 마운트될 때, URL을 파싱하여 `scene` 쿼리 파라미터가 있는지 확인하는 로직을 `useEffect`에 추가해줘.
    -   `scene` ID가 있다면, 해당 ID로 `http://localhost:3001/api/scenes/:id`에 GET 요청을 보내 Scene 데이터를 가져온 후, 그 데이터로 `zustand` store의 초기 상태를 설정해줘.
```

### 기타 지침사항

- 모든 라이브러리 설치는 사용자가 직접 진행하고 확인이 완료되면 설치 후 단계를 실행합니다.
- 절대 원본 파일을 바꾸지말고 새로운 파일을 만들어 컴포넌트화 해서 사용합니다.
- 각 Phase별 checkbox가 완료되면 체크합니다.

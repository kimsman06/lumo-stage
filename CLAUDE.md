# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

LumoStage는 웹 기반 실시간 3D 조명 시뮬레이션 애플리케이션입니다. Three.js/React-Three-Fiber를 사용하여 3D 마네킹에 조명을 연출하고, 프로젝트로 저장/관리하는 기능을 제공합니다.

**주요 기술 스택:**

- Frontend: React + Vite, Zustand (상태관리), React-Three-Fiber (3D), Tailwind CSS + shadcn/ui
- Backend: Node.js + Express, MongoDB + Mongoose
- 인증: JWT (HttpOnly 쿠키) + Passport.js (Google/Naver OAuth)

## 개발 환경 설정 및 실행

### 클라이언트 (Client)

```bash
cd client
npm install                 # 의존성 설치
npm run dev                 # 개발 서버 실행 (http://localhost:5173)
npm run build               # 프로덕션 빌드
npm run preview             # 빌드 결과 미리보기
npm run lint                # ESLint 실행 (엄격한 no-unused-vars 적용)
```

### 서버 (Server)

```bash
cd server
npm install                 # 의존성 설치
npm run dev                 # 개발 서버 실행 (http://localhost:3001)
npm start                   # 프로덕션 서버 실행
npm test                    # Jest 테스트 실행 (TDD 사용)
```

**환경변수:** `server/.env` 파일에 MongoDB URI, JWT Secret, OAuth 클라이언트 ID/Secret 등을 설정해야 합니다. `server/.env.example` 참고.

## 아키텍처 및 데이터 흐름

### 클라이언트 아키텍처

**단방향 데이터 흐름 (Zustand 중심):**

```
[UI 컴포넌트] → [Zustand Store 액션 호출] → [중앙 상태 업데이트] → [Scene/컴포넌트 자동 리렌더링]
```

- **상태 관리 (`client/src/store.js`)**: 모든 3D Scene 상태(조명, 마네킹 포즈, 카메라)를 중앙에서 관리

  - `mannequins`: 마네킹 목록 및 각 마네킹의 position, pose(관절 회전값)
  - `lights`: 조명 목록 및 각 조명의 type, position, color, intensity 등
  - `cameraState`: 카메라 position, target, focalLength
  - `viewMode`, `transformMode`, `highlightedBone` 등 UI 상태

- **3D 렌더링 (`client/src/components/Scene.jsx`)**: React-Three-Fiber `<Canvas>` 내에서 Zustand 상태를 구독하여 3D 객체 렌더링

  - `Scene.jsx`는 `useStore`로 조명/마네킹 상태를 읽고, 해당 데이터를 Three.js 컴포넌트로 매핑
  - 사용자가 EditorPanel에서 조명을 조정하면 → Zustand 상태 변경 → Scene 자동 업데이트

- **컨트롤 UI (`client/src/components/editor/`)**:
  - `CameraControl.jsx`: 카메라 위치, FOV 조정 UI
  - `LightsControl.jsx`, `LightCard.jsx`: 조명 추가/삭제/속성 조정 UI
  - `MannequinControl.jsx`: 마네킹 관절(bone) 회전 조정 UI (IK 포함)

### 서버 아키텍처 (MVCS 패턴)

```
server/
├── controllers/     # HTTP 요청 처리, 유효성 검사, 응답 전송
├── services/        # 비즈니스 로직, DB 상호작용 (Model 사용)
├── models/          # Mongoose 스키마 (User, Project)
├── routes/          # 엔드포인트 정의 및 Controller 연결
├── middleware/      # 인증 미들웨어 (JWT 검증)
├── config/          # Passport 전략 설정
└── tests/           # Jest + Supertest 테스트 (TDD)
```

**데이터 모델:**

- `User`: username, email, password(bcrypt), googleId, naverId
- `Project`: name, description, owner(User 참조), sceneData(JSON - 조명/마네킹 상태 전체), thumbnail, createdAt, updatedAt
  - **단방향 참조**: Project → User (owner 필드). User는 Project 배열을 직접 가지지 않음. `Project.find({ owner: userId })`로 조회.

**인증 흐름:**

1. 로그인/소셜 로그인 → JWT 발급 → HttpOnly 쿠키(`token`)로 전송
2. 이후 모든 `/api/projects/*` 요청은 `requireAuth` 미들웨어에서 JWT 검증
3. `req.user`에 사용자 정보 저장 → Controller/Service에서 사용

**API 엔드포인트:**

- `/api/auth/register`, `/api/auth/login` (로컬 인증)
- `/api/auth/google`, `/api/auth/naver` (소셜 로그인)
- `/api/projects` (GET: 목록, POST: 생성)
- `/api/projects/:id` (GET: 조회, PATCH: 업데이트/저장, DELETE: 삭제)

자세한 API 스펙은 `docs/PROJECT_DASHBOARD_API.md` 참고.

## 주요 개발 패턴 및 규칙

### 코드 스타일

- **ES Modules** 사용 (import/export)
- **2-space 들여쓰기**
- **React 컴포넌트**: PascalCase, `.jsx` 확장자 사용
- **커스텀 훅**: `use` 접두사 사용, `client/src/lib/` 또는 컴포넌트 근처에 배치
- **Tailwind CSS**: utility-first 스타일 사용, shadcn/ui 컴포넌트(`client/src/components/ui/`) 활용
- **Zustand 액션**: 순수하고 동기적으로 작성. 비동기 작업은 컴포넌트에서 처리 후 액션 호출.

### 테스트 전략 (TDD)

- **백엔드**: Jest + Supertest + mongodb-memory-server 사용
  1. (RED) 실패하는 테스트 작성 (`server/tests/*.test.js`)
  2. (GREEN) 최소한의 코드로 테스트 통과
  3. (REFACTOR) 코드 리팩토링
- **프론트엔드**: 현재 자동화된 테스트 스택은 없음. Vitest + Testing Library 도입 시 `*.test.jsx` 형식으로 작성.

### Git 커밋 규칙 (Conventional Commits)

```
type(scope): summary

예시:
feat(client): Add camera FOV control to editor
refactor(docs): Update data modeling to unidirectional reference
fix(server): Correct JWT expiration handling
```

- `type`: feat, fix, refactor, docs, test, chore 등
- `scope`: client, server, docs 등
- 커밋 메시지는 72자 이하로 간결하게 작성

## 컴포넌트 및 파일 구조

### 클라이언트 (`client/src/`)

- `App.jsx`: 라우팅 정의 (react-router-dom)

  - `/` → HomePage (히어로 페이지)
  - `/projects` → ProjectsDashboardPage (프로젝트 목록)
  - `/editor` (또는 `/editor/:id`) → EditorPage (3D 에디터)

- `components/`:

  - `hero/`: 히어로 페이지 관련 컴포넌트
  - `projects/`: ProjectCard, NewProjectDialog, EmptyState 등
  - `editor/`: CameraControl, LightsControl, MannequinControl
  - `ui/`: shadcn/ui 컴포넌트들 (Button, Dialog, Slider 등)
  - `Scene.jsx`: React-Three-Fiber 캔버스, 3D 렌더링
  - `Mannequin.jsx`: 마네킹 3D 모델 컴포넌트

- `pages/`: HomePage, EditorPage, ProjectsDashboardPage
- `store.js`: Zustand 전역 상태 저장소
- `presets.js`: 마네킹 포즈 프리셋

### 서버 (`server/`)

- `server.js`: 서버 진입점 (Express app 설정, MongoDB 연결)
- `controllers/`: auth.controller.js, project.controller.js
- `services/`: auth.service.js, project.service.js
- `models/`: User.js, Project.js
- `routes/`: auth.routes.js, project.routes.js, index.js (라우터 통합)
- `middleware/`: 인증 미들웨어
- `config/`: passport.js (OAuth 전략)
- `tests/`: auth.test.js, project.test.js

## 중요 개발 지침

### 라이브러리 설치

- 모든 npm 패키지 설치는 **사용자가 직접** 수행합니다.
- 코드 작성 시 새로운 패키지가 필요하면 사용자에게 설치를 요청하고, 설치 확인 후 다음 단계를 진행합니다.

### 파일 수정

- **절대 원본 파일을 직접 변경하지 말고**, 새로운 컴포넌트를 만들어 컴포넌트화하여 사용합니다.
- 기존 컴포넌트의 기능을 확장할 때는 props를 활용하거나, 새로운 래퍼 컴포넌트를 만들어 기존 컴포넌트를 감싸는 방식을 사용합니다.

### shadcn/ui 사용

- UI 컴포넌트는 shadcn/ui를 적극 활용합니다.
- 새로운 shadcn 컴포넌트 설치는 **사용자가 직접** 수행합니다. 설치가 필요한 경우 사용자에게 명령어를 알려주고 대기합니다.
- shadcn mcp를 적극 사용 합니다.

### Phase별 체크리스트 관리

- `PROJECT_DASHBOARD_PLAN.md`의 각 Phase별 체크박스(`[ ]`, `[x]`)를 작업 완료 시 업데이트합니다.
- 새로운 기능 구현 시 해당 Phase의 todo 항목을 참고합니다.

### 언어

- **모든 응답은 한국어로** 작성합니다.

## 참고 문서

- `README.md`: 프로젝트 전체 개요 및 설치 가이드
- `PROJECT_DASHBOARD_PLAN.md`: 프로젝트 대시보드 및 인증 기능 구현 계획, 데이터 모델링, Phase별 To-Do 리스트
- `docs/PROJECT_DASHBOARD_API.md`: REST API 상세 명세 (인증, 프로젝트 CRUD)
- `AGENTS.md`: AI 에이전트 사용 가이드라인 (Repository Guidelines와 중복)

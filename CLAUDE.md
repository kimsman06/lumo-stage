# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

LumoStage는 웹 기반 실시간 3D 조명 시뮬레이션 애플리케이션입니다. Three.js/React-Three-Fiber를 사용하여 3D 마네킹에 조명을 연출하고, 프로젝트로 저장/관리하는 기능을 제공합니다.

**주요 기술 스택:**

- Frontend: React + Vite, Zustand (상태관리), React-Three-Fiber (3D), Tailwind CSS + shadcn/ui
- Backend: Node.js + Express, MongoDB + Mongoose
- 인증: Session (express-session + MongoDB) + Passport.js (Google/Naver OAuth) + CSRF 보호

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

**환경변수:** `server/.env` 파일에 MongoDB URI, SESSION_SECRET, OAuth 클라이언트 ID/Secret 등을 설정해야 합니다. `server/.env.example` 참고.

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
├── middleware/      # 인증 미들웨어 (세션 검증), CSRF 보호
├── config/          # Passport 전략 설정, 세션 설정
└── tests/           # Jest + Supertest 테스트 (TDD)
```

**데이터 모델:**

- `User`: username, email, password(bcrypt), googleId, naverId
- `Project`: name, description, owner(User 참조), sceneData(JSON - 조명/마네킹 상태 전체), thumbnail, createdAt, updatedAt
  - **단방향 참조**: Project → User (owner 필드). User는 Project 배열을 직접 가지지 않음. `Project.find({ owner: userId })`로 조회.

**인증 흐름:**

1. 로그인/소셜 로그인 → 세션 생성 → HttpOnly 쿠키(`lumostage.sid`)로 세션 ID 전송
2. 세션 데이터는 MongoDB에 저장 (express-session + connect-mongo)
3. 이후 모든 `/api/projects/*` 요청은 `requireAuth` 미들웨어에서 세션 검증
4. `req.session.userId`로 사용자 식별 → DB에서 사용자 정보 조회 → `req.user`에 저장
5. CSRF 토큰으로 POST/PATCH/DELETE 요청 보호 (csurf 미들웨어)

**API 엔드포인트:**

- `/api/auth/register`, `/api/auth/login` (로컬 인증)
- `/api/auth/google`, `/api/auth/naver` (소셜 로그인)
- `/api/projects` (GET: 목록, POST: 생성)
- `/api/projects/:id` (GET: 조회, PATCH: 업데이트/저장, DELETE: 삭제)

자세한 API 스펙은 `docs/api/PROJECT_DASHBOARD_API.md` 참고.

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

### 언어

- **모든 응답은 한국어로** 작성합니다.

## AI Agent 활용 가이드

이 프로젝트는 전문 AI Agent들을 활용하여 효율적으로 작업할 수 있습니다. **복잡한 작업이나 전문 영역의 작업은 반드시 해당 Agent를 사용하세요.**

### 사용 가능한 Agent 목록

#### 1. **frontend-developer** - 프론트엔드 개발 전문가

**언제 사용하나요?**

- React 컴포넌트 개발 또는 수정
- Zustand 상태 관리 로직 구현
- React-Three-Fiber 3D Scene 작업
- 클라이언트 측 성능 최적화
- 프론트엔드 버그 수정

**사용 예시:**

```
Task 도구 사용:
- subagent_type: frontend-developer
- prompt: "ProjectCard 컴포넌트에 hover 애니메이션을 추가하고 Tailwind를 사용해 반응형으로 만들어주세요."
```

#### 2. **ui-ux-designer** - UI/UX 디자인 전문가

**언제 사용하나요?**

- 디자인 시스템 구축 또는 개선
- 사용자 경험(UX) 개선
- 접근성(Accessibility) 구현
- 컴포넌트 레이아웃 및 스타일링
- 디자인 일관성 검토

**사용 예시:**

```
Task 도구 사용:
- subagent_type: ui-ux-designer
- prompt: "에디터 페이지의 레이아웃을 검토하고 사용자 경험을 개선할 수 있는 방안을 제시하고 구현해주세요."
```

#### 3. **backend-architect** - 백엔드 아키텍처 전문가

**언제 사용하나요?**

- API 엔드포인트 설계
- 데이터베이스 스키마 설계
- 서버 로직 리팩토링
- 백엔드 성능 최적화
- MVCS 패턴 적용
- API 설계만 진행합니다. 구현은 절대 하지 않습니다.

**사용 예시:**

```
Task 도구 사용:
- subagent_type: backend-architect
- prompt: "프로젝트 공유 기능을 위한 ShareToken API를 설계하고 구현해주세요."
```

#### 4. **security-engineer** - 보안 전문가

**언제 사용하나요?**

- 보안 취약점 검토 및 수정
- 인증/인가 로직 구현
- CSRF, XSS 등 보안 이슈 대응
- 입력 검증 및 sanitization
- 보안 모범 사례 적용

**사용 예시:**

```
Task 도구 사용:
- subagent_type: security-engineer
- prompt: "현재 인증 시스템의 보안 취약점을 검토하고 개선 방안을 제시해주세요."
```

#### 5. **documentation-expert** - 문서화 전문가

**언제 사용하나요?**

- 기술 문서 작성 또는 개선
- API 명세서 작성
- 코드 주석 개선
- README, 가이드 문서 작성
- 개발 계획 문서 정리
- 문서 작성시 예제 코드 제외 (토큰 소요)

**사용 예시:**

```
Task 도구 사용:
- subagent_type: documentation-expert
- prompt: "새로 추가된 공유 기능에 대한 API 문서를 작성해주세요."
```

### Agent 사용 원칙

1. **자동 사용**: 복잡한 작업이나 전문 영역 작업은 **자동으로** 해당 Agent를 호출하세요.

   - 예: React 컴포넌트 여러 개 수정 → frontend-developer
   - 예: 디자인 시스템 정리 → ui-ux-designer
   - 예: API 설계 → backend-architect

2. **병렬 실행**: 독립적인 작업은 여러 Agent를 **병렬로** 실행하여 효율성을 높입니다.

   ```
   프론트엔드 개발자가 UI 구현하는 동안
   백엔드 아키텍트가 API 구현
   → 두 Agent를 동시에 실행
   ```

3. **명확한 지시**: Agent에게 구체적이고 명확한 작업 지시를 제공합니다.

   - ❌ "프로젝트를 개선해주세요"
   - ✅ "ProjectsDashboard의 검색 기능에 디바운스를 적용하고 성능을 최적화해주세요"

4. **컨텍스트 제공**: 관련 파일 경로, 기존 구현, 요구사항을 명확히 전달합니다.

5. **결과 확인**: Agent 작업 완료 후 결과를 검토하고 필요시 추가 작업을 요청합니다.

### 작업별 Agent 매칭 가이드

| 작업 유형                | 사용할 Agent         | 우선순위 |
| ------------------------ | -------------------- | -------- |
| React 컴포넌트 개발      | frontend-developer   | 필수     |
| 3D Scene 작업 (Three.js) | frontend-developer   | 필수     |
| UI/UX 개선               | ui-ux-designer       | 권장     |
| 디자인 시스템 구축       | ui-ux-designer       | 필수     |
| API 엔드포인트 구현      | backend-architect    | 필수     |
| 데이터베이스 스키마 설계 | backend-architect    | 필수     |
| 보안 검토 및 구현        | security-engineer    | 필수     |
| 인증/인가 시스템         | security-engineer    | 필수     |
| 기술 문서 작성           | documentation-expert | 권장     |
| 간단한 버그 수정         | (직접 처리 가능)     | -        |
| 설정 파일 수정           | (직접 처리 가능)     | -        |

### 예시 시나리오

**시나리오 1: 새로운 기능 추가 (토스트 알림 시스템)**

```
1. ui-ux-designer: 토스트 알림 디자인 및 UX 플로우 설계
2. frontend-developer: 토스트 컴포넌트 구현 및 통합
3. documentation-expert: 토스트 사용 가이드 문서화
```

**시나리오 2: 보안 강화**

```
1. security-engineer: 보안 취약점 검토 및 개선안 제시
2. backend-architect: 보안 미들웨어 구현
3. frontend-developer: 클라이언트 측 보안 대응
4. documentation-expert: 보안 가이드라인 문서화
```

**시나리오 3: 디자인 시스템 구축**

```
1. ui-ux-designer: 디자인 토큰, 색상 시스템 정의
2. frontend-developer: Tailwind 설정 및 공통 컴포넌트 구현
3. documentation-expert: 디자인 시스템 문서 작성
```

## 문서 구조

프로젝트의 모든 문서는 `/docs` 폴더 내에 카테고리별로 정리되어 있습니다:

### 핵심 문서

- `README.md`: 프로젝트 전체 개요 및 설치 가이드
- `docs/PRD.md`: 제품 요구사항 정의서 (Product Requirements Document)
- `CLAUDE.md`: Claude Code 작업 가이드라인
- `AGENTS.md`: AI 에이전트 사용 가이드라인

### 카테고리별 문서

#### `/docs/architecture` - 아키텍처 문서

- `LumoStage-Architecture.md`: 상태 관리 및 이벤트 흐름 설명

#### `/docs/api` - API 명세

- `PROJECT_DASHBOARD_API.md`: REST API 상세 명세 (인증, 프로젝트 CRUD)

#### `/docs/design` - 디자인 시스템

- `design-strategy.md`: 디자인 철학, 색상 시스템, 타이포그래피, UI 컴포넌트 명세
- `ui-spacing-system.md`: UI 간격 시스템 가이드

#### `/docs/planning` - 개발 계획

- `PROJECT_DASHBOARD_PLAN.md`: 프로젝트 대시보드 및 인증 기능 구현 계획
- `implementation-phases.md`: 단계별 구현 계획 (Phase 1~7 통합)
- `EDITOR_REFINEMENT_PLAN.md`: 에디터 패널 UI 개선 계획
- `HERO_PAGE_*.md`: Hero 페이지 관련 계획 문서들

#### `/docs/development` - 개발 진행 문서

- `Frontend-Implementation-Plan-20251026.md`: 프론트엔드 구현 상세 계획
- `frontend-refactor-plan-2025-10-26.md`: 프론트엔드 리팩토링 계획
- `server-action-plan-2025-10-26.md`: 서버 대응 계획
- `security-review-2025-10-26.md`: 보안 점검 메모
- `ui-refactor-summary-2025-10-27.md`: UI 리팩토링 요약

#### `/docs/legacy` - 레거시 문서

- 과거 작업 일지 및 버그 리포트
- 더 이상 사용하지 않는 체크리스트 및 임시 문서

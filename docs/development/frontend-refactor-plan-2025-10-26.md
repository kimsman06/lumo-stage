# LumoStage 프런트엔드 대규모 리팩터링 계획 (2025-02-14)

- 작성자: Codex Assistant
- 참고 문서: `FRONTEND_IMPROVEMENT_REPORT.md`, `docs/DesignStargey.md`, `docs/Frontend-Implementation-Plan-20251026.md`, `docs/LumoStage-Architecture.md`, `docs/security-review-2025-10-26.md`, `docs/implement/PHASE-7.1-PLAN.md`

---

## 1. 리팩터링 목표

1. 디자인 전략(`DesignStargey.md`)과 실제 UI 구현의 간극 해소
2. 프런트엔드 전반의 보안·환경 구성 취약점 보완 (`docs/security-review-2025-10-26.md` 참고)
3. 대시보드·에디터 기능 완성도 향상 및 사용자 피드백 강화
4. 중복/백업 파일 정리로 유지보수 비용 감소
5. 장기 기능 로드맵(Undo/Redo, 에셋 라이브러리 등)에 대비한 구조 재정비

---

## 2. 현황 요약

- `FRONTEND_IMPROVEMENT_REPORT.md` 기준: 색상 토큰 미적용, Scene 컴포넌트 비대화, 토스트 미연동 등의 개선 항목이 남아 있음.
- `Frontend-Implementation-Plan-20251026.md`의 Phase 3~4 일정 중 일부(토스트 피드백, 공유 다이얼로그, Scene Title 인라인 수정 등)가 아직 미완료 상태.
- `client/src/components/...` 아래에 `.backup.jsx` 파일 다수, 실사용 컴포넌트와 혼재하여 혼란 야기.

### 완료된 작업 (2025-10-27 기준)

#### 프론트엔드

- ✅ **환경 변수 정리** (A1): `client/src/lib/config.js` 생성, OAuth URL 및 API URL 환경 변수 기반으로 전환
  - ⏳ `client/.env.example` 생성 필요
- ✅ **CSRF 대응** (A3): `client/src/lib/api.js`에 axios 인터셉터 구현 (x-csrf-token 헤더, 401/419 에러 처리, 세션 갱신)
- ✅ **입력 검증 강화** (D4): `client/src/lib/validators.js` 생성 (이메일, 비밀번호, 사용자명 검증)
- ✅ **로그인/회원가입 UX 개선** (D4):
  - `autocomplete` 속성 추가 완료
  - 필드별 에러 메시지 표시
  - OAuth 버튼 환경 변수 연결
- ✅ **인증 상태 반영** (D6): `App.jsx`에서 checkAuth() 초기 실행, 인증 사용자 리디렉션 처리
- ✅ **UI 간격 시스템 통일** (B3 부분): `docs/ui-spacing-system.md` 작성 및 버튼 크기 가이드 추가
- ✅ **에디터 레이아웃 개선**: EditorPage, EditorPanel 레이아웃 구조 개선 (overflow 방지, flex 기반 레이아웃)
- ✅ **F1. 화면 비율 & 레터박스** (2025-10-27):
  - `LetterboxOverlay.jsx`, `aspectRatio.js` 생성
  - `editorStore`에 aspectRatio 상태 및 액션 추가
  - Scene과 CameraControl에 화면 비율 선택 및 렌더링 기능 구현
  - 가상 카메라와 캔버스 aspect 동기화

#### 백엔드

- ✅ **CSRF 미들웨어**: `server/middleware/csrf.middleware.js` 구현
- ✅ **세션 관리**: SessionToken 모델 및 서비스 구현
- ✅ **공유 기능**: ShareToken 모델 및 서비스/컨트롤러 구현
- ✅ **Scene 데이터 관리**: scene.service.js 분리
- ✅ **테스트 강화**: auth.test.js, project.test.js 업데이트

---

## 3. 작업 구조 (5개 워크스트림)

### 워크스트림 A · 기반 재정비 (주차 1)

| 세부 작업                             | 설명                                                                                                                                         | 산출물                                                                                                                                            | 상태                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| A1. 환경 변수 정리 ✅                 | `lib/api.js`, 로그인/회원가입 페이지의 OAuth URL을 `import.meta.env.VITE_API_URL`, `VITE_OAUTH_GOOGLE_URL` 등으로 치환. `.env.example` 갱신. | `client/.env.example`, `client/src/lib/api.js`, `client/src/lib/config.js`, `client/src/pages/LoginPage.jsx`, `client/src/pages/RegisterPage.jsx` | 완료 (`.env.example` 생성 필요) |
| A2. Vite 설정 확장                    | `vite.config.js`에 `__APP_VERSION__`, `__API_URL__` 등 글로벌 상수 주입 준비.                                                                | `client/vite.config.js`                                                                                                                           | 미완료                          |
| A3. 보안 미들웨어 대응 프런트 후속 ✅ | CSRF 대응 도입 시 필요한 `X-CSRF-Token` 헤더 전송 로직을 axios 인터셉터에 추가할 수 있도록 구조 마련.                                        | `client/src/lib/api.js` skeleton                                                                                                                  | 완료                            |
| A4. 문서 싱크                         | 리팩터링 일정과 목표를 `docs/Frontend-Implementation-Plan-20251026.md` 최신 상태와 맞춰 링크.                                                | 문서 PR                                                                                                                                           | 미완료                          |

### 워크스트림 B · 디자인 시스템 정합화 (주차 1-2)

- B1. Tailwind 토큰화: `DesignStargey.md`의 `primary`, `studio`, `accent` 팔레트를 `tailwind.config.js`에 추가, `App.css`/컴포넌트에서 하드코딩된 색상 교체. _(미완료)_
- B2. 공통 컴포넌트 정리: `components/ui`에 토글, 컬러 피커, 배지 등 공유 컴포넌트 생성 (`FRONTEND_IMPROVEMENT_REPORT.md`의 Popover 기반 컬러 피커 권고 반영). _(미완료)_
- B3. 모션 일관화: `tailwindcss-animate` 토큰을 활용해 `ProjectCard`, `HeroSection` 등에 정의된 hover 인터랙션 적용 (`DesignStargey.md`의 hover:scale-105 등). _(미완료)_

#### 부분 완료 항목

- ✅ **UI 간격 시스템 통일**: `docs/ui-spacing-system.md` 작성 및 적용
  - Tailwind CSS 기반 간격 시스템 가이드 작성
  - 버튼 크기 시스템 가이드 추가
  - 주요 컴포넌트에 간격 시스템 적용 (commit: 3789805, 57838e1, 3c8ec03)

### 워크스트림 C · 에디터 구조 리팩터링 (주차 2-3)

| 세부 작업                   | 설명                                                                                                                                                  | 상태                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| ⏳ C1. Scene 모듈 분리       | `client/src/components/Scene.jsx`를 `SceneRoot`, `SceneCanvas`, `LightsLayer`, `MannequinLayer`, `GizmoOverlay` 등으로 세분화하고 React 렌더러 재조정을 위해 도메인별 selector를 정의. Zustand `editorStore` 액션은 slice 기반 모듈로 재구성. | 진행 중 (2025-10-30 착수) |
| C2. 메모이제이션 & Suspense | 조명 카드(`LightCard`), 매뉴얼 컨트롤 컴포넌트에 `React.memo`/선택적 `useShallow` 적용.                                                               | 미완료                    |
| C3. Scene Title 인라인 편집 | `DesignStargey.md` 헤더 명세 반영. 에디터 헤더에 `Input` 노출 및 `projectStore.updateProject` 호출로 즉시 저장 (디바운스 적용).                       | 미완료                    |
| C4. Toast/피드백 통합       | `sonner`를 상태 변경(저장/삭제/에러)에 연결하고, `alert()` 등 레거시 호출 제거.                                                                       | 미완료                    |
| ✅ C5. 공유 기능 구현       | shareStore, 공유 컴포넌트(ShareButton, ShareDialog 등), SharedProjectViewer 페이지, 기존 페이지 통합 완료.                                           | **완료** (2025-10-29)     |

#### 부분 완료 항목

- ✅ **에디터 레이아웃 개선**: EditorPage, EditorPanel의 overflow 및 flex 레이아웃 구조 개선 (commit: 관련 작업)
- ✅ **공유 기능 전체 구현** (C5 완료, 2025-10-29):
  - `client/src/store/shareStore.js`: 공유 링크 생성/조회/업데이트/재생성 액션
  - 공유 컴포넌트: ShareButton, ShareDialog, ShareLinkDisplay, PermissionSelector, ExpirationSelector, ActiveToggle, ShareStatusBadge
  - SharedProjectViewer 페이지: ExpiredMessage, ViewerHeader, ViewerEditorPanel
  - ProjectCard, EditorPage에 공유 버튼 통합
  - App.jsx에 `/shared/:token` 라우트 추가
  - Toast 메시지 추가 (SHARE_MESSAGES)

#### Scene 분리 세부 전략 (React 렌더러 특성 반영)

- **선택적 구독**: `useStore(selector, shallow)` 패턴을 도입해 각 레이어가 필요한 slice만 구독. `LightsLayer`는 `state.lights`, `MannequinLayer`는 `state.mannequins`, `CameraRig`는 `state.cameraState`만 바라보도록 리팩터링.
- **렌더 트리 재구성**: `Scene`을 `SceneCanvas`(Canvas Wrapper) → `LightingStage`(Suspense Boundary) → `LightsLayer`, `MannequinLayer`, `CameraRig`, `GizmoOverlay` 구조로 나누고, 지연 로딩되는 모델은 `React.lazy` + `Suspense`로 격리해 차후 코드 스플리팅이 가능하도록 설계.
- **프레임 루프 제어**: TransformControls 드래그 중에만 `invalidate()`를 호출하고, `useFrame` 훅 내부에서 `state.isDragging`을 체크해 불필요한 렌더를 차단. 성능 분석을 위해 `performance.mark/measure`로 프레임 시간 로깅 추가.
- **메모이제이션 가이드**: 조명 지오메트리/머티리얼 생성은 `useMemo`로, 이벤트 핸들러는 `useCallback`으로 고정. `React.memo` 적용 시 위치·색상·타깃 배열만 비교하는 커스텀 비교 함수를 작성해 `RectAreaLight` 같은 고비용 객체가 재생성되지 않도록 함.
- **공용 컨텍스트**: 그림자, 환경맵, 후처리 파이프라인은 `SceneContext`를 만들어 props drilling 없이 공유하고, 향후 다중 뷰포트 확장에 대비.
- **키 안정성 유지**: React Reconciler가 Object3D를 안정적으로 매칭하도록 `lights.map` 등에서 `object.uuid`를 `key`로 사용하고, 동적 배열 정렬 시 `sort` 대신 `toSorted`를 활용해 참조를 보존.
- **Concurrent 렌더 대비**: 향후 React 18 Concurrent 특성을 활용하기 위해 `Suspense` 경계마다 `useTransition` 기반 로딩 상태를 분리하고, 외부 상태 업데이트는 `flushSync`를 피하며 `startTransition`으로 감싸 프레임 드랍을 방지.
- **TransformControls 상태 보호**: 동일 위치 업데이트 시 Zustand 액션이 반복 호출되지 않도록 `positionsAreEqual` 비교 후 조명·디퓨저·마네킹 위치를 갱신해 `Maximum update depth` 오류를 예방.

##### C1 진행 체크포인트 (React Render 특성 중심)

| 단계 | 작업 내용 | 산출물 | React 렌더링 포인트 |
| ---- | -------- | ------ | -------------------- |
| Step 1 | `client/src/components/editor/scene/SceneRoot.jsx`, `SceneCanvas.jsx` 신규 생성 후, 기존 `Scene.jsx`는 래퍼에서만 사용하도록 분리. | 신규 Scene 래퍼 컴포넌트 2종, 업데이트된 import 경로 표 | Canvas와 Suspense 경계를 분리해 commit 단계마다 캔버스 리셋을 막고, Canvas prop 변경 시 불필요한 재마운트를 차단. |
| Step 2 | `LightsLayer`, `MannequinLayer`, `GizmoOverlay`, `EffectsLayer`를 독립 파일로 이동하고 slice selector(`createLightsSlice`, `createMannequinSlice` 등) 도입. | `client/src/store/editor/lightsSlice.js` 등 slice 파일, 레이어별 컴포넌트 | `useStore(selector, shallow)`를 사용해 Render Phase마다 필요한 상태만 구독하고, 객체 비교 비용이 큰 경우 `useMemo`로 selector 결과를 캐시. |
| Step 3 | 기존 Scene 관련 훅(`useSceneHotkeys`, `useSceneClipboard`)을 레이어에 맞게 재배치하고, Vitest 기반 smoke 테스트(`SceneRoot.test.jsx`) 추가. | 테스트 스켈레톤, 훅 리팩터링 노트 | Scene 관련 훅이 React render 흐름을 막지 않도록 Effect 의존성을 정리하고, 테스트에서 React Testing Library의 `waitFor`로 비동기 렌더 타이밍을 검증. |

### 워크스트림 D · 대시보드 & 인증 경험 향상 (주차 3-4)

- D1. `ProjectsDashboard` 뷰모드 토글: 실제 리스트/그리드 토글 구현, `projectStore`에서 정렬/검색 캐싱. _(미완료)_
- D2. EmptyState 시나리오 확장: 프로젝트 없음, 검색 결과 없음, API 실패를 디자인에 맞춰 세분화. _(미완료)_
- D3. PrivateRoute 향상: `checkAuth` 호출을 `Suspense` 또는 `Loader` 패턴으로 바꾸고, 토큰 갱신 실패 시 재로그인 플로우 제공. _(미완료)_
- ✅ **D4. 로그인/회원가입 UX**: 입력 검증 강화(패턴, 길이), `autocomplete="email|current-password|new-password"` 속성 추가, 소셜 로그인 버튼 환경 변수 기반 연결, 필드별 에러 메시지 표시.
  - ✅ `client/src/lib/validators.js` 생성 (이메일, 비밀번호, 사용자명 검증)
  - ✅ LoginPage, RegisterPage에서 validators 사용 및 필드별 에러 표시
  - ✅ `autocomplete` 속성 추가 완료
  - ✅ OAuth URL 환경 변수 기반으로 변경 (`client/src/lib/config.js`)
  - ⏳ 토스트 피드백 통합은 추후 진행 (C4와 함께)
- D5. 접근성 점검: 모든 주요 버튼/토글에 `aria-label`, 키보드 포커스 스타일 추가. _(미완료)_
- ✅ **D6. 인증 상태 반영**: 홈/Hero 페이지에서 `checkAuth`를 초기 실행하도록 적용 완료, 인증 사용자는 `/login`, `/register` 방문 시 `/projects`로 리디렉션 처리.
  - ✅ `App.jsx`에서 useEffect로 checkAuth() 호출
  - ✅ LoginPage, RegisterPage에서 인증 시 리디렉션 처리

### 워크스트림 E · 코드/파일 정비 (주차 4)

#### E1. 제거 후보 (사전 검증 후 삭제) ⏳

현재 확인된 `.backup.jsx` 파일들:

- ✅ `client/src/pages/EditorPage.backup.jsx` (제거 필요)
- ✅ `client/src/components/projects/ProjectsDashboard.backup.jsx` (제거 필요)
- ✅ `client/src/components/projects/NewProjectDialog.backup.jsx` (제거 필요)

기타 점검 필요:

- `client/src/pages/EditorPage.jsx`와 중복되는 `client/src/components/EditorPanel.jsx` 사용 여부 재점검 (현재 사용 중으로 확인됨, 유지)
- `client/src/components/LumoStageHero.jsx` 등 레거시 단일 파일이 현재 구조와 어긋나면 도메인 폴더로 재배치

> **삭제 전 체크리스트**
>
> 1. `git log`로 최근 변경 이력 확인 (사용자 작성 여부 확인).
> 2. `rg "EditorPage.backup"` 등으로 참조 유무 점검.
> 3. 문서화(`docs/작업일지.md`)에 정리하여 팀 공유.

#### E2. 폴더 구조 개편 제안

- `client/src/components/editor/*` 하위에 3D 관련 컴포넌트 집약, `Scene`은 `editor/canvas`로 이동.
- `client/src/pages` 정리: `.backup` 제거 후 현재 라우트에 맞춰 `ProjectsDashboardPage` → `ProjectsPage`로 네이밍 통일 검토.
- `client/src/lib` 내 유틸 정리: API, 포맷터, 변환 로직을 모듈 단위로 분할 (`utils.format.js`, `utils.scene.js` 등).

### 워크스트림 F · 조명 & 카메라 확장 (주차 4-5, PHASE 7.1 연동)

| 세부 작업                      | 설명                                                                                                                                                                                                                                                                                                                                                    | 상태                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| ✅ F1. 화면 비율 & 레터박스    | `docs/implement/PHASE-7.1-PLAN.md` 참고. `editorStore.cameraState.aspectRatio`와 `setAspectRatio` 추가 → `EditorPanel` Scene 탭에 `<Select>` 배치 → `Scene` 상단에 `LetterboxOverlay` 컴포넌트 도입. `ResizeObserver`로 캔버스 크기를 추적하고 `virtualCamera.aspect`를 선택된 비율과 동기화.                                                           | **완료** (2025-10-27) |
| ⏳ F2. 디퓨저 시스템 (진행 중) | `client/src/components/Diffuser.jsx`, `client/src/components/editor/DiffuserControl.jsx` 구현 중. `editorStore`에 `diffusers` 상태 추가 및 Scene 내 디퓨저 렌더링 작업 진행 중입니다.                                                                                                                                                                   | **진행 중**           |
| F3. Rect Light 정식 지원       | R3F에서 `RectAreaLight` 사용. 초기화 시 `THREE.RectAreaLightUniformsLib.init()` 호출하고 `editorStore.lights`에 `type: "rect"` 추가(width/height, intensity, color). `LightsControl`에 전용 슬라이더·컬러 피커를 추가하고, Scene 레이어에서는 `rectAreaLightHelper`를 조건부 렌더링. Softbox 프리셋은 디퓨저 보류로 제외하며 기본 Rect 조명만 다룹니다. | 미완료                |
| F4. 데이터 스키마 업데이트     | `sceneData` 저장·로드 시 `aspectRatio`, `diffusers`, `rect` light 속성을 포함. 백엔드 정규화 로직 업데이트 필요.                                                                                                                                                                                                                                        | 미완료                |
| F5. QA & 매뉴얼                | 신규 기능에 대한 수동 테스트 시나리오 작성(레터박스 리사이즈, 디퓨저 동작, Rect Light 저장). 프로젝트 매뉴얼 업데이트 필요.                                                                                                                                                                                                                             | 미완료                |

#### F1 완료 상세 (2025-10-27)

- ✅ `client/src/components/editor/LetterboxOverlay.jsx` 생성
- ✅ `client/src/lib/aspectRatio.js` 유틸리티 생성 (화면 비율 계산 로직)
- ✅ `editorStore`에 `cameraState.aspectRatio` 및 `setAspectRatio` 액션 추가
- ✅ `Scene.jsx`에 LetterboxOverlay 통합 및 ResizeObserver 구현
- ✅ `CameraControl.jsx`에 화면 비율 선택 UI 추가
- ✅ 가상 카메라와 실제 캔버스 aspect 동기화 로직 구현

#### F2 진행 중 상세 (2025-10-27)

- ✅ `client/src/components/Diffuser.jsx` 컴포넌트 생성
- ✅ `client/src/components/editor/DiffuserControl.jsx` 컨트롤 UI 생성
- ⏳ `editorStore`에 디퓨저 상태 및 액션 추가 중
- ⏳ Scene 내 디퓨저 3D 렌더링 로직 구현 중

---

## 3.1. 백엔드 보안 & 인프라 강화 (병행 작업)

프런트엔드 리팩터링과 병행하여 백엔드 보안 및 인프라가 강화되었습니다:

### 완료된 작업 ✅

- ✅ **CSRF 보호**: `server/middleware/csrf.middleware.js` 구현

  - Double Submit Cookie 패턴 사용
  - `x-csrf-token` 헤더 검증
  - 419 상태 코드로 만료된 토큰 처리

- ✅ **세션 관리**: `server/services/session.service.js`, `server/models/SessionToken.js`

  - JWT 세션 토큰 관리
  - Refresh 토큰 로직

- ✅ **공유 기능 기반**: `server/services/share.service.js`, `server/routes/share.routes.js`, `server/controllers/share.controller.js`, `server/models/ShareToken.js`

  - 프로젝트 공유 토큰 시스템 구현

- ✅ **Scene 데이터 관리**: `server/services/scene.service.js`

  - Scene 데이터 검증 및 저장 로직 분리

- ✅ **인증 컨트롤러 강화**: `server/controllers/auth.controller.js`, `server/services/auth.service.js`

  - CSRF 토큰 발급 엔드포인트 추가
  - 세션 갱신 로직 개선

- ✅ **테스트 업데이트**: `server/tests/auth.test.js`, `server/tests/project.test.js`
  - CSRF 토큰 처리 테스트 추가
  - 인증 플로우 테스트 강화

---

## 4. 테스트 & 품질 계획

- Vitest 기반 UI 스냅샷 + 사용자 상호작용 테스트 추가 (`ProjectsDashboard`, `NewProjectDialog`, `EditorHeader`).
- Storybook 도입 검토: 디자인 토큰 적용 상태를 시각적으로 검증.
- Lighthouse & Axe를 활용한 접근성 검사 정기화.
- `npm run lint` 파이프라인에 `tsconfig.paths.json` 도입 시 ESLint 경로 인식 테스트.

---

## 5. 일정 (제안)

| 기간   | 주요 마일스톤                                 |
| ------ | --------------------------------------------- |
| 주차 1 | 워크스트림 A 완료, Tailwind 토큰 적용 착수    |
| 주차 2 | 워크스트림 B 완료, Scene 모듈 분리 시범 구현  |
| 주차 3 | 워크스트림 C 대부분 완료, Editor UX 베타 검증 |
| 주차 4 | 워크스트림 D, E 마무리, 문서 업데이트 및 QA   |

---

## 6. 후속 관리

- 완료 후 `FRONTEND_IMPROVEMENT_REPORT.md` 업데이트 & 관련 체크리스트 닫기
- `docs/implement/PHASE-*` 문서와 리팩터링 결과 싱크
- `README.md`의 개발자 경험(환경 변수, 실행 방법) 섹션 갱신
- 배포 전 `npm run lint`, `npm run build`, Smoke 테스트(`npm run preview`) 실행 및 결과 기록

---

### 담당자 배정 제안 (예시)

- 디자인 시스템: FE 팀 A
- 에디터 구조: FE 팀 B + 3D 전문 인력
- 인증/보안: FE 팀 C + 백엔드 협업
- 문서/QA: PM 또는 DX 담당자

---

## 7. 다음 작업 우선순위 (2025-10-27 업데이트)

### 🔥 현재 진행 중 (In Progress)

1. **⏳ C1 진행**: Scene 모듈 분리 (React 렌더러 대응)
   - `SceneRoot`, `SceneCanvas` 초안 작성 및 기존 `Scene.jsx` 의존성 분리
   - `editorStore` slice 재구성(`lightsSlice`, `mannequinSlice`)과 selector 최적화
   - Suspense 경계/`invalidate` 호출 주기를 점검하고 렌더 성능 로그 수집

2. **⏳ F2 완료**: 디퓨저 시스템
   - editorStore에 디퓨저 상태 및 액션 완성
   - Scene 내 디퓨저 3D 렌더링 로직 완성
   - DiffuserControl UI와 상태 연동
   - 디퓨저-조명 간 관계 설정 로직 구현

### 높은 우선순위 (High Priority)

3. **F3 시작**: Rect Light 정식 지원

   - RectAreaLight 컴포넌트 구현
   - editorStore에 rect 타입 조명 지원 추가
   - LightsControl에 Rect Light UI 추가

4. **F4 완료**: 데이터 스키마 업데이트

   - sceneData에 aspectRatio, diffusers 저장/로드 로직 추가
   - 백엔드 Scene 데이터 검증 로직 업데이트

5. **E1 실행**: 백업 파일 제거
   - git log로 이력 확인 후 안전하게 삭제
   - ProjectsDashboard.backup.jsx, NewProjectDialog.backup.jsx, EditorPage.backup.jsx

### 중간 우선순위 (Medium Priority)

6. **A1 마무리**: `client/.env.example` 파일 생성

   - 필요한 환경 변수 목록 정리
   - 기본값 및 설명 추가

7. **C4 완료**: Toast/피드백 통합

   - sonner 설치 및 설정
   - 저장/삭제/에러 시 토스트 표시
   - alert() 제거

8. **B1 완료**: Tailwind 색상 토큰화
   - DesignStargey.md 팔레트를 tailwind.config.js에 추가
   - 하드코딩된 색상 교체

### 낮은 우선순위 (Low Priority)

9. **C3 완료**: Scene Title 인라인 편집

   - 에디터 헤더에 Input 추가
   - 디바운스 적용하여 자동 저장

10. **D1 완료**: ProjectsDashboard 뷰모드 토글

   - 리스트/그리드 토글 구현

---

## 8. 작업 진행률 요약

| 워크스트림           | 진행률  | 완료 항목                     | 미완료 항목                                  |
| -------------------- | ------- | ----------------------------- | -------------------------------------------- |
| A. 기반 재정비       | 75%     | A1(부분), A3                  | A2, A4, .env.example                         |
| B. 디자인 시스템     | 30%     | UI 간격 시스템                | 색상 토큰화, 공통 컴포넌트, 모션             |
| C. 에디터 리팩터링   | 40%     | 레이아웃 개선, **공유 기능**  | Scene 분리(진행 중), 메모이제이션, Title 편집, Toast  |
| D. 대시보드 & 인증   | 60%     | D4, D6                        | D1, D2, D3, D5                               |
| E. 코드 정비         | 0%      | -                             | 백업 파일 제거, 폴더 구조 개편               |
| **F. 조명 & 카메라** | **30%** | **F1 (화면 비율 & 레터박스)** | **F2 (진행 중), F3, F4, F5**                 |
| 백엔드 보안          | 100%    | CSRF, 세션, 공유              | -                                            |

**전체 진행률**: 약 **45%** (2025-10-29 업데이트)

---

본 계획을 기반으로 리팩터링을 진행하면 디자인 전략과 구현 코드의 싱크를 맞추고, 향후 대규모 기능 확장(Undo/Redo, 협업 모드, Export 등)을 위한 기반을 안정적으로 마련할 수 있습니다. 각 워크스트림 진행 시 변경 사항을 반드시 `docs/작업일지.md`에 기록하고, 변경된 UI는 캡처하여 공유해 주세요.

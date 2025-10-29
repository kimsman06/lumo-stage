# Repository Guidelines

## Project Structure & Module Organization

- `client/` contains the Vite-powered React app; place feature code under `src/` and keep shared helpers in `src/lib/`.
- `client/src/components` is split into domain folders (`hero/`, `projects/`, `editor/`, `ui/`); add new UI in the closest domain folder to avoid a flat components dump.
- `client/src/store.js` centralizes Zustand state; extend actions here and keep 3D scene updates declarative.
- `docs/` stores design, architecture, and planning notes—`docs/README.md` 설명에 따라 카테고리 폴더를 지키고, 사용이 끝난 문서는 `docs/legacy/`로 이동하며 구조 변경 시 README를 함께 업데이트합니다.
- `server/` is reserved for the Express MVCS service described in `docs/architecture/LumoStage-Architecture.md`; match the `controllers/`, `services/`, `models/`, `routes/` layout when implementing backend features.

## Build, Test, and Development Commands

- `cd client && npm install` installs frontend dependencies; run this after pulling dependency changes.
- `cd client && npm run dev` starts the Vite dev server on `http://localhost:5173` with hot module reload.
- `cd client && npm run build` produces the production bundle in `client/dist/`; use it to validate build integrity before release work.
- `cd client && npm run preview` serves the built bundle for local smoke tests that mimic production routing.
- `cd client && npm run lint` executes ESLint with the React Hooks and Refresh plugins; treat failures as blockers.

## Coding Style & Naming Conventions

- Use ES modules, 2-space indentation, and keep files default-export free; name React components and files in `PascalCase.jsx`.
- Prefix custom hooks with `use`, colocate hook logic near its component, and share cross-cutting hooks via `src/lib/`.
- Compose UI via Tailwind utility classes; favor existing shadcn primitives in `components/ui` before adding new design tokens.
- Zustand actions should be pure and synchronous; perform async work in caller components or future services layers.
- Run `npm run lint` before pushing—`no-unused-vars` is strict, so remove or prefix intentional globals with uppercase.

## Design System & UI 간격

- `docs/design/ui-spacing-system.md`의 간격/패딩/버튼 가이드를 기본 레퍼런스로 사용하세요. Dialog, Form, Card, Dashboard, Editor 작업 시 문서의 체크리스트에 맞춰 Tailwind 클래스를 적용합니다.
- UI 변경 시 `docs/development/ui-refactor-summary-2025-10-27.md`의 완료 항목과 테스트 체크리스트를 참고해 동일한 spacing, aria-label, 접근성 규칙을 유지하고 문서 동기화를 확인합니다.

## Documentation Workflow

- 문서 작성/이동 전 `docs/README.md`를 확인해 올바른 카테고리에 배치하고, 구조 변경이 생기면 README의 트리도 함께 갱신합니다.
- 진행 중인 프런트엔드 작업 내역은 `docs/development/Frontend-Implementation-Plan-20251026.md`에 기록합니다(2025-10-28 업데이트, Phase 5: Toast 피드백, 접근성, 자동 저장 개선). 체크박스와 표 상태를 완료 상황에 맞게 즉시 반영하세요.
- 보안·서버 후속 작업 참고는 `docs/development/security-review-2025-10-26.md`와 `docs/development/server-action-plan-2025-10-26.md`에서 시작하고, 변경 시 해당 문서를 먼저 업데이트합니다.
- 더 이상 현행이 아닌 참고 자료는 `docs/legacy/`로 옮기고, 이동 사실을 관련 최신 문서에 연결하거나 주석으로 남깁니다.

## Testing Guidelines

- A formal automated testing stack is pending; when adding features, include manual test notes in your PR and, where feasible, add component tests using Vitest and Testing Library (create `*.test.jsx` adjacent to the component).
- Keep tests isolated from WebGL internals by mocking Three.js helpers and focusing on Zustand state transitions.
- Target high-risk areas: editor interactions, scene updates, and routing; aim for smoke coverage before merging major UI shifts.
- Record regressions as reproduction scripts or failing tests before issuing fixes to maintain a TDD cadence.
- UI 리팩터링 관련 수동 테스트는 `docs/development/ui-refactor-summary-2025-10-27.md`의 체크리스트를 기준으로 수행하고 필요 시 업데이트합니다.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`type(scope): summary`) as seen in history (`feat(client): …`, `refactor(docs): …`); keep summaries under 72 characters.
- Squash local work before opening a PR; PR titles should mirror the final commit summary.
- Provide a focused description, linked issue or task id, and before/after screenshots or screen recordings for visual updates.
- List manual verification steps (e.g., `cd client && npm run dev` and the scenario exercised) so reviewers can replay them quickly.
- Request targeted reviewers (frontend, 3D, or docs) based on the touched modules and wait for at least one approval before merging.

## 진행 중인 Phase & 작업 우선순위

- 현재 액티브한 프런트엔드 일정은 `docs/development/Frontend-Implementation-Plan-20251026.md`의 Phase 5(Toast 피드백 통합, 접근성 개선, 자동 저장 보완)입니다. 문서의 체크리스트와 예상 시간 표를 작업 완료 시 즉시 갱신하세요.
- 프로젝트 전반의 단계 이력은 `docs/planning/implementation-phases.md`가 단일 출처입니다. Phase 진행 상황을 참조하고 변경 시 해당 문서를 우선 갱신합니다.
- Phase별 체크박스가 포함된 문서는 작업이 완료될 때마다 반드시 체크 상태를 갱신하고, 결과와 테스트 메모를 남깁니다.

### 기타 지침사항

- 모든 라이브러리 설치는 사용자가 직접 진행하고 확인이 완료되면 설치 후 단계를 실행합니다.
- 절대 원본 파일을 바꾸지말고 새로운 파일을 만들어 컴포넌트화 해서 사용합니다.
- 각 Phase별 checkbox가 완료되면 체크합니다.
- shadcn MCP를 적극 사용하세요. 컴포넌트 설치는 사용자가 직접합니다. 절대 함부로 설치하지마세요.
- 모든 응답은 반드시 **한국어**로 대답하세요.

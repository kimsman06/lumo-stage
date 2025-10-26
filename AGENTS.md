# Repository Guidelines

## Project Structure & Module Organization

- `client/` contains the Vite-powered React app; place feature code under `src/` and keep shared helpers in `src/lib/`.
- `client/src/components` is split into domain folders (`hero/`, `projects/`, `editor/`, `ui/`); add new UI in the closest domain folder to avoid a flat components dump.
- `client/src/store.js` centralizes Zustand state; extend actions here and keep 3D scene updates declarative.
- `docs/` stores design, architecture, and planning notes—update these when introducing architecture-impacting changes.
- `server/` is reserved for the Express MVCS service described in `docs/LumoStage-Architecture.md`; match the `controllers/`, `services/`, `models/`, `routes/` layout when implementing backend features.

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

## Testing Guidelines

- A formal automated testing stack is pending; when adding features, include manual test notes in your PR and, where feasible, add component tests using Vitest and Testing Library (create `*.test.jsx` adjacent to the component).
- Keep tests isolated from WebGL internals by mocking Three.js helpers and focusing on Zustand state transitions.
- Target high-risk areas: editor interactions, scene updates, and routing; aim for smoke coverage before merging major UI shifts.
- Record regressions as reproduction scripts or failing tests before issuing fixes to maintain a TDD cadence.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`type(scope): summary`) as seen in history (`feat(client): …`, `refactor(docs): …`); keep summaries under 72 characters.
- Squash local work before opening a PR; PR titles should mirror the final commit summary.
- Provide a focused description, linked issue or task id, and before/after screenshots or screen recordings for visual updates.
- List manual verification steps (e.g., `cd client && npm run dev` and the scenario exercised) so reviewers can replay them quickly.
- Request targeted reviewers (frontend, 3D, or docs) based on the touched modules and wait for at least one approval before merging.

### 기타 지침사항

- 모든 라이브러리 설치는 사용자가 직접 진행하고 확인이 완료되면 설치 후 단계를 실행합니다.
- 절대 원본 파일을 바꾸지말고 새로운 파일을 만들어 컴포넌트화 해서 사용합니다.
- 각 Phase별 checkbox가 완료되면 체크합니다.
- shadcn MCP를 적극 사용하세요. 컴포넌트 설치는 사용자가 직접합니다. 절대 함부로 설치하지마세요.
- 모든 응답은 반드시 **한국어**로 대답하세요.

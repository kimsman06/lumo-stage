# LumoStage: Phase 1 Plan (Revised)

1.  **파일 구조 정의 수정:** `.gemini/GEMINI.md` 파일의 `file_structure`를 `client`/`server` 구조에 맞게 수정합니다. (완료)
2.  **디렉터리 생성:** 프로젝트 루트에 `client`와 `server` 폴더를 생성하여 작업 공간을 분리합니다.
3.  **Vite 프로젝트 생성:** `client` 폴더 내에 Vite + React 프로젝트를 생성합니다. (`npm create vite@latest client -- --template react`)
4.  **필수 라이브러리 설치:** `client` 폴더로 이동하여 `npm install` 후 `three`, `@react-three/fiber`, `@react-three/drei`, `tailwindcss`를 설치합니다.
5.  **Tailwind CSS 설정:** `client` 폴더 내에 `tailwind.config.js`를 설정하고 CSS 파일을 구성합니다.
6.  **`App.jsx` 컴포넌트 작성:** `client/src/App.jsx` 파일에 요구사항에 맞는 3D Scene 코드를 작성합니다.
7.  **Git 커밋:** 완료된 Phase 1 작업을 커밋합니다.
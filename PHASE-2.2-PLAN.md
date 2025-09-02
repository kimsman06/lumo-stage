# LumoStage: Phase 2.2 Plan

- [x] **1. `store.js` 파일 생성:**
    - `client/src/store.js` 파일을 새로 만듭니다.
    - `App.jsx`에 있던 `zustand` 스토어(`useStore`) 관련 코드를 모두 `store.js`로 옮기고, `export` 합니다.

- [x] **2. 컴포넌트 파일 분리:**
    - `client/src/components` 디렉터리를 생성합니다.
    - `Controls.jsx`: `App.jsx`의 `Controls` 컴포넌트 코드를 `client/src/components/Controls.jsx` 파일로 옮깁니다. 이 컴포넌트는 `store.js`에서 `useStore`를 `import`하여 사용합니다.
    - `Scene.jsx`: `App.jsx`의 `Scene` 컴포넌트 코드를 `client/src/components/Scene.jsx` 파일로 옮깁니다. 필요한 것들을 `import`하여 사용합니다.

- [x] **3. `App.jsx` 정리:**
    - `App.jsx` 파일에서는 분리된 `Controls`와 `Scene` 컴포넌트를 `import`하여 최종 레이아웃만 잡도록 코드를 대폭 단순화합니다.

- [x] **4. Git 커밋:**
    - 리팩토링된 내용을 "refactor: Separate components and store into modules"와 같은 메시지로 커밋합니다.
# LumoStage 프론트엔드 구현 계획

**작성일**: 2025-10-26
**최종 업데이트**: 2025-10-28
**작성자**: Claude Code
**상태**: 대부분 완료 (Phase 2-4 완료, Phase 5 진행 중)

## 📊 현재 상태 분석

### ✅ 이미 구현된 것 (2025-10-28 업데이트)
- ✅ 기본 라우팅 설정 (react-router-dom 설치됨)
- ✅ 에디터용 Zustand 스토어 (`editorStore.js` - 3D Scene 상태 관리)
- ✅ 인증 Zustand 스토어 (`authStore.js` - 사용자 인증 상태 관리)
- ✅ 프로젝트 Zustand 스토어 (`projectStore.js` - 프로젝트 CRUD 상태 관리)
- ✅ API 클라이언트 설정 (`lib/api.js` - CSRF, 세션 갱신 포함)
- ✅ LoginPage 및 RegisterPage 구현 (소셜 로그인 포함)
- ✅ ProjectsDashboard API 연동 완료
  - ProjectCard, NewProjectDialog, EditProjectDialog, EmptyState
- ✅ PrivateRoute 구현 완료
- ✅ 에디터 프로젝트 로드/저장 기능 완료
- ✅ 화면 비율 & 레터박스 기능 (F1)
- ✅ shadcn/ui 주요 컴포넌트 설치됨

### ⏳ 진행 중인 것
- ⏳ 디퓨저 시스템 (F2) - 보류 중
- ⏳ Toast 피드백 통합 (일부 alert 사용 중)
- ⏳ 자동 저장 기능 개선

### 📝 향후 개선 사항
- Tailwind 색상 토큰화 (B1)
- Scene Title 인라인 편집 (C3)
- Scene 모듈 분리 및 성능 최적화 (C1)
- 접근성 개선 (D5)

---

## 🎯 프론트엔드 구현 계획

### **Phase 2: 코어 설정 및 인증 시스템 구축** ✅ 완료

#### 2.1. 의존성 설치 및 API 클라이언트 설정 ✅
**목표:** 백엔드와 통신할 수 있는 기반 구축

**작업 항목:**
1. ✅ **axios 설치** (사용자가 직접)
   ```bash
   cd client && npm install axios
   ```

2. ✅ **API 클라이언트 생성** (`client/src/lib/api.js`)
   - ✅ axios 인스턴스 생성
   - ✅ baseURL: 환경 변수 기반 (`VITE_API_URL`)
   - ✅ withCredentials: true (쿠키 자동 포함)
   - ✅ 요청/응답 인터셉터 설정 (에러 핸들링)
   - ✅ CSRF 토큰 자동 처리
   - ✅ 세션 갱신 로직 (401 에러 시)

#### 2.2. 인증 상태 관리 스토어 ✅
**목표:** 전역 인증 상태 관리

**작업 항목:**
1. ✅ **인증 스토어 생성** (`client/src/store/authStore.js`)
   - ✅ 상태: `user`, `isAuthenticated`, `isLoading`, `error`
   - ✅ 액션:
     - ✅ `register(userData)`: POST /api/auth/register
     - ✅ `login(credentials)`: POST /api/auth/login
     - ✅ `logout()`: POST /api/auth/logout
     - ✅ `checkAuth()`: 앱 시작 시 쿠키 기반 사용자 정보 확인

#### 2.3. 인증 페이지 구현 ✅
**목표:** 회원가입/로그인 UI 제공

**필요한 shadcn 컴포넌트 설치** (사용자가 직접):
```bash
npx shadcn@latest add form toast alert-dialog
```

**작업 항목:**
1. ✅ **LoginPage 생성** (`client/src/pages/LoginPage.jsx`)
   - ✅ 이메일/비밀번호 입력 폼
   - ✅ 필드별 유효성 검사 (`lib/validators.js`)
   - ✅ Google 로그인 버튼 (환경 변수 기반)
   - ✅ Naver 로그인 버튼 (환경 변수 기반)
   - ✅ "회원가입" 링크
   - ✅ 인증된 사용자 자동 리디렉션

2. ✅ **RegisterPage 생성** (`client/src/pages/RegisterPage.jsx`)
   - ✅ username, email, password 입력 폼
   - ✅ 필드별 유효성 검사
   - ✅ 소셜 로그인 버튼 동일하게 제공
   - ✅ "이미 계정이 있으신가요?" 로그인 링크
   - ✅ 인증된 사용자 자동 리디렉션

3. ✅ **App.jsx 라우팅 업데이트**
   ```jsx
   <Route path="/login" element={<LoginPage />} />
   <Route path="/register" element={<RegisterPage />} />
   ```

#### 2.4. PrivateRoute 구현 ✅
**목표:** 인증이 필요한 페이지 보호

**작업 항목:**
1. ✅ **PrivateRoute 컴포넌트 생성** (`client/src/components/auth/PrivateRoute.jsx`)
   - ✅ `authStore`의 `isAuthenticated` 확인
   - ✅ 미인증 시 `/login`으로 리디렉트
   - ✅ 로딩 중에는 스피너 표시

2. ✅ **App.jsx에 PrivateRoute 적용**
   ```jsx
   <Route path="/projects" element={<PrivateRoute><ProjectsDashboardPage /></PrivateRoute>} />
   <Route path="/editor/:id" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
   ```

#### 2.5. 네비게이션 바 업데이트 ✅
**목표:** 로그인 상태에 따른 동적 메뉴 표시

**작업 항목:**
1. ✅ **네비게이션 바 구현**
   - ✅ `Navbar.jsx` (비인증 사용자용)
   - ✅ `AuthNavbar.jsx` (인증 사용자용)
   - ✅ `authStore` 구독
   - ✅ 로그인 상태:
     - ✅ "내 프로젝트" 링크 (`/projects`)
     - ✅ 사용자 이름 + 아바타 (드롭다운)
     - ✅ "로그아웃" 버튼
   - ✅ 비로그인 상태:
     - ✅ "로그인" 버튼
     - ✅ "회원가입" 버튼

---

### **Phase 3: 프로젝트 대시보드 API 연동** ✅ 완료

#### 3.1. 프로젝트 상태 관리 스토어 ✅
**목표:** 프로젝트 CRUD 작업을 위한 상태 관리

**작업 항목:**
1. ✅ **프로젝트 스토어 생성** (`client/src/store/projectStore.js`)
   - ✅ 상태: `projects`, `isLoading`, `error`, `currentProject`
   - ✅ 액션:
     - ✅ `fetchProjects()`: GET /api/projects
     - ✅ `createProject(data)`: POST /api/projects
     - ✅ `updateProject(id, data)`: PATCH /api/projects/:id
     - ✅ `deleteProject(id)`: DELETE /api/projects/:id
     - ✅ `getProjectById(id)`: GET /api/projects/:id

#### 3.2. ProjectsDashboard API 연동 ✅
**목표:** 하드코딩된 데이터를 실제 API 데이터로 대체

**필요한 shadcn 컴포넌트** (이미 설치됨):
- skeleton (로딩 UI용)

**작업 항목:**
1. ✅ **ProjectsDashboard 수정** (`client/src/components/projects/ProjectsDashboard.jsx`)
   - ✅ `projectStore` 사용으로 변경
   - ✅ `useEffect`로 컴포넌트 마운트 시 `fetchProjects()` 호출
   - ✅ 로딩 중 스켈레톤 UI 표시
   - ✅ 에러 발생 시 에러 메시지 표시
   - ✅ `handleCreateProject`: API 호출 후 목록 새로고침
   - ✅ `handleDeleteProject`: API 호출 후 목록에서 제거
   - ✅ `handleOpenProject`: `navigate('/editor/' + id)` 구현
   - ✅ 검색 기능 (클라이언트 측)
   - ✅ 뷰모드 토글 (그리드/리스트)

2. ✅ **ProjectCard 수정** (`client/src/components/projects/ProjectCard.jsx`)
   - ✅ 썸네일이 없을 경우 기본 이미지 또는 플레이스홀더 표시
   - ✅ 드롭다운 메뉴: "열기", "이름 변경", "삭제"
   - ✅ 그리드/리스트 뷰모드 지원

3. ✅ **NewProjectDialog 수정** (`client/src/components/projects/NewProjectDialog.jsx`)
   - ✅ 프로젝트 생성 시 `projectStore.createProject()` 호출
   - ✅ 성공 시 생성된 프로젝트 ID로 에디터 페이지로 이동

4. ✅ **EditProjectDialog 추가** (`client/src/components/projects/EditProjectDialog.jsx`)
   - ✅ 프로젝트 이름/설명 수정 기능

---

### **Phase 4: 에디터와 API 연동** ✅ 완료

#### 4.1. 라우팅 변경 ✅
**작업 항목:**
1. ✅ **App.jsx 라우팅 업데이트**
   ```jsx
   // 기존: /editor
   // 변경: /editor/:id
   <Route path="/editor/:id" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
   ```

#### 4.2. 에디터 프로젝트 로드 기능 ✅
**목표:** URL의 프로젝트 ID로 데이터 로드

**작업 항목:**
1. ✅ **EditorPage 수정** (`client/src/pages/EditorPage.jsx`)
   - ✅ `useParams()`로 프로젝트 ID 추출
   - ✅ `useEffect`로 프로젝트 데이터 로드:
     - ✅ `projectStore.getProjectById(id)` 호출
     - ✅ 받은 `sceneData`를 에디터 스토어(`editorStore.js`)에 로드
   - ✅ 로딩 중 스피너 표시
   - ✅ 프로젝트가 없거나 권한이 없으면 404/에러 페이지 표시

2. ✅ **editorStore.js에 상태 초기화/로드 액션 추가**
   ```javascript
   loadSceneData: (sceneData) => set({
     mannequins: sceneData.mannequins || [...],
     lights: sceneData.lights || [...],
     cameraState: sceneData.cameraState || {...}
   })
   ```

#### 4.3. 에디터 프로젝트 저장 기능 ✅
**목표:** 에디터 상태를 백엔드에 저장

**작업 항목:**
1. ✅ **저장 버튼 추가** (`client/src/pages/EditorPage.jsx`)
   - ✅ 헤더에 "저장" 버튼 추가
   - ✅ 클릭 시 현재 에디터 상태를 `sceneData`로 수집
   - ✅ `projectStore.updateProject(id, { sceneData })` 호출
   - ⏳ Toast로 저장 성공/실패 피드백 (현재 alert 사용)

2. ✅ **(심화) 자동 저장 기능**
   - ✅ 디바운스 기반 자동 저장 구현
   - ✅ 저장 상태 표시: "저장됨", "저장 중..."
   - ⏳ 추가 개선 필요 (더 나은 UX)

---

### **Phase 5: 최종 정리 및 테스트** ⏳ 진행 중

#### 5.1. 사용자 흐름 테스트 ✅
**작업 항목:**
1. ✅ **엔드투엔드 시나리오 테스트**
   - ✅ 회원가입 → 로그인 → 새 프로젝트 생성 → 에디터 진입
   - ✅ 조명 조정 → 저장 → 대시보드 복귀 → 프로젝트 재진입 (저장 확인)
   - ✅ 프로젝트 삭제 → 로그아웃

2. ✅ **소셜 로그인 플로우 테스트**
   - ✅ Google/Naver 로그인 → 콜백 처리 → 대시보드 진입

#### 5.2. UI/UX 개선 ⏳ 부분 완료
**작업 항목:**
1. ✅ **반응형 디자인 점검**
   - ✅ 모바일, 태블릿, 데스크탑 화면에서 레이아웃 확인
   - ✅ Tailwind 반응형 유틸리티 활용

2. ✅ **에러 처리 개선**
   - ✅ 네트워크 에러 시 재시도 버튼 제공
   - ✅ 401/403 에러 시 로그인 페이지로 리디렉트
   - ⏳ Toast 메시지로 사용자 피드백 강화 (일부 alert 사용 중)

3. ✅ **로딩 상태 개선**
   - ✅ 스켈레톤 UI 일관성 확인
   - ✅ 버튼 클릭 시 로딩 인디케이터 표시

4. ⏳ **접근성 개선**
   - ✅ 키보드 네비게이션 기본 지원
   - ⏳ aria-label 추가 필요 (일부만 적용됨)

---

## 📋 구현 우선순위 및 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 | 실제 소요 | 상태 |
|-------|----------|----------|-----------|------|
| **Phase 2** | 인증 시스템 구축 | 4-6시간 | ~5시간 | ✅ 완료 |
| **Phase 3** | 대시보드 API 연동 | 3-4시간 | ~4시간 | ✅ 완료 |
| **Phase 4** | 에디터 API 연동 | 2-3시간 | ~3시간 | ✅ 완료 |
| **Phase 5** | 최종 정리 및 테스트 | 2-3시간 | 진행 중 | ⏳ 진행 중 |
| **총합** | | **11-16시간** | ~12시간+ | **약 80% 완료** |

---

## 🎯 핵심 체크포인트

### Phase 2 완료 기준 ✅
- [x] 로그인/회원가입이 정상 작동
- [x] JWT 쿠키가 브라우저에 저장됨
- [x] 인증되지 않은 사용자는 `/projects`, `/editor/:id`에 접근 불가
- [x] 네비게이션 바에 로그인 상태가 반영됨

### Phase 3 완료 기준 ✅
- [x] 대시보드에서 실제 프로젝트 목록 표시
- [x] 새 프로젝트 생성 후 에디터로 이동
- [x] 프로젝트 삭제 기능 작동
- [x] 검색 기능 작동 (클라이언트 측)

### Phase 4 완료 기준 ✅
- [x] URL의 프로젝트 ID로 에디터에 프로젝트 로드
- [x] 에디터에서 변경 후 저장 버튼 클릭 시 백엔드에 저장
- [x] 저장 후 대시보드로 돌아가도 변경사항 유지

### Phase 5 완료 기준 ⏳
- [x] 모든 사용자 흐름이 정상 작동
- [x] 반응형 디자인 확인
- [ ] 에러 상황에서 적절한 피드백 제공 (Toast 통합 필요)

---

## 📝 구현 노트

### 주의사항
1. **원본 파일 수정 금지**: 기존 컴포넌트를 직접 수정하지 않고, 새로운 컴포넌트를 만들어 확장합니다.
2. **사용자가 직접 설치**: 모든 npm 패키지 및 shadcn 컴포넌트는 사용자가 직접 설치합니다.
3. **Phase별 체크리스트 업데이트**: `PROJECT_DASHBOARD_PLAN.md`의 체크박스를 작업 완료 시 업데이트합니다.

### 기술 스택 확인
- React 19.1.1
- React Router DOM 7.9.3
- Zustand 5.0.8
- Tailwind CSS 4.1.14
- shadcn/ui (Radix UI 기반)
- Framer Motion 12.23.22

### API 엔드포인트 (백엔드)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/google` - Google 로그인
- `GET /api/auth/naver` - Naver 로그인
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/:id` - 프로젝트 조회
- `PATCH /api/projects/:id` - 프로젝트 업데이트
- `DELETE /api/projects/:id` - 프로젝트 삭제

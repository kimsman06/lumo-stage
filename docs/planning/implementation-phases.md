# LumoStage 구현 단계별 계획 (Phase History)

이 문서는 LumoStage 프로젝트의 각 개발 단계별 계획과 진행 상황을 기록합니다.

> **참고**: 이 문서는 `docs/implement/` 폴더의 개별 PHASE 파일들을 통합한 것입니다.
> 각 Phase는 프로젝트 초기 개발 단계에서 작성된 계획입니다.

---

## Phase 1: 프로젝트 초기 설정 및 3D 환경 구축

**목표**: 클라이언트/서버 분리 구조 및 기본 3D 렌더링 환경 구축

### 작업 내용
1. 파일 구조 정의 수정 (`.gemini/GEMINI.md`)
2. `client`/`server` 디렉터리 생성
3. Vite + React 프로젝트 생성 (`client`)
4. 필수 라이브러리 설치:
   - `three`, `@react-three/fiber`, `@react-three/drei`
   - `tailwindcss`
5. Tailwind CSS 설정
6. 기본 3D Scene 구현 (`App.jsx`)
7. Git 커밋

**상태**: ✅ 완료

---

## Phase 2: 핵심 UI 및 상태 관리

**목표**: Zustand 기반 상태 관리 및 에디터 패널 구현

### 주요 작업
- Zustand 스토어 설정
- 조명 및 카메라 상태 관리
- 에디터 패널 UI 구현
- 마네킹 모델 통합

### 세부 단계

#### Phase 2.1: Zustand 스토어 기본 구조
- 조명(`lights`) 배열 상태
- 카메라(`cameraState`) 상태
- 기본 액션 함수 정의

#### Phase 2.2: 조명 컨트롤 UI
- 조명 추가/삭제 기능
- 조명 속성 조정 (위치, 색상, 강도)
- 슬라이더 및 컬러 피커 연동

#### Phase 2.3: 카메라 컨트롤 UI
- 카메라 위치 조정
- FOV(화각) 제어
- 뷰 모드 전환 (Free/Camera)

#### Phase 2.4: 마네킹 통합
- GLTF 모델 로드
- 기본 포즈 설정
- 마네킹 위치 조정

#### Phase 2.5: UI 개선 및 통합
- 에디터 패널 레이아웃 최적화
- 컴포넌트 간 상호작용 개선
- 반응형 디자인 적용

**상태**: ✅ 완료

---

## Phase 3: 백엔드 통합 준비

**목표**: Scene 데이터 저장/불러오기를 위한 백엔드 API 설계

### 작업 내용
1. Express 서버 기본 구조 설정
2. MongoDB 연결 설정
3. User/Project 모델 정의
4. MVCS 패턴 적용:
   - Models: Mongoose 스키마
   - Views: REST API 응답 포맷
   - Controllers: 요청 처리
   - Services: 비즈니스 로직

**상태**: ✅ 완료

---

## Phase 4: 인증 시스템

**목표**: 사용자 인증 및 세션 관리

### 작업 내용
1. Passport.js 설정
2. 로컬 인증 (이메일/비밀번호)
3. 소셜 로그인 (Google, Naver)
4. JWT 기반 세션 관리
5. HttpOnly 쿠키 설정
6. 인증 미들웨어 구현

**상태**: ✅ 완료

---

## Phase 5: 프로젝트 대시보드

**목표**: 프로젝트 관리 UI 및 CRUD 기능

### 작업 내용
1. 프로젝트 목록 페이지
2. 프로젝트 생성/수정/삭제
3. 썸네일 표시
4. 검색 및 필터링
5. 프로젝트 카드 UI (shadcn/ui)
6. Empty State 처리

**상태**: ✅ 완료

---

## Phase 6: 에디터-백엔드 연동 & Pro UI

**목표**: 에디터 상태와 데이터베이스 동기화 및 전문가용 UI 개선

### 작업 내용
1. Scene 데이터 스키마 정의 ✅
2. 저장 기능 구현 ✅
3. 불러오기 기능 구현 ✅
4. 자동 저장 (디바운스) ✅
5. 저장 상태 표시 ✅
6. 에러 처리 및 재시도 로직 ✅

### Pro UI (Phase 6.1-6.3)
1. **Outliner 패널** (좌측 256px) ✅
2. **Properties 패널** (우측 480px) ✅
3. **Toolbar 및 Undo/Redo** ✅
   - Floating Toolbar (중앙 하단)
   - Transform 모드 (W/E/R)
   - Grid/Snap 토글
   - Undo/Redo (⌘+Z, ⌘+Shift+Z)
   - 히스토리 관리 시스템

**상태**: ✅ 완료

---

## Phase 7: 고급 기능 및 최적화

**목표**: 디퓨저 시스템, IK, 성능 최적화

### 주요 작업

#### Phase 7: 디퓨저 시스템
- 디퓨저 객체 생성/삭제
- 광학 속성 제어 (투과율, 두께, 러프니스)
- 조명 연동 및 필터링
- Secondary Light 효과

#### Phase 7.1: IK 및 마네킹 개선
- 역운동학(IK) 구현
- 포즈 프리셋 확장
- 관절별 세밀 조정
- 포즈 저장/불러오기

**상태**: ✅ 완료

---

## 향후 계획

### Phase 8: 협업 기능 (미착수)
- 프로젝트 공유
- 실시간 멀티 유저 편집
- 댓글 및 피드백 시스템

### Phase 9: 렌더링 개선 (미착수)
- 고품질 렌더링 옵션
- 그림자 품질 개선
- 포스트 프로세싱 효과

### Phase 10: 배포 및 최적화 (미착수)
- 프로덕션 빌드 최적화
- CDN 설정
- 성능 모니터링
- E2E 테스트

---

## 참고 문서
- `docs/PRD.md`: 제품 요구사항 정의
- `docs/planning/PROJECT_DASHBOARD_PLAN.md`: 대시보드 상세 계획
- `docs/api/PROJECT_DASHBOARD_API.md`: API 명세
- `docs/architecture/LumoStage-Architecture.md`: 아키텍처 설명

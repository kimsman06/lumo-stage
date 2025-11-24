# LumoStage 문서 가이드

이 폴더에는 LumoStage 프로젝트의 모든 기술 문서가 카테고리별로 정리되어 있습니다.

## 📁 문서 구조

```
docs/
├── PRD.md                    # 제품 요구사항 정의서 (핵심 문서)
├── architecture/             # 시스템 아키텍처
│   └── LumoStage-Architecture.md
├── api/                      # API 명세서
│   └── PROJECT_DASHBOARD_API.md
├── design/                   # 디자인 시스템
│   ├── design-strategy.md
│   └── ui-spacing-system.md
├── planning/                 # 개발 계획
│   ├── PROJECT_DASHBOARD_PLAN.md
│   ├── implementation-phases.md
│   ├── EDITOR_REFINEMENT_PLAN.md
│   └── HERO_PAGE_*.md
├── development/              # 개발 진행 문서
│   ├── Frontend-Implementation-Plan-20251026.md
│   ├── frontend-refactor-plan-2025-10-26.md
│   ├── server-action-plan-2025-10-26.md
│   ├── security-review-2025-10-26.md
│   └── ui-refactor-summary-2025-10-27.md
└── legacy/                   # 레거시 문서
    ├── 작업일지.md
    ├── 작업일지-20250930.md
    ├── BUG_REPORT-Gizmo-Issue.md
    ├── FRONTEND_IMPROVEMENT_REPORT.md
    ├── button-size-checklist.md
    └── Learn.md
```

## 📖 문서별 설명

### 핵심 문서

#### `PRD.md` - 제품 요구사항 정의서
- 프로젝트 비전 및 목표
- 사용자 스토리
- MVP 기능 명세
- 기술 스택 및 데이터 스키마
- 개발 로드맵

**읽어야 할 사람**: 모든 팀원, 특히 신규 참여자

---

### `/architecture` - 아키텍처 문서

#### `LumoStage-Architecture.md`
- Zustand 기반 중앙 상태 관리
- 단방향 데이터 흐름
- 컴포넌트 간 이벤트 전파 시퀀스 다이어그램
- 사용자 상호작용 시나리오

**읽어야 할 사람**: 프론트엔드 개발자, 상태 관리 구조 이해가 필요한 경우

---

### `/api` - API 명세서

#### `PROJECT_DASHBOARD_API.md`
- 인증 API (회원가입, 로그인, OAuth)
- 프로젝트 CRUD API
- 요청/응답 예시
- 에러 포맷 및 상태 코드

**읽어야 할 사람**: 백엔드 개발자, 프론트엔드-백엔드 연동 작업자

---

### `/design` - 디자인 시스템

#### `design-strategy.md`
- 디자인 철학 및 컨셉
- 색상 시스템 (Primary, Studio Dark, Accent)
- 타이포그래피 스케일
- 레이아웃 전략 및 반응형 디자인
- shadcn/ui 컴포넌트 활용 가이드
- 아이콘 시스템 및 애니메이션 가이드

#### `ui-spacing-system.md`
- UI 간격 및 여백 시스템

**읽어야 할 사람**: UI/UX 디자이너, 프론트엔드 개발자

---

### `/planning` - 개발 계획

#### `PROJECT_DASHBOARD_PLAN.md`
- 프로젝트 대시보드 설계
- 데이터 모델링 (User, Project)
- 인증 및 세션 관리 전략
- Phase별 체크리스트

#### `implementation-phases.md`
- Phase 1~7 통합 문서
- 각 단계별 목표 및 작업 내용
- 완료 상태 표시
- 향후 계획 (Phase 8~10)

#### `EDITOR_REFINEMENT_PLAN.md`
- 에디터 패널 UI 개선 계획
- 컴포넌트 구조 재설계
- shadcn/ui 적용 전략

#### `HERO_PAGE_*.md`
- Hero 페이지 관련 계획 문서들
- 디자인, 전략, 구현 계획

**읽어야 할 사람**: 프로젝트 매니저, 개발 계획 수립자

---

### `/development` - 개발 진행 문서

#### `Frontend-Implementation-Plan-20251026.md`
- 프론트엔드 구현 상세 계획
- Phase별 작업 항목 및 예상 시간
- 의존성 및 체크포인트

#### `gemini-image-integration-plan-2025-11-24.md`
- Gemini 2.5 Flash 이미지 생성 통합 계획
- 프롬프트 엔지니어링 가이드 및 API 설계
- 필요한 라이브러리/환경 설정 안내

#### `frontend-refactor-plan-2025-10-26.md`
- 프론트엔드 리팩토링 계획
- 코드 개선 항목

#### `server-action-plan-2025-10-26.md`
- 서버 대응 계획
- CSRF 토큰 파이프라인
- Scene 데이터 스키마 확장

#### `security-review-2025-10-26.md`
- 보안 점검 메모
- 클라이언트 보안 이슈

#### `ui-refactor-summary-2025-10-27.md`
- UI 리팩토링 요약

**읽어야 할 사람**: 실제 개발을 진행하는 프론트엔드/백엔드 개발자

---

### `/legacy` - 레거시 문서

과거 작업 일지, 버그 리포트, 임시 체크리스트 등 참고용 문서들이 보관되어 있습니다.

**읽어야 할 사람**: 과거 이슈 추적이 필요한 경우

---

## 🚀 빠른 시작 가이드

### 신규 팀원이라면?
1. `PRD.md` - 프로젝트 전체 이해
2. `/architecture/LumoStage-Architecture.md` - 기술 구조 파악
3. `/planning/implementation-phases.md` - 개발 진행 상황 확인

### 프론트엔드 개발자라면?
1. `/architecture/LumoStage-Architecture.md` - 상태 관리 이해
2. `/design/design-strategy.md` - 디자인 시스템 숙지
3. `/development/Frontend-Implementation-Plan-20251026.md` - 구현 계획

### 백엔드 개발자라면?
1. `/api/PROJECT_DASHBOARD_API.md` - API 명세 확인
2. `/planning/PROJECT_DASHBOARD_PLAN.md` - 데이터 모델 이해
3. `/development/server-action-plan-2025-10-26.md` - 서버 작업 계획

### 디자이너라면?
1. `/design/design-strategy.md` - 디자인 시스템 전체
2. `/design/ui-spacing-system.md` - 간격 시스템
3. `PRD.md` - 제품 기능 이해

---

## 📝 문서 작성 규칙

1. **마크다운 형식 사용**: 모든 문서는 `.md` 형식
2. **명확한 제목**: 문서의 내용을 정확히 반영하는 제목 사용
3. **날짜 표기**: 시간에 민감한 문서는 `YYYY-MM-DD` 형식으로 날짜 포함
4. **카테고리 분류**: 적절한 하위 폴더에 배치
5. **레거시 처리**: 더 이상 사용하지 않는 문서는 `/legacy`로 이동

---

## 🔄 문서 업데이트 이력

- **2025-10-28**: 문서 구조 대규모 정리
  - `/docs` 하위에 카테고리별 폴더 생성
  - 개별 PHASE 문서들을 `implementation-phases.md`로 통합
  - 루트의 분산된 계획 문서들을 `/planning`으로 이동
  - 레거시 문서 분리

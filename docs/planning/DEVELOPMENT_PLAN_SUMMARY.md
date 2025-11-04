# LumoStage 개발 계획 요약

**작성일**: 2025-11-03
**버전**: 2.0
**기준 문서**: PRD 2.0, UI/UX 개선 계획, 3D 기능 구현 계획, AI API 설계

---

## 개요

LumoStage의 새로운 8가지 기능을 우선순위별로 구현하는 개발 계획입니다. 사용자 편의성 (UX)을 최우선으로 하며, 초보자부터 전문가까지 모두 만족할 수 있는 전문적인 3D 조명 시뮬레이션 툴로 발전시키는 것을 목표로 합니다.

---

## 🎯 핵심 목표

1. **초보자 친화성**: 5분 내 핵심 기능 습득 가능 (튜토리얼)
2. **전문가 워크플로우**: Cinema 4D 스타일의 프로페셔널 UI
3. **실제 환경 시뮬레이션**: HDRI 배경 + 커스텀 3D 오브젝트
4. **AI 프리비주얼**: 3D 조명 씬 → 실사 스토리보드 이미지 변환

---

## 📋 우선순위별 기능 목록

### Phase 1: 긴급 버그 수정 & 핵심 UX 개선 (P0 - 최우선)

**소요 기간**: 1주

1. **OrbitControl 카메라 위치 저장** ⚠️ 버그 수정
   - 현재 저장 시 카메라 위치가 초기화되는 문제 해결
   - `orbitControlState` store 추가
   - sceneData에 OrbitControls 위치 저장

2. **OrbitControl-카메라 시점 연결**
   - "Set Camera to View": OrbitControl 위치 → 카메라 설정
   - "View from Camera": 카메라 시점 → OrbitControl 이동
   - Cinema 4D 스타일의 직관적 카메라 조작

3. **튜토리얼 시스템**
   - 7단계 인터랙티브 튜토리얼
   - Tooltip, Popover, Spotlight 효과 활용
   - 단축키 가이드 (`?` 키)

**성공 지표**:
- 카메라 위치 복원 정확도 100%
- 튜토리얼 완료율 80% 이상
- 첫 프로젝트 저장 시간 평균 10분 이내

---

### Phase 2: 씬 구성 기능 확장 (P1 - 높음)

**소요 기간**: 2주 (2-3주차)

4. **배경 시스템**
   - HDRI 이미지 업로드 (.hdr, .exr)
   - 단색 배경 (Color Picker)
   - Ground Plane 설정 (표시/숨김, 색상, 반사)

5. **3D Object 관리 시스템**
   - 프리미티브 객체 (Cube, Sphere, Cylinder, Plane)
   - GLTF/GLB 파일 업로드 및 배치
   - TransformControls로 위치/회전/스케일 조작
   - 재질 설정 (색상, metalness, roughness)

**백엔드 API 필요**:
- Asset 업로드 및 관리 API
- Scene 데이터 스키마 확장 (backgroundSettings, objects)

**성공 지표**:
- 배경 변경률 70% 이상
- 3D 오브젝트 추가율 50% 이상

---

### Phase 3: 전문가용 UI/UX 개선 (P2 - 중간)

**소요 기간**: 7주 (4-10주차)

6. **프로페셔널 UI 시스템**

   **Phase 3.1: Outliner 추가** (2주, 4-5주차)
   - 좌측 Outliner 패널 (256px)
   - 계층 트리 뷰 (Scene → Lights, Mannequins, Camera, Objects, Diffusers)
   - 가시성 토글, 잠금, 드래그 앤 드롭
   - 우클릭 컨텍스트 메뉴 (복사, 삭제, 이름 변경)

   **Phase 3.2: Properties Panel 전환** (3주, 6-8주차)
   - 우측 Properties Panel (320px)
   - Accordion 기반 섹션 (Transform, Light Settings, Material, Shadow)
   - 인라인 편집 (객체 이름 더블클릭)
   - 숫자 입력 + 슬라이더 병행
   - 기존 EditorPanel 탭 시스템 제거

   **Phase 3.3: Toolbar 및 Undo/Redo** (1주, 9주차)
   - 하단 Toolbar (h-10)
   - Transform 모드 버튼 (W: 이동, E: 회전, R: 스케일)
   - Grid, Snap 토글 버튼
   - Zustand temporal 미들웨어로 Undo/Redo
   - 단축키: `Ctrl+Z`, `Ctrl+Shift+Z`

   **Phase 3.4: 반응형 및 패널 토글** (1주, 10주차)
   - 패널 접기/펼치기 버튼
   - localStorage 기반 패널 상태 저장
   - 태블릿 반응형 Drawer 전환

**성공 지표**:
- 전문가 사용자 만족도 90% 이상
- 조명 조정 속도 50% 향상
- Undo/Redo 사용 빈도 주당 평균 20회 이상

---

### Phase 4: AI 프리비주얼 기능 (P3 - 낮음)

**소요 기간**: 3주 (11-13주차)

7. **AI 프리비주얼 이미지 생성**

   **핵심 개념**: "Scene-to-Photo"
   - 사용자가 만든 3D 조명 씬을 바탕으로 Google Nano Banana API를 이용하여 실사 프리비주얼 이미지 생성
   - Canvas API로 3D 씬 캡처 → Nano Banana API로 실사 변환

   **Phase 4.1: 백엔드 AI API 통합** (1주)
   - Previsualization 모델 생성
   - API 키 암호화/복호화 (AES-256-GCM)
   - AI 서비스 레이어 (Google Nano Banana API 연동)
   - Bull Queue (백그라운드 작업)
   - AI 라우터 (API 키 저장, 프리비주얼 생성, 히스토리 조회)

   **Phase 4.2: 프론트엔드 UI 구현** (1.5주)
   - Canvas 캡처 유틸
   - Previsualization Panel
   - API 키 입력 Dialog
   - 프롬프트 입력 (최대 1000자)
   - 파라미터 슬라이더 (strength, steps, guidance scale)
   - 생성 진행 상태 (Progress Bar)
   - 히스토리 뷰 (썸네일 그리드)

   **Phase 4.3: 고급 기능** (0.5주)
   - 프롬프트 Iterate (동일 씬, 다른 프롬프트)
   - 프리비주얼 비교 뷰 (Before/After)
   - 다운로드 (PNG/JPG)

**기술 스택**:
- Google Nano Banana API (Image-to-Image)
- Bull Queue + Redis
- AES-256-GCM

**성공 지표**:
- 프리비주얼 생성 성공률 95% 이상
- 평균 생성 시간 30초 이내
- 사용자 AI 기능 사용률 50% 이상

**참고 문서**: `docs/api/AI_PREVISUALIZATION_API.md`

---

### Phase 5: 기술 부채 정리 (P2 - 중간)

**소요 기간**: 2주 (14-15주차)

8. **Form Validation 및 최적화**
   - React Hook Form + Zod 도입
   - 입력 폼 데이터 검증 강화
   - 성능 최적화 (렌더링 최적화, 메모리 관리)
   - 접근성 개선 (WCAG 2.1 AA 준수)

**성공 지표**:
- 로드 시간 평균 3초 이내
- 렌더링 성능 60fps 유지 (조명 10개 + 오브젝트 5개)
- 접근성 점수 90점 이상

---

## 🗓️ 전체 일정 (총 15주)

| Phase | 기간 | 우선순위 | 주요 목표 |
|-------|------|---------|---------|
| **Phase 1** | 1주 (1주차) | P0 (긴급) | 버그 수정, 카메라 조작 개선, 튜토리얼 |
| **Phase 2** | 2주 (2-3주차) | P1 (높음) | 배경 시스템, 3D 오브젝트 관리 |
| **Phase 3** | 7주 (4-10주차) | P2 (중간) | 프로페셔널 UI (Outliner, Properties, Toolbar) |
| **Phase 4** | 3주 (11-13주차) | P3 (낮음) | AI 프리비주얼 이미지 생성 |
| **Phase 5** | 2주 (14-15주차) | P2 (중간) | 기술 부채 정리 및 최적화 |

**총 소요 기간**: 약 4개월

---

## 📊 전체 성공 지표

### 온보딩 및 사용성
- 튜토리얼 완료율 80% 이상
- 첫 프로젝트 저장 시간 평균 10분 이내
- 단축키 사용률 60% 이상

### 기능 사용률
- 배경 변경률 70% 이상
- 3D 오브젝트 추가율 50% 이상
- AI 기능 사용률 50% 이상 (Phase 4 이후)
- 프로페셔널 UI 사용률 (Outliner/Properties 사용자 비율)

### 성능 및 안정성
- 프로젝트 로드 시간 평균 3초 이내
- 렌더링 성능 60fps 유지 (조명 10개 + 오브젝트 5개)
- 에러율 5% 이하
- 카메라 위치 복원 정확도 100%

### 사용자 참여
- 사용자당 평균 프로젝트 수 3개 이상
- 프로젝트당 평균 조명 수 5개 이상
- 프로젝트당 평균 프리비주얼 수 2개 이상 (Phase 4 이후)

---

## 📝 주요 문서 링크

### 계획 문서
- **PRD 2.0**: `/docs/PRD.md`
- **UI/UX 개선 계획**: `/docs/planning/UI_UX_IMPROVEMENT_PLAN.md`
- **3D 기능 구현 계획**: `/docs/planning/3D_FEATURES_IMPLEMENTATION_PLAN.md`
- **AI API 설계**: `/docs/api/AI_PREVISUALIZATION_API.md`

### 기존 문서
- **API 명세**: `/docs/api/PROJECT_DASHBOARD_API.md`
- **디자인 전략**: `/docs/design/design-strategy.md`
- **UI 간격 시스템**: `/docs/design/ui-spacing-system.md`
- **아키텍처**: `/docs/architecture/LumoStage-Architecture.md`

---

## 🚀 즉시 시작 가능한 작업

### Phase 1 (1주차) - 병렬 작업 가능

**백엔드** (1-2일):
1. `orbitControlState` 필드를 sceneData 스키마에 추가
2. `scene.service.normalizeSceneData()` 수정

**프론트엔드** (3-5일):
1. `editorStore` 확장 (orbitControlState)
2. Scene.jsx에서 OrbitControls 이벤트 구독
3. `CameraOrbitSync.jsx` 컴포넌트 생성
4. `TutorialProvider` Context 생성
5. `TutorialOverlay` 컴포넌트 구현
6. `WelcomeDialog` (Step 1) 구현

### shadcn/ui 컴포넌트 설치

```bash
# Phase 1
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add progress

# Phase 3
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add context-menu
npx shadcn-ui@latest add drawer
```

---

## ⚠️ 주의사항

1. **라이브러리 설치**: 모든 npm 패키지 설치는 사용자가 직접 수행
2. **파일 수정**: 원본 파일 직접 변경 금지, 컴포넌트화 우선
3. **Agent 활용**: 복잡한 작업은 전문 Agent 활용
   - frontend-developer: React 컴포넌트, 3D Scene 작업
   - ui-ux-designer: UI/UX 개선, 디자인 시스템
   - backend-architect: API 설계 (구현 제외)
   - security-engineer: 보안 검토 및 구현
   - documentation-expert: 문서 작성 (예제 코드 제외)

---

## 📈 Milestone 및 검증

### Milestone 1 (1주 후): 핵심 UX 개선 완료
- ✅ OrbitControl 위치 저장 버그 수정
- ✅ 카메라-OrbitControl 연동 기능 완성
- ✅ 튜토리얼 7단계 완성
- **검증**: 신규 사용자 10명 테스트, 튜토리얼 완료율 측정

### Milestone 2 (3주 후): 씬 구성 기능 확장 완료
- ✅ HDRI 배경 업로드 및 적용
- ✅ 3D 오브젝트 추가 및 조작
- **검증**: 배경/오브젝트 사용률 측정

### Milestone 3 (10주 후): 프로페셔널 UI 완성
- ✅ Outliner, Properties, Toolbar 모두 완성
- ✅ Undo/Redo 기능 안정화
- **검증**: 전문가 사용자 만족도 설문 (목표: 90% 이상)

### Milestone 4 (13주 후): AI 프리비주얼 기능 완성
- ✅ Scene-to-Photo 파이프라인 완성
- ✅ 프롬프트 Iterate 기능
- **검증**: 생성 성공률, 평균 생성 시간 측정

### Milestone 5 (15주 후): 안정화 및 배포 준비
- ✅ Form Validation 완료
- ✅ 성능 최적화 (60fps 유지)
- ✅ 접근성 개선 (WCAG AA 준수)
- **검증**: E2E 테스트, 성능 벤치마크

---

## 🎓 팀 역할 분담 (권장)

**백엔드 개발자**:
- Phase 1: OrbitControl 저장 스키마 확장
- Phase 2: Asset 업로드 API 구현
- Phase 4: AI API 통합 (Nano Banana API, Bull Queue)

**프론트엔드 개발자 A**:
- Phase 1: 튜토리얼 시스템, CameraOrbitSync
- Phase 2: BackgroundControl, ObjectControl
- Phase 4: PrevisualizationPanel

**프론트엔드 개발자 B**:
- Phase 3: Outliner, Properties Panel
- Phase 3: Toolbar, Undo/Redo
- Phase 5: Form Validation

**UI/UX 디자이너**:
- Phase 1: 튜토리얼 UX 플로우 설계
- Phase 3: 프로페셔널 UI 디자인 시스템
- 전체: 사용자 테스트 및 피드백 수집

---

이 계획은 사용자 중심 설계 원칙에 기반하며, 점진적으로 기능을 확장하여 초보자와 전문가 모두를 만족시키는 전문적인 3D 조명 시뮬레이션 툴을 완성하는 것을 목표로 합니다.

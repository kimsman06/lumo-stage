# LumoStage PRD 요약본

**문서 버전:** 1.0
**최종 수정일:** 2025년 11월 29일
**프로젝트 오너:** 김재준

---

## 1. 프로젝트 개요

### 1.1 프로젝트명
**LumoStage** - 웹 기반 실시간 3D 조명 시뮬레이션 애플리케이션

### 1.2 비전
영상 및 영화 제작자들이 실제 촬영 전 웹 브라우저에서 간편하게 조명과 카메라 구도를 시뮬레이션하여 시간과 비용을 절약하고 창의적인 결과물을 만들 수 있도록 돕는 전문 3D 시뮬레이션 툴.

### 1.3 문제점
- 실제 촬영 현장에서 조명 설치/테스트 시간과 인력 소모
- 고가의 3D 소프트웨어(Cinema 4D, Blender)는 접근성이 낮음
- 팀원 간 조명/카메라 구도 커뮤니케이션이 어려움
- 웹 기반 3D 툴의 온보딩 부족

### 1.4 타겟 사용자
- **주요**: 영화/영상 전공 학생, 독립 영화 제작자/촬영감독, 유튜버
- **부가**: 조명 디자이너, 무대 연출가, 건축/인테리어 시각화 전문가

---

## 2. 핵심 기능 (Phase 1-7 완료)

### 2.1 3D 뷰포트 및 실시간 렌더링
- Three.js 기반 실시간 3D 렌더링
- OrbitControls로 직관적인 3D 공간 탐색
- 나무 마네킹 모델 기본 제공
- 카메라 위치 저장/복원 (Phase 4)

### 2.2 조명 제어 시스템
- 다양한 조명 타입: Point, Spot, Directional, Rect
- 실시간 속성 조정: 위치, 색상, 강도, 각도, 타겟
- TransformControls로 3D 공간에서 직접 조작
- 디퓨저 시스템: 조명 필터링 및 2차 광원 효과

### 2.3 카메라 및 뷰포트 제어
- 카메라 위치, FOV(화각) 조정
- Cinema 4D 스타일 Camera-Orbit 동기화
  - "Set Camera to View": OrbitControls → Camera View
  - "View from Camera": Camera View → OrbitControls
- 레터박스 오버레이로 종횡비 가이드 제공

### 2.4 배경 및 환경 시스템 (Phase 5)
- HDRI 배경 업로드 (.hdr, .exr) - Cloudflare R2 저장
- 환경광 강도 조절
- Ground Plane 설정 (반사도, 색상)
- 단색 배경 지원

### 2.5 3D 오브젝트 관리 (Phase 5)
- GLB 파일 업로드 및 배치
- Transform 조작 (위치, 회전, 스케일)
- Material 설정 (색상, Metalness, Roughness)
- 그림자 설정

### 2.6 프로젝트 관리 (Phase 3)
- 프로젝트 CRUD (생성, 조회, 수정, 삭제)
- Scene 데이터 저장/로드 (조명, 카메라, 오브젝트 등)
- 공유 토큰 기반 프로젝트 공유
- 썸네일 자동 생성

### 2.7 튜토리얼 시스템 (Phase 4)
- 8단계 인터랙티브 튜토리얼
- 신규 사용자 자동 실행
- 단축키 카드 (? 키)
- localStorage 기반 진행 상태 저장

### 2.8 전문가용 UI (Phase 6)
- **Outliner**: 좌측 패널, 계층 트리 뷰, 가시성 토글
- **Properties Panel**: 우측 패널, 선택된 객체 상세 편집
- **Toolbar**: 하단 플로팅, Transform 모드(W/E/R), Grid/Snap 토글
- **Undo/Redo**: Zustand 기반 히스토리 관리 (⌘+Z, ⌘+Shift+Z)

### 2.9 AI 프리비주얼 (Phase 7)
- **Scene-to-Photo**: 3D 조명 씬 → 실사 이미지 변환
- Gemini 2.5 Flash Image API 통합
- 사용자 API 키 암호화 저장 (AES-256-GCM)
- Bull Queue 기반 비동기 처리
- 프롬프트 Iterate 기능
- 히스토리 관리 및 다운로드

---

## 3. 기술 스택

### 3.1 Frontend
- **Core**: React, Vite, Zustand (상태관리)
- **3D**: Three.js, React-Three-Fiber, React-Three-Drei
- **UI**: Tailwind CSS, shadcn/ui
- **Animation**: Framer Motion

### 3.2 Backend
- **Core**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Session (express-session + MongoDB) + Passport.js (Google/Naver OAuth)
- **File Storage**: Cloudflare R2 (S3 호환)
- **File Upload**: Multer
- **AI**: Gemini 2.5 Flash Image API
- **Queue**: Bull (Redis)
- **Security**: bcrypt, CSRF 보호, AES-256-GCM

### 3.3 아키텍처 패턴
- **Frontend**: 단방향 데이터 흐름 (Zustand 중심)
- **Backend**: MVCS 패턴 (Model-View-Controller-Service)
- **데이터 동기화**: editorStore ↔ projectStore ↔ Express API ↔ MongoDB

---

## 4. 개발 단계별 주요 성과

### Phase 1: 3D Scene 기본 환경 구축 ✅
- Vite+React 프로젝트 설정
- Three.js/R3F 환경 구축
- OrbitControls 기본 3D 캔버스

### Phase 2: 핵심 기능 구현 ✅
- Zustand 전역 상태 관리
- 조명/카메라 제어 UI
- EditorPanel 구현
- 마네킹 모델 통합

### Phase 3: 백엔드 연동 ✅
- MERN 스택 구축
- MVCS 패턴 적용
- 프로젝트 CRUD API
- Scene 저장/로드 파이프라인
- 공유 토큰 시스템

### Phase 4: UX 개선 ✅
- OrbitControls 카메라 위치 저장/복원
- Cinema 4D 스타일 Camera-Orbit 동기화
- 8단계 인터랙티브 튜토리얼
- 단축키 시스템

### Phase 5: 파일 스토리지 및 씬 확장 ✅
- Cloudflare R2 인프라 구축
- HDRI 업로드 및 환경광 시스템
- GLB 파일 업로드 및 3D 오브젝트 관리
- Asset 모델 및 cascade 삭제

### Phase 6: 전문가용 UI ✅
- Outliner 패널 (계층 트리, 가시성 토글)
- Properties Panel (상세 편집)
- Toolbar (Transform 모드, Grid/Snap)
- Undo/Redo 시스템 (Zustand temporal middleware)

### Phase 7: AI 프리비주얼 ✅
- Gemini 2.5 Flash Image API 통합
- 사용자 API 키 암호화 관리
- Bull Queue 비동기 이미지 생성
- Rate Limiting
- 프롬프트 Iterate 및 히스토리

---

## 5. 주요 기술적 도전 과제 및 해결

### 5.1 상태 관리 복잡도
**문제**: 3D 씬 상태(조명, 카메라, 오브젝트)와 UI 상태를 동기화
**해결**: Zustand 단일 진실 소스(Single Source of Truth) 패턴 적용

### 5.2 OrbitControls와 Camera 동기화
**문제**: 사용자가 탐색한 시점을 카메라 뷰로 설정하고 싶음
**해결**: Cinema 4D 스타일 양방향 동기화 구현 (setOrbitToCameraView, setCameraViewToOrbit)

### 5.3 파일 업로드 및 스토리지
**문제**: 대용량 HDRI/GLB 파일 관리
**해결**: Cloudflare R2 (S3 호환) + Multer + Asset 모델 cascade 삭제

### 5.4 Scene 데이터 정규화
**문제**: 프로젝트 간 상태 오염 방지
**해결**: `scene.service.normalizeSceneData()` 서버 레이어에서 정규화

### 5.5 AI 프리비주얼 비동기 처리
**문제**: Gemini API 응답 시간 30초 이상
**해결**: Bull Queue + Redis 기반 백그라운드 작업 처리, Progress 실시간 업데이트

### 5.6 사용자 API 키 보안
**문제**: Gemini API 키를 안전하게 저장
**해결**: AES-256-GCM 암호화 저장, 서버 측에서만 복호화

---

## 6. 데이터 스키마 핵심

### Scene Data 구조
```javascript
{
  schemaVersion: 2,
  aspectRatio: "16:9",
  mannequins: [...],          // 마네킹 위치, 포즈
  lights: [...],              // 조명 타입, 속성
  diffusers: [...],           // 디퓨저 광학 속성
  cameraState: {...},         // 카메라 position, target, focalLength
  orbitControlState: {...},   // OrbitControls 카메라 위치, 타겟, 줌
  backgroundSettings: {...},  // 배경 타입, HDRI URL, Ground 설정
  objects: [...]              // 3D 오브젝트 (프리미티브/GLTF)
}
```

### 백엔드 모델
- **User**: username, email, password(bcrypt), googleId, naverId, geminiApiKey(암호화)
- **Project**: name, description, owner, sceneData, thumbnail
- **Asset**: owner, projectId, type(hdri/gltf), fileKey, fileUrl, metadata
- **Previsualization**: owner, project, sceneRenderUrl, prompt, generatedImageUrl, status

---

## 7. 향후 계획 (Phase 8+)

### Phase 8: 기술 부채 정리 및 최적화
- 프론트엔드 컴포넌트 리팩토링
- 성능 최적화 (React.memo, useCallback)
- 접근성 개선 (WCAG 2.1 AA)
- E2E 테스트 (Playwright)

### Phase 9: 협업 기능
- 실시간 멀티 유저 편집 (WebSocket)
- 댓글 및 피드백 시스템
- 버전 관리

### Phase 10: 렌더링 개선
- 고품질 렌더링 옵션
- 포스트 프로세싱 효과
- 그림자 품질 개선

### Phase 11: 배포 및 모니터링
- 프로덕션 빌드 최적화
- CDN 설정
- 성능 모니터링
- 에러 트래킹 (Sentry)

---

## 8. 성공 지표

### 기술적 성과
- ✅ 프로젝트 저장/로드 성공률 100%
- ✅ OrbitControls 위치 복원 정확도 100%
- ✅ HDRI 업로드 성공률 99% 이상
- ✅ 3D 오브젝트 10개 이상 배치 시 60fps 유지
- ✅ AI 프리비주얼 생성 성공률 95% 이상

### 사용자 경험
- ✅ 신규 사용자 튜토리얼 완료율 80% 이상 목표
- ✅ 전문가용 UI로 조명 조정 속도 50% 향상
- ✅ Undo/Redo 사용 빈도 주당 평균 20회 이상

---

**문서 종료**

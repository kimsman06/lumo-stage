# Server 대응 계획 및 Client 보안 점검 메모 (2025-10-26)

## 1. 작성 배경

- 참조 문서: `docs/frontend-refactor-plan-2025-10-26.md`
- 목적: 프런트 리팩터링 계획 중 서버(`server/`)에서 선행하거나 병행할 수 있는 항목을 정리하고, 동일 문서에서 언급된 클라이언트 보안 이슈를 다시 짚어 후속 조치 범위를 명확히 함.

## 2. `server/`에서 처리할 우선 항목

### 2.1 CSRF 토큰 발급·검증 파이프라인

- 근거: `docs/frontend-refactor-plan-2025-10-26.md:37`
- 목표
  - Express 전역 미들웨어로 CSRF 토큰 쿠키 발급 및 요청 검증 체계 마련.
  - 프런트 `axios` 인터셉터에서 사용할 `/auth/csrf-token` 엔드포인트 제공.
- 처리 계획
  1. `server/middleware/csrf.js` 추가: `helmet` 기본 설정 확인 후, `csurf` 또는 커스텀 nonce 기반 토큰 발급 로직 구현.
  2. `server/routes/auth.js`에 `GET /auth/csrf-token` 핸들러 추가, 토큰을 JSON과 `SameSite=Strict` 쿠키로 동시 반환.
  3. POST/PUT/DELETE 라우트 공통 미들웨어에 `verifyCsrfToken` 연결, 실패 시 403과 표준 에러 포맷 응답.
  4. 단위 테스트(`server/tests/middleware/csrf.test.js`)로 토큰 발급·검증 플로우 검증.

### 2.2 공유 토큰 발급 API (프로젝트 공유 다이얼로그 백엔드)

- 근거: `docs/frontend-refactor-plan-2025-10-26.md:54`
- 목표
  - Share 버튼에서 사용할 임시 접근 토큰 발급·폐기 API 제공.
- 처리 계획
  1. `server/models/ShareToken.js` 생성: `projectId`, `token`, `expiresAt`, `createdBy`, `lastAccessedAt` 필드 정의.
  2. `server/services/shareService.js`에서 토큰 생성·검증·폐기 로직 구현(랜덤 128bit, 만료 7일 기본).
  3. `server/controllers/shareController.js`에 `POST /projects/:id/share`, `DELETE /projects/:id/share`, `GET /share/:token` 액션 추가.
  4. 라우트 보호: 프로젝트 소유자 확인, 레이트 리밋 적용(`server/middleware/rateLimit.js` 재사용 또는 신규 작성).
  5. 통합 테스트로 토큰 발급→검증→폐기 플로우 확인.

### 2.3 Scene 데이터 스키마 확장 및 마이그레이션

- 근거: `docs/frontend-refactor-plan-2025-10-26.md:102`
- 목표
  - `sceneData` 저장 구조에 `aspectRatio`, `diffusers`, `lights[*].type === "rect"` 등 새로운 속성을 반영하고 역호환 보장.
- 처리 계획
  1. `server/models/Scene.js` 또는 대응되는 스키마에 신규 필드 추가 및 기본값 정의.
  2. DB 마이그레이션 스크립트 작성: 기존 레코드에 `aspectRatio: "16:9"`, `diffusers: []` 등 기본값 주입.
  3. `server/services/sceneService.js`에서 save/load 시 스키마 검증 추가(`Joi`/`zod` 등 사용 고려).
  4. API 응답 버전 관리: 응답 본문에 `schemaVersion` 포함, 구버전 요청 처리 경로 점검.
  5. 회귀 테스트로 Rect Light, Diffuser가 포함된 페이로드 저장·조회 검증.

### 2.4 인증 토큰 갱신 및 실패 처리 개선

- 근거: `docs/frontend-refactor-plan-2025-10-26.md:68`
- 목표
  - 프런트 `PrivateRoute` 개선과 연동해 Refresh 토큰 갱신 실패 시 안정적인 로그아웃 플로우를 제공.
- 업데이트(2025-10-30): 백엔드 인증이 JWT + Refresh 토큰 구조에서 Express 세션 기반으로 전환되었습니다. `/auth/refresh` 엔드포인트와 관련 세션 토큰 모델이 제거되었으며, 프런트엔드 axios 인터셉터도 더 이상 토큰 재발급을 시도하지 않습니다. 아래 처리 계획은 참조용으로 보존하며, 향후 세션 무효화/연장 전략이 필요할 때 재정의가 필요합니다.
- 처리 계획
  1. `server/controllers/authController.js`에 `POST /auth/refresh` 응답 포맷 재검토(만료 원인 코드 포함).
  2. Refresh 토큰 재발급 시 재사용 감지, IP/UA 로그 기록, 실패 시 서버 측 세션 즉시 폐기.
  3. `server/services/authService.js`에서 재발급 실패 시 Audit 로그 적재 및 알림 훅(필요 시).
  4. 통합 테스트: 만료/위조/재사용 토큰 각각에 대해 기대값 확인.

## 3. Client 보안 이슈 재점검

- 하드코딩된 OAuth/API URL (`docs/frontend-refactor-plan-2025-10-26.md:20-22,35`): `import.meta.env` 기반 구성으로 교체하고 HTTPS 전용 엔드포인트 사용 필요.
- CSRF 대응 미비 (`docs/frontend-refactor-plan-2025-10-26.md:37`): 서버 토큰 파이프라인과 연계한 axios 인터셉터 구현이 필요.
- 인증 라우팅 시 토큰 갱신 실패 처리 부재 (`docs/frontend-refactor-plan-2025-10-26.md:68`): Refresh 실패 시 강제 로그아웃 및 에러 토스트 노출 설계.
- 로그인/회원가입 입력 검증 미흡 (`docs/frontend-refactor-plan-2025-10-26.md:69`): 길이/패턴 검증, 오류 메시지, 가이드 텍스트 명시.
- HTTP 기반 소셜 로그인 링크 유지 (`docs/frontend-refactor-plan-2025-10-26.md:22`): HTTPS 리디렉션 강제, 미등록 도메인 차단 및 실패 시 보안 알림 처리.

### 2.5 Cloudflare R2 자산 파이프라인 (Phase 5 백엔드) — ✅ 2025-11-09 완료

- **작업 범위** ✅ 완료
  - ✅ `server/models/Asset.js`: Asset 모델 정의 (hdri/gltf/image 타입, 메타데이터, 인덱스)
    - 필드: owner, projectId, type, fileName, fileKey, fileUrl, fileSize, mimeType, metadata, storageProvider
    - 인덱스: `{ owner: 1, uploadedAt: -1 }`, `{ projectId: 1, type: 1 }`
  - ✅ `server/services/storage.service.js`: R2 스토리지 서비스 구현
    - S3 호환 API 사용 (`@aws-sdk/client-s3`)
    - `uploadBuffer()`, `deleteObject()`, `generateAssetKey()` 유틸리티
    - 테스트/개발 환경용 인메모리 모킹 (`isMockMode()`)
  - ✅ `server/services/asset.service.js`: Asset 비즈니스 로직
    - `createAssetFromBuffer()`: 파일 업로드 및 DB 저장
    - `getAssetsForProject()`: 프로젝트별 Asset 조회
    - `removeAsset()`: Asset 삭제 (R2 파일 포함)
    - `removeAssetsByProject()`: 프로젝트 삭제 시 cascade 삭제
  - ✅ `server/controllers/asset.controller.js`: Asset 컨트롤러
    - `uploadHdri()`: HDRI 업로드 처리 (.hdr, .exr / 최대 50MB)
    - `uploadGltf()`: GLB 업로드 처리 (.glb / 최대 100MB)
    - `listByProject()`: 프로젝트별 Asset 목록 조회
    - `remove()`: Asset 삭제
    - 파일 검증: 확장자, MIME 타입, 크기
  - ✅ `server/routes/asset.routes.js`: Asset 라우터
    - `POST /api/assets/upload-hdri`: HDRI 업로드 (Multer 미들웨어)
    - `POST /api/assets/upload-gltf`: GLB 업로드 (Multer 미들웨어)
    - `GET /api/assets/project/:projectId`: 프로젝트별 Asset 목록
    - `DELETE /api/assets/:assetId`: Asset 삭제
    - 모든 엔드포인트: `requireAuth` 미들웨어로 인증 검증
  - ✅ `server/validators/asset.schemas.js`: Asset 유효성 검사 스키마
  - ✅ 프로젝트 삭제 연계: `project.service.js`에서 `removeAssetsByProject()` 호출

- **테스트** ✅ 완료
  - ✅ `server/tests/assets.test.js`: TDD 기반 통합 테스트
    - HDRI 업로드 플로우 (파일 검증, R2 업로드, DB 저장)
    - GLB 업로드 플로우
    - 프로젝트별 Asset 목록 조회
    - Asset 삭제 (R2 파일 및 DB 레코드)
    - 프로젝트 삭제 시 cascade 삭제
    - 파일 크기/확장자 검증 시나리오
    - 권한 검증 (소유자만 삭제 가능)
  - ✅ 인메모리 모킹: `storage.service.js`의 `__memoryStore`로 R2 업로드/삭제 검증

- **주요 변경사항**
  - **GLB 전용 지원**: `.gltf` 대신 `.glb` (Binary GLTF)만 지원
    - 이유: 파일 크기 최적화, 로딩 속도 향상, 관리 간편화
    - 영향: PRD 및 관련 문서에서 "GLTF" → "GLB" 명시

- **환경 설정**
  - 환경변수: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
  - 테스트: `NODE_ENV=test` 또는 `R2_USE_LOCAL=true` 시 로컬 모킹 사용

- **다음 단계** (Phase 5 나머지 작업)
  - ⏳ 프론트엔드 Scene 통합 (HDRI 환경 맵, GLB 모델 렌더링)
  - ⏳ TransformControls 확장 (GLB 모델 조작)
  - ⏳ Ground Plane 조건부 렌더링

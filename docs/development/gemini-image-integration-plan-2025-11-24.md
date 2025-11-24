# Gemini 2.5 Flash 이미지 통합 계획 (2025-11-24)

**작성자:** Codex  
**상태:** 초안 (Phase 5 선행 연구)  
**참고 문서:** `docs/development/Frontend-Implementation-Plan-20251026.md`, `docs/design/ui-spacing-system.md`, `docs/development/ui-refactor-summary-2025-10-27.md`

---

## 1. 목표와 범위
- Gemini 2.5 Flash Image(Nano Banana) 모델을 활용한 **텍스트→이미지**, **이미지+텍스트 편집**, **다중 이미지 합성** 워크플로우 정의
- 프롬프트 엔지니어링 가이드와 체크리스트 확보로 **일관된 에셋 품질**과 **Phase 5(Toast/접근성/자동 저장)** 맞춤 피드백 루프 구현
- 서버 Express MVCS 구조와 일치하는 **API/서비스 계층 설계** 및 엔드포인트 명세 수립
- 필요한 라이브러리, 환경 변수, 보안/비용 제약을 식별해 **사용자 설치/설정 작업**을 명확히 전달

---

## 2. 모델 선택 및 구성 전략
| 항목 | 권장값 | 비고 |
| --- | --- | --- |
| 기본 모델 | `gemini-2.5-flash-image` | 빠른 응답, 1024px 기본, Nano Banana |
| 고품질 옵션 | `gemini-3-pro-image-preview` | 4K/멀티레퍼런스 필요 시만 사용 |
| 응답 Modalities | `["TEXT","IMAGE"]` | 1-Turn 결과 설명 + Base64 |
| 해상도/비율 | `image_config.aspect_ratio` + `image_size` | 1K 기본, 하위 표 참고 |
| 도구 | `tools: [{"google_search": {}}]` (선택) | 실시간 자료 기반 작업만 사용 |

> **토큰 예산**: Flash Image는 고정 1290토큰/이미지 (1024px). 3 Pro는 해상도별 1210~2000토큰.  
> **API Key 입력**: 환경변수 대신 **사용자별 입력 UI**를 통해 `geminiApiKey`를 수집하고 암호화 저장한다. 서버는 요청 시 해당 키로 Google API를 호출하며, 관리용 기본 키(`GEMINI_IMAGE_MODEL`, `GEMINI_IMAGE_REGION`) 정도만 환경 변수로 유지한다.

### 2.1 API Key 사용자 입력·보관 흐름
1. **Client**: “Gemini API Key 설정” 다이얼로그(Modal)에서 사용자가 직접 키 입력 → `POST /api/ai/provider-key` 호출.  
2. **Server**:  
   - Zod 검증 후 KMS or AES로 암호화 → DB(`UserAISettings`) 보관  
   - Key digest(SHA-256) 저장해 중복 감지 및 감사 로그 작성  
3. **호출 시점**: `geminiImageService`가 요청자 ID로 키 조회 → 존재하지 않으면 412 에러(`API key not configured`) 반환.  
4. **보안**:  
   - 응답/로그에 키 노출 금지  
   - 삭제 API (`DELETE /api/ai/provider-key`) 제공  
   - 비활성 사용자 정리 시 키도 즉시 파기

---

## 3. 프롬프트 엔지니어링 가이드

### 3.1 공통 원칙
1. **장면 설명 우선**: 키워드 나열 대신 “누가-어디서-무엇을-어떻게” 구조로 서술.
2. **맥락 명시**: 결과물 용도(예: “에디터 기능 소개 썸네일”, “대시보드 온보딩 일러스트”)를 포함하면 일관성 ↑.
3. **카메라/스타일/광원**: 사진·시네마틱 요구 시 촬영 용어(렌즈, 조리개, 조명, 무드) 명시.
4. **부정 지침은 긍정형으로**: “차 없는 거리”처럼 원하는 상태를 서술.
5. **단계적 지시**: 복잡한 장면은 “배경 → 전경 → 텍스트” 순서로 나누어 작성.

### 3.2 시나리오별 템플릿 (요약)

- **포토리얼**  
  `A photorealistic [shot type] of [subject], [action], set in [environment]. Lit by [light], captured with [lens], mood is [mood].`

- **스타일/스티커**  
  `A [style] sticker of [subject] doing [action], [line style/shading], palette [colors], background [transparent/white].`

- **정확한 텍스트 렌더링**  
  `Create a [asset] with the text "[copy]". Font style [descriptor], layout [shape]. Color scheme [colors].`

- **상품/Mockup**  
  `A studio-lit product photo of [product] on [surface], using [lighting]. Camera angle [angle], emphasize [detail].`

- **미니멀/네거티브 스페이스**  
  `Minimalist composition with [subject] at [position] against [color] negative space, soft light from [direction].`

- **시퀀스/코믹**  
  `Make a [N] panel comic in [style]. Panel breakdown: (1) [...], (2) [...], ...`

### 3.3 편집/합성 시 체크포인트
- **이미지+텍스트 편집**: `contents: [prompt, image]` 순, 스타일/조명 일치 문구 포함.
- **세맨틱 마스킹**: “change only the [element] … keep everything else identical.”  
- **다중 이미지 합성**: 순서 = 텍스트 맥락 → 참고 이미지 n개 → 명령문. 최대 3개 입력 우선, 4개 이상은 3 Pro 고려.
- **배치 생성**: 20MB 이하 요청은 inline JSONL, 그 이상은 파일 업로드 + Batch API (`batchGenerateContent`).  
- **반복 수정**: Chat 세션 유지 → `thought_signature` 자동 전달 (SDK 사용 시 추가 처리 불필요).

---

## 4. API/서비스 설계

### 4.1 요청 흐름
1. **Client (React)**: Prompt Builder 모달에서 시나리오/스타일/옵션(Aspect Ratio, Resolution, Reference 이미지)을 수집.  
2. **Store 액션 (예: `aiAssetStore.generateImage`)**: `/api/ai/images` POST 호출. Phase 5 Toast 가이드에 맞춰 진행/성공/실패 토스트 노출.  
3. **Express Route (`routes/aiImageRoutes.js`)**  
   - 입력 검증: Zod 스키마 (`prompt`, `mode`, `aspectRatio`, `resolution`, `references[]`, `negativePrompt`)  
   - Bull Queue enqueue (job type `ai:image-generate`) → 장시간 작업 분리.  
4. **Service (`services/geminiImageService.js`)**  
   - Google SDK 클라이언트 초기화 (`new GoogleGenAI({ apiKey: ... })`)  
   - `models.generateContent` 호출: `model`, `contents`, `config.imageConfig` 주입  
   - 응답 image Base64를 Buffer 변환 후 S3 업로드 → URL 반환 (기존 S3 util 재사용)  
5. **Controller 응답**: `202 Accepted`(비동기) 또는 `200 OK`(동기) 선택.  
   - 권장: 동기 모드(이미지 1~2장)에서는 즉시 URL 반환, 배치 모드는 Job ID 반환 후 `/api/ai/images/:jobId`로 폴링.

### 4.2 엔드포인트 명세
```
POST /api/ai/images
Body {
  prompt: string,
  mode: "text-to-image" | "text-image-edit" | "multi-reference" | "batch",
  aspectRatio?: "1:1" | "16:9" | ...,
  resolution?: "1K" | "2K",
  references?: [{ type: "image", fileId }, { type: "text", value }],
  negativePrompt?: string
}
Response 200 {
  images: [{ url, mimeType, metadata: { aspectRatio, resolution, model } }],
  tokenUsage,
  promptEcho
}
```

에러 규칙:
- 400: 검증 실패 (Zod 메시지 + 사용자 친화적 안내)
- 422: 모델 응답 오류 (Google API error code 매핑)
- 503: Rate limit/Quota 초과 → 재시도 후 대안 제시

### 4.3 서비스 계층 구현 TODO
1. `config/gemini.js`: API Key/기본 옵션 로더, timeouts, 추적용 logger 포함.
2. `services/geminiImageService.js`: `buildContents(payload)` + `callModel()` + `uploadImage(buffer)` + `mapResponse()`.
3. `controllers/aiImageController.js`: 요청 검증 → 서비스 호출 → 응답 DTO 변환.
4. `routes/aiImageRoutes.js`: `POST /`, `GET /:jobId`.  
5. `queues/aiImageQueue.js`: 대량 생성 시 Bull worker에서 `geminiImageService`.
6. `tests/services/geminiImageService.test.js`: SDK Mock(예: `jest.mock("@google/genai")`) + happy/error path.

---

## 5. 클라이언트 통합 시나리오 (Vite React)
1. **상태 스토어 (`client/src/store/aiAssetStore.js` 신규)**  
   - 상태: `assets`, `currentJob`, `isGenerating`, `error`  
   - 액션: `generateImage(options)`, `pollJob(jobId)`, `reset()`
2. **프롬프트 빌더 UI**  
   - `client/src/components/editor/ai/PromptBuilder.jsx` (새 컴포넌트)  
   - 템플릿 선택 (포토리얼, 스티커 등), Aspect Ratio, Resolution, Negative Prompt 토글  
   - Reference 업로드는 기존 `S3UploadDialog` 재사용
3. **Phase 5 연계**  
   - `sonner` Toast로 진행률/성공/실패 메시지 → `docs/development/ui-refactor-summary-2025-10-27.md` 체크리스트 준수 (aria-live, spacing)  
   - 자동 저장 개선 항목: 생성된 이미지 메타데이터를 `projectStore` Scene Assets에 자동 연결 후 debounce 저장
4. **접근성**: Prompt Builder에 `aria-labelledby`, Form Field 설명, 키보드 포커스 트랩(Dialog)

---

## 6. 필요한 라이브러리 & 설치 요청
사용자가 직접 설치해야 하는 패키지 목록:
1. **서버**  
   - `@google/genai` : 공식 Node SDK (chat + image).  
   - `form-data` (이미지 업로드 시 필요하면).  
   - `uuid` (Job/Asset ID 생성, 없다면).  
2. **클라이언트** (선택)  
   - `@google/generative-ai` 대신 서버 프록시만 쓰므로 추가 설치 불필요.  
   - 이미지 편집기능을 확장하려면 `react-dropzone` 등 업로드 UX 라이브러리 고려.

설치 명령 예시 (사용자 실행):
```bash
cd server && npm install @google/genai uuid
```

> **주의:** 네트워크 접근은 서버에서만 수행. 클라이언트에서 직접 Gemini API 호출 금지 (API 키 노출 방지).

---

## 7. 테스트 & 검증 전략
- **단위 테스트**: `geminiImageService` mock 응답 (성공/쿼터초과/invalid aspect ratio).  
- **통합 테스트**: `supertest`로 `/api/ai/images` 호출 → 200/422/503 시나리오. `mongodb-memory-server`를 사용하되 이미지 메타데이터만 저장.  
- **수동 체크리스트** (`docs/development/ui-refactor-summary-2025-10-27.md`)  
  - Dialog spacing, focus trap, aria-tags  
  - Toast 접근성 (`aria-live="polite"`)  
  - 업로드 버튼 키보드 접근 가능 여부  
- **회귀 테스트**: Buffer 업로드 시 `mime-types` 모듈로 Content-Type 검증.

---

## 8. 운영 고려 사항
1. **비용/쿼터 모니터링**: 일간 이미지 생성 횟수 Redis 카운터 + 관리자 대시보드 노출.  
2. **오류 가시성**: Google 응답 `groundingMetadata`, `thought_signature`는 DB에 저장해 재현성 확보.  
3. **보안**:  
   - API Key는 사용자 입력 → 암호화 저장 → 호출 시 복호화. 운영 계정용 기본 키는 비상용으로만 `.env`에 보관  
   - Reference 이미지 업로드 시 라이선스 확인 체크박스 필수  
4. **확장 로드맵**:  
   - 고해상도(2K/4K) 요청은 Background Job 필수 + Webhook/Socket 알림  
   - 향후 Imagen 4 비교 테스트 후 모듈 교체 가능하도록 Adapter 패턴 유지

---

### 다음 단계 요약
1. 사용자 측에서 `@google/genai` 설치 및 API Key 입력 UI를 노출할 준비  
2. `config/gemini.js`, `services/geminiImageService.js` 스캐폴드 추가  
3. `/api/ai/images` 라우트 + Zod 스키마 + Bull Queue 작성  
4. 클라이언트 Prompt Builder/Store/Toast 연동 및 `API Key 설정` 다이얼로그 구현 → Phase 5 체크리스트 업데이트

# LumoStage AI 프리비주얼 이미지 생성 API 설계

**작성일**: 2025-11-03
**목적**: 3D 조명 씬을 실사 이미지로 변환하여 스토리보드 프리비주얼 제작

---

## 1. 기능 개요

### 1.1 핵심 개념

**"Scene-to-Photo: 3D 조명 씬 → 실사 프리비주얼 이미지"**

사용자가 LumoStage에서 설정한 조명, 카메라 각도, 마네킹 포즈를 바탕으로 Google Nano Banana API를 활용하여 실사처럼 렌더링된 영화 스토리보드 이미지를 생성합니다.

### 1.2 워크플로우

```
1. 사용자가 3D 씬에서 조명, 카메라, 마네킹 포즈 설정
   ↓
2. Canvas API로 현재 3D 씬을 이미지(PNG/JPG)로 캡처
   ↓
3. 사용자가 프롬프트 입력 (예: "cinematic portrait, studio lighting, professional photography")
   ↓
4. 서버로 3D 렌더링 이미지 + 프롬프트 전송
   ↓
5. 서버가 사용자의 Nano Banana API 키로 실사 변환 요청
   ↓
6. AI가 3D 씬의 조명/구도를 유지하면서 실사 이미지 생성
   ↓
7. 결과를 프로젝트에 연결하여 스토리보드로 활용
```

### 1.3 사용 사례

- **영화 제작 프리프로덕션**: 촬영 전 조명 테스트 → 실사 프리비주얼로 감독/촬영감독과 커뮤니케이션
- **유튜버 콘텐츠 기획**: 조명 세팅을 미리 시뮬레이션 → 실제 촬영 환경 예측
- **학생 포트폴리오**: 조명 디자인 작업물을 실사 이미지로 변환하여 포트폴리오 제작

---

## 2. 데이터 모델

### 2.1 User 스키마 확장

**파일**: `server/models/User.js`

```javascript
{
  // 기존 필드...
  aiApiKey: {
    type: String,
    default: null,
    select: false  // 보안: 기본 쿼리에서 제외
  },
  aiUsageStats: {
    totalGenerations: { type: Number, default: 0 },
    lastGeneratedAt: { type: Date, default: null },
    monthlyGenerations: { type: Number, default: 0 }  // 월간 사용량
  }
}
```

### 2.2 Previsualization 모델 (신규)

**파일**: `server/models/Previsualization.js`

```javascript
{
  owner: ObjectId,                    // User 참조 (required)
  project: ObjectId,                  // Project 참조 (optional)

  // 입력 데이터
  sceneRenderUrl: String,             // 3D 씬 렌더링 이미지 URL (required)
  prompt: String,                     // 사용자 프롬프트 (required, maxlength: 1000)
  negativePrompt: String,             // 네거티브 프롬프트 (optional, maxlength: 500)

  // 씬 메타데이터 (선택적, 디버깅/히스토리용)
  sceneSnapshot: {
    lightsCount: Number,              // 조명 개수
    cameraAngle: Object,              // { position, target }
    mannequinPose: String             // 포즈 이름
  },

  // 출력 데이터
  generatedImageUrl: String,          // AI 생성 실사 이미지 URL (required)

  // AI 파라미터
  generationParams: {
    model: String,                    // 'nano-banana-v1' 등
    steps: Number,                    // Diffusion steps (default: 20)
    guidanceScale: Number,            // CFG scale (default: 7.5)
    seed: Number,                     // 재현성을 위한 시드
    strength: Number                  // 이미지 변환 강도 (0.0-1.0)
  },

  // 상태 관리
  status: String,                     // 'pending' | 'processing' | 'completed' | 'failed'
  errorMessage: String,               // 실패 시 에러 메시지

  // 메타데이터
  metadata: {
    processingTime: Number,           // 밀리초
    apiProvider: String,              // 'google-nano-banana'
    apiVersion: String,
    retryCount: Number                // 재시도 횟수
  },

  createdAt: Date,
  updatedAt: Date
}
```

**인덱스**:
```javascript
{ owner: 1, createdAt: -1 }         // 사용자별 히스토리 조회
{ project: 1, createdAt: -1 }       // 프로젝트별 프리비주얼 조회
{ status: 1, createdAt: 1 }         // pending/processing 작업 모니터링
```

---

## 3. API 엔드포인트

### 3.1 API 키 관리

#### 3.1.1 API 키 저장/업데이트

**엔드포인트**: `POST /api/ai/api-key`
**인증**: 필수 (`requireAuth`)

**요청 본문**:
```json
{
  "apiKey": "sk-nanbanana-abc123xyz..."
}
```

**응답 (200)**:
```json
{
  "message": "Nano Banana API 키가 저장되었습니다."
}
```

**보안**:
- API 키는 AES-256-GCM으로 암호화하여 DB 저장
- 암호화 키는 환경변수 `ENCRYPTION_KEY`에서 관리 (32 bytes)
- 선택적: API 키 유효성 검증 (Google API에 테스트 요청)

**에러**:
- 400: API 키 형식 오류
- 401: API 키가 유효하지 않음 (검증 실패)

---

#### 3.1.2 API 키 확인

**엔드포인트**: `GET /api/ai/api-key/status`
**인증**: 필수

**응답 (200)**:
```json
{
  "hasApiKey": true,
  "usageStats": {
    "totalGenerations": 45,
    "monthlyGenerations": 12,
    "lastGeneratedAt": "2025-11-02T14:30:00.000Z"
  }
}
```

**설명**: API 키 존재 여부만 반환 (실제 키 값은 반환하지 않음)

---

### 3.2 프리비주얼 이미지 생성

#### 3.2.1 생성 요청 (비동기)

**엔드포인트**: `POST /api/ai/previsualize`
**인증**: 필수
**요청 형식**: `multipart/form-data`

**요청 필드**:
```javascript
{
  sceneRender: File,              // 3D 씬 렌더링 이미지 (required, jpg/png, max 10MB)
  prompt: String,                 // 텍스트 프롬프트 (required, maxlength: 1000)
  negativePrompt: String,         // 네거티브 프롬프트 (optional)
  projectId: String,              // 연결할 프로젝트 ID (optional)

  // 선택적 파라미터
  generationParams: {
    model: String,                // default: 'nano-banana-v1'
    steps: Number,                // default: 20
    guidanceScale: Number,        // default: 7.5
    seed: Number,                 // optional
    strength: Number              // default: 0.75 (조명 구도 유지 강도)
  }
}
```

**응답 (202 Accepted)**:
```json
{
  "message": "프리비주얼 이미지 생성 작업이 시작되었습니다.",
  "previsualization": {
    "id": "65f0xyz...",
    "status": "processing",
    "estimatedTime": 30,
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

**비동기 처리 플로우**:
```
1. Previsualization 레코드 생성 (status: 'pending')
2. 3D 씬 렌더링 이미지를 임시 스토리지에 저장
3. Bull Queue에 작업 추가
4. 즉시 202 응답 반환
5. Worker에서 다음 작업 수행:
   a. 사용자 API 키 복호화
   b. Google Nano Banana API 호출
   c. 생성된 실사 이미지 저장
   d. Previsualization 레코드 업데이트 (status: 'completed')
   e. (선택) WebSocket으로 클라이언트에게 완료 알림
```

**에러**:
- 400: 필수 필드 누락 / 프롬프트 길이 초과 / 이미지 형식 오류
- 403: API 키가 설정되지 않음
- 413: 이미지 파일 크기 초과 (10MB)
- 429: Rate limit 초과 (사용자당 10 requests/hour)
- 507: 월간 사용량 초과 (사용자당 100 generations/month)

---

#### 3.2.2 생성 상태 조회

**엔드포인트**: `GET /api/ai/previsualize/:id`
**인증**: 필수

**응답 (200)**:
```json
{
  "previsualization": {
    "id": "65f0xyz...",
    "status": "completed",
    "sceneRenderUrl": "http://localhost:3001/uploads/ai/source/...",
    "prompt": "cinematic portrait with dramatic studio lighting",
    "negativePrompt": "blur, low quality",
    "generatedImageUrl": "http://localhost:3001/uploads/ai/generated/...",
    "sceneSnapshot": {
      "lightsCount": 3,
      "cameraAngle": { "position": [0, 2, 8], "target": [0, 1, 0] },
      "mannequinPose": "neutral"
    },
    "generationParams": {
      "model": "nano-banana-v1",
      "steps": 20,
      "guidanceScale": 7.5,
      "strength": 0.75,
      "seed": 42
    },
    "metadata": {
      "processingTime": 28340,
      "apiProvider": "google-nano-banana",
      "apiVersion": "v1"
    },
    "createdAt": "2025-11-03T10:00:00.000Z",
    "updatedAt": "2025-11-03T10:00:28.340Z"
  }
}
```

**상태별 응답**:
- `pending` / `processing`: `generatedImageUrl` 없음, `estimatedTime` 포함
- `completed`: 모든 필드 포함
- `failed`: `errorMessage` 필드 포함

**에러**:
- 400: 잘못된 ObjectId
- 403: 본인의 프리비주얼이 아님
- 404: 프리비주얼을 찾을 수 없음

---

#### 3.2.3 히스토리 조회

**엔드포인트**: `GET /api/ai/previsualizations`
**인증**: 필수

**쿼리 파라미터**:
```javascript
{
  projectId: String,    // 프로젝트별 필터링 (optional)
  status: String,       // 상태별 필터링 (optional)
  page: Number,         // 페이지 번호 (default: 1)
  limit: Number         // 페이지 크기 (default: 20, max: 50)
}
```

**응답 (200)**:
```json
{
  "previsualizations": [
    {
      "id": "65f0xyz...",
      "status": "completed",
      "prompt": "cinematic portrait...",
      "sceneRenderUrl": "http://...",
      "generatedImageUrl": "http://...",
      "projectId": "64e9abc...",
      "createdAt": "2025-11-03T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

---

#### 3.2.4 프롬프트로 재생성 (Iterate)

**엔드포인트**: `POST /api/ai/previsualize/:id/iterate`
**인증**: 필수

**요청 본문**:
```json
{
  "prompt": "same scene but with warmer tones, golden hour lighting",
  "negativePrompt": "cold colors, blue tones",
  "generationParams": {
    "seed": 42,  // 동일 시드로 일관성 유지
    "strength": 0.8  // 변환 강도 조정
  }
}
```

**응답 (202)**:
```json
{
  "message": "프롬프트가 업데이트되어 새로운 이미지를 생성합니다.",
  "previsualization": {
    "id": "65f0new...",
    "status": "processing",
    "parentId": "65f0xyz..."  // 원본 프리비주얼 참조
  }
}
```

**설명**: 동일한 3D 씬 렌더링 이미지를 사용하되, 프롬프트만 변경하여 새로운 프리비주얼 생성

---

#### 3.2.5 삭제

**엔드포인트**: `DELETE /api/ai/previsualize/:id`
**인증**: 필수

**응답 (204)**: 본문 없음

**동작**:
1. Previsualization 레코드 삭제
2. 3D 씬 렌더링 이미지 파일 삭제
3. 생성된 실사 이미지 파일 삭제
4. 진행 중인 작업인 경우 큐에서 제거

---

## 4. Google Nano Banana API 연동

### 4.1 API 호출 로직

**서비스 레이어**: `server/services/ai.service.js`

**핵심 로직**:
```
1. 사용자의 암호화된 API 키 가져오기 및 복호화
2. 3D 씬 렌더링 이미지를 Base64로 인코딩
3. Google Nano Banana API 호출:
   - 엔드포인트: POST https://api.google-nanbanana.com/v1/image-to-image
   - 헤더: Authorization: Bearer {apiKey}
   - 본문:
     {
       "init_image": "data:image/png;base64,...",
       "prompt": "사용자 프롬프트",
       "negative_prompt": "네거티브 프롬프트",
       "model": "nano-banana-v1",
       "steps": 20,
       "guidance_scale": 7.5,
       "strength": 0.75,  // 중요: 조명/구도 유지 강도
       "seed": 42
     }
4. 응답 받기: { "image": "base64_encoded_image" }
5. 생성된 이미지를 디코딩하여 스토리지에 저장
6. Previsualization 레코드 업데이트
```

### 4.2 에러 핸들링

**API 에러 코드별 매핑**:
```
400 → "잘못된 요청입니다. 프롬프트 또는 이미지 형식을 확인해주세요."
401 → "API 키가 유효하지 않습니다. 설정에서 API 키를 다시 확인해주세요."
403 → "API 사용 권한이 없습니다."
429 → "Google API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
500 → "AI 서비스에 일시적인 문제가 발생했습니다."
TIMEOUT (60s) → "이미지 생성 시간이 초과되었습니다. 다시 시도해주세요."
```

**재시도 전략**:
- 네트워크 에러: 최대 3회 재시도, exponential backoff
- 429 에러: Retry-After 헤더 확인 후 대기
- 500 에러: 1회 재시도 후 실패 처리

---

## 5. 보안 및 성능

### 5.1 보안

**API 키 암호화**:
```javascript
// server/utils/encryption.js

const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptApiKey(encryptedApiKey) {
  const parts = encryptedApiKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Rate Limiting**:
- 생성 요청: 사용자당 10 requests/hour
- 월간 생성 한도: 사용자당 100 generations/month
- Redis 카운터로 관리

**입력 검증**:
- 프롬프트: XSS 방지 (HTML 태그 strip)
- 이미지: MIME 타입 검증 (`image/jpeg`, `image/png`)
- 파일 크기: 최대 10MB

### 5.2 성능

**백그라운드 큐**:
```javascript
// server/queues/ai.queue.js

const Queue = require('bull');
const aiQueue = new Queue('ai-previsualization', process.env.REDIS_URL);

aiQueue.process(async (job) => {
  const { previzId, userId, sceneRenderPath, prompt, params } = job.data;

  try {
    // AI 이미지 생성
    const imageUrl = await aiService.generatePrevisualization({
      userId,
      sceneRenderPath,
      prompt,
      params
    });

    // DB 업데이트
    await Previsualization.findByIdAndUpdate(previzId, {
      status: 'completed',
      generatedImageUrl: imageUrl,
      'metadata.processingTime': Date.now() - job.timestamp
    });

    // WebSocket 알림
    io.to(userId).emit('previsualization-completed', { previzId, imageUrl });
  } catch (error) {
    await Previsualization.findByIdAndUpdate(previzId, {
      status: 'failed',
      errorMessage: error.message
    });
    throw error;
  }
});
```

**캐싱 전략**:
- 동일한 3D 씬 + 프롬프트 조합은 Redis에 캐시 (24시간 TTL)
- 캐시 키: `SHA256(sceneRenderUrl + prompt + params)`

**WebSocket 통합 (선택)**:
- Socket.IO로 실시간 상태 업데이트
- 클라이언트가 폴링 없이 완료 알림 수신

---

## 6. 파일 구조

```
server/
├── models/
│   ├── User.js              # (확장) aiApiKey 필드 추가
│   └── Previsualization.js  # (신규)
├── controllers/
│   └── ai.controller.js     # (신규)
├── services/
│   └── ai.service.js        # (신규) Nano Banana API 연동
├── routes/
│   └── ai.routes.js         # (신규)
├── middleware/
│   └── rateLimiter.js       # Rate limiting
├── utils/
│   └── encryption.js        # (신규) API 키 암호화
└── queues/
    └── ai.queue.js          # (신규) Bull Queue
```

---

## 7. 클라이언트 구현 가이드

### 7.1 3D 씬 캡처

```javascript
// client/src/lib/captureScene.js

export async function captureCurrentScene(gl, width = 1920, height = 1080) {
  // Three.js WebGLRenderer에서 현재 프레임 캡처
  const canvas = gl.domElement;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}
```

### 7.2 프리비주얼 생성 요청

```javascript
// client/src/lib/api/ai.js

export async function createPrevisualization({
  sceneRenderBlob,
  prompt,
  negativePrompt,
  projectId,
  params
}) {
  const formData = new FormData();
  formData.append('sceneRender', sceneRenderBlob, 'scene.png');
  formData.append('prompt', prompt);
  if (negativePrompt) formData.append('negativePrompt', negativePrompt);
  if (projectId) formData.append('projectId', projectId);
  if (params) formData.append('generationParams', JSON.stringify(params));

  const response = await fetch('/api/ai/previsualize', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  return response.json();
}
```

### 7.3 UI 컴포넌트

**`client/src/components/editor/PrevisualizationPanel.jsx`**:
- "Generate Previsualization" 버튼
- 프롬프트 입력 텍스트 영역
- 네거티브 프롬프트 (펼치기/접기)
- 파라미터 조정 슬라이더 (strength, steps 등)
- 생성 진행 상태 (Progress Bar)
- 히스토리: 과거 생성된 프리비주얼 썸네일 목록

---

## 8. 환경변수

```bash
# .env 추가 필요
ENCRYPTION_KEY=your-32-byte-hex-key         # API 키 암호화
REDIS_URL=redis://localhost:6379            # Bull Queue
GOOGLE_NANBANANA_API_URL=https://api.google-nanbanana.com/v1  # API 엔드포인트
AI_MAX_HOURLY_GENERATIONS=10                # 시간당 생성 한도
AI_MAX_MONTHLY_GENERATIONS=100              # 월간 생성 한도
```

---

## 9. 테스트 계획

### 9.1 단위 테스트
- API 키 암호화/복호화 테스트
- 프롬프트 검증 로직 테스트

### 9.2 통합 테스트
- Mock API로 프리비주얼 생성 플로우 테스트
- 에러 핸들링 (API 키 없음, 잘못된 이미지 등)

### 9.3 E2E 테스트
- 씬 캡처 → 생성 요청 → 상태 조회 → 결과 확인

---

## 10. 향후 확장 계획

### Phase 1 (MVP)
- 기본 프리비주얼 생성
- API 키 관리
- 히스토리 조회

### Phase 2
- 프롬프트 iterate 기능 (동일 씬, 다른 프롬프트)
- 프리비주얼 비교 뷰 (Before/After)

### Phase 3
- 프리셋 프롬프트 라이브러리 ("Cinematic", "Horror", "Romantic" 등)
- 프리비주얼을 스토리보드로 내보내기 (PDF)

### Phase 4
- 멀티 앵글 생성 (여러 카메라 각도를 한 번에 생성)
- 프로젝트 공유 시 프리비주얼도 함께 공유

---

이 API 설계는 LumoStage의 핵심 가치인 "영화/영상 제작 프리프로덕션 지원"을 AI 기술로 확장하여, 사용자가 3D 조명 씬을 실사 이미지로 변환하고 스토리보드에 활용할 수 있도록 합니다.

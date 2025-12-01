# LumoStage 프로젝트 종합 가이드

**작성일:** 2025-11-30
**버전:** 1.0
**대상:** 개발자, 교수진, 프로젝트 리뷰어

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 개념](#2-핵심-개념)
3. [기술 스택 상세](#3-기술-스택-상세)
4. [아키텍처 설계](#4-아키텍처-설계)
5. [주요 기능 구현](#5-주요-기능-구현)
6. [어려웠던 점과 해결](#6-어려웠던-점과-해결)
7. [핵심 코드 설명](#7-핵심-코드-설명)
8. [API 명세 요약](#8-api-명세-요약)
9. [보안 고려사항](#9-보안-고려사항)
10. [성능 최적화](#10-성능-최적화)
11. [테스트 전략](#11-테스트-전략)
12. [개발 단계 (Phase 1-7)](#12-개발-단계-phase-1-7)
13. [향후 계획](#13-향후-계획)
14. [자주 묻는 질문 (FAQ)](#14-자주-묻는-질문-faq)
15. [용어 사전](#15-용어-사전)

---

## 1. 프로젝트 개요

### 1.1. 무엇을 만들었는가?

**LumoStage**는 웹 브라우저에서 실행되는 실시간 3D 조명 시뮬레이션 플랫폼입니다. 영상 제작자, 촬영감독, 독립 영화 제작자들이 실제 촬영에 들어가기 전에 조명과 카메라 구도를 미리 실험하고 시각화할 수 있도록 돕습니다.

**주요 특징:**
- 웹 기반 (설치 불필요, 브라우저만 있으면 사용 가능)
- 실시간 3D 렌더링 (Three.js + React-Three-Fiber)
- 직관적인 UI/UX (초보자도 5분 내 학습 가능)
- 전문가용 워크플로우 (Cinema 4D 스타일 UI)
- 프로젝트 저장/공유 기능
- AI 프리비주얼라이제이션 (3D → 실사 변환)

### 1.2. 왜 만들었는가? (문제점과 해결책)

**현재의 문제점:**

1. **시간과 비용 낭비**: 실제 촬영 현장에서 조명을 설치하고 테스트하는 데 많은 시간과 인력이 소모됩니다.
2. **높은 진입 장벽**: Cinema 4D, Blender 같은 전문 3D 소프트웨어는 고가이면서도 학습 곡선이 가파릅니다.
3. **커뮤니케이션 어려움**: 팀원들끼리 조명 구도를 말이나 그림으로만 설명하기 어렵습니다.
4. **접근성 부족**: 독립 영화 제작자나 학생, 유튜버들은 전문 소프트웨어를 구매하거나 사용하기 어렵습니다.

**LumoStage의 해결책:**

1. **설치 불필요**: 웹 브라우저만 있으면 즉시 사용 가능
2. **실시간 시뮬레이션**: 조명과 카메라 구도를 실시간으로 확인하며 빠르게 실험
3. **직관적인 UI**: 초보자를 위한 8단계 튜토리얼과 단축키 시스템
4. **전문가용 기능**: Outliner, Properties Panel, Undo/Redo 등 프로급 워크플로우 제공
5. **협업 지원**: URL 공유만으로 팀원들과 프로젝트 공유

### 1.3. 누가 사용하는가?

**주요 타겟 사용자:**
- 영화/영상 전공 학생 (~50만 명)
- 독립 영화 제작자 및 촬영감독 (10만~25만 명)
- 영상 콘텐츠 크리에이터 (유튜버, 프리랜서)

**부가 타겟:**
- 조명 디자이너
- 무대 연출가
- 건축/인테리어 시각화 전문가

---

## 2. 핵심 개념

### 2.1. 3D 조명 시뮬레이션이란?

3D 조명 시뮬레이션은 컴퓨터 그래픽스 기술을 활용하여 가상의 3D 공간에서 조명의 위치, 색상, 강도, 각도 등을 조정하고 그 결과를 실시간으로 확인하는 과정입니다.

**실제 활용 사례:**
- **영화 제작**: 촬영 전 조명 디자인을 미리 테스트하여 현장 시간 절약
- **유튜브 콘텐츠**: 스튜디오 조명 세팅을 시뮬레이션하여 최적의 구도 찾기
- **교육**: 영상 제작 학생들이 조명 이론을 실습하며 학습

### 2.2. 웹 기반으로 구현한 이유

**장점:**
1. **접근성**: 설치 없이 브라우저만 있으면 어디서나 사용 가능
2. **협업**: URL 공유만으로 팀원들과 실시간 협업 (향후 WebSocket 도입 예정)
3. **크로스 플랫폼**: Windows, macOS, Linux 모두 동일하게 작동
4. **자동 업데이트**: 서버 배포만으로 모든 사용자가 최신 버전 사용

**단점:**
- 브라우저 WebGL 성능 한계 (데스크톱 앱 대비)
- 인터넷 연결 필요
- 대용량 파일 처리 시 속도 저하

### 2.3. 주요 기능 요약

| 기능 | 설명 | Phase |
|------|------|-------|
| 실시간 3D 렌더링 | Three.js 기반 고품질 3D 뷰포트 | Phase 1 |
| 조명 시스템 | Spot, Rect Area, Point, Directional Light 지원 | Phase 2 |
| 카메라 컨트롤 | Cinema 4D 스타일 카메라 동기화 | Phase 2 |
| Undo/Redo | 최대 50개 히스토리 관리 | Phase 2 |
| 프로젝트 관리 | 저장/불러오기, 썸네일 자동 생성 | Phase 3 |
| 튜토리얼 시스템 | 8단계 인터랙티브 온보딩 | Phase 4 |
| 파일 업로드 (R2) | HDRI, 3D 모델 업로드 (Cloudflare R2) | Phase 5 |
| Pro UI | Outliner, Properties Panel, Toolbar | Phase 6 |
| AI 프리비주얼 | 3D → 실사 변환 (Gemini 2.5 Flash) | Phase 7 |

---

## 3. 기술 스택 상세

### 3.1. Frontend

#### React 18 + Vite

**선택 이유:**
- **Vite**: 빠른 HMR(Hot Module Replacement)과 번들링 속도 (Webpack 대비 10배 빠름)
- **React 18**: Concurrent Rendering, Automatic Batching으로 성능 향상

**대안 비교:**
- **Next.js**: SSR이 필요 없는 SPA이므로 오버헤드
- **Vue**: React 생태계가 Three.js와 더 잘 통합됨

#### Zustand vs Redux/Context API

**Zustand 선택 이유:**

1. **가벼움**: 2KB (Redux는 ~10KB)
2. **선택적 구독**: 필요한 상태만 구독하여 불필요한 리렌더링 방지
   ```javascript
   // Redux: 전체 상태 구독 → lights 외 다른 상태 변경 시에도 리렌더링
   const lights = useSelector(state => state.lights);

   // Zustand: lights만 구독 → lights 변경 시에만 리렌더링
   const lights = useStore(state => state.lights);
   ```
3. **보일러플레이트 최소화**: Redux는 Actions, Reducers, Types 정의 필요 → Zustand는 직관적인 함수 호출
4. **TypeScript 타입 추론**: 별도 타입 정의 없이도 자동 타입 추론

**Context API와 비교:**
- Context API는 값 변경 시 모든 구독 컴포넌트가 리렌더링 → 3D Scene처럼 자주 업데이트되는 상태에는 부적합
- Zustand는 selector 기반 선택적 구독 지원

**단점:**
- Redux DevTools 통합이 Redux Toolkit보다 약함
- 미들웨어 생태계가 작음 (하지만 이 프로젝트 규모에서는 문제없음)

#### Three.js + React-Three-Fiber

**Three.js 선택 이유:**
- 업계 표준 WebGL 라이브러리
- 방대한 커뮤니티와 예제
- 성능 최적화 도구 (LOD, Instancing 등)

**React-Three-Fiber (R3F) 선택 이유:**
- Three.js 객체를 React 컴포넌트로 선언적으로 작성
- Zustand와 자연스럽게 통합
- React Hook으로 Three.js 생명주기 관리

**예시:**
```javascript
// 순수 Three.js (명령형)
const light = new THREE.SpotLight(0xffffff, 1);
light.position.set(0, 3, 0);
scene.add(light);

// React-Three-Fiber (선언형)
<spotLight position={[0, 3, 0]} intensity={1} color="#ffffff" />
```

#### Tailwind CSS + shadcn/ui

**Tailwind CSS 선택 이유:**
- Utility-first: 클래스 조합으로 빠른 스타일링
- 일관성: 디자인 시스템 구축 용이
- 번들 크기 최적화: PurgeCSS로 사용하지 않는 스타일 제거

**shadcn/ui 선택 이유:**
- Headless UI 라이브러리 (Radix UI 기반)
- 복사-붙여넣기 방식: 라이브러리 의존성 없이 코드 소유
- 접근성(A11y) 기본 지원: WCAG 2.1 AA 준수

### 3.2. Backend

#### Node.js + Express

**선택 이유:**
- JavaScript 풀스택: 프론트엔드와 동일한 언어
- 풍부한 생태계: Passport, Multer, Bull 등 검증된 라이브러리
- 비동기 I/O: AI 작업, 파일 업로드 등 I/O 바운드 작업에 적합

**대안 비교:**
- **Django/Flask (Python)**: AI 통합은 유리하지만 풀스택 개발 속도 저하
- **Spring Boot (Java)**: 오버엔지니어링, 스타트업에 부적합

#### MongoDB vs 관계형 DB

**MongoDB 선택 이유:**

1. **Document 기반**: Scene 데이터는 항상 전체를 한 번에 읽고 쓰는 패턴 → JSON 저장이 자연스러움
2. **스키마 유연성**: 조명 타입마다 다른 속성을 가지므로 유연한 스키마 필요
3. **쿼리 단순성**: `Project.find({ owner: userId })` 한 번에 전체 씬 조회

**관계형 DB였다면?**
- Lights, Mannequins, Camera를 각각 테이블로 분리
- JOIN 연산 필요 → 성능 저하
- 트랜잭션 복잡도 증가

**트레이드오프:**
- **단점**: 데이터 중복 가능 → `normalizeSceneData` 함수로 해결
- **장점**: 단일 쿼리로 전체 씬 로드/저장 가능

#### MVCS 패턴

**레이어 분리:**

```
Controller (HTTP) → Service (비즈니스 로직) → Model (DB 스키마)
```

**각 레이어의 책임:**

| 레이어 | 책임 | 예시 |
|--------|------|------|
| **Controller** | HTTP 요청/응답, 입력 검증 | `req.body` 파싱, 상태 코드 반환 |
| **Service** | 비즈니스 로직, 데이터 정규화 | `normalizeSceneData`, 중복 제거 |
| **Model** | Mongoose 스키마, DB 저장 | `Project.findById()`, `save()` |

**장점:**
- 테스트 용이: Service는 순수 함수로 작성 → HTTP 없이도 테스트 가능
- 재사용성: Service는 CLI, WebSocket 등 다른 컨텍스트에서도 사용 가능
- 유지보수성: 각 레이어의 책임이 명확하여 버그 추적 용이

#### Cloudflare R2 vs 로컬 스토리지

**R2 선택 이유:**

1. **대용량 파일**: HDRI (최대 50MB), GLTF (최대 100MB) 처리
2. **CDN 통합**: 전 세계 어디서나 빠른 파일 로드
3. **비용 효율**: S3 대비 Egress(다운로드) 비용 무료
4. **S3 호환 API**: `@aws-sdk/client-s3` 그대로 사용 가능

**로컬 스토리지 문제점:**
- 서버 디스크 용량 한계
- 백업/복구 복잡
- 확장성 부족 (다중 서버 환경에서 파일 동기화 어려움)

### 3.3. 인증 & 보안

#### Session vs JWT

**Session 선택 이유:**

1. **즉시 무효화 가능**: 로그아웃 시 서버에서 세션 삭제 → 토큰 즉시 만료
2. **보안성**: JWT는 탈취 시 만료 전까지 무효화 불가능
3. **민감 정보 관리**: AI API 키 같은 민감 정보는 서버에 저장 (JWT는 클라이언트에 저장)

**JWT의 장점 (사용하지 않은 이유):**
- Stateless: 서버 메모리 사용 없음 → **하지만 MongoDB Session Store 사용으로 해결**
- 확장성: 로드 밸런서 환경에 유리 → **현재는 단일 서버, 향후 Redis Session Store로 전환 예정**

**Session 구현:**
```javascript
// express-session + connect-mongo
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' }
}));
```

#### OAuth 통합 (Google/Naver)

**Passport.js 선택 이유:**
- 검증된 전략(Strategy) 패턴
- Google, Naver 등 다양한 제공자 지원
- Express와 자연스럽게 통합

**흐름:**
1. 사용자가 "Google 로그인" 클릭
2. `/api/auth/google` → Google OAuth 페이지로 리다이렉트
3. 사용자 승인 후 `/api/auth/google/callback` 호출
4. Passport가 Google 프로필 정보를 받아 User DB에 저장/업데이트
5. 세션 생성 → 쿠키 발급

#### CSRF 보호

**csurf 미들웨어 사용:**
- 모든 POST/PATCH/DELETE 요청에 CSRF 토큰 검증
- 토큰은 클라이언트가 `/api/csrf-token` 엔드포인트로 받아서 헤더에 포함

#### API 키 암호화 (AES-256-GCM)

**AI API 키 보호:**
```javascript
// 암호화
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);

// 복호화
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
```

- **GCM 모드**: 인증 태그로 무결성 검증
- **키 관리**: `ENCRYPTION_KEY` 환경변수로 관리 (32바이트)

### 3.4. AI 통합

#### Gemini 2.5 Flash 선택 이유

1. **이미지 생성 특화**: Stable Diffusion 대비 조명/구도 유지 능력 우수
2. **빠른 속도**: 평균 5~10초 생성 시간
3. **무료 티어**: 개발/테스트 단계에서 비용 절감

#### Bull Queue 비동기 작업 처리

**문제점:**
- Gemini API 요청은 5~10초 소요 → HTTP 요청으로 처리 시 타임아웃

**해결책: Queue 시스템**

1. 클라이언트가 `/api/ai/generate` POST → 즉시 Job ID 반환
2. Bull Worker가 백그라운드에서 Job 처리
3. 클라이언트는 `/api/ai/status/:jobId` GET으로 폴링
4. 완료되면 결과물 URL 반환

**Bull 선택 이유:**
- Redis 기반 (빠르고 안정적)
- Job 재시도, 우선순위, 동시성 제어 지원
- Dashboard로 Queue 모니터링 가능

#### Rate Limiting

**목적:** API 남용 방지, 비용 통제

**구현:**
```javascript
// express-rate-limit
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10, // 최대 10회
  message: '시간당 요청 횟수를 초과했습니다.'
});

app.use('/api/ai/generate', limiter);
```

---

## 4. 아키텍처 설계

### 4.1. 데이터 흐름

#### 단방향 데이터 흐름 vs 양방향 바인딩

**단방향 데이터 흐름 (LumoStage 채택):**

```
[UI 이벤트] → [Zustand 액션] → [Store 업데이트] → [Scene 리렌더링]
```

**장점:**
- 예측 가능: 데이터 흐름이 항상 한 방향
- 디버깅 용이: Redux DevTools로 모든 상태 변경 추적 가능
- 테스트 용이: 순수 함수로 액션 작성

**양방향 바인딩 (Vue v-model 같은):**
- 편리하지만 데이터 흐름 추적 어려움
- 3D Scene처럼 복잡한 상태에서는 디버깅 지옥

#### UI → Zustand → Scene 업데이트 흐름

**예시: 조명 밝기 조절**

1. **사용자 입력**: `LightCard.jsx`에서 Intensity 슬라이더 변경
2. **액션 호출**:
   ```javascript
   const updateLight = useStore(state => state.updateLight);
   updateLight(lightId, 'intensity', newValue);
   ```
3. **Store 업데이트**:
   ```javascript
   // editorStore.js
   updateLight: (id, key, value) => set(state => ({
     lights: state.lights.map(light =>
       light.id === id ? { ...light, [key]: value } : light
     )
   })),
   ```
4. **Scene 리렌더링**:
   ```javascript
   // Scene.jsx
   const lights = useStore(state => state.lights);
   return lights.map(light => <spotLight key={light.id} {...light} />);
   ```

#### 서버 동기화 메커니즘

**저장 흐름:**

```
[Save 버튼] → [editorStore.getSceneData()] → [projectStore.updateProject()]
  → [API: PATCH /api/projects/:id] → [Controller] → [Service: normalizeSceneData]
  → [Model: Project.save()] → [MongoDB]
```

**불러오기 흐름:**

```
[프로젝트 클릭] → [API: GET /api/projects/:id] → [Controller] → [Service]
  → [Model: Project.findById()] → [MongoDB] → [Response: sceneData]
  → [editorStore.loadSceneData(sceneData)] → [Scene 복원]
```

### 4.2. 상태 관리 (Zustand)

#### Store 구조

**editorStore.js** (장면 편집 상태):
```javascript
{
  // 장면 객체
  lights: Array<Light>,
  diffusers: Array<Diffuser>,
  mannequins: Array<Mannequin>,
  objects: Array<Object>,

  // 카메라 & 뷰포트
  cameraState: { position, target, focalLength },
  orbitControlState: { cameraPosition, target, zoom },
  aspectRatio: "16:9",

  // 배경 설정
  backgroundSettings: {
    type: 'color' | 'hdri' | 'none',
    color, hdriUrl, hdriIntensity,
    showGround, groundColor, groundReflectivity
  },

  // UI 상태
  selectedLight: string | null,
  selectedDiffuser: string | null,
  selectedObjectId: string | null,
  transformMode: 'translate' | 'rotate' | 'scale',
  viewMode: 'free' | 'camera',

  // 액션
  addLight, updateLight, removeLight,
  addDiffuser, updateDiffuser, removeDiffuser,
  updateMannequinPose,
  setCameraState, setOrbitControlState,
  updateBackgroundSettings,
  // ...
}
```

**projectStore.js** (프로젝트 관리):
```javascript
{
  projects: Array<Project>,
  currentProject: Project | null,
  isLoading: boolean,
  error: string | null,

  // 액션
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
  // ...
}
```

#### 선택적 구독 (Selective Subscription)

**문제점:**
- 전체 상태를 구독하면 조명 하나만 변경되어도 모든 컴포넌트가 리렌더링

**해결책: Selector 사용**

```javascript
// ❌ 나쁜 예: 전체 상태 구독 → lights 외 다른 상태 변경 시에도 리렌더링
const state = useStore();
const lights = state.lights;

// ✅ 좋은 예: lights만 구독 → lights 변경 시에만 리렌더링
const lights = useStore(state => state.lights);
```

**개별 조명 구독 (더 최적화):**

```javascript
// Scene.jsx에서 각 조명 컴포넌트가 자신의 상태만 구독
function LightComponent({ lightId }) {
  const light = useStore(state =>
    state.lights.find(l => l.id === lightId)
  );
  // 이 조명의 속성만 변경되면 리렌더링
  return <spotLight {...light} />;
}
```

#### 히스토리 (Undo/Redo) 구현

**Zustand Temporal Middleware 사용:**

```javascript
import { temporal } from 'zundo';

const useStore = create(
  temporal(
    (set) => ({
      // ... 상태
    }),
    {
      limit: 50, // 최대 50개 스냅샷
      equality: (a, b) => a === b, // 깊은 비교
    }
  )
);

// Undo/Redo 사용
const { undo, redo } = useStore.temporal.getState();
```

**최적화: Transform 종료 시점에만 히스토리 저장**

```javascript
// TransformControls.jsx
<TransformControls
  onMouseUp={() => {
    // Transform 종료 시에만 히스토리에 저장
    useStore.temporal.getState().pause = false;
  }}
  onMouseDown={() => {
    // Transform 중에는 히스토리 저장 안 함
    useStore.temporal.getState().pause = true;
  }}
/>
```

### 4.3. 백엔드 MVCS

#### Controller: HTTP 계층

**책임:**
- HTTP 요청 파싱 (`req.body`, `req.params`)
- 입력 검증 (express-validator)
- 인증 확인 (`req.user`)
- HTTP 응답 전송 (`res.json`, `res.status`)

**예시: project.controller.js**

```javascript
exports.updateProject = async (req, res) => {
  // 1. 입력 검증
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. 인증 확인
  const userId = req.user._id;

  // 3. Service 호출
  const updatedProject = await projectService.updateProject(
    req.params.id,
    userId,
    req.body
  );

  // 4. HTTP 응답
  res.json({ message: '저장되었습니다.', project: updatedProject });
};
```

#### Service: 비즈니스 로직

**책임:**
- 데이터 정규화 (`normalizeSceneData`)
- 비즈니스 규칙 적용
- Model과 상호작용
- 순수 함수 (HTTP 모름)

**예시: scene.service.js**

```javascript
exports.normalizeSceneData = (sceneData) => {
  const dirtyRef = { dirty: false };

  // 조명 정규화
  const lights = Array.isArray(sceneData.lights)
    ? sceneData.lights
        .filter(light => light && typeof light === 'object')
        .map(light => normalizeLight(light, dirtyRef))
    : createDefaultLights();

  // 카메라 정규화
  const cameraState = normalizeCameraState(sceneData.cameraState, dirtyRef);

  // ... 기타 정규화

  return { lights, cameraState, /* ... */ };
};
```

#### Model: 데이터 스키마

**책임:**
- Mongoose 스키마 정의
- Validation 규칙
- 가상 필드, 인덱스

**예시: Project.js**

```javascript
const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sceneData: { type: Object, required: true, default: {} },
  thumbnail: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
```

### 4.4. 데이터베이스 설계

#### User, Project, Asset 모델

**User 모델:**
```javascript
{
  username: String,
  email: String (unique),
  password: String (bcrypt),
  googleId: String (unique, sparse),
  naverId: String (unique, sparse),
  oauthProvider: 'local' | 'google' | 'naver',
  aiApiKey: String (암호화, select: false),
  aiUsageStats: { totalGenerations, lastGeneratedAt, ... }
}
```

**Project 모델:**
```javascript
{
  name: String,
  description: String,
  owner: ObjectId → User,
  sceneData: {
    schemaVersion: Number,
    aspectRatio: String,
    lights: Array<Light>,
    diffusers: Array<Diffuser>,
    mannequins: Array<Mannequin>,
    objects: Array<Object>,
    cameraState: Object,
    orbitControlState: Object,
    backgroundSettings: Object
  },
  thumbnail: String,
  createdAt, updatedAt
}
```

**Asset 모델:**
```javascript
{
  owner: ObjectId → User,
  projectId: ObjectId → Project,
  type: 'hdri' | 'gltf' | 'image',
  fileName, fileKey, fileUrl,
  fileSize, mimeType,
  metadata: { width, height, compression },
  storageProvider: 'r2',
  uploadedAt, updatedAt
}
```

#### 관계 설계 (단방향 참조)

**Project → User (owner 필드)**
- User 모델에는 projects 배열 없음
- 프로젝트 조회: `Project.find({ owner: userId })`

**장점:**
- 데이터 일관성 유지 (프로젝트 삭제 시 User 업데이트 불필요)
- 쿼리 단순화

**단점:**
- User에서 프로젝트 목록 조회 시 역참조 필요 (하지만 MongoDB 인덱스로 빠름)

#### Scene 데이터 JSON 저장 방식

**왜 JSON으로 저장하는가?**

1. **항상 전체를 읽고 씀**: 조명 하나만 수정해도 전체 씬을 저장
2. **트랜잭션 단순화**: 하나의 Document 업데이트로 끝
3. **쿼리 성능**: 단일 `findById` 쿼리로 전체 씬 로드

**정규화가 필요한 이유:**

프론트엔드에서 올라오는 데이터가 오염될 수 있음:
- 조명 ID 중복
- null/undefined 값
- 잘못된 타입 (예: intensity가 문자열)

**normalizeSceneData 함수가 해결:**
```javascript
// 중복 ID 제거
const seenIds = new Set();
const uniqueLights = lights.filter(light => {
  if (seenIds.has(light.id)) return false;
  seenIds.add(light.id);
  return true;
});

// 기본값 설정
const normalizedLight = {
  id: light.id || nanoid(),
  type: light.type || 'spot',
  intensity: typeof light.intensity === 'number' ? light.intensity : 10,
  // ...
};
```

---

## 5. 주요 기능 구현

### 5.1. 3D Scene 렌더링

#### Three.js 기본 설정

**Scene.jsx 구조:**

```javascript
<Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
  {/* 환경 설정 */}
  <Background /> {/* HDRI 또는 단색 배경 */}
  <Environment preset="sunset" /> {/* 환경광 */}

  {/* 조명 */}
  {lights.map(light => (
    <LightComponent key={light.id} light={light} />
  ))}

  {/* 객체 */}
  <Mannequin />
  <GroundPlane />
  {objects.map(obj => <SceneObject key={obj.id} object={obj} />)}

  {/* 컨트롤 */}
  <OrbitControls />
  <TransformControls />
</Canvas>
```

#### 조명 타입

**1. Spot Light (스포트라이트)**
- 무대 조명처럼 원뿔 형태로 빛 발산
- 속성: `angle` (각도), `penumbra` (가장자리 부드러움), `distance`, `decay`

**2. Rect Area Light (면적 조명)**
- 창문, 소프트박스 같은 면광원
- 속성: `width`, `height`
- **주의**: 그림자 미지원 (Three.js 한계)

**3. Point Light (점 조명)**
- 전구처럼 모든 방향으로 빛 발산
- 속성: `distance`, `decay`

**4. Directional Light (방향 조명)**
- 태양처럼 평행광
- 속성: `target` (빛이 향하는 방향)

#### 마네킹 모델과 관절 제어

**GLTF 모델 로드:**

```javascript
import { useGLTF } from '@react-three/drei';

function Mannequin({ pose, position }) {
  const { scene, nodes } = useGLTF('/models/mannequin.glb');

  // 포즈 적용
  useEffect(() => {
    Object.entries(pose).forEach(([boneName, rotation]) => {
      const bone = nodes[boneName];
      if (bone) {
        bone.rotation.set(rotation.x, rotation.y, rotation.z);
      }
    });
  }, [pose, nodes]);

  return <primitive object={scene} position={position} />;
}
```

**포즈 데이터 구조:**

```javascript
{
  "head_02": { x: 0, y: 0.2, z: 0 },
  "l_shoulder_03": { x: -1.57, y: 0, z: -1.57 },
  "r_shoulder_06": { x: -1.57, y: 0, z: 1.57 },
  // ... 총 13개 관절
}
```

#### 카메라 컨트롤 (OrbitControls)

**양방향 동기화 (Cinema 4D 스타일):**

1. **Orbit → Camera**: OrbitControls로 탐색 후 "Set Camera to View" 버튼
   ```javascript
   const setCameraToView = () => {
     const { position, target } = orbitControlsRef.current;
     updateCameraState({
       position: position.toArray(),
       target: target.toArray()
     });
   };
   ```

2. **Camera → Orbit**: 저장된 카메라 뷰로 복원 "View from Camera" 버튼
   ```javascript
   const viewFromCamera = () => {
     orbitControlsRef.current.object.position.set(...cameraState.position);
     orbitControlsRef.current.target.set(...cameraState.target);
   };
   ```

### 5.2. 조명 시스템

#### 조명 추가/삭제/수정

**추가:**
```javascript
const addLight = (type) => {
  const newLight = buildSpotLight({ type, name: `${type} Light` });
  set(state => ({ lights: [...state.lights, newLight] }));
};
```

**삭제:**
```javascript
const removeLight = (id) => {
  set(state => ({
    lights: state.lights.filter(light => light.id !== id),
    selectedLight: state.selectedLight === id ? null : state.selectedLight
  }));
};
```

**수정:**
```javascript
const updateLight = (id, key, value) => {
  set(state => ({
    lights: state.lights.map(light =>
      light.id === id ? { ...light, [key]: value } : light
    )
  }));
};
```

#### Transform 모드

**W: 이동, E: 회전, R: 스케일**

```javascript
<TransformControls
  object={selectedObject}
  mode={transformMode} // 'translate' | 'rotate' | 'scale'
  onObjectChange={(e) => {
    const { position, rotation, scale } = e.target.object;
    updateLight(selectedLight, 'position', position.toArray());
  }}
/>
```

**단축키 바인딩:**
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'w') setTransformMode('translate');
    if (e.key === 'e') setTransformMode('rotate');
    if (e.key === 'r') setTransformMode('scale');
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### 그림자 설정

**Three.js 그림자 활성화:**

```javascript
// Canvas 레벨
<Canvas shadows>

// 조명
<spotLight castShadow shadow-mapSize={[2048, 2048]} />

// 객체
<mesh castShadow receiveShadow>
  <boxGeometry />
  <meshStandardMaterial />
</mesh>
```

**성능 최적화:**
- Shadow Map Size: 512 (낮음) ~ 2048 (높음)
- Shadow Bias: 그림자 아티팩트 방지

#### 실시간 프리뷰

**React-Three-Fiber의 자동 렌더링:**
- 상태 변경 시 자동으로 Scene 렌더링
- `useFrame` 훅으로 60fps 유지

```javascript
useFrame((state, delta) => {
  // 매 프레임마다 실행 (60fps)
  // 예: 애니메이션, 카메라 이동
});
```

### 5.3. 카메라 시스템

#### Cinema 4D 스타일 카메라

**주요 기능:**

1. **Free View Mode**: OrbitControls로 자유롭게 탐색
2. **Camera View Mode**: 저장된 카메라 시점으로 고정
3. **Set Camera to View**: 현재 Orbit 위치를 카메라로 저장
4. **View from Camera**: 카메라 위치로 Orbit 이동

#### OrbitControls 양방향 동기화

**문제점:**
- OrbitControls는 내부적으로 카메라를 움직임
- Zustand 상태와 동기화 어려움

**해결책:**

```javascript
// OrbitControls 변경 → Zustand 업데이트
<OrbitControls
  ref={orbitControlsRef}
  onChange={() => {
    const { position, target } = orbitControlsRef.current.object;
    setOrbitControlState({
      cameraPosition: position.toArray(),
      target: orbitControlsRef.current.target.toArray(),
      zoom: orbitControlsRef.current.object.zoom
    });
  }}
/>
```

#### 카메라 뷰 저장/복원

**저장:**
```javascript
const saveCameraView = () => {
  const { position, target } = orbitControlsRef.current;
  updateCameraState({
    position: position.toArray(),
    target: target.toArray(),
    focalLength: calculateFocalLength(camera.fov)
  });
};
```

**복원:**
```javascript
const restoreCameraView = () => {
  const { position, target } = cameraState;
  orbitControlsRef.current.object.position.set(...position);
  orbitControlsRef.current.target.set(...target);
  orbitControlsRef.current.update();
};
```

#### FOV(시야각) 조절

**FOV ↔ 초점거리 변환:**

```javascript
// FOV → 초점거리 (mm)
const focalLength = (35 / (2 * Math.tan((fov * Math.PI) / 360))) * 36;

// 초점거리 → FOV
const fov = 2 * Math.atan(36 / (2 * focalLength)) * (180 / Math.PI);
```

**UI:**
```javascript
<Slider
  value={cameraState.focalLength}
  min={15} max={200}
  onChange={(focalLength) => {
    const fov = focalLengthToFOV(focalLength);
    updateCameraState({ focalLength, fov });
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }}
/>
```

### 5.4. 프로젝트 관리

#### 프로젝트 생성/저장/불러오기

**생성:**
```javascript
const createProject = async (name, description) => {
  const sceneData = editorStore.getSceneData(); // 현재 씬 스냅샷
  const response = await api.post('/api/projects', {
    name,
    description,
    sceneData
  });
  return response.data.project;
};
```

**저장:**
```javascript
const saveProject = async (projectId) => {
  const sceneData = editorStore.getSceneData();
  const response = await api.patch(`/api/projects/${projectId}`, {
    sceneData
  });
  toast.success('저장되었습니다.');
};
```

**불러오기:**
```javascript
const loadProject = async (projectId) => {
  const response = await api.get(`/api/projects/${projectId}`);
  const { sceneData } = response.data.project;
  editorStore.loadSceneData(sceneData); // 씬 복원
};
```

#### 썸네일 자동 생성

**Canvas API 활용:**

```javascript
const generateThumbnail = () => {
  const canvas = gl.domElement; // Three.js 캔버스
  return canvas.toDataURL('image/png');
};

// 저장 시 썸네일 포함
const saveWithThumbnail = async () => {
  const thumbnail = generateThumbnail();
  await api.patch(`/api/projects/${projectId}`, {
    sceneData,
    thumbnail
  });
};
```

#### Scene 데이터 직렬화/역직렬화

**직렬화 (getSceneData):**

```javascript
const getSceneData = () => ({
  schemaVersion: 2,
  aspectRatio: state.aspectRatio,
  lights: state.lights,
  diffusers: state.diffusers,
  mannequins: state.mannequins,
  objects: state.objects,
  cameraState: state.cameraState,
  orbitControlState: state.orbitControlState,
  backgroundSettings: state.backgroundSettings
});
```

**역직렬화 (loadSceneData):**

```javascript
const loadSceneData = (sceneData) => {
  set({
    lights: sceneData.lights || createDefaultLights(),
    diffusers: sceneData.diffusers || [],
    mannequins: sceneData.mannequins || [createDefaultMannequin()],
    objects: sceneData.objects || [],
    cameraState: sceneData.cameraState || DEFAULT_CAMERA_STATE,
    orbitControlState: sceneData.orbitControlState || DEFAULT_ORBIT_STATE,
    backgroundSettings: sceneData.backgroundSettings || DEFAULT_BACKGROUND,
    aspectRatio: sceneData.aspectRatio || '16:9'
  });
};
```

#### 버전 관리

**schemaVersion으로 마이그레이션:**

```javascript
const loadSceneData = (sceneData) => {
  if (sceneData.schemaVersion === 1) {
    // V1 → V2 마이그레이션
    sceneData = migrateV1ToV2(sceneData);
  }
  // 최신 버전 로드
  set({ ...sceneData });
};
```

### 5.5. 파일 업로드 (R2)

#### HDRI 배경 이미지 업로드

**클라이언트:**

```javascript
const uploadHDRI = async (file, projectId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);

  const response = await api.post('/api/assets/upload-hdri', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.asset.fileUrl;
};
```

**서버 (asset.controller.js):**

```javascript
exports.uploadHDRI = async (req, res) => {
  const file = req.file; // Multer
  const { projectId } = req.body;

  // 1. 파일 검증
  if (!file.originalname.match(/\.(hdr|exr)$/)) {
    return res.status(400).json({ message: '지원하지 않는 형식입니다.' });
  }
  if (file.size > 50 * 1024 * 1024) {
    return res.status(400).json({ message: '파일 크기는 50MB 이하여야 합니다.' });
  }

  // 2. R2 업로드
  const fileUrl = await storageService.uploadToR2(
    file.buffer,
    `hdri/${req.user._id}/${projectId}/${file.originalname}`
  );

  // 3. Asset 모델 저장
  const asset = await Asset.create({
    owner: req.user._id,
    projectId,
    type: 'hdri',
    fileUrl,
    fileSize: file.size,
    // ...
  });

  res.json({ message: '업로드 완료', asset });
};
```

#### 3D 모델 업로드

**GLB 파일만 지원 (Binary GLTF):**

- 텍스처 포함 단일 파일
- 파일 크기 최적화
- 로딩 속도 향상

**Draco 압축 권장:**
```javascript
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
```

#### Presigned URL 방식

**현재:** 공개 URL 직접 반환

**향후 개선:** Presigned URL로 보안 강화

```javascript
// R2 Presigned URL 생성 (S3 API)
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const url = await getSignedUrl(
  s3Client,
  new GetObjectCommand({ Bucket, Key }),
  { expiresIn: 3600 } // 1시간
);
```

#### Cascade 삭제

**프로젝트 삭제 시 연결된 에셋도 삭제:**

```javascript
exports.deleteProject = async (projectId, userId) => {
  // 1. 프로젝트 삭제
  await Project.findByIdAndDelete(projectId);

  // 2. 연결된 에셋 조회
  const assets = await Asset.find({ projectId });

  // 3. R2에서 파일 삭제
  for (const asset of assets) {
    await storageService.deleteFromR2(asset.fileKey);
  }

  // 4. Asset 모델 삭제
  await Asset.deleteMany({ projectId });
};
```

### 5.6. AI 프리비주얼라이제이션

#### 3D → 실사 변환

**워크플로우:**

1. **3D Scene 렌더링**: Canvas API로 현재 씬을 PNG로 캡처
2. **프롬프트 생성**: 조명 정보를 텍스트로 변환
   ```javascript
   const prompt = `
   A cinematic portrait with the following lighting setup:
   - Key Light: White spotlight at position (5, 7, 5) with intensity 15
   - Fill Light: White spotlight at position (-5, 4, 5) with intensity 5
   - Back Light: White spotlight at position (0, 5, -8) with intensity 8
   Professional photography, studio lighting, high quality
   `;
   ```
3. **Gemini API 호출**: 이미지 + 프롬프트 전송
4. **실사 이미지 생성**: Gemini가 조명/구도 유지하며 실사 렌더링

#### Gemini API 통합

**geminiImage.service.js:**

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generateImage = async (apiKey, imageBuffer, prompt) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/png'
      }
    },
    { text: prompt }
  ]);

  return result.response.text(); // 생성된 이미지 URL
};
```

#### Queue 기반 비동기 처리

**Bull Queue 설정:**

```javascript
const Queue = require('bull');
const aiQueue = new Queue('ai-generation', process.env.REDIS_URL);

// Job 추가
const jobId = await aiQueue.add({
  userId,
  projectId,
  sceneImageUrl,
  prompt
});

// Worker 설정
aiQueue.process(async (job) => {
  const { userId, sceneImageUrl, prompt } = job.data;

  // 1. 사용자 API 키 조회 (복호화)
  const apiKey = await getUserApiKey(userId);

  // 2. Gemini API 호출
  const imageUrl = await geminiService.generateImage(apiKey, sceneImageUrl, prompt);

  // 3. R2에 업로드
  const uploadedUrl = await storageService.uploadToR2(imageBuffer, `ai/${userId}/${Date.now()}.png`);

  return { imageUrl: uploadedUrl };
});
```

#### 진행 상황 폴링

**클라이언트:**

```javascript
const generatePrevis = async () => {
  // 1. Job 생성
  const { jobId } = await api.post('/api/ai/generate', { projectId, prompt });

  // 2. 폴링
  const interval = setInterval(async () => {
    const { status, result } = await api.get(`/api/ai/status/${jobId}`);

    if (status === 'completed') {
      clearInterval(interval);
      setGeneratedImageUrl(result.imageUrl);
      toast.success('생성 완료!');
    } else if (status === 'failed') {
      clearInterval(interval);
      toast.error('생성 실패');
    }
  }, 2000); // 2초마다 폴링
};
```

### 5.7. Undo/Redo

#### 히스토리 스택 구현

**Zustand Temporal Middleware:**

```javascript
import { temporal } from 'zundo';

const useStore = create(
  temporal(
    (set, get) => ({
      lights: [],
      // ... 상태
    }),
    {
      limit: 50, // 최대 50개
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b) // 깊은 비교
    }
  )
);
```

#### 최대 50개 스냅샷

**메모리 관리:**
- 50개 초과 시 가장 오래된 것 삭제 (FIFO)
- 평균 스냅샷 크기: ~10KB
- 총 메모리: ~500KB (무시 가능)

#### Deep Copy 최적화

**문제점:**
- `JSON.parse(JSON.stringify(state))`는 느림 (큰 객체의 경우)

**해결책: 구조적 공유 (Structural Sharing)**

```javascript
// ❌ 전체 복사
const newState = JSON.parse(JSON.stringify(state));

// ✅ 변경된 부분만 복사
const newState = {
  ...state,
  lights: state.lights.map(light =>
    light.id === id ? { ...light, intensity: newValue } : light
  )
};
```

#### Transform 종료 시점에만 저장

**최적화:**

```javascript
<TransformControls
  onMouseDown={() => {
    // Transform 시작 → 히스토리 일시 정지
    useStore.temporal.getState().pause();
  }}
  onMouseUp={() => {
    // Transform 종료 → 히스토리 재개 및 저장
    useStore.temporal.getState().resume();
  }}
/>
```

**효과:**
- Transform 중 수십 번의 상태 변경이 히스토리에 저장되지 않음
- 메모리 사용량 대폭 감소
- Undo/Redo 사용성 향상 (불필요한 중간 상태 제거)

---

## 6. 어려웠던 점과 해결

### 6.1. OrbitControls 동기화

**문제점:**

Three.js의 OrbitControls는 자체적으로 카메라를 움직이기 때문에 Zustand 상태와 동기화하기 어려웠습니다. 특히 다음 두 가지 시나리오가 까다로웠습니다:

1. OrbitControls로 탐색한 시점을 카메라 뷰로 설정
2. 저장된 카메라 뷰로 OrbitControls 이동

**해결책: Cinema 4D 패턴 적용**

Cinema 4D는 "Viewport Camera"와 "Render Camera"를 분리합니다. LumoStage도 동일한 패턴을 적용했습니다:

- **OrbitControls State**: 현재 Viewport 카메라 위치 (`orbitControlState`)
- **Camera State**: 렌더링용 카메라 위치 (`cameraState`)

**구현:**

```javascript
// 1. Orbit → Camera: "Set Camera to View" 버튼
const setCameraToView = () => {
  const position = orbitControlsRef.current.object.position.toArray();
  const target = orbitControlsRef.current.target.toArray();

  updateCameraState({ position, target });
  toast.info('현재 시점이 카메라로 저장되었습니다.');
};

// 2. Camera → Orbit: "View from Camera" 버튼
const viewFromCamera = () => {
  const { position, target } = cameraState;

  orbitControlsRef.current.object.position.set(...position);
  orbitControlsRef.current.target.set(...target);
  orbitControlsRef.current.update();
};
```

**교훈:**
- 라이브러리의 내부 동작을 이해하고 그에 맞는 패턴 적용 중요
- Cinema 4D 같은 검증된 UX 패턴을 참고하면 좋은 해결책을 찾을 수 있음

### 6.2. Zustand Store 비대화

**문제점:**

초기에는 모든 기능을 `store.js` 한 파일에 넣다 보니 **8000줄 이상**으로 비대해졌습니다. 파일을 열 때마다 VSCode가 느려지고, 특정 함수를 찾기 어려웠습니다.

**원인: 순환 참조 문제**

Store를 분리하려고 했더니 순환 참조 문제 발생:

```javascript
// lightsStore.js
import { useHistoryStore } from './historyStore';

export const useLightsStore = create((set) => ({
  lights: [],
  addLight: (light) => {
    set(state => ({ lights: [...state.lights, light] }));
    useHistoryStore.getState().saveSnapshot(); // ❌ 순환 참조
  }
}));

// historyStore.js
import { useLightsStore } from './lightsStore';

export const useHistoryStore = create((set) => ({
  history: [],
  saveSnapshot: () => {
    const lights = useLightsStore.getState().lights; // ❌ 순환 참조
    set(state => ({ history: [...state.history, { lights }] }));
  }
}));
```

**해결 계획: Slice 패턴 + 의존성 주입**

Zustand 공식 문서의 Slice 패턴 사용:

```javascript
// slices/lightsSlice.js
export const createLightsSlice = (set, get) => ({
  lights: [],
  addLight: (light) => set(state => ({
    lights: [...state.lights, light]
  })),
  // ...
});

// slices/historySlice.js
export const createHistorySlice = (set, get) => ({
  history: [],
  saveSnapshot: () => {
    const snapshot = get(); // 전체 상태 접근
    set(state => ({ history: [...state.history, snapshot] }));
  },
  // ...
});

// store/index.js
import { create } from 'zustand';
import { createLightsSlice } from './slices/lightsSlice';
import { createHistorySlice } from './slices/historySlice';

export const useStore = create((set, get) => ({
  ...createLightsSlice(set, get),
  ...createHistorySlice(set, get)
}));
```

**아직 적용 안 함 (Phase 8 계획):**
- 현재는 8000줄 파일이지만 동작은 정상
- 리팩토링 시 기존 기능 손상 위험 → E2E 테스트 먼저 구축 예정

**교훈:**
- 초기 설계가 얼마나 중요한지 뼈저리게 느낌
- 테스트 코드 없이 리팩토링하는 건 자살 행위

### 6.3. Scene 데이터 정규화

**문제점:**

프로젝트를 저장하고 불러올 때 다음 버그들이 발생했습니다:

1. **조명 ID 중복**: 동일한 조명이 2개로 복제됨
2. **undefined 값**: `light.intensity === undefined` → Scene 렌더링 실패
3. **타입 오염**: `intensity: "10"` (문자열) → Three.js 오류
4. **null 값**: `lights: [null, {...}, null]` → 렌더링 오류

**원인:**

프론트엔드에서 올라오는 데이터가 신뢰할 수 없었습니다. 특히 다음 상황에서 문제 발생:

- Undo/Redo 중 상태 오염
- 브라우저 새로고침 시 localStorage 복원 실패
- 버전 업그레이드 시 이전 프로젝트 데이터 호환성 문제

**해결책: normalizeSceneData 함수**

서버의 `scene.service.js`에서 모든 데이터를 검증하고 정리:

```javascript
const normalizeSceneData = (sceneData) => {
  const dirtyRef = { dirty: false }; // 데이터 오염 추적

  // 1. null/undefined 필터링
  const lights = Array.isArray(sceneData.lights)
    ? sceneData.lights.filter(light => light && typeof light === 'object')
    : createDefaultLights();

  // 2. 중복 ID 체크
  const seenIds = new Set();
  const uniqueLights = lights.filter(light => {
    if (seenIds.has(light.id)) {
      dirtyRef.dirty = true;
      return false;
    }
    seenIds.add(light.id);
    return true;
  });

  // 3. 각 조명 정규화
  const normalizedLights = uniqueLights.map(light => normalizeLight(light, dirtyRef));

  // 4. 로그 기록
  if (dirtyRef.dirty) {
    console.warn('Scene 데이터가 정규화되었습니다.');
  }

  return { lights: normalizedLights, /* ... */ };
};

const normalizeLight = (light, dirtyRef) => {
  const normalized = {
    id: light.id || nanoid(),
    type: ['spot', 'rect', 'point', 'directional'].includes(light.type)
      ? light.type
      : 'spot',
    intensity: typeof light.intensity === 'number'
      ? Math.max(0, Math.min(light.intensity, 100))
      : 10,
    color: typeof light.color === 'string' ? light.color : '#ffffff',
    position: ensureVector3(light.position, [0, 3, 0]),
    // ...
  };

  // 변경 사항 추적
  if (JSON.stringify(normalized) !== JSON.stringify(light)) {
    dirtyRef.dirty = true;
  }

  return normalized;
};
```

**효과:**
- 데이터 품질 보장 → 렌더링 버그 거의 사라짐
- 버전 마이그레이션 안전성 향상
- 디버깅 시간 대폭 단축

**교훈:**
- 클라이언트 데이터를 절대 신뢰하지 말 것
- 서버에서 철저한 검증 필수

### 6.4. 대용량 파일 업로드

**문제점:**

HDRI 파일은 최대 50MB, 3D 모델은 100MB까지 되는데 로컬 서버로는 감당이 안 됐습니다:

1. **서버 디스크 용량 부족**: 여러 사용자가 파일 업로드 시 서버 디스크 풀
2. **느린 로딩 속도**: 서버에서 파일 직접 제공 → CDN 없어서 느림
3. **백업 복잡**: 서버 장애 시 파일 손실 위험

**해결책: Cloudflare R2 클라우드 스토리지**

**R2 선택 이유:**

1. **S3 호환 API**: 기존 S3 SDK 그대로 사용 가능
2. **무료 Egress**: S3는 다운로드마다 과금, R2는 다운로드 무료
3. **CDN 통합**: Cloudflare CDN 자동 연동 → 빠른 로딩

**구현:**

```javascript
// storage.service.js
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

exports.uploadToR2 = async (buffer, key) => {
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'application/octet-stream'
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
};
```

**Cascade 삭제 구현:**

프로젝트 삭제 시 연결된 파일도 자동 삭제:

```javascript
exports.deleteProject = async (projectId) => {
  // 1. 프로젝트 삭제
  await Project.findByIdAndDelete(projectId);

  // 2. 연결된 에셋 조회
  const assets = await Asset.find({ projectId });

  // 3. R2에서 파일 삭제
  for (const asset of assets) {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: asset.fileKey
    }));
  }

  // 4. Asset 모델 삭제
  await Asset.deleteMany({ projectId });
};
```

**교훈:**
- 클라우드 스토리지는 필수 (로컬 서버로는 한계 명확)
- S3 호환 API 덕분에 마이그레이션 쉬움

### 6.5. Three.js 성능 최적화

**문제점:**

조명이 10개 이상일 때 프레임 드랍 발생 (60fps → 30fps):

1. **불필요한 리렌더링**: 조명 하나만 변경되어도 전체 Scene 리렌더링
2. **히스토리 저장 오버헤드**: Transform 중 수십 번 Deep Copy
3. **HDRI 로딩 블로킹**: HDRI 로드 중 화면 멈춤

**해결책:**

#### 1. React.memo 메모이제이션

```javascript
const LightComponent = React.memo(({ light }) => {
  return <spotLight {...light} />;
}, (prevProps, nextProps) => {
  // light 객체가 변경되지 않으면 리렌더링 안 함
  return JSON.stringify(prevProps.light) === JSON.stringify(nextProps.light);
});
```

#### 2. Zustand 선택적 구독

```javascript
// ❌ 전체 상태 구독 → 모든 변경에 리렌더링
const state = useStore();

// ✅ lights만 구독 → lights 변경 시에만 리렌더링
const lights = useStore(state => state.lights);

// ✅✅ 개별 조명 구독 (최적)
const light = useStore(state =>
  state.lights.find(l => l.id === lightId)
);
```

#### 3. Transform 중 히스토리 저장 안 함

```javascript
<TransformControls
  onMouseDown={() => {
    useStore.temporal.getState().pause(); // 히스토리 일시 정지
  }}
  onMouseUp={() => {
    useStore.temporal.getState().resume(); // 종료 시점에만 저장
  }}
/>
```

#### 4. HDRI 비동기 로딩

```javascript
import { useTexture } from '@react-three/drei';

function Background({ hdriUrl }) {
  const texture = useTexture(hdriUrl, {
    onLoad: () => console.log('HDRI 로드 완료')
  });

  // 로드 전까지는 단색 배경
  return texture ? <Environment map={texture} /> : <color attach="background" args={['#050505']} />;
}
```

**효과:**
- 조명 20개에서도 60fps 유지
- 일반 노트북(M1 MacBook Air)에서도 부드러운 동작

**교훈:**
- 성능 최적화는 측정부터 (Chrome DevTools Performance 탭)
- 선택적 구독이 성능 향상의 핵심

---

## 7. 핵심 코드 설명

### 7.1. Zustand Store 구조

**editorStore.js 핵심 부분:**

```javascript
import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useStore = create((set, get) => ({
  // ========== 상태 ==========
  lights: createDefaultLights(),
  selectedLight: null,

  // ========== 액션 ==========

  // 조명 추가
  addLight: (type = 'spot') => {
    const newLight = buildSpotLight({ type, name: `${type} Light` });
    set(state => ({
      lights: [...state.lights, newLight],
      selectedLight: newLight.id
    }));
  },

  // 조명 업데이트
  updateLight: (id, key, value) => {
    set(state => ({
      lights: state.lights.map(light =>
        light.id === id ? { ...light, [key]: value } : light
      )
    }));
  },

  // 조명 삭제
  removeLight: (id) => {
    set(state => ({
      lights: state.lights.filter(light => light.id !== id),
      selectedLight: state.selectedLight === id ? null : state.selectedLight
    }));
  },

  // Scene 데이터 가져오기 (저장용)
  getSceneData: () => {
    const state = get();
    return {
      schemaVersion: 2,
      lights: state.lights,
      mannequins: state.mannequins,
      cameraState: state.cameraState,
      // ...
    };
  },

  // Scene 데이터 로드 (불러오기용)
  loadSceneData: (sceneData) => {
    set({
      lights: sceneData.lights || createDefaultLights(),
      mannequins: sceneData.mannequins || [createDefaultMannequin()],
      cameraState: sceneData.cameraState || DEFAULT_CAMERA_STATE,
      // ...
    });
  }
}));

export default useStore;
```

**사용 예시:**

```javascript
// 컴포넌트에서 사용
function LightCard({ lightId }) {
  // 선택적 구독: 이 조명의 데이터만 구독
  const light = useStore(state =>
    state.lights.find(l => l.id === lightId)
  );
  const updateLight = useStore(state => state.updateLight);
  const removeLight = useStore(state => state.removeLight);

  return (
    <div>
      <input
        type="range"
        value={light.intensity}
        onChange={(e) => updateLight(lightId, 'intensity', parseFloat(e.target.value))}
      />
      <button onClick={() => removeLight(lightId)}>삭제</button>
    </div>
  );
}
```

### 7.2. normalizeSceneData 함수

**scene.service.js:**

```javascript
const normalizeSceneData = (sceneData) => {
  const dirtyRef = { dirty: false };

  // 1. 조명 정규화
  const lights = Array.isArray(sceneData.lights)
    ? sceneData.lights
        .filter(light => light && typeof light === 'object')
        .map(light => normalizeLight(light, dirtyRef))
    : createDefaultLights();

  // 2. 중복 ID 제거
  const seenIds = new Set();
  const uniqueLights = lights.filter(light => {
    if (seenIds.has(light.id)) {
      dirtyRef.dirty = true;
      console.warn(`중복 조명 ID 발견: ${light.id}`);
      return false;
    }
    seenIds.add(light.id);
    return true;
  });

  // 3. 카메라 정규화
  const cameraState = normalizeCameraState(sceneData.cameraState, dirtyRef);

  // 4. 배경 정규화
  const backgroundSettings = normalizeBackgroundSettings(sceneData.backgroundSettings, dirtyRef);

  return {
    schemaVersion: 2,
    lights: uniqueLights,
    cameraState,
    backgroundSettings,
    // ...
  };
};

const normalizeLight = (light, dirtyRef) => {
  const normalized = {
    id: light.id || nanoid(),
    type: ['spot', 'rect', 'point', 'directional'].includes(light.type)
      ? light.type
      : 'spot',
    name: typeof light.name === 'string' ? light.name : 'Light',
    visible: typeof light.visible === 'boolean' ? light.visible : true,
    color: /^#[0-9A-F]{6}$/i.test(light.color) ? light.color : '#ffffff',
    intensity: clampNumber(light.intensity, 0, 100, 10),
    position: ensureVector3(light.position, [0, 3, 0]),
    castShadow: typeof light.castShadow === 'boolean' ? light.castShadow : true,
  };

  // Spot Light 전용 속성
  if (normalized.type === 'spot') {
    normalized.angle = clampNumber(light.angle, 0, Math.PI / 2, Math.PI / 4);
    normalized.penumbra = clampNumber(light.penumbra, 0, 1, 0.5);
    normalized.targetPosition = ensureVector3(light.targetPosition, [0, 1, 0]);
  }

  return normalized;
};

const ensureVector3 = (value, fallback) => {
  if (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(n => typeof n === 'number' && Number.isFinite(n))
  ) {
    return value;
  }
  return fallback;
};

const clampNumber = (value, min, max, fallback) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(value, max));
};
```

### 7.3. MVCS 패턴 코드

**project.controller.js:**

```javascript
const projectService = require('../services/project.service');
const { validationResult } = require('express-validator');

exports.updateProject = async (req, res) => {
  try {
    // 1. 입력 검증
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 2. 인증 확인
    const userId = req.user._id;

    // 3. Service 호출
    const updatedProject = await projectService.updateProject(
      req.params.id,
      userId,
      req.body
    );

    // 4. HTTP 응답
    res.json({
      message: '프로젝트가 업데이트되었습니다.',
      project: updatedProject
    });
  } catch (error) {
    console.error('프로젝트 업데이트 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
```

**project.service.js:**

```javascript
const Project = require('../models/Project');
const sceneService = require('./scene.service');

exports.updateProject = async (projectId, userId, updateData) => {
  // 1. 프로젝트 조회 및 권한 확인
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('프로젝트를 찾을 수 없습니다.');
  }
  if (project.owner.toString() !== userId.toString()) {
    throw new Error('권한이 없습니다.');
  }

  // 2. Scene 데이터 정규화
  if (updateData.sceneData) {
    updateData.sceneData = sceneService.normalizeSceneData(updateData.sceneData);
  }

  // 3. 업데이트 적용
  Object.assign(project, updateData);

  // 4. 저장 및 반환
  await project.save();
  return project;
};
```

### 7.4. Bull Queue 워커

**ai.worker.js:**

```javascript
const Queue = require('bull');
const geminiService = require('../services/geminiImage.service');
const storageService = require('../services/storage.service');
const User = require('../models/User');

const aiQueue = new Queue('ai-generation', process.env.REDIS_URL);

aiQueue.process(async (job) => {
  const { userId, sceneImageUrl, prompt, negativePrompt } = job.data;

  try {
    // 1. 사용자 API 키 조회 (복호화)
    const user = await User.findById(userId).select('+aiApiKey');
    if (!user || !user.aiApiKey) {
      throw new Error('AI API 키가 설정되지 않았습니다.');
    }

    const apiKey = decrypt(user.aiApiKey);

    // 2. Scene 이미지 다운로드
    const sceneImageBuffer = await downloadImage(sceneImageUrl);

    // 3. Gemini API 호출
    job.progress(30); // 진행률 업데이트
    const generatedImageUrl = await geminiService.generateImage(
      apiKey,
      sceneImageBuffer,
      prompt,
      negativePrompt
    );

    // 4. R2에 업로드
    job.progress(70);
    const imageBuffer = await downloadImage(generatedImageUrl);
    const uploadedUrl = await storageService.uploadToR2(
      imageBuffer,
      `ai/${userId}/${Date.now()}.png`
    );

    // 5. 완료
    job.progress(100);
    return { imageUrl: uploadedUrl };
  } catch (error) {
    console.error('AI 생성 실패:', error);
    throw error; // Bull이 자동 재시도
  }
});

// 재시도 설정
aiQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} 실패:`, err);
  if (job.attemptsMade < 3) {
    console.log(`재시도 ${job.attemptsMade + 1}/3`);
  }
});
```

---

## 8. API 명세 요약

### 8.1. 인증 API

| 메서드 | 경로 | 설명 | 요청 본문 | 응답 |
|--------|------|------|-----------|------|
| `POST` | `/api/auth/register` | 회원가입 | `{ username, email, password }` | `{ user }` + 세션 쿠키 |
| `POST` | `/api/auth/login` | 로그인 | `{ email, password }` | `{ user }` + 세션 쿠키 |
| `GET` | `/api/auth/google` | Google OAuth 시작 | - | Google OAuth 페이지로 리다이렉트 |
| `GET` | `/api/auth/google/callback` | Google OAuth 콜백 | - | 세션 쿠키 발급 후 리다이렉트 |
| `GET` | `/api/auth/naver` | Naver OAuth 시작 | - | Naver OAuth 페이지로 리다이렉트 |
| `GET` | `/api/auth/naver/callback` | Naver OAuth 콜백 | - | 세션 쿠키 발급 후 리다이렉트 |
| `POST` | `/api/auth/logout` | 로그아웃 | - | `{ message }` + 세션 삭제 |
| `GET` | `/api/auth/me` | 현재 사용자 조회 | - | `{ user }` |

### 8.2. 프로젝트 API

| 메서드 | 경로 | 설명 | 요청 본문 | 응답 |
|--------|------|------|-----------|------|
| `GET` | `/api/projects` | 프로젝트 목록 조회 | - | `{ projects: Project[] }` |
| `POST` | `/api/projects` | 프로젝트 생성 | `{ name, description?, sceneData, thumbnail? }` | `{ project }` |
| `GET` | `/api/projects/:id` | 프로젝트 상세 조회 | - | `{ project }` |
| `PATCH` | `/api/projects/:id` | 프로젝트 업데이트 | `{ name?, description?, sceneData?, thumbnail? }` | `{ message, project }` |
| `DELETE` | `/api/projects/:id` | 프로젝트 삭제 | - | 상태 코드 `204` |

### 8.3. 공유 API

| 메서드 | 경로 | 설명 | 요청 본문 | 응답 |
|--------|------|------|-----------|------|
| `POST` | `/api/share/projects/:id` | 공유 토큰 발급 | - | `{ shareToken }` |
| `DELETE` | `/api/share/projects/:id` | 공유 토큰 회수 | - | 상태 코드 `204` |
| `GET` | `/api/share/:token` | 공유 프로젝트 조회 (공개) | - | `{ project }` |

### 8.4. 에셋 API

| 메서드 | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| `POST` | `/api/assets/upload-hdri` | HDRI 업로드 | FormData (file, projectId) | `{ asset }` |
| `POST` | `/api/assets/upload-gltf` | GLB 업로드 | FormData (file, projectId) | `{ asset }` |
| `GET` | `/api/assets/project/:projectId` | 프로젝트 에셋 목록 | - | `{ assets: Asset[] }` |
| `DELETE` | `/api/assets/:assetId` | 에셋 삭제 | - | 상태 코드 `204` |

### 8.5. AI API

| 메서드 | 경로 | 설명 | 요청 본문 | 응답 |
|--------|------|------|-----------|------|
| `POST` | `/api/ai/generate` | 프리비주얼 생성 시작 | `{ projectId, prompt, negativePrompt? }` | `{ jobId }` |
| `GET` | `/api/ai/status/:jobId` | 생성 진행 상황 조회 | - | `{ status, progress, result? }` |
| `POST` | `/api/ai/api-key` | AI API 키 저장 | `{ apiKey }` | `{ message }` |
| `GET` | `/api/ai/api-key` | AI API 키 존재 여부 확인 | - | `{ hasApiKey }` |

---

## 9. 보안 고려사항

### 9.1. Session 기반 인증

**구현:**
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true, // XSS 방지
    secure: process.env.NODE_ENV === 'production', // HTTPS 전용
    sameSite: 'lax', // CSRF 방지
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
  }
}));
```

**보안 강점:**
- **즉시 무효화**: 서버에서 세션 삭제 → 토큰 즉시 만료
- **HttpOnly 쿠키**: JavaScript에서 접근 불가 → XSS 공격 방지
- **SameSite**: CSRF 공격 방지

### 9.2. CSRF 토큰

**구현:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false, sessionKey: 'session' });

// CSRF 토큰 발급
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// POST/PATCH/DELETE 요청 보호
app.use('/api', csrfProtection);
```

**클라이언트:**
```javascript
// CSRF 토큰 가져오기
const { csrfToken } = await api.get('/api/csrf-token');

// 모든 요청에 포함
api.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

### 9.3. API 키 암호화

**AES-256-GCM 암호화:**

```javascript
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32바이트

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // IV + AuthTag + 암호화된 텍스트
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

exports.decrypt = (encryptedData) => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
```

**사용:**
```javascript
// 저장 시
user.aiApiKey = encrypt(plainApiKey);
await user.save();

// 조회 시
const user = await User.findById(userId).select('+aiApiKey');
const plainApiKey = decrypt(user.aiApiKey);
```

### 9.4. Rate Limiting

**express-rate-limit 사용:**

```javascript
const rateLimit = require('express-rate-limit');

// AI 생성 API: 시간당 10회
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10,
  message: 'AI 생성 요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
  standardHeaders: true, // RateLimit-* 헤더 반환
  legacyHeaders: false
});

app.use('/api/ai/generate', aiLimiter);

// 로그인 API: 15분당 5회
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: '로그인 시도 횟수를 초과했습니다.'
});

app.use('/api/auth/login', loginLimiter);
```

### 9.5. 입력 검증

**express-validator 사용:**

```javascript
const { body, validationResult } = require('express-validator');

router.patch(
  '/projects/:id',
  requireAuth,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('sceneData').optional().isObject()
  ],
  projectController.updateProject
);

// Controller에서 검증
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
```

---

## 10. 성능 최적화

### 10.1. React 렌더링 최적화

#### React.memo 메모이제이션

```javascript
const LightComponent = React.memo(
  ({ light }) => {
    return <spotLight {...light} />;
  },
  (prevProps, nextProps) => {
    // 얕은 비교로 충분한 경우
    return prevProps.light === nextProps.light;
  }
);
```

#### useCallback으로 함수 메모이제이션

```javascript
const handleIntensityChange = useCallback((e) => {
  updateLight(lightId, 'intensity', parseFloat(e.target.value));
}, [lightId, updateLight]);
```

### 10.2. Three.js 프레임 관리

#### useFrame으로 60fps 유지

```javascript
import { useFrame } from '@react-three/fiber';

function AnimatedLight({ position }) {
  const ref = useRef();

  useFrame((state, delta) => {
    // 매 프레임 실행 (60fps)
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5 + 3;
  });

  return <spotLight ref={ref} position={position} />;
}
```

#### LOD (Level of Detail)

```javascript
import { Lod } from '@react-three/drei';

<Lod distances={[0, 10, 20]}>
  <mesh> {/* 가까울 때: 고품질 모델 */} </mesh>
  <mesh> {/* 중간 거리: 중품질 모델 */} </mesh>
  <mesh> {/* 멀 때: 저품질 모델 */} </mesh>
</Lod>
```

### 10.3. 메모리 관리 (히스토리 제한)

**최대 50개 스냅샷:**

```javascript
const useStore = create(
  temporal(
    (set) => ({ /* ... */ }),
    {
      limit: 50, // 최대 50개
      equality: (a, b) => a === b
    }
  )
);
```

**메모리 사용량:**
- 평균 스냅샷 크기: ~10KB
- 총 메모리: ~500KB (무시 가능)

### 10.4. 비동기 로딩

#### HDRI 비동기 로드

```javascript
import { useTexture } from '@react-three/drei';
import { Suspense } from 'react';

function Background({ hdriUrl }) {
  return (
    <Suspense fallback={<color attach="background" args={['#050505']} />}>
      <HDRIEnvironment url={hdriUrl} />
    </Suspense>
  );
}

function HDRIEnvironment({ url }) {
  const texture = useTexture(url);
  return <Environment map={texture} />;
}
```

#### GLTF 모델 비동기 로드

```javascript
<Suspense fallback={<Placeholder />}>
  <Mannequin />
</Suspense>
```

---

## 11. 테스트 전략

### 11.1. TDD (Backend)

**Jest + Supertest + mongodb-memory-server:**

```javascript
const request = require('supertest');
const app = require('../app');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/projects', () => {
  it('프로젝트를 생성해야 함', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: '테스트 프로젝트',
        sceneData: { lights: [] }
      })
      .expect(201);

    expect(response.body.project).toHaveProperty('id');
    expect(response.body.project.name).toBe('테스트 프로젝트');
  });
});
```

### 11.2. 프론트엔드 테스트 (향후 계획)

**Vitest + Testing Library:**

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LightCard from './LightCard';

describe('LightCard', () => {
  it('조명 밝기를 조절할 수 있어야 함', () => {
    const light = { id: '1', intensity: 10 };
    const updateLight = vi.fn();

    render(<LightCard light={light} updateLight={updateLight} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });

    expect(updateLight).toHaveBeenCalledWith('1', 'intensity', 20);
  });
});
```

---

## 12. 개발 단계 (Phase 1-7)

### Phase 1: 프로젝트 초기 설정 및 3D 환경 구축

**목표:** 클라이언트/서버 분리 구조 및 기본 3D 렌더링 환경 구축

**작업 내용:**
- Vite + React 프로젝트 생성
- Three.js, React-Three-Fiber 설치 및 기본 Scene 구현
- Tailwind CSS 설정
- Git 초기 커밋

**학습 포인트:**
- Vite의 빠른 HMR 경험
- React-Three-Fiber의 선언적 3D 렌더링

**상태:** ✅ 완료

---

### Phase 2: 핵심 UI 및 상태 관리

**목표:** Zustand 기반 상태 관리 및 에디터 패널 구현

**작업 내용:**
- Zustand Store 설정 (조명, 카메라 상태)
- 조명 추가/삭제/수정 UI
- 카메라 FOV 제어
- 마네킹 모델 통합
- Undo/Redo 시스템 (Zustand Temporal)

**학습 포인트:**
- Zustand의 선택적 구독으로 성능 최적화
- React-Three-Fiber와 Zustand 통합 패턴
- Undo/Redo 구현 시 Deep Copy 최적화 필요성

**상태:** ✅ 완료

---

### Phase 3: 백엔드 통합 준비

**목표:** Scene 데이터 저장/불러오기를 위한 백엔드 API 설계

**작업 내용:**
- Express 서버 기본 구조
- MongoDB 연결
- User/Project 모델 정의
- MVCS 패턴 적용
- normalizeSceneData 함수 구현

**학습 포인트:**
- MVCS 패턴으로 책임 분리의 중요성
- 클라이언트 데이터를 절대 신뢰하지 말 것
- 데이터 정규화가 버그 예방의 핵심

**상태:** ✅ 완료

---

### Phase 4: 인증 시스템 & 튜토리얼

**목표:** 사용자 인증 및 신규 사용자 온보딩

**작업 내용:**
- Passport.js 설정 (로컬, Google, Naver)
- Session 기반 인증 (express-session + MongoDB)
- CSRF 보호
- 8단계 인터랙티브 튜토리얼
- 단축키 카드 시스템

**학습 포인트:**
- Session vs JWT 선택 근거 (보안 > 확장성)
- OAuth 흐름 이해
- 튜토리얼 UX 설계 중요성 (초보자 진입 장벽 낮추기)

**상태:** ✅ 완료

---

### Phase 5: 파일 업로드 (R2)

**목표:** HDRI, 3D 모델 업로드 기능 구현

**작업 내용:**
- Cloudflare R2 연동
- Multer 파일 업로드
- Asset 모델 정의
- Cascade 삭제 구현
- 파일 검증 (확장자, 크기)

**학습 포인트:**
- 로컬 스토리지의 한계 → 클라우드 스토리지 필수
- S3 호환 API 덕분에 쉬운 마이그레이션
- Cascade 삭제로 데이터 일관성 유지

**상태:** ✅ 완료

---

### Phase 6: 전문가용 UI (Pro UI)

**목표:** Cinema 4D 스타일 전문가용 워크플로우 제공

**작업 내용:**
- Outliner 패널 (계층 트리)
- Properties Panel (상세 속성 편집)
- Toolbar (Transform 모드, Grid, Snap)
- 패널 접기/펼치기
- 단축키 시스템 (W/E/R)

**학습 포인트:**
- 전문가 툴의 UX 패턴 벤치마킹 중요성
- shadcn/ui로 일관된 디자인 시스템 구축
- 접근성(A11y) 고려 (키보드 내비게이션, ARIA 라벨)

**상태:** ✅ 완료

---

### Phase 7: AI 프리비주얼라이제이션

**목표:** 3D → 실사 변환 기능 구현

**작업 내용:**
- Gemini 2.5 Flash Image 모델 통합
- Bull Queue 비동기 작업 처리
- AI API 키 암호화 저장 (AES-256-GCM)
- Rate Limiting (시간당 10회)
- 진행 상황 폴링 UI

**학습 포인트:**
- 비동기 작업은 Queue로 처리 (HTTP 타임아웃 방지)
- 민감 정보는 반드시 암호화 (API 키)
- Rate Limiting으로 비용 통제

**상태:** ✅ 완료

---

## 13. 향후 계획

### Phase 8: 리팩토링 및 최적화

**목표:** 기술 부채 정리 및 성능 개선

**작업 내용:**
1. **Zustand Store 분리**: 8000줄 → Slice 패턴 적용
2. **E2E 테스트 도입**: Playwright로 사용자 시나리오 자동 테스트
3. **성능 프로파일링**: Chrome DevTools로 병목 지점 파악
4. **번들 크기 최적화**: Vite 번들 분석 및 Code Splitting
5. **접근성 개선**: WCAG 2.1 AA 완전 준수

**예상 기간:** 2주

---

### 협업 기능 (미착수)

**목표:** URL 공유만으로 팀원들과 실시간 협업

**작업 내용:**
- WebSocket 기반 실시간 동기화
- 멀티 유저 커서 표시
- 댓글 및 피드백 시스템
- 버전 히스토리 (Git 스타일)

**기술 스택:**
- Socket.IO (WebSocket)
- Operational Transform (동시 편집 충돌 해결)

---

### 렌더링 개선 (미착수)

**목표:** 고품질 렌더링 옵션 제공

**작업 내용:**
- Ray Tracing 지원 (Three.js PathTracing Renderer)
- 포스트 프로세싱 효과 (Bloom, DOF, SSAO)
- 그림자 품질 개선 (Soft Shadow)
- 4K 렌더링 옵션

---

### 배포 및 모니터링 (미착수)

**목표:** 프로덕션 환경 구축

**작업 내용:**
- Docker 컨테이너화
- Kubernetes 배포
- Cloudflare CDN 설정
- Sentry 에러 모니터링
- Google Analytics 통합

---

## 14. 자주 묻는 질문 (FAQ)

### Q1. Zustand를 선택한 이유는? Redux와 비교했을 때 장단점은?

**A:** Redux는 보일러플레이트가 너무 많고, Context API는 성능 문제가 있었습니다.

**Zustand의 장점:**
- 가벼움 (2KB vs Redux 10KB)
- 선택적 구독으로 성능 최적화
- 직관적인 API (보일러플레이트 최소)

**Zustand의 단점:**
- Redux DevTools 통합이 약함
- 미들웨어 생태계가 작음

하지만 이 프로젝트 규모에서는 Zustand의 단순함이 더 큰 장점이었습니다.

---

### Q2. Scene 데이터를 JSON으로 저장하는 방식의 트레이드오프는?

**A:** 관계형 DB로 정규화하면 조명, 마네킹, 카메라를 각각 테이블로 분리해야 합니다. 하지만 3D 씬은 항상 전체를 한 번에 읽고 쓰는 패턴이므로 JSON 저장이 효율적입니다.

**장점:**
- 단일 쿼리로 전체 씬 로드/저장
- 트랜잭션 단순화
- MongoDB의 유연한 스키마 활용

**단점:**
- 데이터 중복 가능 → `normalizeSceneData`로 해결
- 부분 업데이트 어려움 → 전체 씬을 저장하므로 문제없음

---

### Q3. Session 방식을 선택한 이유는? JWT와 비교했을 때?

**A:** JWT는 stateless하고 확장성이 좋지만, 로그아웃 처리가 어렵고 토큰 탈취 시 무효화 불가능합니다.

**Session의 장점:**
- 즉시 무효화 가능 (보안성 높음)
- 민감 정보(AI API 키)를 서버에 저장

**Session의 단점:**
- 서버 메모리 사용 → MongoDB Session Store로 해결
- 로드 밸런서 환경에서 sticky session 필요 → 향후 Redis로 전환 예정

---

### Q4. Zustand Store가 8000줄이 넘어간 이유와 리팩토링 계획은?

**A:** 초기에는 모든 상태를 한 파일에 넣었습니다. 분리를 시도했을 때 순환 참조 문제가 발생했습니다.

**해결 계획: Slice 패턴**

```javascript
// slices/lightsSlice.js
export const createLightsSlice = (set, get) => ({
  lights: [],
  addLight: (light) => set(state => ({ lights: [...state.lights, light] }))
});

// store/index.js
export const useStore = create((set, get) => ({
  ...createLightsSlice(set, get),
  ...createCameraSlice(set, get)
}));
```

**Phase 8에서 적용 예정** (E2E 테스트 먼저 구축)

---

### Q5. Three.js 성능 최적화는 어떻게 했나요?

**A:**

1. **React.memo**: 컴포넌트 메모이제이션
2. **선택적 구독**: 필요한 상태만 구독
3. **Transform 중 히스토리 저장 안 함**: 불필요한 Deep Copy 제거
4. **HDRI 비동기 로딩**: Suspense로 블로킹 방지

**결과:** 조명 20개에서도 60fps 유지

---

### Q6. Bull Queue를 선택한 이유와 AI 비동기 처리 아키텍처는?

**A:** Gemini API 요청은 5~10초 걸려서 HTTP 타임아웃 발생. Queue가 필요했습니다.

**Bull 선택 이유:**
- Redis 기반 (빠르고 안정적)
- Job 재시도, 우선순위, 동시성 제어

**아키텍처:**
1. 클라이언트 → `/api/ai/generate` → 즉시 Job ID 반환
2. Bull Worker가 백그라운드에서 처리
3. 클라이언트는 `/api/ai/status/:jobId`로 폴링
4. 완료되면 결과 URL 반환

---

### Q7. MVCS 패턴에서 각 레이어의 책임은?

**A:**

| 레이어 | 책임 | 예시 |
|--------|------|------|
| Controller | HTTP 요청/응답, 입력 검증 | `req.body` 파싱, 상태 코드 반환 |
| Service | 순수 비즈니스 로직 | `normalizeSceneData`, 중복 제거 |
| Model | Mongoose 스키마 | `Project.findById()` |

**예시:** 프로젝트 업데이트
- Controller: `req.body` 검증, `req.user` 권한 확인
- Service: `sceneData` 정규화, 버전 체크
- Model: MongoDB 저장

---

## 15. 용어 사전

### Three.js 관련

| 용어 | 설명 |
|------|------|
| **WebGL** | 웹 브라우저에서 3D 그래픽을 렌더링하는 JavaScript API |
| **Scene** | 3D 객체(조명, 카메라, 메시)를 담는 컨테이너 |
| **Mesh** | Geometry(형태) + Material(재질)로 구성된 3D 객체 |
| **OrbitControls** | 마우스로 카메라를 회전/줌/이동하는 컨트롤러 |
| **HDRI** | High Dynamic Range Image, 360도 환경 이미지 |
| **FOV (Field of View)** | 카메라 시야각 (도 단위) |
| **Focal Length** | 카메라 초점거리 (mm 단위, FOV와 반비례) |

### React 패턴

| 용어 | 설명 |
|------|------|
| **Zustand** | React 경량 상태 관리 라이브러리 |
| **Selector** | Store에서 특정 상태만 선택하는 함수 |
| **Slice 패턴** | Store를 도메인별로 분리하는 패턴 |
| **선택적 구독** | 필요한 상태만 구독하여 불필요한 리렌더링 방지 |
| **React.memo** | 컴포넌트 메모이제이션 (props 변경 시에만 리렌더링) |

### 백엔드 아키텍처

| 용어 | 설명 |
|------|------|
| **MVCS** | Model-View-Controller-Service 패턴 |
| **Session** | 서버에 저장되는 사용자 인증 정보 |
| **JWT** | JSON Web Token, stateless 인증 토큰 |
| **CSRF** | Cross-Site Request Forgery, 사이트 간 요청 위조 공격 |
| **XSS** | Cross-Site Scripting, 악성 스크립트 주입 공격 |
| **HttpOnly 쿠키** | JavaScript에서 접근 불가능한 쿠키 (XSS 방지) |
| **Cascade 삭제** | 부모 삭제 시 자식도 자동 삭제 |

### AI & Queue

| 용어 | 설명 |
|------|------|
| **Gemini 2.5 Flash** | Google의 이미지 생성 AI 모델 |
| **Bull Queue** | Redis 기반 Node.js 작업 큐 라이브러리 |
| **Job** | Queue에 추가되는 비동기 작업 단위 |
| **Worker** | Job을 처리하는 백그라운드 프로세스 |
| **폴링 (Polling)** | 주기적으로 서버에 상태 확인 요청 |

---

## 마무리

이 문서는 LumoStage 프로젝트의 모든 측면을 종합적으로 다루었습니다. 기술적 의사결정의 근거, 구현 세부사항, 직면한 문제와 해결책, 향후 계획까지 포함하여 프로젝트를 완전히 이해할 수 있도록 구성했습니다.

**발표 시 참고 포인트:**
- **기술 선택의 근거**: "왜 이 기술을 선택했는가?"에 대한 명확한 답변 준비
- **어려웠던 점**: 실제 개발 과정에서의 어려움과 해결 과정 강조
- **성능 최적화**: 구체적인 수치(60fps 유지, 8000줄 → Slice 패턴)로 설명
- **보안 고려**: Session, CSRF, 암호화 등 보안 의식 강조

**질문 대비:**
- Zustand vs Redux/Context API
- Session vs JWT
- MongoDB vs 관계형 DB
- MVCS 패턴 책임 분리
- normalizeSceneData 구체적 구현

**추가 학습 자료:**
- `docs/PRD.md`: 제품 요구사항 상세
- `docs/api/PROJECT_DASHBOARD_API.md`: API 명세 전체
- `docs/architecture/LumoStage-Architecture.md`: 아키텍처 다이어그램
- `docs/planning/implementation-phases.md`: 단계별 개발 계획

---

**문서 버전:** 1.0
**최종 업데이트:** 2025-11-30
**작성자:** Documentation Expert (Claude Code)

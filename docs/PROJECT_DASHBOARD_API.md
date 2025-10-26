# LumoStage 프로젝트 대시보드 API 명세 (초안)

> 본 문서는 `PROJECT_DASHBOARD_PLAN.md`의 Phase 1 범위를 백엔드 구현 관점에서 구체화한 API 초안입니다. 프론트엔드 통합 시 반드시 최신 스펙을 검증하고 필요한 변경 사항을 본 문서에 반영해주세요.

## 1. 공통 규칙

- **Base URL**: `/api`
- **응답 포맷**: `application/json`
- **인증**: 로그인 또는 소셜 로그인 성공 시 발급되는 `HttpOnly` 쿠키(`token`) 기반의 JWT.
- **에러 포맷**:

```json
{
  "message": "에러 메시지"
}
```

## 2. 인증 API

### 2.1 회원가입 `POST /api/auth/register`

- **요청 본문**

```json
{
  "username": "홍길동",
  "email": "hong@example.com",
  "password": "strong-password"
}
```

- **응답 (201)**

```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "65f0…",
    "username": "홍길동",
    "email": "hong@example.com",
    "googleId": null,
    "naverId": null,
    "createdAt": "2024-03-01T00:00:00.000Z",
    "updatedAt": "2024-03-01T00:00:00.000Z"
  }
}
```

- **특이사항**
  - 쿠키 `token`이 설정되며 이후 요청에 자동 포함됩니다.
  - 중복 이메일은 409 에러.

### 2.2 로그인 `POST /api/auth/login`

- **요청 본문**

```json
{
  "email": "hong@example.com",
  "password": "strong-password"
}
```

- **응답 (200)**

```json
{
  "message": "로그인에 성공했습니다.",
  "user": { "...": "회원가입과 동일" }
}
```

- **에러 케이스**
  - 필수 필드 누락: 400
  - 자격 증명 불일치: 401

### 2.3 Google OAuth

| 경로 | 설명 |
| --- | --- |
| `GET /api/auth/google` | Google OAuth 인증 시작 (`prompt=select_account`) |
| `GET /api/auth/google/callback` | 콜백 처리, 사용자 생성/연결 후 JWT 쿠키 발급 |

- **성공 시 리다이렉트**: `.env`의 `OAUTH_SUCCESS_REDIRECT`(기본: `<CLIENT_ORIGIN>/projects`)
- **실패 시 리다이렉트**: `.env`의 `OAUTH_FAILURE_REDIRECT`(기본: `<CLIENT_ORIGIN>/login?error=oauth`)
- **테스트/개발 모드**: `OAUTH_RESPONSE_MODE=json` 또는 쿼리 `?mode=json` → JSON 응답으로 전환

```json
{
  "message": "소셜 로그인에 성공했습니다.",
  "provider": "google",
  "user": { "...": "회원가입과 동일" }
}
```

### 2.4 Naver OAuth

Google 흐름과 동일한 구조이며, 초기 경로만 `naver`로 변경됩니다.

## 3. 프로젝트 API

> 모든 엔드포인트는 인증 미들웨어(`requireAuth`)를 거쳐 JWT 검증을 수행합니다.

### 3.1 생성 `POST /api/projects`

- **요청 본문**

```json
{
  "name": "스테이지 1",
  "description": "첫 번째 씬",
  "sceneData": {
    "nodes": [],
    "lights": []
  },
  "thumbnail": "https://…/thumb.png"
}
```

- **응답 (201)**

```json
{
  "message": "프로젝트가 생성되었습니다.",
  "project": {
    "id": "65f0…",
    "name": "스테이지 1",
    "description": "첫 번째 씬",
    "sceneData": { "nodes": [], "lights": [] },
    "thumbnail": "",
    "owner": "64e9…",
    "createdAt": "2024-03-01T00:00:00.000Z",
    "updatedAt": "2024-03-01T00:00:00.000Z"
  }
}
```

- **검증**: `name`, `sceneData` 필수.

### 3.2 목록 조회 `GET /api/projects`

- **응답 (200)**

```json
{
  "projects": [
    {
      "id": "65f0…",
      "name": "스테이지 1",
      "owner": "64e9…",
      "createdAt": "2024-03-01T00:00:00.000Z",
      "updatedAt": "2024-03-01T00:00:00.000Z",
      "sceneData": { … },
      "description": "첫 번째 씬",
      "thumbnail": ""
    }
  ]
}
```

### 3.3 단건 조회 `GET /api/projects/:id`

- **응답 (200)**

```json
{
  "project": { "...": "생성과 동일" }
}
```

- **에러**
  - 잘못된 ObjectId: 400 `잘못된 프로젝트 ID입니다.`
  - 다른 사용자의 프로젝트: 404 `프로젝트를 찾을 수 없습니다.`

### 3.4 업데이트 `PATCH /api/projects/:id`

- **요청 본문**: `name`, `description`, `sceneData`, `thumbnail` 중 하나 이상 전달
- **응답 (200)**

```json
{
  "message": "프로젝트가 업데이트되었습니다.",
  "project": { "...": "생성과 동일" }
}
```

- **에러**
  - Body 비어 있음: 400 `수정할 필드를 제공해주세요.`
  - 잘못된/타인 프로젝트: 위와 동일

### 3.5 삭제 `DELETE /api/projects/:id`

- **응답 (204)**: 본문 없음
- **에러**: 위와 동일

## 4. 테스트 전략 메모

- `jest` + `supertest` 기반 e2e 시나리오 작성
- MongoDB는 `mongodb-memory-server`를 통해 격리된 환경에서 실행
- 소셜 로그인 플로우는 `passport.authenticate` 스파이로 모킹하여 콜백 경로만 검증

## 5. 향후 과제

- 프로젝트 수정 시 장면 데이터 스키마 정교화 (타입 검증)
- OAuth 연동에 대해 CSRF/state 파라미터 검증 추가
- 리프레시 토큰 전략 및 로그아웃 엔드포인트 도입
- 프로젝트 공유/협업 시나리오를 위한 권한 모델 확장

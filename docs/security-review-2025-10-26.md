# LumoStage 보안 코드 리뷰 (2025-02-14)

- 진행자: Codex Assistant

---

## 주요 보안 이슈
- `server/server.js:15-21`  
  `CLIENT_ORIGIN` 미설정 시 CORS가 전면 허용되어 인증 쿠키가 외부 도메인으로 전송될 수 있음. 화이트리스트 기반 허용 함수로 재구성하고, 설정 누락 시 서버 기동을 중단해야 함.
- `controllers/auth.controller.js:37-55`  
  프로덕션 환경에서 SameSite=None 쿠키를 사용하면서 CSRF 토큰·Referer 검증이 없음. CSRF 대응(예: `csurf`, 더블 서브밋 토큰)과 함께 `helmet`, `hpp` 등 보안 미들웨어를 추가해야 함.
- `routes/auth.routes.js`, `services/auth.service.js:82-133`  
  로그인/회원가입에 레이트 리밋·잠금 정책 부재. `express-rate-limit`으로 `/api/auth/*` 경로를 보호하고, 비밀번호 정책 강화 및 감사 로그를 마련할 필요가 있음.
- `services/project.service.js:14-68`  
  API 입력 검증이 전혀 없어 `sceneData` 등에 악성 데이터 저장 가능. Zod/Joi 기반으로 요청 본문을 검증하고, `mongoose` 모델에 `strict: true`, `sanitizeFilter` 옵션을 적용해야 함.
- `server/server.js:32-37`  
  에러 객체 전체를 로그·HTTP 응답에 노출. 운영 환경에서는 표준 에러 포맷을 정의하고 민감 정보를 마스킹해야 함.
- `client/src/lib/api.js:5`, `client/src/pages/LoginPage.jsx:131-166`, `client/src/pages/RegisterPage.jsx:176-209`  
  API/OAuth URL이 `http://localhost`로 하드코딩되어 HTTPS 배포 시 쿠키 전송 실패 및 혼합 콘텐츠 문제가 발생. 환경 변수 기반 설정으로 교체하고 HTTPS를 기본값으로 강제해야 함.

## 추가 품질 이슈
- `client/src/components/projects/ProjectCard.jsx:49-183`  
  백엔드가 내려주지 않는 `lightsCount`, `lastEdited` 필드를 그대로 렌더링. 안전한 fallback 처리나 API 응답 정렬이 필요함.
- 자동화 테스트가 행복 경로에 치우쳐 있고, 실패/권한/부정 입력 시나리오가 누락되어 있음. Vitest·Jest에 부정 케이스를 추가해야 함.

## 리팩토링 계획
1. **보안 하드닝 (1차)**
   - CORS 화이트리스트/환경 검증 로직 도입, `helmet`, `express-rate-limit`, CSRF 대응 미들웨어 적용.
   - Auth/Project API 입력을 **Zod** 기반으로 검증하도록 1차 적용 완료(2025-10-30). 향후 공통 에러 핸들러 개선과 로깅 체계 분리는 별도 작업으로 진행.
2. **인증·구성 재정비 (2차)**
   - 클라이언트/서버의 API 및 OAuth URL을 `.env` 기반으로 통일하고 HTTPS 기본값 강제.
   - 비밀번호 정책, 로그인 실패 누적 잠금, 감사 로깅 등 계정 보안 정책 수립.
3. **데이터 무결성 및 테스트 확장 (3차)**
   - `sceneData` 구조 스키마 정의, 허용 MIME/사이즈 제한 추가.
   - Vitest/Jest로 CSRF 실패, 레이트 리밋, 입력 검증 실패 등 부정 케이스 테스트 작성.
   - UI 컴포넌트에 필요한 fallback 데이터를 정의하고 타입 가드/기본값을 명시.

---

### 권장 후속 조치
1. 보안 미들웨어 보강 작업 브랜치 생성  
2. 환경 변수 설계 재정립 및 배포 파이프라인 반영  
3. 보안 중심 통합 테스트 러닝 및 결과 공유

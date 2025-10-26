import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // JWT 쿠키 자동 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 요청 전처리
api.interceptors.request.use(
  (config) => {
    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 핸들링
api.interceptors.response.use(
  (response) => {
    // 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // 에러 로깅
    if (error.response) {
      // 서버가 2xx 범위를 벗어나는 상태 코드로 응답
      console.error(`[API Error] ${error.response.status}: ${error.response.data?.message || error.message}`);

      // 401 Unauthorized: 토큰 만료 또는 인증 실패
      if (error.response.status === 401) {
        // 로그인 페이지로 리디렉션 (authStore에서 처리)
        console.warn('[API] Unauthorized - 로그인이 필요합니다.');
      }

      // 403 Forbidden: 권한 없음
      if (error.response.status === 403) {
        console.warn('[API] Forbidden - 접근 권한이 없습니다.');
      }

      // 404 Not Found: 리소스를 찾을 수 없음
      if (error.response.status === 404) {
        console.warn('[API] Not Found - 요청한 리소스를 찾을 수 없습니다.');
      }
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못함
      console.error('[API Error] 서버 응답 없음:', error.request);
    } else {
      // 요청 설정 중 오류 발생
      console.error('[API Error] 요청 설정 오류:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

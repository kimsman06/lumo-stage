/**
 * Toast 메시지 상수 정의
 *
 * 모든 Toast 메시지를 중앙에서 관리하여 일관성을 유지합니다.
 * 향후 다국어 지원 시 i18next와 통합 가능합니다.
 */

// ============================================
// 프로젝트 관련 메시지
// ============================================
export const PROJECT_MESSAGES = {
  // 생성
  createLoading: '프로젝트를 생성하는 중...',
  createSuccess: '프로젝트가 생성되었습니다',
  createError: '프로젝트 생성에 실패했습니다',

  // 저장
  saveLoading: '저장 중...',
  saveSuccess: '변경사항이 저장되었습니다',
  saveError: '저장에 실패했습니다',

  // 자동 저장
  autoSaveLoading: '자동 저장 중...',
  autoSaveSuccess: '자동 저장됨',
  autoSaveError: '자동 저장 실패',

  // 삭제
  deleteLoading: '프로젝트를 삭제하는 중...',
  deleteSuccess: '프로젝트가 삭제되었습니다',
  deleteError: '삭제에 실패했습니다',

  // 수정
  updateSuccess: '프로젝트 정보가 수정되었습니다',
  updateError: '수정에 실패했습니다',

  // 로드
  loadError: '프로젝트를 불러올 수 없습니다',
  loadListError: '프로젝트 목록을 불러오는데 실패했습니다',

  // 기타
  notFound: '프로젝트를 찾을 수 없습니다',
  refreshSuccess: '프로젝트 목록이 업데이트되었습니다',
};

// ============================================
// 인증 관련 메시지
// ============================================
export const AUTH_MESSAGES = {
  // 로그인
  loginSuccess: (username) => `${username}님, 환영합니다`,
  loginError: '로그인에 실패했습니다',
  loginErrorInvalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다',

  // 회원가입
  registerSuccess: '회원가입이 완료되었습니다',
  registerError: '회원가입에 실패했습니다',
  registerErrorDuplicateEmail: '이미 사용 중인 이메일입니다',

  // 로그아웃
  logoutSuccess: '로그아웃되었습니다',
  logoutError: '로그아웃에 실패했습니다',

  // 세션
  sessionExpired: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  unauthorized: '로그인이 필요합니다',
  forbidden: '접근 권한이 없습니다',

  // 소셜 로그인
  socialLoginSuccess: (provider, username) => `${provider} 로그인 성공. ${username}님, 환영합니다`,
};

// ============================================
// 네트워크 에러 메시지
// ============================================
export const NETWORK_MESSAGES = {
  connectionError: '서버에 연결할 수 없습니다',
  networkError: '네트워크 오류가 발생했습니다',
  timeoutError: '요청 시간이 초과되었습니다',
  serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  unknownError: '알 수 없는 오류가 발생했습니다',
};

// ============================================
// 유효성 검사 메시지
// ============================================
export const VALIDATION_MESSAGES = {
  required: '필수 항목을 입력해주세요',
  invalidEmail: '올바른 이메일 주소를 입력해주세요',
  invalidPassword: '비밀번호는 최소 8자, 대·소문자 및 숫자를 포함해야 합니다',
  passwordMismatch: '비밀번호가 일치하지 않습니다',
  tooShort: (min) => `최소 ${min}자 이상 입력해주세요`,
  tooLong: (max) => `최대 ${max}자까지 입력 가능합니다`,
  checkInputs: '입력값을 다시 확인해주세요',
};

// ============================================
// 에디터 관련 메시지
// ============================================
export const EDITOR_MESSAGES = {
  // 조명
  lightAdded: '조명이 추가되었습니다',
  lightDeleted: '조명이 삭제되었습니다',
  lightUpdated: '조명 설정이 변경되었습니다',

  // 마네킹
  mannequinAdded: '마네킹이 추가되었습니다',
  mannequinDeleted: '마네킹이 삭제되었습니다',
  mannequinPoseUpdated: '포즈가 변경되었습니다',

  // 카메라
  cameraReset: '카메라가 초기화되었습니다',

  // 단축키
  shortcutHint: 'Ctrl+S로 저장, ESC로 선택 해제',

  // 경고
  unsavedChanges: '저장되지 않은 변경사항이 있습니다',
};

// ============================================
// 공유 관련 메시지
// ============================================
export const SHARE_MESSAGES = {
  // 링크 생성
  createLinkLoading: '공유 링크를 생성하는 중...',
  createLinkSuccess: '공유 링크가 생성되었습니다',
  createLinkError: '공유 링크 생성에 실패했습니다',

  // 링크 복사
  linkCopied: '공유 링크가 클립보드에 복사되었습니다',
  linkCopyError: '클립보드 복사에 실패했습니다',

  // 설정 업데이트
  updateSettingsSuccess: '공유 설정이 업데이트되었습니다',
  updateSettingsError: '공유 설정 업데이트에 실패했습니다',

  // 링크 재생성
  regenerateLinkSuccess: '새 공유 링크가 생성되었습니다',
  regenerateLinkError: '링크 재생성에 실패했습니다',

  // 공유 비활성화
  deactivateSuccess: '공유가 비활성화되었습니다',
  deactivateError: '공유 비활성화에 실패했습니다',

  // 공유 활성화
  activateSuccess: '공유가 활성화되었습니다',

  // 공유 프로젝트 조회
  loadSharedProjectError: '공유된 프로젝트를 불러올 수 없습니다',

  // 만료/비활성
  linkExpired: '이 공유 링크는 만료되었습니다',
  linkInactive: '이 공유 링크는 비활성화되었습니다',

  // 복제
  projectClonedSuccess: '프로젝트가 복제되었습니다',
  projectCloneError: '프로젝트 복제에 실패했습니다',
};

// ============================================
// 일반 메시지
// ============================================
export const GENERAL_MESSAGES = {
  // 복사
  copiedToClipboard: '클립보드에 복사되었습니다',

  // 검색
  noSearchResults: '검색 결과가 없습니다',

  // 브라우저
  unsupportedBrowser: '일부 기능이 제한될 수 있습니다',

  // 저장 공간
  storageFull: '로컬 저장 공간이 부족합니다',

  // 기타
  comingSoon: '곧 출시됩니다',
  maintenanceMode: '시스템 점검 중입니다',
};

// ============================================
// 에러 코드 → 메시지 매핑
// ============================================
export const ERROR_CODE_MESSAGES = {
  // 400번대
  'BAD_REQUEST': '잘못된 요청입니다',
  'VALIDATION_ERROR': VALIDATION_MESSAGES.checkInputs,
  'UNAUTHORIZED': AUTH_MESSAGES.unauthorized,
  'FORBIDDEN': AUTH_MESSAGES.forbidden,
  'NOT_FOUND': '요청한 리소스를 찾을 수 없습니다',
  'CONFLICT': '이미 존재하는 데이터입니다',
  'DUPLICATE_EMAIL': AUTH_MESSAGES.registerErrorDuplicateEmail,

  // 500번대
  'INTERNAL_SERVER_ERROR': NETWORK_MESSAGES.serverError,
  'SERVICE_UNAVAILABLE': '서비스를 일시적으로 사용할 수 없습니다',
  'GATEWAY_TIMEOUT': NETWORK_MESSAGES.timeoutError,

  // 네트워크
  'NETWORK_ERROR': NETWORK_MESSAGES.networkError,
  'TIMEOUT': NETWORK_MESSAGES.timeoutError,
  'CONNECTION_ERROR': NETWORK_MESSAGES.connectionError,
};

// ============================================
// 유틸리티 함수: 에러 메시지 추출
// ============================================

/**
 * API 에러 응답에서 사용자 친화적인 메시지를 추출합니다.
 *
 * @param {Error} error - Axios 에러 객체
 * @param {string} fallbackMessage - 기본 폴백 메시지
 * @returns {string} 사용자에게 표시할 메시지
 */
export function getErrorMessage(error, fallbackMessage = NETWORK_MESSAGES.unknownError) {
  // 네트워크 에러
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? NETWORK_MESSAGES.timeoutError
      : NETWORK_MESSAGES.connectionError;
  }

  // 서버 응답이 있는 경우
  const { status, data } = error.response;

  // 1. 서버에서 제공한 메시지 (사용자 친화적인 경우)
  if (data?.message && isFriendlyMessage(data.message)) {
    return data.message;
  }

  // 2. 에러 코드로 매핑
  if (data?.code && ERROR_CODE_MESSAGES[data.code]) {
    return ERROR_CODE_MESSAGES[data.code];
  }

  // 3. HTTP 상태 코드로 매핑
  switch (status) {
    case 400:
      return ERROR_CODE_MESSAGES.BAD_REQUEST;
    case 401:
      return AUTH_MESSAGES.unauthorized;
    case 403:
      return AUTH_MESSAGES.forbidden;
    case 404:
      return ERROR_CODE_MESSAGES.NOT_FOUND;
    case 409:
      return ERROR_CODE_MESSAGES.CONFLICT;
    case 500:
      return NETWORK_MESSAGES.serverError;
    case 503:
      return ERROR_CODE_MESSAGES.SERVICE_UNAVAILABLE;
    default:
      return fallbackMessage;
  }
}

/**
 * 메시지가 사용자 친화적인지 확인합니다.
 * (기술적인 에러 메시지를 필터링)
 *
 * @param {string} message
 * @returns {boolean}
 */
function isFriendlyMessage(message) {
  // 기술적 키워드가 포함된 메시지는 사용자 친화적이지 않음
  const technicalKeywords = [
    'error', 'exception', 'stack', 'trace', 'null', 'undefined',
    'ECONNREFUSED', 'ETIMEDOUT', 'ERR_', '500', '404', 'NaN'
  ];

  const lowerMessage = message.toLowerCase();
  return !technicalKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

/**
 * 프로젝트 관련 에러 메시지를 생성합니다.
 *
 * @param {Error} error
 * @returns {string}
 */
export function getProjectErrorMessage(error) {
  return getErrorMessage(error, PROJECT_MESSAGES.loadError);
}

/**
 * 인증 관련 에러 메시지를 생성합니다.
 *
 * @param {Error} error
 * @returns {string}
 */
export function getAuthErrorMessage(error) {
  return getErrorMessage(error, AUTH_MESSAGES.loginError);
}

// ============================================
// Export all
// ============================================
export default {
  PROJECT: PROJECT_MESSAGES,
  AUTH: AUTH_MESSAGES,
  NETWORK: NETWORK_MESSAGES,
  VALIDATION: VALIDATION_MESSAGES,
  EDITOR: EDITOR_MESSAGES,
  SHARE: SHARE_MESSAGES,
  GENERAL: GENERAL_MESSAGES,
  ERROR_CODES: ERROR_CODE_MESSAGES,
  getErrorMessage,
  getProjectErrorMessage,
  getAuthErrorMessage,
};

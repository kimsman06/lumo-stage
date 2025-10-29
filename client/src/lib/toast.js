/**
 * Toast 유틸리티 함수
 *
 * sonner를 래핑하여 프로젝트 전체에서 일관된 Toast를 사용합니다.
 * 중복 방지, 메시지 표준화, 타입별 기본 설정 등을 제공합니다.
 */

import { toast as sonnerToast } from 'sonner';
import MESSAGES from './toast-messages';

// ============================================
// Toast 설정 상수
// ============================================
const TOAST_CONFIG = {
  // 지속 시간 (밀리초)
  duration: {
    success: 3000,
    error: 5000,
    info: 3000,
    warning: 5000,
    loading: Infinity,
  },

  // 최대 동시 표시 개수
  maxToasts: 3,

  // 중복 방지 캐시 만료 시간 (밀리초)
  cacheExpiry: 1000,
};

// ============================================
// 중복 방지 캐시
// ============================================
const toastCache = new Set();

/**
 * Toast 중복 확인
 *
 * @param {string} message
 * @param {string} type
 * @returns {boolean} 중복이면 true
 */
function isDuplicate(message, type) {
  const key = `${type}-${message}`;
  return toastCache.has(key);
}

/**
 * Toast 캐시에 추가
 *
 * @param {string} message
 * @param {string} type
 * @param {number} duration
 */
function addToCache(message, type, duration) {
  const key = `${type}-${message}`;
  toastCache.add(key);

  // 캐시 만료 후 삭제
  setTimeout(() => {
    toastCache.delete(key);
  }, Math.min(duration, TOAST_CONFIG.cacheExpiry));
}

// ============================================
// 기본 Toast 래퍼
// ============================================

/**
 * 성공 Toast
 *
 * @param {string} message - 표시할 메시지
 * @param {Object} options - sonner toast 옵션
 * @returns {string|number} Toast ID
 */
export function success(message, options = {}) {
  const duration = options.duration || TOAST_CONFIG.duration.success;

  if (isDuplicate(message, 'success')) {
    return null;
  }

  addToCache(message, 'success', duration);

  return sonnerToast.success(message, {
    duration,
    ...options,
  });
}

/**
 * 에러 Toast
 *
 * @param {string} message - 표시할 메시지
 * @param {Object} options - sonner toast 옵션
 * @returns {string|number} Toast ID
 */
export function error(message, options = {}) {
  const duration = options.duration || TOAST_CONFIG.duration.error;

  if (isDuplicate(message, 'error')) {
    return null;
  }

  addToCache(message, 'error', duration);

  return sonnerToast.error(message, {
    duration,
    ariaLive: 'assertive', // 스크린 리더에서 즉시 읽음
    ...options,
  });
}

/**
 * 정보 Toast
 *
 * @param {string} message - 표시할 메시지
 * @param {Object} options - sonner toast 옵션
 * @returns {string|number} Toast ID
 */
export function info(message, options = {}) {
  const duration = options.duration || TOAST_CONFIG.duration.info;

  if (isDuplicate(message, 'info')) {
    return null;
  }

  addToCache(message, 'info', duration);

  return sonnerToast.info(message, {
    duration,
    ...options,
  });
}

/**
 * 경고 Toast
 *
 * @param {string} message - 표시할 메시지
 * @param {Object} options - sonner toast 옵션
 * @returns {string|number} Toast ID
 */
export function warning(message, options = {}) {
  const duration = options.duration || TOAST_CONFIG.duration.warning;

  if (isDuplicate(message, 'warning')) {
    return null;
  }

  addToCache(message, 'warning', duration);

  return sonnerToast.warning(message, {
    duration,
    ...options,
  });
}

/**
 * 로딩 Toast
 *
 * @param {string} message - 표시할 메시지
 * @param {Object} options - sonner toast 옵션
 * @returns {string|number} Toast ID
 */
export function loading(message, options = {}) {
  return sonnerToast.loading(message, {
    duration: TOAST_CONFIG.duration.loading,
    ...options,
  });
}

/**
 * Promise 기반 Toast
 *
 * 로딩 → 성공/실패 자동 전환
 *
 * @param {Promise} promise - 비동기 작업
 * @param {Object} messages - { loading, success, error }
 * @param {Object} options - sonner toast 옵션
 * @returns {string|number} Toast ID
 */
export function promise(promiseOrFn, messages, options = {}) {
  return sonnerToast.promise(promiseOrFn, {
    loading: messages.loading,
    success: messages.success,
    error: (err) => {
      // 에러 객체인 경우 메시지 추출
      if (typeof messages.error === 'function') {
        return messages.error(err);
      }
      return messages.error;
    },
    ...options,
  });
}

/**
 * Toast 업데이트 (기존 Toast를 다른 상태로 변경)
 *
 * @param {string|number} toastId - 업데이트할 Toast ID
 * @param {Object} options - 업데이트할 옵션
 */
export function update(toastId, options) {
  // sonner는 ID를 통해 Toast를 업데이트할 수 있음
  return sonnerToast.success(options.message, {
    id: toastId,
    ...options,
  });
}

/**
 * Toast 닫기
 *
 * @param {string|number} toastId - 닫을 Toast ID (생략 시 모두 닫기)
 */
export function dismiss(toastId) {
  return sonnerToast.dismiss(toastId);
}

// ============================================
// 프로젝트 관련 Toast
// ============================================

/**
 * 프로젝트 생성 Toast (Promise 기반)
 *
 * @param {Promise} createPromise
 * @returns {string|number} Toast ID
 */
export function projectCreate(createPromise) {
  return promise(createPromise, {
    loading: MESSAGES.PROJECT.createLoading,
    success: MESSAGES.PROJECT.createSuccess,
    error: (err) => {
      const errorMsg = MESSAGES.getProjectErrorMessage(err);
      return `${MESSAGES.PROJECT.createError}. ${errorMsg}`;
    },
  });
}

/**
 * 프로젝트 저장 Toast (Promise 기반)
 *
 * @param {Promise} savePromise
 * @returns {string|number} Toast ID
 */
export function projectSave(savePromise) {
  return promise(savePromise, {
    loading: MESSAGES.PROJECT.saveLoading,
    success: MESSAGES.PROJECT.saveSuccess,
    error: (err) => {
      const errorMsg = MESSAGES.getProjectErrorMessage(err);
      return `${MESSAGES.PROJECT.saveError}. ${errorMsg}`;
    },
  });
}

/**
 * 프로젝트 삭제 Toast (Promise 기반)
 *
 * @param {Promise} deletePromise
 * @returns {string|number} Toast ID
 */
export function projectDelete(deletePromise) {
  return promise(deletePromise, {
    loading: MESSAGES.PROJECT.deleteLoading,
    success: MESSAGES.PROJECT.deleteSuccess,
    error: (err) => {
      const errorMsg = MESSAGES.getProjectErrorMessage(err);
      return `${MESSAGES.PROJECT.deleteError}. ${errorMsg}`;
    },
  });
}

/**
 * 프로젝트 수정 성공 Toast
 */
export function projectUpdateSuccess() {
  return success(MESSAGES.PROJECT.updateSuccess);
}

/**
 * 프로젝트 수정 실패 Toast
 *
 * @param {Error} err
 */
export function projectUpdateError(err) {
  const errorMsg = MESSAGES.getProjectErrorMessage(err);
  return error(`${MESSAGES.PROJECT.updateError}. ${errorMsg}`);
}

// ============================================
// 인증 관련 Toast
// ============================================

/**
 * 로그인 성공 Toast
 *
 * @param {string} username
 */
export function loginSuccess(username) {
  return success(MESSAGES.AUTH.loginSuccess(username));
}

/**
 * 로그인 실패 Toast
 *
 * @param {Error} err
 */
export function loginError(err) {
  const errorMsg = MESSAGES.getAuthErrorMessage(err);
  return error(errorMsg || MESSAGES.AUTH.loginError);
}

/**
 * 회원가입 성공 Toast
 */
export function registerSuccess() {
  return success(MESSAGES.AUTH.registerSuccess);
}

/**
 * 회원가입 실패 Toast
 *
 * @param {Error} err
 */
export function registerError(err) {
  const errorMsg = MESSAGES.getAuthErrorMessage(err);
  return error(errorMsg || MESSAGES.AUTH.registerError);
}

/**
 * 로그아웃 성공 Toast
 */
export function logoutSuccess() {
  return success(MESSAGES.AUTH.logoutSuccess);
}

/**
 * 세션 만료 Toast
 */
export function sessionExpired() {
  return warning(MESSAGES.AUTH.sessionExpired, {
    duration: 6000,
  });
}

/**
 * 권한 없음 Toast
 */
export function forbidden() {
  return error(MESSAGES.AUTH.forbidden);
}

// ============================================
// 에디터 관련 Toast
// ============================================

/**
 * 자동 저장 Toast (debounced)
 *
 * 자동 저장은 빈번하게 발생하므로 마지막 것만 표시
 */
let autoSaveToastId = null;

export function autoSave(savePromise) {
  // 기존 자동 저장 Toast가 있으면 닫기
  if (autoSaveToastId) {
    dismiss(autoSaveToastId);
  }

  autoSaveToastId = promise(savePromise, {
    loading: MESSAGES.PROJECT.autoSaveLoading,
    success: MESSAGES.PROJECT.autoSaveSuccess,
    error: MESSAGES.PROJECT.autoSaveError,
  }, {
    duration: 2000, // 성공 시 2초만 표시
  });

  return autoSaveToastId;
}

/**
 * 단축키 힌트 Toast
 */
export function shortcutHint() {
  return info(MESSAGES.EDITOR.shortcutHint, {
    duration: 4000,
  });
}

/**
 * 저장되지 않은 변경사항 경고 Toast
 */
export function unsavedChanges() {
  return warning(MESSAGES.EDITOR.unsavedChanges);
}

// ============================================
// 네트워크 에러 Toast
// ============================================

/**
 * 네트워크 에러 Toast (재시도 버튼 포함)
 *
 * @param {Function} retryFn - 재시도 함수
 */
export function networkError(retryFn) {
  return error(MESSAGES.NETWORK.connectionError, {
    action: retryFn ? {
      label: '다시 시도',
      onClick: retryFn,
    } : undefined,
    duration: 6000,
  });
}

/**
 * 서버 에러 Toast
 */
export function serverError() {
  return error(MESSAGES.NETWORK.serverError, {
    duration: 6000,
  });
}

// ============================================
// 일반 Toast
// ============================================

/**
 * 클립보드 복사 Toast
 */
export function copiedToClipboard() {
  return success(MESSAGES.GENERAL.copiedToClipboard, {
    duration: 2000,
  });
}

/**
 * 검색 결과 없음 Toast
 */
export function noSearchResults() {
  return info(MESSAGES.GENERAL.noSearchResults);
}

// ============================================
// 커스텀 Toast (고급)
// ============================================

/**
 * 액션 버튼이 있는 Toast
 *
 * @param {string} message
 * @param {Object} action - { label, onClick }
 * @param {string} type - 'success' | 'error' | 'info' | 'warning'
 * @param {Object} options
 */
export function withAction(message, action, type = 'info', options = {}) {
  return sonnerToast[type](message, {
    action: {
      label: action.label,
      onClick: action.onClick,
    },
    ...options,
  });
}

/**
 * 에러 Toast with 재시도 버튼
 *
 * @param {string} message
 * @param {Function} retryFn
 * @param {Object} options
 */
export function errorWithRetry(message, retryFn, options = {}) {
  return error(message, {
    action: {
      label: '다시 시도',
      onClick: retryFn,
    },
    duration: 6000,
    ...options,
  });
}

/**
 * 에러 Toast with 새로고침 버튼
 *
 * @param {string} message
 * @param {Object} options
 */
export function errorWithRefresh(message, options = {}) {
  return error(message, {
    action: {
      label: '새로고침',
      onClick: () => window.location.reload(),
    },
    duration: Infinity, // 수동으로 닫을 때까지 유지
    ...options,
  });
}

// ============================================
// Export
// ============================================
export default {
  success,
  error,
  info,
  warning,
  loading,
  promise,
  update,
  dismiss,

  // 프로젝트
  project: {
    create: projectCreate,
    save: projectSave,
    delete: projectDelete,
    updateSuccess: projectUpdateSuccess,
    updateError: projectUpdateError,
  },

  // 인증
  auth: {
    loginSuccess,
    loginError,
    registerSuccess,
    registerError,
    logoutSuccess,
    sessionExpired,
    forbidden,
  },

  // 에디터
  editor: {
    autoSave,
    shortcutHint,
    unsavedChanges,
  },

  // 네트워크
  network: {
    error: networkError,
    serverError,
  },

  // 일반
  general: {
    copiedToClipboard,
    noSearchResults,
  },

  // 커스텀
  withAction,
  errorWithRetry,
  errorWithRefresh,
};

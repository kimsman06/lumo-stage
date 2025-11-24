/**
 * AI 프리비주얼 API 클라이언트
 *
 * AI 이미지 생성 관련 API 엔드포인트를 호출합니다.
 */

import api from './api';

/**
 * Base64 이미지를 Blob으로 변환
 */
async function base64ToBlob(base64) {
  const response = await fetch(base64);
  return response.blob();
}

/**
 * API 키 저장
 *
 * @param {string} apiKey - AI 서비스 API 키
 * @returns {Promise<Object>} 저장 결과
 */
export async function saveApiKey(apiKey) {
  const response = await api.post('/ai/api-key', { apiKey });
  return response.data;
}

/**
 * API 키 존재 여부 확인
 *
 * @returns {Promise<Object>} { hasApiKey: boolean }
 */
export async function getApiKeyStatus() {
  const response = await api.get('/ai/api-key/status');
  return response.data;
}

/**
 * API 키 삭제
 *
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteApiKey() {
  const response = await api.delete('/ai/api-key');
  return response.data;
}

/**
 * 프리비주얼 생성 요청
 *
 * @param {Object} params - 생성 파라미터
 * @param {string} params.projectId - 프로젝트 ID
 * @param {string} params.image - Base64 인코딩된 소스 이미지
 * @param {string} params.prompt - 생성 프롬프트
 * @param {string} params.negativePrompt - 네거티브 프롬프트
 * @param {number} params.strength - 이미지 변환 강도 (0.1-1.0)
 * @param {number} params.steps - 생성 스텝 수 (10-50)
 * @param {number} params.guidanceScale - 가이던스 스케일 (1-20)
 * @returns {Promise<Object>} { id: string, status: 'pending' }
 */
export async function createPrevisualization(params) {
  const formData = new FormData();

  // Base64 이미지를 Blob으로 변환하여 파일로 첨부
  if (params.image) {
    const blob = await base64ToBlob(params.image);
    formData.append('sceneRender', blob, 'scene.png');
  }

  // 기본 필드들
  if (params.projectId) {
    formData.append('projectId', params.projectId);
  }
  formData.append('prompt', params.prompt);

  if (params.negativePrompt) {
    formData.append('negativePrompt', params.negativePrompt);
  }

  // 생성 파라미터
  const generationParams = {
    strength: params.strength,
    steps: params.steps,
    guidanceScale: params.guidanceScale,
  };
  if (params.aspectRatio) {
    generationParams.aspectRatio = params.aspectRatio;
  }
  if (params.model) {
    generationParams.model = params.model;
  }
  formData.append('generationParams', JSON.stringify(generationParams));

  const response = await api.post('/ai/previsualize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

/**
 * 프리비주얼 생성 상태 조회
 *
 * @param {string} id - 프리비주얼 ID
 * @returns {Promise<Object>} 생성 상태 및 결과
 */
export async function getPrevisualizationStatus(id) {
  const response = await api.get(`/ai/previsualize/${id}`);
  return response.data;
}

/**
 * 프리비주얼 히스토리 조회
 *
 * @param {Object} params - 조회 파라미터
 * @param {string} params.projectId - 프로젝트 ID (선택)
 * @param {number} params.limit - 조회 개수 (기본: 20)
 * @param {number} params.offset - 오프셋 (기본: 0)
 * @returns {Promise<Object>} { items: Array, total: number }
 */
export async function getPrevisualizations(params = {}) {
  const response = await api.get('/ai/previsualizations', { params });
  return response.data;
}

/**
 * 프롬프트 변경하여 재생성
 *
 * @param {string} id - 원본 프리비주얼 ID
 * @param {Object} params - 재생성 파라미터
 * @param {string} params.prompt - 새 프롬프트
 * @param {string} params.negativePrompt - 새 네거티브 프롬프트
 * @param {number} params.strength - 이미지 변환 강도
 * @param {number} params.steps - 생성 스텝 수
 * @param {number} params.guidanceScale - 가이던스 스케일
 * @returns {Promise<Object>} { id: string, status: 'pending' }
 */
export async function iteratePrevisualization(id, params) {
  const payload = {
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    generationParams: {
      strength: params.strength,
      steps: params.steps,
      guidanceScale: params.guidanceScale,
    },
  };

  if (params.aspectRatio) {
    payload.generationParams.aspectRatio = params.aspectRatio;
  }
  if (params.model) {
    payload.generationParams.model = params.model;
  }

  const response = await api.post(`/ai/previsualize/${id}/iterate`, payload);
  return response.data;
}

/**
 * 프리비주얼 삭제
 *
 * @param {string} id - 프리비주얼 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deletePrevisualization(id) {
  const response = await api.delete(`/ai/previsualize/${id}`);
  return response.data;
}

/**
 * 사용량 통계 조회
 *
 * @returns {Promise<Object>} 사용량 통계
 */
export async function getUsageStats() {
  const response = await api.get('/ai/usage');
  return response.data;
}

export default {
  saveApiKey,
  getApiKeyStatus,
  deleteApiKey,
  createPrevisualization,
  getPrevisualizationStatus,
  getPrevisualizations,
  iteratePrevisualization,
  deletePrevisualization,
  getUsageStats,
};

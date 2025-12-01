/**
 * Asset API 클라이언트
 *
 * HDRI 및 GLTF 파일 업로드, 조회, 삭제 등의 API 호출을 담당합니다.
 */

import api from './api';

/**
 * HDRI 파일 업로드
 *
 * @param {string} projectId - 프로젝트 ID
 * @param {File} file - 업로드할 HDRI 파일
 * @returns {Promise<Object>} { success, asset }
 */
export async function uploadHdri(projectId, file) {
  try {
    const mimeType = file.type || 'application/octet-stream';

    const initResponse = await api.post('/assets/upload-hdri/init', {
      projectId,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
    });

    const { uploadUrl, headers, fileKey } = initResponse.data || {};

    if (!uploadUrl || !fileKey) {
      throw new Error('업로드 URL을 생성하지 못했습니다.');
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        ...(headers || {}),
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(errorText || '스토리지 업로드에 실패했습니다.');
    }

    const finalizeResponse = await api.post('/assets/upload-hdri/complete', {
      projectId,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      fileKey,
    });

    return {
      success: true,
      asset: finalizeResponse.data.asset,
    };
  } catch (error) {
    console.error('HDRI 업로드 실패:', error);
    return {
      success: false,
      error: error.response?.data?.message || '파일 업로드에 실패했습니다.',
    };
  }
}

/**
 * GLTF 파일 업로드
 *
 * @param {string} projectId - 프로젝트 ID
 * @param {File} file - 업로드할 GLTF 파일
 * @param {string} compression - 압축 옵션 (optional)
 * @returns {Promise<Object>} { success, asset }
 */
export async function uploadGltf(projectId, file, compression = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    if (compression) {
      formData.append('compression', compression);
    }

    // axios는 FormData를 감지하면 자동으로 Content-Type을 설정합니다.
    // 수동으로 설정하면 boundary가 포함되지 않아 오류가 발생할 수 있습니다.
    const response = await api.post('/assets/upload-gltf', formData);

    return {
      success: true,
      asset: response.data.asset,
    };
  } catch (error) {
    console.error('GLTF 업로드 실패:', error);
    return {
      success: false,
      error: error.response?.data?.message || '파일 업로드에 실패했습니다.',
    };
  }
}

/**
 * 프로젝트별 Asset 목록 조회
 *
 * @param {string} projectId - 프로젝트 ID
 * @returns {Promise<Object>} { success, assets }
 */
export async function getProjectAssets(projectId) {
  try {
    const response = await api.get(`/assets/project/${projectId}`);

    return {
      success: true,
      assets: response.data.assets || [],
    };
  } catch (error) {
    console.error('Asset 목록 조회 실패:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Asset 목록을 불러올 수 없습니다.',
      assets: [],
    };
  }
}

/**
 * Asset 삭제
 *
 * @param {string} assetId - 삭제할 Asset ID
 * @returns {Promise<Object>} { success }
 */
export async function deleteAsset(assetId) {
  try {
    await api.delete(`/assets/${assetId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Asset 삭제 실패:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Asset을 삭제할 수 없습니다.',
    };
  }
}

export default {
  uploadHdri,
  uploadGltf,
  getProjectAssets,
  deleteAsset,
};

/**
 * Three.js Canvas 캡처 유틸리티
 *
 * WebGL renderer에서 이미지 데이터를 추출하여
 * Base64 또는 Blob 형태로 반환합니다.
 */

import { computeLetterbox, getAspectRatioValue } from "./aspectRatio";

/**
 * Canvas를 Base64 이미지로 캡처
 *
 * @param {HTMLCanvasElement} canvas - Three.js 캔버스 요소
 * @param {string} format - 이미지 포맷 ('image/png' | 'image/jpeg')
 * @param {number} quality - JPEG 품질 (0-1, PNG에서는 무시됨)
 * @returns {string} Base64 인코딩된 이미지 데이터
 */
export function captureToBase64(canvas, format = 'image/png', quality = 0.92) {
  if (!canvas) {
    throw new Error('Canvas element is required');
  }

  // WebGL context에서 preserveDrawingBuffer가 false인 경우
  // 다음 프레임 렌더링 전에 캡처해야 함
  return canvas.toDataURL(format, quality);
}

/**
 * Canvas를 Blob으로 캡처
 *
 * @param {HTMLCanvasElement} canvas - Three.js 캔버스 요소
 * @param {string} format - 이미지 포맷 ('image/png' | 'image/jpeg')
 * @param {number} quality - JPEG 품질 (0-1, PNG에서는 무시됨)
 * @returns {Promise<Blob>} 이미지 Blob
 */
export function captureToBlob(canvas, format = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error('Canvas element is required'));
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Three.js Scene을 캡처
 *
 * React-Three-Fiber의 Canvas 컴포넌트에서 캔버스를 찾아 캡처합니다.
 *
 * @param {Object} options - 캡처 옵션
 * @param {string} options.format - 이미지 포맷 ('png' | 'jpeg')
 * @param {number} options.quality - JPEG 품질 (0-1)
 * @param {boolean} options.asBlob - Blob으로 반환할지 여부
 * @param {boolean} options.cropToAspect - 설정한 카메라 비율에 맞춰 크롭할지 여부
 * @param {string|number} options.aspectRatio - '16:9' 형식 또는 숫자 비율
 * @returns {Promise<string|Blob>} Base64 문자열 또는 Blob
 */
export async function captureScene(options = {}) {
  const {
    format = 'png',
    quality = 0.92,
    asBlob = false,
    cropToAspect = false,
    aspectRatio,
  } = options;

  // R3F Canvas를 찾음
  const canvas = document.querySelector('canvas');

  if (!canvas) {
    throw new Error('Canvas element not found. Make sure the 3D scene is rendered.');
  }

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

  let targetCanvas = canvas;

  if (cropToAspect) {
    const ratioValue = typeof aspectRatio === 'number'
      ? aspectRatio
      : getAspectRatioValue(aspectRatio);

    if (ratioValue) {
      const rect = canvas.getBoundingClientRect();
      const cssWidth = rect.width || canvas.clientWidth || canvas.width;
      const cssHeight = rect.height || canvas.clientHeight || canvas.height;

      // Three.js는 devicePixelRatio를 곱한 해상도로 렌더링하므로
      // CSS 픽셀 기준으로 안전영역을 계산한 뒤 물리 픽셀로 다시 환산한다.
      const pixelRatioX = cssWidth ? canvas.width / cssWidth : 1;
      const pixelRatioY = cssHeight ? canvas.height / cssHeight : 1;

      const safeArea = computeLetterbox(cssWidth, cssHeight, ratioValue);
      const viewportWidth = Math.round(
        (safeArea.viewportWidth || cssWidth) * pixelRatioX
      );
      const viewportHeight = Math.round(
        (safeArea.viewportHeight || cssHeight) * pixelRatioY
      );

      if (viewportWidth > 0 && viewportHeight > 0) {
        const offsetX = Math.round((safeArea.offsetX || 0) * pixelRatioX);
        const offsetY = Math.round((safeArea.offsetY || 0) * pixelRatioY);

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = viewportWidth;
        croppedCanvas.height = viewportHeight;
        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(
          canvas,
          offsetX,
          offsetY,
          viewportWidth,
          viewportHeight,
          0,
          0,
          viewportWidth,
          viewportHeight
        );

        targetCanvas = croppedCanvas;
      }
    }
  }

  if (asBlob) {
    return captureToBlob(targetCanvas, mimeType, quality);
  }

  return captureToBase64(targetCanvas, mimeType, quality);
}

/**
 * 캡처된 이미지를 다운로드
 *
 * @param {string|Blob} imageData - Base64 문자열 또는 Blob
 * @param {string} filename - 파일명 (확장자 포함)
 */
export function downloadImage(imageData, filename = 'capture.png') {
  const link = document.createElement('a');

  if (typeof imageData === 'string') {
    // Base64 문자열인 경우
    link.href = imageData;
  } else {
    // Blob인 경우
    link.href = URL.createObjectURL(imageData);
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Blob URL 해제
  if (typeof imageData !== 'string') {
    URL.revokeObjectURL(link.href);
  }
}

/**
 * 캡처된 이미지를 리사이즈
 *
 * @param {string} base64Image - Base64 인코딩된 이미지
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @returns {Promise<string>} 리사이즈된 Base64 이미지
 */
export function resizeImage(base64Image, maxWidth = 1024, maxHeight = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // 비율 유지하면서 리사이즈
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = base64Image;
  });
}

export default {
  captureToBase64,
  captureToBlob,
  captureScene,
  downloadImage,
  resizeImage,
};

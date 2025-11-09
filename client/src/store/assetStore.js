/**
 * Asset Store (Zustand)
 *
 * HDRI 및 GLTF Asset의 상태 관리를 담당합니다.
 * - Asset 목록 로드
 * - HDRI/GLTF 업로드
 * - Asset 삭제
 * - Scene에 적용할 HDRI 및 GLTF 모델 선택
 */

import { create } from 'zustand';
import * as assetApi from '../lib/assetApi';
import { normalizeAsset, getAssetId } from '@/lib/assetUtils';

const buildAssetSnapshot = (asset) => {
  const normalized = normalizeAsset(asset);
  if (!normalized) {
    return null;
  }

  return {
    id: normalized.id,
    _id: normalized.id,
    type: normalized.type || null,
    fileName: normalized.fileName || null,
    fileUrl: normalized.fileUrl || null,
    fileSize: normalized.fileSize || null,
    mimeType: normalized.mimeType || null,
    metadata: normalized.metadata || null,
    projectId: normalized.projectId || null,
    owner: normalized.owner || null,
    storageProvider: normalized.storageProvider || null,
    thumbnailUrl: normalized.thumbnailUrl || normalized.previewUrl || null,
    uploadedAt: normalized.uploadedAt || null,
    updatedAt: normalized.updatedAt || null,
  };
};

const useAssetStore = create((set, get) => ({
  // 상태
  assets: [],
  isLoading: false,
  error: null,
  currentHdri: null, // Scene에 적용할 HDRI Asset ID
  currentGltfModels: [], // Scene에 추가된 GLTF 모델 배열 [{ assetId, position, rotation, scale }]

  // Asset 목록 로드
  loadAssets: async (projectId) => {
    if (!projectId) return;

    set({ isLoading: true, error: null });

    const result = await assetApi.getProjectAssets(projectId);

    if (result.success) {
      const normalizedAssets = (result.assets || []).map(normalizeAsset).filter(Boolean);
      set({ assets: normalizedAssets, isLoading: false });
    } else {
      set({ error: result.error, isLoading: false });
    }
  },

  // HDRI 업로드
  uploadHdri: async (projectId, file) => {
    if (!projectId || !file) return { success: false };

    set({ isLoading: true, error: null });

    const result = await assetApi.uploadHdri(projectId, file);

    let finalResult = result;

    if (result.success && result.asset) {
      const normalizedAsset = normalizeAsset(result.asset);

      set((state) => ({
        assets: [...state.assets, normalizedAsset],
        isLoading: false,
      }));

      finalResult = { ...result, asset: normalizedAsset };
    } else {
      set({ error: result.error, isLoading: false });
    }

    return finalResult;
  },

  // GLTF 업로드
  uploadGltf: async (projectId, file, compression = null) => {
    if (!projectId || !file) return { success: false };

    set({ isLoading: true, error: null });

    const result = await assetApi.uploadGltf(projectId, file, compression);

    let finalResult = result;

    if (result.success && result.asset) {
      const normalizedAsset = normalizeAsset(result.asset);

      set((state) => ({
        assets: [...state.assets, normalizedAsset],
        isLoading: false,
      }));

      finalResult = { ...result, asset: normalizedAsset };
    } else {
      set({ error: result.error, isLoading: false });
    }

    return finalResult;
  },

  // Asset 삭제
  deleteAsset: async (assetOrId) => {
    const assetId = getAssetId(assetOrId);
    if (!assetId) return { success: false };

    set({ isLoading: true, error: null });

    const result = await assetApi.deleteAsset(assetId);

    if (result.success) {
      set((state) => {
        const updatedAssets = state.assets.filter(
          (asset) => getAssetId(asset) !== assetId
        );
        const updatedCurrentHdri =
          state.currentHdri === assetId ? null : state.currentHdri;
        const updatedGltfModels = state.currentGltfModels.filter(
          (model) => model.assetId !== assetId
        );

        return {
          assets: updatedAssets,
          currentHdri: updatedCurrentHdri,
          currentGltfModels: updatedGltfModels,
          isLoading: false,
        };
      });
    } else {
      set({ error: result.error, isLoading: false });
    }

    return result;
  },

  // Scene에 적용할 HDRI 선택
  setCurrentHdri: (assetOrId) => {
    const assetId = getAssetId(assetOrId);
    set({ currentHdri: assetId });
  },

  // Scene에 GLTF 모델 추가
  addGltfModel: (
    assetOrId,
    position = [0, -1.5, 2],
    rotation = [0, 0, 0],
    scale = [1, 1, 1]
  ) => {
    const assetId = getAssetId(assetOrId);
    if (!assetId) {
      return;
    }

    set((state) => {
      // 이미 추가된 모델인지 확인
      const alreadyAdded = state.currentGltfModels.some(
        (model) => model.assetId === assetId
      );

      if (alreadyAdded) {
        return state; // 중복 추가 방지
      }

      return {
        currentGltfModels: [
          ...state.currentGltfModels,
          { assetId, position, rotation, scale },
        ],
      };
    });
  },

  // Scene에서 GLTF 모델 제거
  removeGltfModel: (assetOrId) => {
    const assetId = getAssetId(assetOrId);
    if (!assetId) {
      return;
    }

    set((state) => ({
      currentGltfModels: state.currentGltfModels.filter(
        (model) => model.assetId !== assetId
      ),
    }));
  },

  // GLTF 모델 위치/회전/스케일 업데이트
  updateGltfModel: (assetOrId, property, value) => {
    const assetId = getAssetId(assetOrId);
    if (!assetId) {
      return;
    }

    set((state) => ({
      currentGltfModels: state.currentGltfModels.map((model) =>
        model.assetId === assetId ? { ...model, [property]: value } : model
      ),
    }));
  },

  // GLTF 모델 가시성 업데이트
  setGltfModelVisibility: (assetOrId, visible) => {
    const assetId = getAssetId(assetOrId);
    if (!assetId) {
      return;
    }

    set((state) => ({
      currentGltfModels: state.currentGltfModels.map((model) =>
        model.assetId === assetId ? { ...model, visible } : model
      ),
    }));
  },

  // 스토어 초기화 (프로젝트 변경 시)
  reset: () => {
    set({
      assets: [],
      isLoading: false,
      error: null,
      currentHdri: null,
      currentGltfModels: [],
    });
  },

  // Scene 데이터 로드 (프로젝트 로드 시)
  loadAssetSceneData: (assetSceneData) => {
    if (!assetSceneData) return;

    const normalizedHdri = getAssetId(assetSceneData.currentHdri) || null;
    const normalizedModels = (assetSceneData.currentGltfModels || [])
      .map((model) => {
        const assetId = getAssetId(model.assetId);
        if (!assetId) {
          return null;
        }
        return { ...model, assetId };
      })
      .filter(Boolean);

    const assetsCatalog = Array.isArray(assetSceneData.assetsCatalog)
      ? assetSceneData.assetsCatalog.map(buildAssetSnapshot).filter(Boolean)
      : [];

    set({
      currentHdri: normalizedHdri,
      currentGltfModels: normalizedModels,
      assets: assetsCatalog,
    });
  },

  // Scene 데이터 추출 (프로젝트 저장 시)
  getAssetSceneData: () => {
    const state = get();
    const referencedAssetIds = new Set();

    if (state.currentHdri) {
      referencedAssetIds.add(getAssetId(state.currentHdri));
    }

    state.currentGltfModels.forEach((model) => {
      const assetId = getAssetId(model.assetId);
      if (assetId) {
        referencedAssetIds.add(assetId);
      }
    });

    const assetsCatalog = state.assets
      .filter((asset) => referencedAssetIds.has(getAssetId(asset)))
      .map(buildAssetSnapshot)
      .filter(Boolean);

    return {
      currentHdri: state.currentHdri,
      currentGltfModels: state.currentGltfModels,
      assetsCatalog,
    };
  },
}));

export default useAssetStore;

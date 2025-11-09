/**
 * AssetControl 컴포넌트
 *
 * HDRI 및 GLTF 파일을 업로드하고 관리하는 UI를 제공합니다.
 * - HDRI 업로드 및 Scene 적용
 * - GLTF 업로드 및 Scene 추가
 * - Asset 목록 표시 및 삭제
 */

import React, { useState, useRef } from "react";
import { Upload, Trash2, Image, Box, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CenteredAlertDialogContent } from "@/components/ui/centered-alert-dialog";
import useAssetStore from "@/store/assetStore";
import toast from "@/lib/toast";
import { getAssetId } from "@/lib/assetUtils";

const MAX_HDRI_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_GLTF_SIZE = 100 * 1024 * 1024; // 100MB

const HDRI_EXTENSIONS = [".hdr", ".exr"];
const GLTF_EXTENSIONS = [".glb"];

const buildStableAssetKey = (asset, prefix) => {
  if (!asset) return `${prefix}-missing`;
  const assetId = getAssetId(asset);
  if (assetId) return assetId;
  return `${prefix}-${asset.fileName || "asset"}-${
    asset.updatedAt || asset.createdAt || asset.fileSize || "unknown"
  }`;
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 파일 확장자 검증
 */
function validateFileExtension(file, allowedExtensions) {
  const fileName = file.name.toLowerCase();
  return allowedExtensions.some((ext) => fileName.endsWith(ext));
}

function AssetControl({ projectId }) {
  const {
    assets,
    isLoading,
    currentHdri,
    currentGltfModels,
    uploadHdri,
    uploadGltf,
    deleteAsset,
    setCurrentHdri,
    addGltfModel,
    removeGltfModel,
  } = useAssetStore();

  const hdriInputRef = useRef(null);
  const gltfInputRef = useRef(null);

  const [uploadingHdri, setUploadingHdri] = useState(false);
  const [uploadingGltf, setUploadingGltf] = useState(false);

  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // HDRI 파일 선택
  const handleHdriFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    if (!validateFileExtension(file, HDRI_EXTENSIONS)) {
      toast.error(
        "지원하지 않는 파일 형식입니다. .hdr 또는 .exr 파일을 선택하세요."
      );
      event.target.value = ""; // 입력 초기화
      return;
    }

    // 파일 크기 검증
    if (file.size > MAX_HDRI_SIZE) {
      toast.error(
        `파일 크기가 너무 큽니다. 최대 ${formatFileSize(
          MAX_HDRI_SIZE
        )}까지 업로드할 수 있습니다.`
      );
      event.target.value = "";
      return;
    }

    setUploadingHdri(true);

    const uploadPromise = uploadHdri(projectId, file);
    toast.promise(uploadPromise, {
      loading: "HDRI 파일을 업로드하는 중...",
      success: "HDRI 파일이 업로드되었습니다.",
      error: (err) => err.error || "HDRI 업로드에 실패했습니다.",
    });

    const result = await uploadPromise;

    setUploadingHdri(false);
    event.target.value = ""; // 입력 초기화

    // 업로드 성공 시 자동으로 Scene에 적용
    if (result.success && result.asset) {
      setCurrentHdri(result.asset);
    }
  };

  // GLTF 파일 선택
  const handleGltfFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    if (!validateFileExtension(file, GLTF_EXTENSIONS)) {
      toast.error("지원하지 않는 파일 형식입니다. .glb 파일을 선택하세요.");
      event.target.value = "";
      return;
    }

    // 파일 크기 검증
    if (file.size > MAX_GLTF_SIZE) {
      toast.error(
        `파일 크기가 너무 큽니다. 최대 ${formatFileSize(
          MAX_GLTF_SIZE
        )}까지 업로드할 수 있습니다.`
      );
      event.target.value = "";
      return;
    }

    setUploadingGltf(true);

    const uploadPromise = uploadGltf(projectId, file);
    toast.promise(uploadPromise, {
      loading: "GLTF 파일을 업로드하는 중...",
      success: "GLTF 파일이 업로드되었습니다.",
      error: (err) => err.error || "GLTF 업로드에 실패했습니다.",
    });

    const result = await uploadPromise;

    setUploadingGltf(false);
    event.target.value = "";

    // 업로드 성공 시 자동으로 Scene에 추가
    if (result.success && result.asset) {
      addGltfModel(result.asset);
    }
  };

  // 삭제 다이얼로그 열기
  const openDeleteDialog = (assetId, assetName) => {
    setAssetToDelete({ id: assetId, name: assetName });
    setDeleteDialogOpen(true);
  };

  // Asset 삭제 실행
  const confirmDelete = async () => {
    if (!assetToDelete) return;

    const deletePromise = deleteAsset(assetToDelete.id);
    toast.promise(deletePromise, {
      loading: "파일을 삭제하는 중...",
      success: "파일이 삭제되었습니다.",
      error: (err) => err.error || "파일 삭제에 실패했습니다.",
    });

    await deletePromise;

    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  // HDRI Asset 목록
  const hdriAssets = assets.filter((asset) => asset.type === "hdri");

  // GLTF Asset 목록
  const gltfAssets = assets.filter((asset) => asset.type === "gltf");

  // GLTF 모델이 Scene에 추가되었는지 확인
  const isGltfModelAdded = (assetId) => {
    const normalizedAssetId = getAssetId(assetId);
    if (!normalizedAssetId) return false;
    return currentGltfModels.some((model) => model.assetId === normalizedAssetId);
  };

  return (
    <div className="space-y-6">
      {/* HDRI 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Image className="w-4 h-4" />
            HDRI 환경 맵
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <input
              ref={hdriInputRef}
              type="file"
              accept=".hdr,.exr"
              onChange={handleHdriFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => hdriInputRef.current?.click()}
              disabled={uploadingHdri || isLoading}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadingHdri ? "업로드 중..." : "HDRI 업로드"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              .hdr, .exr 파일 (최대 {formatFileSize(MAX_HDRI_SIZE)})
            </p>
          </div>

          {hdriAssets.length > 0 && (
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {hdriAssets.map((asset) => {
                  const assetId = getAssetId(asset);
                  const isSelected = currentHdri === assetId;

                  return (
                    <div
                      key={buildStableAssetKey(asset, "hdri")}
                      className={`p-2 rounded border flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <button
                        onClick={() => setCurrentHdri(assetId)}
                        className="flex-1 text-left flex items-center gap-2"
                      >
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{asset.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(asset.fileSize)}
                          </p>
                        </div>
                      </button>
                      <Button
                        onClick={() =>
                          openDeleteDialog(assetId, asset.fileName)
                        }
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {hdriAssets.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              업로드된 HDRI가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* GLTF 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Box className="w-4 h-4" />
            3D 모델 (GLB)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <input
              ref={gltfInputRef}
              type="file"
              accept=".glb"
              onChange={handleGltfFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => gltfInputRef.current?.click()}
              disabled={uploadingGltf || isLoading}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadingGltf ? "업로드 중..." : "GLTF 업로드"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              .glb 파일 (최대 {formatFileSize(MAX_GLTF_SIZE)})
            </p>
          </div>

          {gltfAssets.length > 0 && (
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {gltfAssets.map((asset) => {
                  const assetId = getAssetId(asset);
                  const isAdded = isGltfModelAdded(assetId);

                  return (
                    <div
                      key={buildStableAssetKey(asset, "gltf")}
                      className={`p-2 rounded border flex items-center justify-between ${
                        isAdded
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (isAdded) {
                            removeGltfModel(assetId);
                          } else {
                            addGltfModel(assetId);
                          }
                        }}
                        className="flex-1 text-left flex items-center gap-2"
                      >
                        {isAdded && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{asset.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(asset.fileSize)}
                          </p>
                        </div>
                      </button>
                      <Button
                        onClick={() =>
                          openDeleteDialog(assetId, asset.fileName)
                        }
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {gltfAssets.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              업로드된 GLTF 모델이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 사용 중인 모델 개수 표시 */}
      {currentGltfModels.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Scene에 {currentGltfModels.length}개의 모델이 추가되었습니다.
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <CenteredAlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>파일 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              "{assetToDelete?.name}" 파일을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </CenteredAlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AssetControl;

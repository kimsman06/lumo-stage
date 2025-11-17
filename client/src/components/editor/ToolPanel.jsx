/**
 * ToolPanel 컴포넌트
 *
 * 에디터 좌측에 고정된 수직 툴바
 * - 조명, 마네킹 추가
 * - HDRI, GLTF 파일 업로드
 *
 * 기존 AssetControl.jsx의 업로드 로직을 재사용하며
 * Outliner의 Plus 버튼 기능을 대체합니다.
 */

import React, { useRef, useState } from "react";
import { Lightbulb, User, Image, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useStore from "@/store/editorStore";
import useAssetStore from "@/store/assetStore";
import toast from "@/lib/toast";

const MAX_HDRI_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_GLTF_SIZE = 100 * 1024 * 1024; // 100MB

const HDRI_EXTENSIONS = [".hdr", ".exr"];
const GLTF_EXTENSIONS = [".glb"];

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

function ToolPanel({ projectId, readOnly = false }) {
  const { addLight, addMannequin } = useStore();
  const { uploadHdri, uploadGltf, setCurrentHdri, addGltfModel } =
    useAssetStore();

  const hdriInputRef = useRef(null);
  const gltfInputRef = useRef(null);

  const [uploadingHdri, setUploadingHdri] = useState(false);
  const [uploadingGltf, setUploadingGltf] = useState(false);

  // 조명 추가
  const handleAddLight = () => {
    if (readOnly) return;
    addLight("spot");
  };

  // 마네킹 추가
  const handleAddMannequin = () => {
    if (readOnly) return;
    addMannequin();
  };

  // HDRI 파일 선택
  const handleHdriFileSelect = async (event) => {
    if (readOnly) return;
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    if (!validateFileExtension(file, HDRI_EXTENSIONS)) {
      toast.error(
        "지원하지 않는 파일 형식입니다. .hdr 또는 .exr 파일을 선택하세요."
      );
      event.target.value = "";
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
    event.target.value = "";

    // 업로드 성공 시 자동으로 Scene에 적용
    if (result.success && result.asset) {
      setCurrentHdri(result.asset);
    }
  };

  // GLTF 파일 선택
  const handleGltfFileSelect = async (event) => {
    if (readOnly) return;
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

  // HDRI 업로드 트리거
  const handleHdriUpload = () => {
    hdriInputRef.current?.click();
  };

  // GLTF 업로드 트리거
  const handleGltfUpload = () => {
    gltfInputRef.current?.click();
  };

  const tools = [
    {
      id: "add-light",
      label: "조명 추가",
      icon: Lightbulb,
      onClick: handleAddLight,
      disabled: readOnly,
    },
    {
      id: "add-mannequin",
      label: "마네킹 추가",
      icon: User,
      onClick: handleAddMannequin,
      disabled: readOnly,
    },
    {
      id: "upload-hdri",
      label: "HDRI 업로드",
      icon: Image,
      onClick: handleHdriUpload,
      disabled: readOnly || uploadingHdri,
    },
    {
      id: "upload-gltf",
      label: "GLTF 업로드",
      icon: Box,
      onClick: handleGltfUpload,
      disabled: readOnly || uploadingGltf,
    },
  ];

  return (
    <div className="w-16 h-full bg-background border-r flex flex-col items-center py-4 gap-2">
      {/* Hidden file inputs */}
      <input
        ref={hdriInputRef}
        type="file"
        accept=".hdr,.exr"
        onChange={handleHdriFileSelect}
        className="hidden"
      />
      <input
        ref={gltfInputRef}
        type="file"
        accept=".glb"
        onChange={handleGltfFileSelect}
        className="hidden"
      />

      {/* Tool buttons */}
      <TooltipProvider>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={tool.onClick}
                  disabled={tool.disabled}
                  className="w-12 h-12 text-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={tool.label}
                  data-tutorial={tool.id === "add-light" ? "add-light-button" : undefined}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}

export default ToolPanel;

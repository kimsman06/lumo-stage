import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, ArrowLeft, Check } from "lucide-react";
import Scene from "../components/Scene";
import Outliner from "../components/outliner/Outliner";
import PropertiesPanel from "../components/properties/PropertiesPanel";
import ToolPanel from "../components/editor/ToolPanel";
import Toolbar from "../components/editor/Toolbar";
import useStore from "../store/editorStore";
import useProjectStore from "../store/projectStore";
import useAssetStore from "../store/assetStore";
import { Button } from "../components/ui/button";
import toast from "../lib/toast";
import ShareButton from "@/components/share/ShareButton";
import ShareDialog from "@/components/share/ShareDialog";
import { TutorialProvider, TutorialOverlay } from "@/components/tutorial";

function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadSceneData, getSceneData } = useStore();
  const { getProjectById, updateProject, currentProject, isLoading, error } =
    useProjectStore();
  const {
    loadAssets,
    loadAssetSceneData,
    getAssetSceneData,
    reset: resetAssetStore,
  } = useAssetStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // 프로젝트 로드
  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate("/projects");
        return;
      }

      const result = await getProjectById(id);
      if (result.success && result.project) {
        // Scene 데이터를 에디터 스토어에 로드
        loadSceneData(result.project.sceneData);

        // Asset Scene 데이터 로드 (HDRI, GLTF 모델 정보)
        if (result.project.sceneData?.assets) {
          loadAssetSceneData(result.project.sceneData.assets);
        }

        // Asset 목록 로드
        loadAssets(id);
      } else {
        toast.error("프로젝트를 불러올 수 없습니다.");
        navigate("/projects");
      }
    };

    loadProject();

    // 컴포넌트 언마운트 시 Asset Store 초기화
    return () => {
      resetAssetStore();
    };
  }, [
    id,
    getProjectById,
    loadSceneData,
    loadAssets,
    loadAssetSceneData,
    resetAssetStore,
    navigate,
  ]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName.toLowerCase() === "input") return;

      // Ctrl+S 또는 Cmd+S로 저장
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
        return;
      }

      // Ctrl+Z 또는 Cmd+Z로 Undo
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        useStore.getState().undo();
        return;
      }

      // Ctrl+Shift+Z 또는 Cmd+Shift+Z로 Redo
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        useStore.getState().redo();
        return;
      }

      switch (event.key.toLowerCase()) {
        case "escape":
          useStore.getState().setSelectedLight(null);
          break;
        case "w":
          useStore.getState().setTransformMode("translate");
          break;
        case "e":
          useStore.getState().setTransformMode("rotate");
          break;
        case "r":
          useStore.getState().setTransformMode("scale");
          break;
        case "f":
          useStore.getState().setViewMode("free");
          break;
        case "c":
          useStore.getState().setViewMode("camera");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [id]);

  // 프로젝트 저장
  const handleSave = async () => {
    if (!id || isSaving) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const sceneData = getSceneData();
    const assetSceneData = getAssetSceneData();

    // Asset 정보를 sceneData에 포함
    const fullSceneData = {
      ...sceneData,
      assets: assetSceneData,
    };

    // Promise 기반 Toast로 저장 진행 상황 표시
    const savePromise = updateProject(id, { sceneData: fullSceneData });
    toast.project.save(savePromise);

    const result = await savePromise;

    setIsSaving(false);

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    // 에러는 Toast에서 자동으로 표시됨
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p>프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4 text-white">
          <p className="text-red-400">{error}</p>
          <Button onClick={() => navigate("/projects")} variant="outline">
            프로젝트 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TutorialProvider>
      <div className="w-screen h-screen bg-black flex flex-col overflow-hidden">
        {/* Header - 고정 높이, shrink 방지 */}
        <div className="h-14 flex-shrink-0 bg-black/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="text-white gap-2">
                <ArrowLeft className="w-4 h-4" />
                프로젝트 목록
              </Button>
            </Link>
            <div className="text-white">
              <h1 className="text-lg font-semibold">
                {currentProject?.name || "프로젝트"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span
                className="text-green-400 text-sm flex items-center gap-1"
                role="status"
                aria-live="polite"
              >
                <Check className="w-4 h-4" />
                저장됨
              </span>
            )}
            <ShareButton
              projectId={id}
              variant="button"
              onOpenDialog={() => setShareDialogOpen(true)}
            />
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
              size="sm"
              aria-label="프로젝트 저장"
              data-tutorial="save-button"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>

        {/* ShareDialog */}
        <ShareDialog
          projectId={id}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />

        {/* Editor Content - Scene + ToolPanel + (Outliner/Properties) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Scene - 좌측 남은 공간 (Toolbar floating 포함) */}
          <div className="flex-1 overflow-hidden relative">
            <Scene />
            {/* Toolbar - Scene 위에 floating */}
            <Toolbar />
          </div>

          {/* ToolPanel - 세로 전체 */}
          <div className="flex-shrink-0">
            <ToolPanel projectId={id} />
          </div>

          {/* 우측 패널 - Outliner + PropertiesPanel */}
          <div className="w-[480px] flex flex-col overflow-hidden border-l">
            {/* Outliner - 상단 */}
            <div className="h-80 flex-shrink-0">
              <Outliner />
            </div>
            {/* PropertiesPanel - 하단 (남은 공간) */}
            <div className="flex-1 overflow-hidden">
              <PropertiesPanel projectId={id} />
            </div>
          </div>
        </div>

        {/* Tutorial Overlay */}
        <TutorialOverlay />
      </div>
    </TutorialProvider>
  );
}

export default EditorPage;

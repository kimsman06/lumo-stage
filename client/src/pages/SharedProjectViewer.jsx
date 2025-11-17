import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShareStore from '@/store/shareStore';
import useAssetStore from '@/store/assetStore';
import { useEditorStore, useAuthStore } from '@/store';
import { toast } from 'sonner';
import { SHARE_MESSAGES } from '@/lib/toast-messages';
import Scene from '@/components/Scene';
import Outliner from '@/components/outliner/Outliner';
import PropertiesPanel from '@/components/properties/PropertiesPanel';
import ToolPanel from '@/components/editor/ToolPanel';
import Toolbar from '@/components/editor/Toolbar';
import ViewerHeader from './SharedProjectViewer/ViewerHeader';
import ExpiredMessage from './SharedProjectViewer/ExpiredMessage';

/**
 * SharedProjectViewer - 공유된 프로젝트 뷰어 페이지
 */
export default function SharedProjectViewer() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { sharedProject, isLoading, error, getSharedProject } = useShareStore();
  const loadSceneData = useEditorStore((state) => state.loadSceneData);
  const user = useAuthStore((state) => state.user);
  const loadAssetSceneData = useAssetStore((state) => state.loadAssetSceneData);
  const resetAssetStore = useAssetStore((state) => state.reset);

  const loadSharedProject = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getSharedProject(token);

      if (data.project && data.project.sceneData) {
        loadSceneData(data.project.sceneData);
        if (data.project.sceneData.assets) {
          loadAssetSceneData(data.project.sceneData.assets);
        }
      }
    } catch (err) {
      if (err.message.includes('만료')) {
        // handled by ExpiredMessage
      } else if (err.message.includes('비활성')) {
        // handled by ExpiredMessage
      } else {
        toast.error(err.message || SHARE_MESSAGES.loadSharedProjectError);
      }
    }
  }, [token, getSharedProject, loadSceneData, loadAssetSceneData]);

  useEffect(() => {
    loadSharedProject();
  }, [loadSharedProject]);

  useEffect(() => {
    return () => {
      resetAssetStore();
    };
  }, [resetAssetStore]);

  const handleOpenEditor = () => {
    if (sharedProject?.project?._id) {
      navigate(`/editor/${sharedProject.project._id}`);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-studio-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 - 만료/비활성/404
  if (error) {
    let reason = 'not-found';
    if (error.includes('만료')) reason = 'expired';
    else if (error.includes('비활성')) reason = 'inactive';

    return <ExpiredMessage reason={reason} />;
  }

  // 프로젝트 데이터가 없는 경우
  if (!sharedProject || !sharedProject.project) {
    return <ExpiredMessage reason="not-found" />;
  }

  const { project, permission } = sharedProject;
  const isOwner = user?._id === project.owner;
  const isAuthenticated = !!user;
  const isViewOnly = permission === 'view';

  return (
    <div className="flex flex-col h-screen bg-studio-950">
      {/* 헤더 */}
      <ViewerHeader
        projectName={project.name}
        permission={permission}
        isOwner={isOwner}
        isAuthenticated={isAuthenticated}
        onOpenEditor={handleOpenEditor}
        sceneData={project.sceneData}
      />

      {/* 메인 콘텐츠: Scene + ToolPanel + (Outliner/Properties) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scene - 좌측 남은 공간 (Toolbar floating 포함) */}
        <div className="flex-1 overflow-hidden relative">
          <Scene readOnly={isViewOnly} />
          {/* Toolbar - Scene 위에 floating */}
          <Toolbar />
        </div>

        {/* ToolPanel - 세로 전체 */}
        <div className="flex-shrink-0">
          <ToolPanel projectId={project._id} readOnly={isViewOnly} />
        </div>

        {/* 우측 패널 - Outliner + PropertiesPanel */}
        <div className="w-[480px] flex flex-col overflow-hidden border-l">
          {/* Outliner - 상단 */}
          <div className="h-80 flex-shrink-0">
            <Outliner readOnly={isViewOnly} />
          </div>
          {/* PropertiesPanel - 하단 (남은 공간) */}
          <div className="flex-1 overflow-hidden">
            <PropertiesPanel projectId={project._id} readOnly={isViewOnly} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShareStore from '@/store/shareStore';
import useAssetStore from '@/store/assetStore';
import { useEditorStore, useAuthStore } from '@/store';
import { toast } from 'sonner';
import { SHARE_MESSAGES } from '@/lib/toast-messages';
import Scene from '@/components/Scene';
import ViewerHeader from './SharedProjectViewer/ViewerHeader';
import ViewerEditorPanel from './SharedProjectViewer/ViewerEditorPanel';
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

      {/* 메인 콘텐츠: Scene + Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1">
          <Scene readOnly={isViewOnly} />
        </div>

        {/* Editor Panel */}
        <ViewerEditorPanel permission={permission} />
      </div>
    </div>
  );
}

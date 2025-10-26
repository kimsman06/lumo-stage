import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Check } from 'lucide-react';
import Scene from '../components/Scene';
import EditorPanel from '../components/EditorPanel';
import useStore from '../store/editorStore';
import useProjectStore from '../store/projectStore';
import { Button } from '../components/ui/button';

function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadSceneData, getSceneData } = useStore();
  const { getProjectById, updateProject, currentProject, isLoading, error } = useProjectStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 프로젝트 로드
  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }

      const result = await getProjectById(id);
      if (result.success && result.project) {
        // Scene 데이터를 에디터 스토어에 로드
        loadSceneData(result.project.sceneData);
      } else {
        alert('프로젝트를 불러올 수 없습니다.');
        navigate('/projects');
      }
    };

    loadProject();
  }, [id, getProjectById, loadSceneData, navigate]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName.toLowerCase() === 'input') return;

      // Ctrl+S 또는 Cmd+S로 저장
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'escape':
          useStore.getState().setSelectedLight(null);
          break;
        case 'w':
          useStore.getState().setTransformMode('translate');
          break;
        case 'e':
          useStore.getState().setTransformMode('rotate');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id]);

  // 프로젝트 저장
  const handleSave = async () => {
    if (!id || isSaving) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const sceneData = getSceneData();
    const result = await updateProject(id, { sceneData });

    setIsSaving(false);

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      alert(`저장 실패: ${result.error}`);
    }
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
          <Button onClick={() => navigate('/projects')} variant="outline">
            프로젝트 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="h-14 bg-black/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              프로젝트 목록
            </Button>
          </Link>
          <div className="text-white">
            <h1 className="text-lg font-semibold">{currentProject?.name || '프로젝트'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-green-400 text-sm flex items-center gap-1">
              <Check className="w-4 h-4" />
              저장됨
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
            size="sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 grid grid-flow-col grid-cols-[1fr_auto]">
        {/* Scene takes up the first column (all remaining space) */}
        <div className="h-full overflow-hidden">
          <Scene />
        </div>
        {/* EditorPanel takes up the second column (its own width) */}
        <EditorPanel />
      </div>
    </div>
  );
}

export default EditorPage;

import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SHARE_MESSAGES } from "@/lib/toast-messages";

/**
 * ViewerHeader - 공유 프로젝트 뷰어 헤더
 *
 * @param {string} projectName - 프로젝트 이름
 * @param {'view' | 'edit'} permission - 권한
 * @param {boolean} isOwner - 본인 프로젝트 여부
 * @param {boolean} isAuthenticated - 로그인 상태
 * @param {function} onOpenEditor - 에디터 열기 콜백
 * @param {object} sceneData - Scene 데이터 (복제용)
 */
export default function ViewerHeader({
  projectName,
  permission,
  isOwner,
  isAuthenticated,
  onOpenEditor,
  sceneData,
}) {
  const navigate = useNavigate();

  const handleOpenEditor = async () => {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다");
      navigate("/login");
      return;
    }

    if (isOwner && onOpenEditor) {
      // 본인 프로젝트 - 원본 열기
      onOpenEditor();
    } else {
      // 타인 프로젝트 - 복제하여 편집
      try {
        // TODO: 프로젝트 복제 API 호출
        // const newProject = await cloneProject(sceneData);
        // navigate(`/editor/${newProject._id}`);
        toast.info(SHARE_MESSAGES.comingSoon || "곧 출시됩니다");
      } catch (error) {
        toast.error(SHARE_MESSAGES.projectCloneError);
      }
    }
  };

  const getPermissionBadge = () => {
    if (permission === "view") {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          읽기 전용
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 border-amber-500 text-amber-500"
      >
        <Edit className="w-3 h-3" />
        편집 가능
      </Badge>
    );
  };

  const getActionButton = () => {
    if (isOwner) {
      return (
        <Button onClick={handleOpenEditor} size="sm">
          에디터로 열기
        </Button>
      );
    }

    if (!isAuthenticated) {
      return (
        <Button onClick={() => navigate("/login")} variant="outline" size="sm">
          로그인하여 편집하기
        </Button>
      );
    }

    return (
      <Button onClick={handleOpenEditor} size="sm">
        <Copy className="w-4 h-4 mr-2" />
        복제하여 편집
      </Button>
    );
  };

  return (
    <header className="h-14 border-b border-studio-800 bg-studio-900 flex items-center justify-between px-4">
      {/* 좌측: 로고 */}
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-studio-300 hover:text-primary-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold">LumoStage</span>
      </Link>

      {/* 중앙: 프로젝트 이름 + 권한 */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-black">{projectName}</h1>
        {getPermissionBadge()}
      </div>

      {/* 우측: 액션 버튼 */}
      <div>{getActionButton()}</div>
    </header>
  );
}

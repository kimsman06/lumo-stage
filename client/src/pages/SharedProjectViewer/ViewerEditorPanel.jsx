import { Camera, Lightbulb, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CameraControl from "@/components/editor/CameraControl";
import LightsControl from "@/components/editor/LightsControl";

/**
 * ViewerEditorPanel - 공유 프로젝트 뷰어 에디터 패널
 *
 * @param {'view' | 'edit'} permission - 권한
 */
export default function ViewerEditorPanel({ permission }) {
  const isViewOnly = permission === "view";

  return (
    <div className="w-96 h-full bg-studio-900 border-l border-studio-800 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* 편집 가능 모드 경고 */}
        {!isViewOnly && (
          <div className="p-3 bg-amber-950/80 border border-amber-900 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-300 font-semibold mb-1">
                변경사항은 저장되지 않습니다
              </p>
              <p className="text-amber-200/80 text-xs">
                이 프로젝트를 저장하려면 복제하세요
              </p>
            </div>
          </div>
        )}

        {/* 카메라 컨트롤 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary-500" />
            <h3 className="text-sm font-semibold">Camera</h3>
          </div>
          <CameraControl readOnly={isViewOnly} />
        </div>

        <Separator />

        {/* 조명 컨트롤 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary-500" />
            <h3 className="text-sm font-semibold">Lights</h3>
          </div>
          <LightsControl readOnly={isViewOnly} />
        </div>

        {/* 읽기 전용 모드 안내 */}
        {isViewOnly && (
          <div className="p-3 bg-studio-800 border border-studio-700 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">
              이 프로젝트는 읽기 전용입니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

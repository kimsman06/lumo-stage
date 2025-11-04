import React from "react";
import useStore from "../../store/editorStore";
import { Button } from "../ui/button";
import { Camera, Eye } from "lucide-react";

/**
 * CameraOrbitSync 컴포넌트
 * Cinema 4D 스타일의 카메라-Orbit 시점 동기화 기능 제공
 *
 * 기능:
 * 1. "Set Camera to View": 현재 OrbitControls 위치를 Camera View로 설정
 * 2. "View from Camera": Camera View 위치로 OrbitControls 이동
 */
function CameraOrbitSync() {
  const setOrbitToCameraView = useStore((state) => state.setOrbitToCameraView);
  const setCameraViewToOrbit = useStore((state) => state.setCameraViewToOrbit);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-white">Camera-Orbit Sync</h3>
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start"
          onClick={setCameraViewToOrbit}
        >
          <Eye className="mr-2 h-4 w-4" />
          View from Camera
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start"
          onClick={setOrbitToCameraView}
        >
          <Camera className="mr-2 h-4 w-4" />
          Set Camera to View
        </Button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        OrbitControls 시점과 Camera View를 동기화합니다.
      </p>
    </div>
  );
}

export default CameraOrbitSync;

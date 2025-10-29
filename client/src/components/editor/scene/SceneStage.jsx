// @docs/development/scene-architecture-c1.md 기반 복구
import React from 'react';

// 3D 씬의 메인 스테이지. 모든 3D 레이어를 조합하고 상태를 관리합니다.
const SceneStage = () => {
  // TODO: 상태 구독 로직 통합 필요 (문제점 1)
  // TODO: 하위 레이어 컴포넌트 렌더링
  return (
    <>
      {/* <CameraRig /> */}
      {/* <LightsLayer /> */}
      {/* <MannequinLayer /> */}
      {/* <DiffuserLayer /> */}
      {/* <GizmoOverlay /> */}
      {/* <OrbitOverlay /> */}
      {/* <SceneGround /> */}
    </>
  );
};

export default SceneStage;

// @docs/development/scene-architecture-c1.md 기반 복구
import React from 'react';
import { OrbitControls } from '@react-three/drei';

// Free 모드에서 카메라를 제어하는 OrbitControls 오버레이
const OrbitOverlay = () => {
  // TODO: viewMode에 따른 활성화/비활성화 로직 필요
  return <OrbitControls makeDefault />;
};

export default OrbitOverlay;

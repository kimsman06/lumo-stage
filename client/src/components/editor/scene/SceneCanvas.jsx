// @docs/development/scene-architecture-c1.md 기반 복구
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneStage from './SceneStage';

// 3D 렌더링이 일어나는 주 캔버스 컴포넌트입니다.
// 상태 구독 없이 props만 전달하여 성능을 최적화합니다.
const SceneCanvas = () => {
  return (
    <Canvas shadows camera={{ position: [0, 2, 10], fov: 50 }}>
      <Suspense fallback={null}>
        <SceneStage />
      </Suspense>
    </Canvas>
  );
};

export default SceneCanvas;

// @docs/development/scene-architecture-c1.md 기반 복구
import React from 'react';

// 씬의 바닥을 렌더링하는 컴포넌트
const SceneGround = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial transparent opacity={0.2} />
    </mesh>
  );
};

export default SceneGround;

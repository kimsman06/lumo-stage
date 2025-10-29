// @docs/development/scene-architecture-c1.md 기반 복구
import React, { Suspense } from 'react';
import { Mannequin } from '@/components/Mannequin'; // 경로 확인 필요

// 마네킹 3D 모델을 렌더링하는 레이어
const MannequinLayer = React.memo(({ mannequins, registerMannequinHandle }) => {
  return (
    <Suspense fallback={null}>
      {mannequins.map(mannequin => (
        <Mannequin key={mannequin.id} {...mannequin} />
      ))}
    </Suspense>
  );
});

export default MannequinLayer;

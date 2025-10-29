import React from 'react';
import SceneCanvas from './SceneCanvas';

// Scene의 최상위 컴포넌트. 에러 바운더리, 컨텍스트 제공자 등을 포함할 수 있습니다.
const SceneRoot = () => {
  return (
    <div className="w-full h-full relative">
      <SceneCanvas />
    </div>
  );
};

export default SceneRoot;

import React from 'react';
import useEditorStore from '@/store/editorStore';
import { shallow } from 'zustand/shallow';

// Scene의 조명들을 렌더링하는 레이어입니다.
const LightsLayer = () => {
  // const lights = useEditorStore((state) => state.lights, shallow);

  return (
    <>
      {/* {lights.map(light => { */}
      {/*  // 여기에 각 조명 타입에 맞는 컴포넌트를 렌더링합니다. */}
      {/*  return <pointLight key={light.id} position={light.position} intensity={light.intensity} />; */}
      {/* })} */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
       <ambientLight intensity={0.5} />
    </>
  );
};

export default LightsLayer;

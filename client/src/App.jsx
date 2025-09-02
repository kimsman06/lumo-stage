import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane } from '@react-three/drei';
import { create } from 'zustand';
import { nanoid } from 'nanoid';

// 1. Zustand 스토어 생성
const useStore = create((set) => ({
  lights: [
    { id: nanoid(), position: [5, 5, 0], color: '#ff0000', intensity: 10 },
    { id: nanoid(), position: [-5, 5, -5], color: '#0000ff', intensity: 10 },
  ],
  camera: {
    position: [0, 2, 8],
    fov: 75,
  },
  addLight: () =>
    set((state) => ({
      lights: [
        ...state.lights,
        { id: nanoid(), position: [0, 3, 0], color: '#ffffff', intensity: 10 },
      ],
    })),
  updateLight: (id, property, value) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? { ...light, [property]: value } : light
      ),
    })),
  updateLightPosition: (id, axis, value) =>
    set((state) => ({
      lights: state.lights.map((light) => {
        if (light.id === id) {
          const newPosition = [...light.position];
          newPosition[axis] = parseFloat(value);
          return { ...light, position: newPosition };
        }
        return light;
      }),
    })),
}));

// 2. 컨트롤 패널 UI 컴포넌트
function Controls() {
  // Zustand 스토어에서 상태와 함수를 개별적으로 선택하여 불필요한 리렌더링 방지
  const lights = useStore((state) => state.lights);
  const addLight = useStore((state) => state.addLight);
  const updateLight = useStore((state) => state.updateLight);
  const updateLightPosition = useStore((state) => state.updateLightPosition);

  return (
    <div className="w-1/4 h-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">컨트롤 패널</h2>
      <button
        onClick={addLight}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        조명 추가
      </button>

      {lights.map((light, i) => (
        <div key={light.id} className="bg-gray-800 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">조명 {i + 1}</h3>
          
          {/* 색상 */}
          <div className="mb-2">
            <label className="block text-sm">Color</label>
            <input
              type="color"
              value={light.color}
              onChange={(e) => updateLight(light.id, 'color', e.target.value)}
              className="w-full h-8"
            />
          </div>

          {/* 강도 */}
          <div className="mb-2">
            <label className="block text-sm">Intensity: {light.intensity.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={light.intensity}
              onChange={(e) => updateLight(light.id, 'intensity', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 위치 (X, Y, Z) */}
          {['X', 'Y', 'Z'].map((axis, axisIndex) => (
            <div key={axis} className="mb-2">
              <label className="block text-sm">Position {axis}: {light.position[axisIndex].toFixed(1)}</label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={light.position[axisIndex]}
                onChange={(e) => updateLightPosition(light.id, axisIndex, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// 3. 3D Scene 컴포넌트
function Scene() {
  const lights = useStore((state) => state.lights);
  const cameraSettings = useStore((state) => state.camera);

  return (
    <Canvas shadows camera={{ position: cameraSettings.position, fov: cameraSettings.fov }}>
      {/* Store에서 가져온 조명들을 동적으로 렌더링 (기본 <pointLight> 사용) */}
      {lights.map(light => (
        <pointLight
          key={light.id}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
      ))}
      
      <ambientLight intensity={0.2} />

      <Sphere args={[1, 32, 32]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="white" metalness={0.7} roughness={0.2} />
      </Sphere>

      <Plane
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
        args={[100, 100]}
      >
        <meshStandardMaterial color="grey" />
      </Plane>

      <OrbitControls />
    </Canvas>
  );
}

// 4. 메인 앱 레이아웃
function App() {
  return (
    <div className="w-screen h-screen bg-black flex">
      <div className="w-3/4 h-full">
        <Scene />
      </div>
      <Controls />
    </div>
  );
}

export default App;
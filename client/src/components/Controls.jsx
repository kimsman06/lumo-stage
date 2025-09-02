import React from 'react';
import useStore from '../store';

function Controls() {
  // 스토어에서 필요한 상태와 함수를 개별적으로 선택하여 구독 (최적화)
  const lights = useStore((state) => state.lights);
  const selectedLight = useStore((state) => state.selectedLight);
  const addLight = useStore((state) => state.addLight);
  const updateLight = useStore((state) => state.updateLight);
  const updateLightPosition = useStore((state) => state.updateLightPosition);
  const setSelectedLight = useStore((state) => state.setSelectedLight);

  return (
    <div className="w-1/4 h-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">컨트롤 패널</h2>
      <button onClick={addLight} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6">
        조명 추가
      </button>
      {selectedLight && (
        <button onClick={() => setSelectedLight(null)} className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-6">
          선택 해제
        </button>
      )}

      {lights.map((light, i) => (
        <div key={light.id} className={`p-4 rounded-lg mb-4 ${selectedLight === light.id ? 'bg-blue-900' : 'bg-gray-800'}`}>
          <h3 className="font-bold mb-2">조명 {i + 1}</h3>
          <div className="mb-2">
            <label className="block text-sm">Color</label>
            <input type="color" value={light.color} onChange={(e) => updateLight(light.id, 'color', e.target.value)} className="w-full h-8" />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Intensity: {light.intensity.toFixed(1)}</label>
            <input type="range" min="0" max="50" step="0.5" value={light.intensity} onChange={(e) => updateLight(light.id, 'intensity', parseFloat(e.target.value))} className="w-full" />
          </div>
          {['X', 'Y', 'Z'].map((axis, axisIndex) => (
            <div key={axis} className="mb-2">
              <label className="block text-sm">Position {axis}: {light.position[axisIndex].toFixed(1)}</label>
              <input type="range" min="-10" max="10" step="0.1" value={light.position[axisIndex]} onChange={(e) => updateLightPosition(light.id, axisIndex, e.target.value)} className="w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Controls;
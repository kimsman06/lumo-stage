import React, { useState } from 'react';
import useStore from '../store';

function Controls() {
  const { 
    transformMode, setTransformMode,
    viewMode, setViewMode, // Added
    lights, addLight, deleteLight, updateLight, updateLightPosition,
    selectedLight, setSelectedLight,
    mainSphereRoughness, mainSphereMetalness, updateMainSphereMaterial,
    cameraState, updateCameraState,
  } = useStore();

  const [newLightType, setNewLightType] = useState('point');

  return (
    <div className="w-1/4 h-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">컨트롤 패널</h2>

      {/* View Mode Switcher */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">뷰 모드</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('free')}
            className={`w-full font-bold py-2 px-4 rounded ${viewMode === 'free' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            자유 시점
          </button>
          <button
            onClick={() => setViewMode('camera')}
            className={`w-full font-bold py-2 px-4 rounded ${viewMode === 'camera' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            카메라 시점
          </button>
        </div>
      </div>

      {/* Transform Mode Switcher */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">조작 모드</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTransformMode('translate')}
            className={`w-full font-bold py-2 px-4 rounded ${transformMode === 'translate' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            이동 (Translate)
          </button>
          <button
            onClick={() => setTransformMode('rotate')}
            className={`w-full font-bold py-2 px-4 rounded ${transformMode === 'rotate' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            회전 (Rotate)
          </button>
        </div>
      </div>

      {/* 새 조명 추가 섹션 */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">새 조명 추가</h3>
        <select
          value={newLightType}
          onChange={(e) => setNewLightType(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded"
        >
          <option value="point">Point Light</option>
          <option value="spot">Spot Light</option>
          <option value="directional">Directional Light</option>
        </select>
        <button
          onClick={() => addLight(newLightType)}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          조명 추가
        </button>
      </div>

      {/* 선택 해제 버튼 */}
      {selectedLight && (
        <button onClick={() => setSelectedLight(null)} className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-6">
          선택 해제
        </button>
      )}

      {/* 조명 목록 */}
      {lights.map((light, i) => (
        <div key={light.id} className={`p-4 rounded-lg mb-4 ${selectedLight === light.id ? 'bg-blue-900' : 'bg-gray-800'}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">조명 {i + 1} ({light.type})</h3>
            <button
              onClick={() => deleteLight(light.id)}
              className="bg-red-600 hover:bg-red-800 text-white text-xs font-bold py-1 px-2 rounded"
            >
              삭제
            </button>
          </div>
          
          {/* 공통 컨트롤 */}
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

          {/* Type-specific controls */}
          {(light.type === 'point' || light.type === 'spot') && (
            <>
              <div className="mb-2">
                <label className="block text-sm">Distance: {light.distance.toFixed(1)}</label>
                <input type="range" min="0" max="100" step="0.1" value={light.distance} onChange={(e) => updateLight(light.id, 'distance', parseFloat(e.target.value))} className="w-full" />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Decay: {light.decay.toFixed(1)}</label>
                <input type="range" min="0" max="5" step="0.1" value={light.decay} onChange={(e) => updateLight(light.id, 'decay', parseFloat(e.target.value))} className="w-full" />
              </div>
            </>
          )}
          {light.type === 'spot' && (
            <>
              <div className="mb-2">
                <label className="block text-sm">Angle: {light.angle.toFixed(2)}</label>
                <input type="range" min="0" max={Math.PI / 2} step="0.01" value={light.angle} onChange={(e) => updateLight(light.id, 'angle', parseFloat(e.target.value))} className="w-full" />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Penumbra: {light.penumbra.toFixed(2)}</label>
                <input type="range" min="0" max="1" step="0.01" value={light.penumbra} onChange={(e) => updateLight(light.id, 'penumbra', parseFloat(e.target.value))} className="w-full" />
              </div>
            </>
          )}
          {(light.type === 'spot' || light.type === 'directional') && light.targetPosition && ( // Added safety check
            <>
              <h4 className="font-bold mt-4 mb-2">Target Position</h4>
              {['X', 'Y', 'Z'].map((axis, axisIndex) => (
                <div key={axis} className="mb-2">
                  <label className="block text-sm">Target {axis}: {light.targetPosition[axisIndex].toFixed(1)}</label>
                  <input type="range" min="-10" max="10" step="0.1" value={light.targetPosition[axisIndex]} onChange={(e) => {
                    const newTargetPosition = [...light.targetPosition];
                    newTargetPosition[axisIndex] = parseFloat(e.target.value);
                    updateLight(light.id, 'targetPosition', newTargetPosition);
                  }} className="w-full" />
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      {/* 메인 구 재질 컨트롤 */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">메인 구 재질</h3>
        <div className="mb-2">
          <label className="block text-sm">Roughness: {mainSphereRoughness.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.01" value={mainSphereRoughness} onChange={(e) => updateMainSphereMaterial('mainSphereRoughness', parseFloat(e.target.value))} className="w-full" />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Metalness: {mainSphereMetalness.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.01" value={mainSphereMetalness} onChange={(e) => updateMainSphereMaterial('mainSphereMetalness', parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>

      {/* 카메라 제어 섹션 */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">카메라 제어</h3>
        
        {/* Position Controls */}
        <h4 className="font-semibold mt-3 mb-1 text-sm">Position</h4>
        {['X', 'Y', 'Z'].map((axis, axisIndex) => (
          <div key={`cam-pos-${axis}`} className="mb-2">
            <label className="block text-sm">Position {axis}: {cameraState.position[axisIndex].toFixed(1)}</label>
            <input
              type="range" min="-50" max="50" step="0.1"
              value={cameraState.position[axisIndex]}
              onChange={(e) => {
                const newPosition = [...cameraState.position];
                newPosition[axisIndex] = parseFloat(e.target.value);
                updateCameraState('position', newPosition);
              }}
              className="w-full"
            />
          </div>
        ))}

        {/* Target Controls */}
        <h4 className="font-semibold mt-3 mb-1 text-sm">Target</h4>
        {['X', 'Y', 'Z'].map((axis, axisIndex) => (
          <div key={`cam-tar-${axis}`} className="mb-2">
            <label className="block text-sm">Target {axis}: {cameraState.target[axisIndex].toFixed(1)}</label>
            <input
              type="range" min="-50" max="50" step="0.1"
              value={cameraState.target[axisIndex]}
              onChange={(e) => {
                const newTarget = [...cameraState.target];
                newTarget[axisIndex] = parseFloat(e.target.value);
                updateCameraState('target', newTarget);
              }}
              className="w-full"
            />
          </div>
        ))}

        {/* Focal Length Control */}
        <h4 className="font-semibold mt-3 mb-1 text-sm">초점 거리 (Focal Length)</h4>
        <div className="mb-2">
          <label className="block text-sm">Focal Length: {cameraState.focalLength.toFixed(0)}mm</label>
          <input
            type="range" min="18" max="200" step="1"
            value={cameraState.focalLength}
            onChange={(e) => updateCameraState('focalLength', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default Controls;
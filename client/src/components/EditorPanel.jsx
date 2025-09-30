import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store';
import { standPose, sitPose } from '../presets'; // Import presets

// Mannequin Controls Tab
const boneLabels = {
  head_02: '머리',
  waist_00: '허리',
  l_shoulder_03: '왼쪽 어깨',
  l_forearm_04: '왼쪽 팔뚝',
  l_hand_05: '왼쪽 손',
  r_shoulder_06: '오른쪽 어깨',
  r_forearm_07: '오른쪽 팔뚝',
  r_hand_08: '오른쪽 손',
  l_thigh_09: '왼쪽 허벅지',
  l_shin_010: '왼쪽 정강이',
  l_foot_012: '왼쪽 발',
  r_thigh_013: '오른쪽 허벅지',
  r_shin_014: '오른쪽 정강이',
  r_foot_016: '오른쪽 발',
};
const axisLabels = { x: 'X축', y: 'Y축', z: 'Z축' };

function BoneControl({ boneName, mannequinId }) {
  const { mannequins, setBoneRotation, highlightedBone } = useStore();
  const mannequin = mannequins.find(m => m.id === mannequinId);
  const rotation = mannequin?.pose[boneName];
  const ref = useRef();

  useEffect(() => {
    if (highlightedBone === boneName) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedBone, boneName]);

  if (!rotation) return null; // Safety check

  const handleRotationChange = (axis, value) => {
    setBoneRotation(mannequinId, boneName, axis, parseFloat(value));
  };

  const isHighlighted = highlightedBone === boneName;

  return (
    <div ref={ref} className={`p-4 border-b border-gray-700 ${isHighlighted ? 'bg-blue-900' : ''}`}>
      <h4 className="text-md font-bold text-white mb-2">{boneLabels[boneName] || boneName}</h4>
      {Object.keys(rotation).map((axis) => (
        <div key={axis} className="mb-2">
          <label className="block text-sm font-medium text-gray-300">{axisLabels[axis]} 회전: {rotation[axis].toFixed(2)}</label>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            value={rotation[axis]}
            onChange={(e) => handleRotationChange(axis, e.target.value)}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      ))}
    </div>
  );
}

function MannequinTab() {
  const { mannequins, selectedMannequinId, addMannequin, selectMannequin, deleteMannequin } = useStore();
  const selectedMannequin = mannequins.find(m => m.id === selectedMannequinId);

  return (
    <div className="flex-grow p-1">
      <div className="p-4">
        <button
          onClick={addMannequin}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          마네킹 추가
        </button>
        <div className="space-y-2 mb-4">
          {mannequins.map((m, index) => (
            <div key={m.id} 
              className={`flex justify-between items-center p-2 rounded cursor-pointer ${selectedMannequinId === m.id ? 'bg-blue-800' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => selectMannequin(m.id)}
            >
              <span>마네킹 {index + 1}</span>
              {mannequins.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteMannequin(m.id); }}
                  className="bg-red-600 hover:bg-red-800 text-white text-xs font-bold py-1 px-2 rounded"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedMannequin && (
        <>
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-md font-bold text-white mb-3">포즈 프리셋</h4>
            <div className="flex space-x-2">
              <button 
                onClick={() => applyPosePreset(selectedMannequin.id, standPose)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                서기
              </button>
              <button 
                onClick={() => applyPosePreset(selectedMannequin.id, sitPose)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                앉기
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 p-4 border-t border-gray-700">
            This work is based on "Wooden Mannequin (Lay Figure) - Rigged" by madeofmesh, licensed under CC-BY-4.0.
          </p>
          {Object.keys(selectedMannequin.pose).map(boneName => (
            <BoneControl key={boneName} boneName={boneName} mannequinId={selectedMannequin.id} />
          ))}
        </>
      )}
    </div>
  );
}

// Lighting Controls Tab
function LightingTab() {
  const { lights, addLight, deleteLight, updateLight, updateLightPosition, selectedLight, setSelectedLight } = useStore();
  const [newLightType, setNewLightType] = useState('point');

  return (
    <div className="p-4">
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

      {selectedLight && (
        <button onClick={() => setSelectedLight(null)} className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-6">
          선택 해제
        </button>
      )}

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
          <div className="mb-2">
            <label className="block text-sm">Color</label>
            <input type="color" value={light.color} onChange={(e) => updateLight(light.id, 'color', e.target.value)} className="w-full h-8" />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Intensity: {light.intensity.toFixed(1)}</label>
            <input type="range" min="0" max="50" step="0.5" value={light.intensity} onChange={(e) => updateLight(light.id, 'intensity', parseFloat(e.target.value))} className="w-full" />
          </div>

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
          
          {/* Target Position for Spot and Directional Lights */}
          {(light.type === 'spot' || light.type === 'directional') && light.targetPosition && (
            <>
              <h4 className="font-bold mt-4 mb-2 text-sm">Target Position</h4>
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

          {/* Cast Shadow Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id={`cast-shadow-${light.id}`}
              checked={light.castShadow}
              onChange={(e) => updateLight(light.id, 'castShadow', e.target.checked)}
              className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor={`cast-shadow-${light.id}`} className="ml-2 text-sm font-medium text-gray-300">Cast Shadow</label>
          </div>
        </div>
      ))}
    </div>
  );
}

// Scene Controls Tab
function SceneTab() {
  const { transformMode, setTransformMode, viewMode, setViewMode, cameraState, updateCameraState } = useStore();

  return (
    <div className="p-4">
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">뷰 모드</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('free')}
            className={`w-full font-bold py-2 px-4 rounded ${viewMode === 'free' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
            자유 시점
          </button>
          <button
            onClick={() => setViewMode('camera')}
            className={`w-full font-bold py-2 px-4 rounded ${viewMode === 'camera' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
            카메라 시점
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">조작 모드</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTransformMode('translate')}
            className={`w-full font-bold py-2 px-4 rounded ${transformMode === 'translate' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
            이동 (Translate)
          </button>
          <button
            onClick={() => setTransformMode('rotate')}
            className={`w-full font-bold py-2 px-4 rounded ${transformMode === 'rotate' ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
            회전 (Rotate)
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">카메라 제어</h3>
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

// Main Panel Component
function EditorPanel() {
  const [activeTab, setActiveTab] = useState('Mannequin');

  const tabs = {
    'Mannequin': <MannequinTab />,
    'Lighting': <LightingTab />,
    'Scene': <SceneTab />,
  };

  return (
    <div className="w-96 bg-gray-900 text-white flex flex-col h-screen">
      <div className="flex border-b border-gray-700">
        {Object.keys(tabs).map(tabName => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 font-bold py-3 px-4 text-sm ${activeTab === tabName ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>
            {tabName}
          </button>
        ))}
      </div>
      <div className="flex-grow overflow-y-auto">
        {tabs[activeTab]}
      </div>
    </div>
  );
}

export default EditorPanel;

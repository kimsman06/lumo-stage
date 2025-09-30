import React from 'react';
import useStore from '../store';

// A map for user-friendly labels for each bone
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

function BoneControl({ boneName }) {
  const { mannequinPose, setBoneRotation } = useStore();
  const rotation = mannequinPose[boneName];

  const handleRotationChange = (axis, value) => {
    setBoneRotation(boneName, axis, parseFloat(value));
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <h4 className="text-lg font-bold text-white mb-2">{boneLabels[boneName] || boneName}</h4>
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

function MannequinControls() {
  const { mannequinPose } = useStore();
  const bones = Object.keys(mannequinPose);

  return (
    <div className="w-72 bg-gray-800 text-white overflow-y-auto h-screen">
      <div className="p-4 bg-gray-900">
        <h3 className="text-xl font-bold">마네킹 관절 제어</h3>
        <p className="text-xs text-gray-400 mt-2">
          This work is based on "Wooden Mannequin (Lay Figure) - Rigged" by madeofmesh, licensed under CC-BY-4.0.
        </p>
      </div>
      <div className="flex-grow">
        {bones.map(boneName => (
          <BoneControl key={boneName} boneName={boneName} />
        ))}
      </div>
    </div>
  );
}

export default MannequinControls;
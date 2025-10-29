// @docs/development/scene-architecture-c1.md 기반 복구
import React from 'react';
import { Diffuser } from '@/components/Diffuser'; // 경로 확인 필요

// 디퓨저를 렌더링하는 레이어
const DiffuserLayer = ({ diffusers, registerDiffuserHandle, onDiffuserPointerDown }) => {
  return (
    <>
      {diffusers.map(diffuser => (
        <Diffuser key={diffuser.id} {...diffuser} />
      ))}
    </>
  );
};

export default DiffuserLayer;

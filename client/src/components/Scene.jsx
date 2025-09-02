import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane, TransformControls } from '@react-three/drei';
import useStore from '../store';

function Scene() {
  const lights = useStore((state) => state.lights);
  const selectedLight = useStore((state) => state.selectedLight);
  const setSelectedLight = useStore((state) => state.setSelectedLight);
  const updateLightPositionArray = useStore((state) => state.updateLightPositionArray);

  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();
  
  const meshRefs = useRef(new Map());
  const objectToControl = meshRefs.current.get(selectedLight);

  useEffect(() => {
    if (transformControlsRef.current) {
      const controls = transformControlsRef.current;
      const callback = (event) => (orbitControlsRef.current.enabled = !event.value);
      controls.addEventListener('dragging-changed', callback);
      return () => controls.removeEventListener('dragging-changed', callback);
    }
  });

  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 2, 8], fov: 75 }}
    >
      <ambientLight intensity={0.2} />
      
      {lights.map(light => (
        <React.Fragment key={light.id}>
          <pointLight 
            position={light.position}
            color={light.color}
            intensity={light.intensity}
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
          />
          <Sphere
            position={light.position}
            args={[0.2, 16, 16]}
            onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }}
            ref={(el) => meshRefs.current.set(light.id, el)}
          >
            <meshBasicMaterial color={light.color} />
          </Sphere>
        </React.Fragment>
      ))}

      {objectToControl && (
        <TransformControls
          ref={transformControlsRef}
          object={objectToControl}
          mode="translate"
          onMouseUp={(e) => {
            if (e.target.object) {
              const { x, y, z } = e.target.object.position;
              updateLightPositionArray(selectedLight, [x, y, z]);
            }
          }}
        />
      )}

      <Sphere args={[1, 32, 32]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="white" metalness={0.7} roughness={0.2} />
      </Sphere>

      <Plane receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} args={[100, 100]}>
        <meshStandardMaterial color="grey" />
      </Plane>

      <OrbitControls ref={orbitControlsRef} makeDefault />
    </Canvas>
  );
}

export default Scene;
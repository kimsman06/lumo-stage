import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane, TransformControls, Cone } from '@react-three/drei';
import useStore from '../store';
import * as THREE from 'three';

function CanvasSetup() {
  const { gl } = useThree();

  useEffect(() => {
    gl.capabilities.isWebGL2 = true;
    gl.physicallyCorrectLights = true;
    gl.outputEncoding = THREE.sRGBEncoding;
  }, [gl]);

  return null;
}

function Scene() {
  const { lights, selectedLight, setSelectedLight, updateLightPositionArray,
          mainSphereRoughness, mainSphereMetalness, updateLight } = useStore();

  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();
  const meshRefs = useRef(new Map());
  const directionalLightTargetRefs = useRef(new Map());

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
    <Canvas shadows camera={{ position: [0, 2, 8], fov: 75 }}>
      <CanvasSetup />
      <ambientLight intensity={0.2} />
      
      {lights.map(light => {
        const directionalLightTarget = light.type === 'directional' ? (
          <object3D ref={(el) => directionalLightTargetRefs.current.set(light.id, el)} position={light.targetPosition} />
        ) : null;

        return (
          <React.Fragment key={light.id}>
            {light.type === 'point' && (
              <pointLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                // Removed rotation, distance, decay
                // rotation={light.rotation}
                // distance={light.distance}
                // decay={light.decay}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                // Removed ref to lightRefs
                // ref={(el) => lightRefs.current.set(light.id, el)} // Store ref
              />
            )}
            {light.type === 'spot' && (
              <spotLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                angle={light.angle}
                penumbra={light.penumbra}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
            )}
            {light.type === 'directional' && (
              <directionalLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                // Removed rotation
                // rotation={light.rotation}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                target={directionalLightTargetRefs.current.get(light.id)}
              />
            )}

            {/* Visual models for lights */}
            {light.type === 'point' && (
              <Sphere
                position={light.position}
                args={[0.2, 16, 16]}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }}
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <meshBasicMaterial color={light.color} />
              </Sphere>
            )}
            {light.type === 'spot' && (
              <Cone
                position={light.position}
                args={[0.2, 0.5, 32]}
                // Removed rotation
                // rotation={light.rotation}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }}
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <meshBasicMaterial color={light.color} />
              </Cone>
            )}
            {light.type === 'directional' && (
              <group
                position={light.position}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }}
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <arrowHelper args={[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 1, light.color]} />
              </group>
            )}
            {directionalLightTarget}
          </React.Fragment>
        );
      })}

      {objectToControl && (
        <TransformControls
          ref={transformControlsRef}
          object={objectToControl}
          mode="translate"
          onMouseUp={(e) => {
            if (e.target.object) {
              const { x, y, z } = e.target.object.position;
              const lightType = lights.find(l => l.id === selectedLight)?.type;
              if (lightType === 'directional') {
                updateLight(selectedLight, 'targetPosition', [x, y, z]);
              }
            } else {
                updateLightPositionArray(selectedLight, [x, y, z]);
              }
          }}
        />
      )}
      
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="white" roughness={mainSphereRoughness} metalness={mainSphereMetalness} />
      </Sphere>

      <Plane receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} args={[100, 100]}>
        <meshStandardMaterial color="grey" />
      </Plane>

      <OrbitControls ref={orbitControlsRef} makeDefault />
    </Canvas>
  );
}

export default Scene;

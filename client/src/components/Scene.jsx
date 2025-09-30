import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane, TransformControls, Cone } from '@react-three/drei';
import useStore from '../store';
import * as THREE from 'three';
import { Mannequin } from './Mannequin';

// This component will contain all the 3D logic and objects.
// It is rendered inside the Canvas, so it can safely use R3F hooks.
function Experience() {
  const { 
    transformMode,
    lights, selectedLight, setSelectedLight, updateLight,
    mainSphereRoughness, mainSphereMetalness, 
    cameraState, viewMode, setIsDragging
  } = useStore();

  const { camera, controls } = useThree();
  const transformControlsRef = useRef();
  const meshRefs = useRef(new Map());
  const lightTargetObjectsRef = useRef(new Map());
  const virtualCamera = useRef(new THREE.PerspectiveCamera());

  const objectToControl = meshRefs.current.get(selectedLight);

  // This useEffect now correctly handles the controls conflict directly.
  useEffect(() => {
    const transformCtrl = transformControlsRef.current;
    if (transformCtrl) {
      const callback = (event) => {
        setIsDragging(event.value);
      };
      transformCtrl.addEventListener('dragging-changed', callback);
      return () => transformCtrl.removeEventListener('dragging-changed', callback);
    }
  }, [objectToControl, setIsDragging]);

  // This useFrame is now the single source of truth for all per-frame logic.
  useFrame(() => {
    // 1. Handle OrbitControls enabling/disabling
    if (controls) {
      controls.enabled = viewMode === 'free' && !useStore.getState().isDragging;
    }

    // 2. Update virtual camera from store
    const vCam = virtualCamera.current;
    vCam.position.set(...cameraState.position);
    vCam.lookAt(new THREE.Vector3(...cameraState.target));
    const sensorHeight = 24;
    vCam.fov = 2 * Math.atan(sensorHeight / (2 * cameraState.focalLength)) * (180 / Math.PI);
    vCam.updateProjectionMatrix();

    // 3. Handle camera view mode
    if (viewMode === 'camera') {
      camera.position.copy(vCam.position);
      camera.quaternion.copy(vCam.quaternion);
      camera.fov = vCam.fov;
      camera.updateProjectionMatrix();
    }

    // 4. Handle light orientation
    lights.forEach(light => {
      if (light.type === 'spot' || light.type === 'directional') {
        const mesh = meshRefs.current.get(light.id);
        const targetObject = lightTargetObjectsRef.current.get(light.id);
        if (mesh && targetObject) {
          mesh.lookAt(targetObject.position);
        }
      }
    });
  });

  return (
    <>
      {/* Render a helper for our virtual camera, only visible in free view */}
      {viewMode === 'free' && <cameraHelper args={[virtualCamera.current]} />}
      
      <ambientLight intensity={0.2} />
      
      {lights.map(light => {
        if (!lightTargetObjectsRef.current.has(light.id)) {
          lightTargetObjectsRef.current.set(light.id, new THREE.Object3D());
        }
        const currentLightTargetObject = lightTargetObjectsRef.current.get(light.id);
        if (light.targetPosition) {
          currentLightTargetObject.position.set(...light.targetPosition);
        }

        return (
          <React.Fragment key={light.id}>
            <primitive object={currentLightTargetObject} />

            {light.type === 'point' && (
              <pointLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                distance={light.distance}
                decay={light.decay}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
            )}
            {light.type === 'spot' && (
              <spotLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                angle={light.angle}
                penumbra={light.penumbra}
                distance={light.distance}
                decay={light.decay}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                target={currentLightTargetObject}
              />
            )}
            {light.type === 'directional' && (
              <directionalLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                target={currentLightTargetObject}
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
                <meshStandardMaterial color={light.color} />
              </Sphere>
            )}
            {light.type === 'spot' && (
              <group
                position={light.position}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }}
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <Cone
                  args={[0.2, 0.5, 32]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <meshStandardMaterial color={light.color} />
                </Cone>
              </group>
            )}
            {light.type === 'directional' && (
              <group
                position={light.position}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }}
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, light.color]} />
              </group>
            )}

            {/* Visual Target for Directional and Spot Lights */}
            {(light.type === 'directional' || light.type === 'spot') && (
              <Sphere
                position={light.targetPosition}
                args={[0.1, 16, 16]}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(`${light.id}-target`); }}
                ref={(el) => meshRefs.current.set(`${light.id}-target`, el)}
              >
                <meshStandardMaterial color="hotpink" wireframe />
              </Sphere>
            )}
          </React.Fragment>
        );
      })}

      {objectToControl && (
        <TransformControls
          ref={transformControlsRef}
          object={objectToControl}
          mode={transformMode}
          onObjectChange={(e) => {
            if (e?.target?.object) {
              const obj = e.target.object;
              const isTarget = selectedLight && selectedLight.endsWith('-target');
              const lightId = isTarget ? selectedLight.replace('-target', '') : selectedLight;
              const light = lights.find(l => l.id === lightId);

              if (!light) return;

              if (transformMode === 'translate') {
                const newPosition = [obj.position.x, obj.position.y, obj.position.z];
                if (isTarget) {
                  updateLight(lightId, 'targetPosition', newPosition);
                } else {
                  updateLight(lightId, 'position', newPosition);
                }
              } else if (transformMode === 'rotate') {
                if (isTarget) return; // Cannot rotate a target

                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyQuaternion(obj.quaternion);
                
                const distance = 5; 
                
                const newTargetPosition = new THREE.Vector3(...light.position).add(direction.multiplyScalar(distance));
                
                updateLight(lightId, 'targetPosition', [newTargetPosition.x, newTargetPosition.y, newTargetPosition.z]);
              }
            }
          }}
        />
      )}

      <React.Suspense fallback={null}>
        <Mannequin position={[0, -1.5, 0]} />
      </React.Suspense>

      <Plane receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} args={[100, 100]}>
        <meshStandardMaterial color="grey" />
      </Plane>

      <OrbitControls makeDefault />
    </>
  );
}

function Scene() {
  return (
    <Canvas shadows>
      <Experience />
    </Canvas>
  );
}

export default Scene;
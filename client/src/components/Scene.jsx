import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane, TransformControls, Cone } from '@react-three/drei';
import useStore from '../store';
import * as THREE from 'three';
import { Mannequin } from './Mannequin';

// This component will contain all the 3D logic and objects.
// It is rendered inside the Canvas, so it can safely use R3F hooks.
function Experience() {
  const mannequins = useStore(state => state.mannequins);
  const {
    transformMode,
    lights, selectedLight, setSelectedLight, updateLight,
    cameraState, viewMode, setIsDragging,
    selectedMannequinId, setMannequinPosition, selectMannequin, selectedBoneName, setSelectedBoneName,
  } = useStore();

  const { camera, controls } = useThree();
  const transformControlsRef = useRef();
  const lightRefs = useRef(new Map());
  const mannequinRefs = useRef(new Map());
  const lightTargetObjectsRef = useRef(new Map());
  const virtualCamera = useRef(new THREE.PerspectiveCamera());

  // Determine which object to control
  const lightToControl = lightRefs.current.get(selectedLight);
  // Only allow mannequin control if no bone is selected
  const mannequinToControl = !selectedBoneName && mannequinRefs.current.get(selectedMannequinId);
  const objectToControl = selectedLight ? lightToControl : mannequinToControl;

  useEffect(() => {
    const transformCtrl = transformControlsRef.current;
    if (transformCtrl) {
      const callback = (event) => setIsDragging(event.value);
      transformCtrl.addEventListener('dragging-changed', callback);
      return () => transformCtrl.removeEventListener('dragging-changed', callback);
    }
  }, [objectToControl, setIsDragging]);

  useFrame(() => {
    if (controls) {
      controls.enabled = viewMode === 'free' && !useStore.getState().isDragging;
    }
    const vCam = virtualCamera.current;
    vCam.position.set(...cameraState.position);
    vCam.lookAt(new THREE.Vector3(...cameraState.target));
    const sensorHeight = 24;
    vCam.fov = 2 * Math.atan(sensorHeight / (2 * cameraState.focalLength)) * (180 / Math.PI);
    vCam.updateProjectionMatrix();

    if (viewMode === 'camera') {
      camera.position.copy(vCam.position);
      camera.quaternion.copy(vCam.quaternion);
      camera.fov = vCam.fov;
      camera.updateProjectionMatrix();
    }

    lights.forEach(light => {
      if (light.type === 'spot' || light.type === 'directional') {
        const mesh = lightRefs.current.get(light.id);
        const targetObject = lightTargetObjectsRef.current.get(light.id);
        if (mesh && targetObject) {
          mesh.lookAt(targetObject.position);
        }
      }
    });
  });

  return (
    <>
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
            {(({ id, type, ...rest }) => {
              switch (type) {
                case 'point':
                  return <pointLight {...rest} />;
                case 'spot':
                  return <spotLight {...rest} target={currentLightTargetObject} />;
                case 'directional':
                  return <directionalLight {...rest} target={currentLightTargetObject} />;
                default:
                  return null;
              }
            })(light)}

            {/* Visual helpers for lights (restored) */}
            {light.type === 'point' && (
              <Sphere
                position={light.position}
                args={[0.2, 16, 16]}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); selectMannequin(null); }}
                ref={(el) => lightRefs.current.set(light.id, el)}
              >
                <meshStandardMaterial color={light.color} emissive={light.color} emissiveIntensity={2} />
              </Sphere>
            )}
            {light.type === 'spot' && (
              <group
                position={light.position}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); selectMannequin(null); }}
                ref={(el) => lightRefs.current.set(light.id, el)}
              >
                <Cone args={[0.4, 0.5, 32]} rotation={[-Math.PI / 2, 0, 0]}>
                  <meshStandardMaterial color={light.color} emissive={light.color} emissiveIntensity={2} />
                </Cone>
              </group>
            )}
            {light.type === 'directional' && (
              <group
                position={light.position}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); selectMannequin(null); }}
                ref={(el) => lightRefs.current.set(light.id, el)}
              >
                <arrowHelper args={[new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3(...light.position).normalize())), new THREE.Vector3(0,0,0), 1, light.color]} />
              </group>
            )}
            {(light.type === 'directional' || light.type === 'spot') && (
              <Sphere
                position={light.targetPosition}
                args={[0.1, 16, 16]}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(`${light.id}-target`); selectMannequin(null); }}
                ref={(el) => lightRefs.current.set(`${light.id}-target`, el)}
              >
                <meshStandardMaterial color="hotpink" wireframe />
              </Sphere>
            )}          </React.Fragment>
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
              const state = useStore.getState(); // Get fresh state

              // Use fresh state to determine what to update
              if (state.selectedLight) {
                const newPosition = [obj.position.x, obj.position.y, obj.position.z];
                updateLight(state.selectedLight, 'position', newPosition);
              } else if (state.selectedMannequinId) {
                const newPosition = [obj.position.x, obj.position.y, obj.position.z];
                setMannequinPosition(state.selectedMannequinId, newPosition);
              }
            }
          }}
        />
      )}

      <React.Suspense fallback={null}>
        {mannequins.map(m => (
          <Mannequin 
            key={m.id} 
            {...m}
            ref={(el) => mannequinRefs.current.set(m.id, el)}
          />
        ))}
      </React.Suspense>

      <Plane 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1.5, 0]} 
        args={[100, 100]}
        onClick={() => {
          selectMannequin(null);
          setSelectedLight(null);
          setSelectedBoneName(null);
        }}
      >
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
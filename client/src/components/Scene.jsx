import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane, TransformControls, Cone } from '@react-three/drei';
import useStore from '../store';
import * as THREE from 'three';

// New component for Canvas-specific setup
function CanvasSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.capabilities.isWebGL2 = true;
    gl.physicallyCorrectLights = true;
    gl.outputEncoding = THREE.sRGBEncoding;
  }, [gl]);
  return null;
}

// New component to manage light orientation
function LightOrientationManager({ lights, meshRefs, lightTargetObjectsRef }) {
  useFrame(() => {
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
  return null; // This component doesn't render anything visible
}

function Scene() {
  const { 
    transformMode,
    lights, selectedLight, setSelectedLight, updateLight, updateLightPositionArray,
    mainSphereRoughness, mainSphereMetalness 
  } = useStore();

  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();
  const meshRefs = useRef(new Map()); // For light visual models and target visual models
  const lightTargetObjectsRef = useRef(new Map());

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
      <LightOrientationManager
        lights={lights}
        meshRefs={meshRefs}
        lightTargetObjectsRef={lightTargetObjectsRef}
      />
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
                <meshBasicMaterial color={light.color} />
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
                  rotation={[-Math.PI / 2, 0, 0]} // Rotate the cone inside the group
                >
                  <meshBasicMaterial color={light.color} />
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
                <meshBasicMaterial color="hotpink" wireframe />
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
          onObjectChange={(e) => { // Changed from onMouseUp to onObjectChange
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
                
                // Use a fixed distance for stable rotation control
                const distance = 5; 
                
                const newTargetPosition = new THREE.Vector3(...light.position).add(direction.multiplyScalar(distance));
                
                updateLight(lightId, 'targetPosition', [newTargetPosition.x, newTargetPosition.y, newTargetPosition.z]);
              }
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

import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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

function Scene() {
  const { lights, selectedLight, setSelectedLight, updateLightPositionArray,
          mainSphereRoughness, mainSphereMetalness, updateLight } = useStore();

  // Removed DEBUGGING LOGS
  // console.log('Scene re-rendered');
  // console.log('Current lights in Scene:', lights);

  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();
  const meshRefs = useRef(new Map()); // For light visual models
  const lightRefs = useRef(new Map()); // To store references to actual light objects
  const helperRefs = useRef(new Map()); // To store references to helper objects

  // To store stable Object3D references for light targets
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

  useEffect(() => {
    lights.forEach(light => {
      // Update Three.js light targets based on store
      const targetObject = lightTargetObjectsRef.current.get(light.id);
      if (targetObject) {
        // For directional light, use its targetPosition from store
        if (light.type === 'directional' && light.targetPosition) {
          targetObject.position.set(...light.targetPosition);
        } else { // For spot light, or if targetPosition is not in store, default to origin
          targetObject.position.set(0, 0, 0);
        }
      }
    });
  }, [lights]);

  return (
    <Canvas shadows camera={{ position: [0, 2, 8], fov: 75 }}>
      <CanvasSetup />
      <ambientLight intensity={0.2} />
      
      {lights.map(light => {
        // Create a stable target Object3D for each light
        if (!lightTargetObjectsRef.current.has(light.id)) {
          lightTargetObjectsRef.current.set(light.id, new THREE.Object3D());
        }
        const currentLightTargetObject = lightTargetObjectsRef.current.get(light.id);

        return (
          <React.Fragment key={light.id}>
            {/* Render the stable target Object3D in the scene */}
            <primitive object={currentLightTargetObject} />

            {light.type === 'point' && (
              <pointLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                rotation={light.rotation}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                ref={(el) => lightRefs.current.set(light.id, el)} // Store ref
              />
            )}
            {light.type === 'spot' && (
              <spotLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                angle={light.angle}
                penumbra={light.penumbra}
                rotation={light.rotation}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                target={currentLightTargetObject} // Link to stable Object3D target
                ref={(el) => lightRefs.current.set(light.id, el)} // Store ref
              >
              </spotLight>
            )}
            {light.type === 'directional' && (
              <directionalLight
                position={light.position}
                color={light.color}
                intensity={light.intensity}
                rotation={light.rotation}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                target={currentLightTargetObject}
                ref={(el) => lightRefs.current.set(light.id, el)} // Store ref
              >
              </directionalLight>
            )}

            {/* Visual models for lights */}
            {light.type === 'point' && (
              <Sphere
                position={light.position}
                args={[0.2, 16, 16]}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }} // Select visual mesh
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <meshBasicMaterial color={light.color} />
              </Sphere>
            )}
            {light.type === 'spot' && (
              <Cone
                position={light.position}
                args={[0.2, 0.5, 32]}
                rotation={light.rotation}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }} // Select visual mesh
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <meshBasicMaterial color={light.color} />
              </Cone>
            )}
            {light.type === 'directional' && (
              <group
                position={light.position}
                rotation={light.rotation}
                onClick={(e) => { e.stopPropagation(); setSelectedLight(light.id); }} // Select visual mesh
                ref={(el) => meshRefs.current.set(light.id, el)}
              >
                <arrowHelper args={[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 1, light.color]} />
              </group>
            )}
          </React.Fragment>
        );
      })}

      {objectToControl && (
        <TransformControls
          ref={transformControlsRef}
          object={objectToControl}
          mode="translate" // Default to translate
          onMouseUp={(e) => {
            if (e.target.object) {
              const { x, y, z } = e.target.object.position;
              const { x: rotX, y: rotY, z: rotZ } = e.target.object.rotation;
              
              // Always update light's position and rotation
              updateLight(selectedLight, 'position', [x, y, z]);
              updateLight(selectedLight, 'rotation', [rotX, rotY, rotZ]);
            }
          }}
        />
      )}

      <Sphere args={[1, 32, 32]} position={[0, 0, 0]} castShadow> {/* Reverted main sphere position */}
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
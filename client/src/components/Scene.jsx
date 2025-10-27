import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  Plane,
  TransformControls,
  Cone,
  Grid,
} from "@react-three/drei";
import useStore from "../store/editorStore";
import * as THREE from "three";
import { Mannequin } from "./Mannequin";
import Diffuser from "./Diffuser";
import LetterboxOverlay from "./editor/LetterboxOverlay";
import { computeLetterbox, getAspectRatioValue } from "../lib/aspectRatio";
import { useSceneSelection } from "./editor/useSceneSelection";

// This component will contain all the 3D logic and objects.
// It is rendered inside the Canvas, so it can safely use R3F hooks.
function Experience() {
  // 각 값을 개별적으로 구독하여 무한 루프 방지
  const transformMode = useStore((state) => state.transformMode);
  const lights = useStore((state) => state.lights);
  const selectedLight = useStore((state) => state.selectedLight);
  const diffusers = useStore((state) => state.diffusers);
  const selectedDiffuser = useStore((state) => state.selectedDiffuser);
  const cameraState = useStore((state) => state.cameraState);
  const viewMode = useStore((state) => state.viewMode);
  const selectedMannequinId = useStore((state) => state.selectedMannequinId);
  const mannequins = useStore((state) => state.mannequins);
  const aspectRatio = useStore((state) => state.aspectRatio);

  // blockOriginalLight가 true인 디퓨저에 연결된 조명 ID 목록
  const blockedLightIds = useMemo(() => {
    const blocked = new Set();
    diffusers.forEach((diffuser) => {
      if (diffuser.blockOriginalLight && diffuser.linkedLightIds) {
        diffuser.linkedLightIds.forEach((lightId) => blocked.add(lightId));
      }
    });
    return blocked;
  }, [diffusers]);

  // 액션 함수들
  const updateLight = useStore((state) => state.updateLight);
  const setMannequinPosition = useStore((state) => state.setMannequinPosition);
  const setDiffuserPosition = useStore((state) => state.setDiffuserPosition);
  const setIsTransformInteracting = useStore(
    (state) => state.setIsTransformInteracting
  );

  const aspectRatioValue = useMemo(
    () => getAspectRatioValue(aspectRatio),
    [aspectRatio]
  );

  useEffect(() => {
    return () => {
      setIsTransformInteracting(false);
    };
  }, [setIsTransformInteracting]);
  const {
    handleLightPointerDown,
    handleStagePointerDown,
    handleDiffuserPointerDown,
  } = useSceneSelection();

  const { camera, size, gl } = useThree();
  const transformControlsRef = useRef();
  const lightRefs = useRef(new Map());
  const mannequinRefs = useRef(new Map());
  const diffuserRefs = useRef(new Map());
  const lightTargetObjectsRef = useRef(new Map());
  const virtualCamera = useRef(new THREE.PerspectiveCamera());
  const draggingRef = useRef(false);
  const orbitControlsRef = useRef(null);
  const scissorActiveRef = useRef(false);

  const registerLightHandle = useCallback((id, node) => {
    if (!id) return;
    if (node) {
      lightRefs.current.set(id, node);
    } else {
      lightRefs.current.delete(id);
    }
  }, []);

  const registerMannequinHandle = useCallback((id, node) => {
    if (!id) return;
    if (node) {
      mannequinRefs.current.set(id, node);
    } else {
      mannequinRefs.current.delete(id);
    }
  }, []);

  const registerDiffuserHandle = useCallback((id, node) => {
    if (!id) return;
    if (node) {
      diffuserRefs.current.set(id, node);
    } else {
      diffuserRefs.current.delete(id);
    }
  }, []);

  const disableOrbitControls = useCallback(() => {
    if (draggingRef.current) {
      return;
    }
    draggingRef.current = true;
    const orbit = orbitControlsRef.current;
    if (orbit) {
      orbit.enabled = false;
    }
    setIsTransformInteracting(true);
  }, [setIsTransformInteracting]);

  const enableOrbitControls = useCallback(() => {
    const currentViewMode = useStore.getState().viewMode;

    if (!draggingRef.current) {
      return;
    }
    draggingRef.current = false;
    const orbit = orbitControlsRef.current;
    if (orbit) {
      const shouldEnable = currentViewMode === "free";
      orbit.enabled = shouldEnable;

      if (shouldEnable) {
        orbit.enableRotate = true;
        orbit.enablePan = true;
        orbit.enableZoom = true;
      }
    }
    setIsTransformInteracting(false);
  }, [setIsTransformInteracting]);

  // Determine which object to control
  const lightToControl = lightRefs.current.get(selectedLight);
  const mannequinToControl = mannequinRefs.current.get(selectedMannequinId);
  const diffuserToControl = diffuserRefs.current.get(selectedDiffuser);
  const objectToControl = selectedLight
    ? lightToControl
    : selectedDiffuser
    ? diffuserToControl
    : mannequinToControl;

  // TransformControls 이벤트 리스너 설정
  // 기즈모 드래그 시 OrbitControls 비활성화하여 충돌 방지
  useEffect(() => {
    const transformCtrl = transformControlsRef.current;
    if (!transformCtrl) return;

    const handleDragging = (event) => {
      const orbit = orbitControlsRef.current;
      if (!orbit) {
        return;
      }

      if (event.value) {
        // 드래그 시작 - OrbitControls 완전히 비활성화
        disableOrbitControls();
        orbit.enableRotate = false;
        orbit.enablePan = false;
        orbit.enableZoom = false;
      } else {
        // 드래그 종료 - OrbitControls 다시 활성화
        enableOrbitControls();
        const currentViewMode = useStore.getState().viewMode;
        if (currentViewMode === "free") {
          orbit.enableRotate = true;
          orbit.enablePan = true;
          orbit.enableZoom = true;
        }
      }
    };

    const handlePointerStart = () => {
      disableOrbitControls();
      const orbit = orbitControlsRef.current;
      if (orbit) {
        orbit.enableRotate = false;
        orbit.enablePan = false;
        orbit.enableZoom = false;
      }
    };

    const handlePointerEnd = () => {
      enableOrbitControls();
      const orbit = orbitControlsRef.current;
      const currentViewMode = useStore.getState().viewMode;
      if (orbit && currentViewMode === "free") {
        orbit.enableRotate = true;
        orbit.enablePan = true;
        orbit.enableZoom = true;
      }
    };

    transformCtrl.addEventListener("dragging-changed", handleDragging);
    transformCtrl.addEventListener("mouseDown", handlePointerStart);
    transformCtrl.addEventListener("touchStart", handlePointerStart);
    transformCtrl.addEventListener("mouseUp", handlePointerEnd);
    transformCtrl.addEventListener("touchEnd", handlePointerEnd);
    transformCtrl.addEventListener("touchCancel", handlePointerEnd);

    return () => {
      transformCtrl.removeEventListener("dragging-changed", handleDragging);
      transformCtrl.removeEventListener("mouseDown", handlePointerStart);
      transformCtrl.removeEventListener("touchStart", handlePointerStart);
      transformCtrl.removeEventListener("mouseUp", handlePointerEnd);
      transformCtrl.removeEventListener("touchEnd", handlePointerEnd);
      transformCtrl.removeEventListener("touchCancel", handlePointerEnd);
    };
  }, [disableOrbitControls, enableOrbitControls, viewMode]);

  useEffect(() => {
    const transformCtrl = transformControlsRef.current;
    if (!transformCtrl) return;
    if (objectToControl) {
      transformCtrl.attach(objectToControl);
    } else {
      transformCtrl.detach();
    }
  }, [objectToControl]);

  // viewMode 변경 시 OrbitControls 상태 동기화
  useEffect(() => {
    const orbit = orbitControlsRef.current;
    if (!orbit) {
      return;
    }

    if (viewMode === "free" && !draggingRef.current) {
      orbit.enabled = true;
      orbit.enableRotate = true;
      orbit.enablePan = true;
      orbit.enableZoom = true;
    } else {
      orbit.enabled = false;
      orbit.enableRotate = false;
      orbit.enablePan = false;
      orbit.enableZoom = false;
    }
  }, [viewMode]);

  useEffect(() => {
    return () => {
      gl.setScissorTest(false);
      gl.setViewport(0, 0, size.width, size.height);
      gl.setScissor(0, 0, size.width, size.height);
      scissorActiveRef.current = false;
    };
  }, [gl, size.height, size.width]);

  useFrame(() => {
    const isCameraView = viewMode === "camera";
    const safeArea = isCameraView
      ? computeLetterbox(size.width, size.height, aspectRatioValue)
      : null;

    let viewportWidth = size.width;
    let viewportHeight = size.height;
    let offsetX = 0;
    let offsetY = 0;

    if (isCameraView && safeArea) {
      viewportWidth = safeArea.viewportWidth || size.width;
      viewportHeight = safeArea.viewportHeight || size.height;
      offsetX = safeArea.offsetX || 0;
      offsetY = safeArea.offsetY || 0;

      if (!scissorActiveRef.current) {
        gl.setScissorTest(true);
        scissorActiveRef.current = true;
      }

      if (viewportWidth > 0 && viewportHeight > 0) {
        gl.setViewport(offsetX, offsetY, viewportWidth, viewportHeight);
        gl.setScissor(offsetX, offsetY, viewportWidth, viewportHeight);
      }
    } else {
      if (scissorActiveRef.current) {
        gl.setScissorTest(false);
        scissorActiveRef.current = false;
      }

      gl.setViewport(0, 0, size.width, size.height);
      gl.setScissor(0, 0, size.width, size.height);
    }

    // OrbitControls 상태는 useEffect에서 제어하므로 여기서는 제거
    const vCam = virtualCamera.current;
    vCam.position.set(...cameraState.position);
    vCam.lookAt(new THREE.Vector3(...cameraState.target));
    const sensorHeight = 24;
    vCam.fov =
      2 *
      Math.atan(sensorHeight / (2 * cameraState.focalLength)) *
      (180 / Math.PI);
    if (viewportWidth > 0 && viewportHeight > 0) {
      vCam.aspect = viewportWidth / viewportHeight;
      vCam.updateProjectionMatrix();
    }

    if (isCameraView && safeArea) {
      camera.position.copy(vCam.position);
      camera.quaternion.copy(vCam.quaternion);
      camera.fov = vCam.fov;
      if (safeArea.viewportWidth && safeArea.viewportHeight) {
        camera.aspect = safeArea.viewportWidth / safeArea.viewportHeight;
        camera.updateProjectionMatrix();
      }
    } else {
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }

    lights.forEach((light) => {
      if (light.type === "spot" || light.type === "directional") {
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
      {viewMode === "free" && <cameraHelper args={[virtualCamera.current]} />}

      <ambientLight intensity={0.2} />

      {/* [Architecture 시나리오 2: 기즈모로 조명 이동 - 1단계: 조명 렌더링 및 선택] */}
      {lights.map((light) => {
        if (!lightTargetObjectsRef.current.has(light.id)) {
          lightTargetObjectsRef.current.set(light.id, new THREE.Object3D());
        }
        const currentLightTargetObject = lightTargetObjectsRef.current.get(
          light.id
        );
        if (light.targetPosition) {
          currentLightTargetObject.position.set(...light.targetPosition);
        }

        return (
          <React.Fragment key={light.id}>
            <primitive object={currentLightTargetObject} />
            {(() => {
              const { id: _lightId, type, ...rest } = light;
              void _lightId;
              // blockOriginalLight가 true인 디퓨저에 연결된 조명은 차단
              const isBlocked = blockedLightIds.has(light.id);
              const adjustedIntensity = isBlocked ? 0 : rest.intensity;
              const lightProps = { ...rest, intensity: adjustedIntensity };

              switch (type) {
                case "point":
                  return <pointLight {...lightProps} />;
                case "spot":
                  return (
                    <spotLight {...lightProps} target={currentLightTargetObject} />
                  );
                case "directional":
                  return (
                    <directionalLight
                      {...lightProps}
                      target={currentLightTargetObject}
                    />
                  );
                default:
                  return null;
              }
            })(light)}

            {/* Visual helpers for lights */}
            {/* [시나리오 2-1: 조명 클릭 → setSelectedLight 호출] */}
            {light.type === "point" && (
              <Sphere
                position={light.position}
                args={[0.3, 16, 16]}
                onPointerDown={(event) =>
                  handleLightPointerDown(event, light.id)
                }
                ref={(el) => registerLightHandle(light.id, el)}
              >
                <meshStandardMaterial
                  color={light.color}
                  emissive={light.color}
                  emissiveIntensity={2}
                />
              </Sphere>
            )}
            {light.type === "spot" && (
              <group
                position={light.position}
                onPointerDown={(event) =>
                  handleLightPointerDown(event, light.id)
                }
                ref={(el) => registerLightHandle(light.id, el)}
              >
                <Cone args={[0.5, 0.7, 32]} rotation={[-Math.PI / 2, 0, 0]}>
                  <meshStandardMaterial
                    color={light.color}
                    emissive={light.color}
                    emissiveIntensity={2}
                  />
                </Cone>
              </group>
            )}
            {light.type === "directional" && (
              <group
                position={light.position}
                onPointerDown={(event) =>
                  handleLightPointerDown(event, light.id)
                }
                ref={(el) => registerLightHandle(light.id, el)}
              >
                <arrowHelper
                  args={[
                    new THREE.Vector3(0, 0, -1).applyQuaternion(
                      new THREE.Quaternion().setFromUnitVectors(
                        new THREE.Vector3(0, 0, 1),
                        new THREE.Vector3(...light.position).normalize()
                      )
                    ),
                    new THREE.Vector3(0, 0, 0),
                    1,
                    light.color,
                  ]}
                />
              </group>
            )}
            {(light.type === "directional" || light.type === "spot") && (
              <Sphere
                position={light.targetPosition}
                args={[0.2, 16, 16]}
                onPointerDown={(event) =>
                  handleLightPointerDown(event, `${light.id}-target`)
                }
                ref={(el) => registerLightHandle(`${light.id}-target`, el)}
              >
                <meshStandardMaterial color="hotpink" wireframe />
              </Sphere>
            )}
          </React.Fragment>
        );
      })}

      {/* [Architecture 시나리오 2: 기즈모로 조명 이동 - 2단계: TransformControls] */}
      {objectToControl && (
        <TransformControls
          ref={transformControlsRef}
          object={objectToControl}
          mode={transformMode}
          makeDefault={false}
          onObjectChange={(e) => {
            if (e?.target?.object) {
              const obj = e.target.object;
              // [시나리오 2-2: getState()로 최신 상태 확인]
              // 이벤트 핸들러는 클로저로 인해 오래된 state를 참조할 수 있으므로
              // getState()를 사용하여 항상 최신 상태를 가져옴
              const state = useStore.getState(); // Get fresh state

              // [시나리오 2-3: updateLight 액션 호출하여 Zustand Store 업데이트]
              // Use fresh state to determine what to update
              if (state.selectedLight) {
                const newPosition = [
                  obj.position.x,
                  obj.position.y,
                  obj.position.z,
                ];
                if (state.selectedLight.endsWith("-target")) {
                  const baseLightId = state.selectedLight.replace(
                    /-target$/,
                    ""
                  );
                  updateLight(baseLightId, "targetPosition", newPosition);
                } else {
                  updateLight(state.selectedLight, "position", newPosition);
                }
              } else if (state.selectedDiffuser) {
                // Diffuser 위치 이동
                const newPosition = [
                  obj.position.x,
                  obj.position.y,
                  obj.position.z,
                ];
                setDiffuserPosition(state.selectedDiffuser, newPosition);
              } else if (state.selectedMannequinId) {
                // 마네킹 위치 이동 (시나리오 2와 유사한 패턴)
                const newPosition = [
                  obj.position.x,
                  obj.position.y,
                  obj.position.z,
                ];
                setMannequinPosition(state.selectedMannequinId, newPosition);
              }
            }
          }}
        />
      )}

      <React.Suspense fallback={null}>
        {mannequins.map((m) => (
          <Mannequin
            key={m.id}
            {...m}
            ref={(el) => registerMannequinHandle(m.id, el)}
          />
        ))}
      </React.Suspense>

      {/* Diffusers - 광목천/실크 디퓨저 */}
      {diffusers.map((diffuser) => (
        <Diffuser
          key={diffuser.id}
          {...diffuser}
          ref={(el) => registerDiffuserHandle(diffuser.id, el)}
          onPointerDown={(event) =>
            handleDiffuserPointerDown(event, diffuser.id)
          }
        />
      ))}

      <Grid
        position={[0, -1.49, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[100, 100]}
        cellColor={"white"}
        cellSize={1}
        sectionSize={10}
        sectionColor={"#444"}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
      />
      <Plane
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
        args={[100, 100]}
      >
        <meshStandardMaterial color="grey" />
      </Plane>

      <OrbitControls ref={orbitControlsRef} makeDefault />
    </>
  );
}
function Scene() {
  const containerRef = useRef(null);
  const aspectRatio = useStore((state) => state.aspectRatio);
  const viewMode = useStore((state) => state.viewMode);
  const isTransformInteracting = useStore(
    (state) => state.isTransformInteracting
  );
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { handleStagePointerDown } = useSceneSelection();

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const safeArea = useMemo(() => {
    if (viewMode !== "camera") {
      return null;
    }
    return computeLetterbox(
      dimensions.width,
      dimensions.height,
      getAspectRatioValue(aspectRatio)
    );
  }, [dimensions.height, dimensions.width, aspectRatio, viewMode]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <Canvas
        shadows
        className="w-full h-full"
        onPointerMissed={(event) => {
          // 기즈모 드래그 중일 때는 Canvas 클릭 이벤트 무시
          if (isTransformInteracting) {
            return;
          }
          handleStagePointerDown(event);
        }}
      >
        <Experience />
      </Canvas>
      {viewMode === "camera" && <LetterboxOverlay safeArea={safeArea} />}
    </div>
  );
}

export default Scene;

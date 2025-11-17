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
  Environment,
  useGLTF,
} from "@react-three/drei";
import useStore from "../store/editorStore";
import useAssetStore from "../store/assetStore";
import * as THREE from "three";
import { RGBELoader, EXRLoader } from "three-stdlib";
import { Mannequin } from "./Mannequin";
import Diffuser from "./Diffuser";
import LetterboxOverlay from "./editor/LetterboxOverlay";
import { computeLetterbox, getAspectRatioValue } from "../lib/aspectRatio";
import { useSceneSelection } from "./editor/useSceneSelection";
import { getAssetId } from "../lib/assetUtils";

const getGltfModelKey = (model, index) => {
  if (!model) return `model-${index}`;
  return (
    model.id ||
    model.instanceId ||
    (model.assetId ? `asset-${model.assetId}` : `model-${index}`)
  );
};

function useHdriTexture(fileUrl) {
  const [texture, setTexture] = React.useState(null);
  const [error, setError] = React.useState(null);
  const textureRef = React.useRef(null);
  const disposeCurrentTexture = useCallback(() => {
    if (textureRef.current) {
      textureRef.current.dispose?.();
      textureRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!fileUrl) {
      disposeCurrentTexture();
      setTexture(null);
      setError(null);
      return;
    }

    let isCancelled = false;
    const lowerUrl = fileUrl.toLowerCase();
    const isExr = lowerUrl.endsWith(".exr");
    const LoaderClass = isExr ? EXRLoader : RGBELoader;
    const loader = new LoaderClass();

    if (loader.setDataType) {
      loader.setDataType(isExr ? THREE.FloatType : THREE.HalfFloatType);
    }

    if (loader.setCrossOrigin) {
      loader.setCrossOrigin("anonymous");
    }

    loader.load(
      fileUrl,
      (nextTexture) => {
        if (isCancelled) {
          nextTexture?.dispose?.();
          return;
        }

        nextTexture.mapping = THREE.EquirectangularReflectionMapping;
        nextTexture.colorSpace = THREE.LinearSRGBColorSpace;
        nextTexture.needsUpdate = true;

        disposeCurrentTexture();
        textureRef.current = nextTexture;
        setError(null);
        setTexture(nextTexture);
      },
      undefined,
      (err) => {
        if (isCancelled) return;
        console.error("HDRI 로드 에러:", err);
        setError(err);
        disposeCurrentTexture();
        setTexture(null);
      }
    );

    return () => {
      isCancelled = true;
      disposeCurrentTexture();
      if (loader.dispose) {
        loader.dispose();
      }
    };
  }, [fileUrl, disposeCurrentTexture]);

  return { texture, error };
}

// HDRI Environment 컴포넌트 (에러 핸들링 포함)
function HdriEnvironment({ fileUrl, setAsBackground = false }) {
  const { texture, error } = useHdriTexture(fileUrl);

  if (!fileUrl || error || !texture) {
    return <ambientLight intensity={0.2} />;
  }

  return <Environment map={texture} background={setAsBackground} />;
}

// GLTF Model 컴포넌트 (Wrapper)
function GltfModelWrapper({
  fileUrl,
  position,
  rotation,
  scale,
  registerHandle,
  onPointerDown,
}) {
  if (!fileUrl) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <GltfModel
        fileUrl={fileUrl}
        position={position}
        rotation={rotation}
        scale={scale}
        registerHandle={registerHandle}
        onPointerDown={onPointerDown}
      />
    </React.Suspense>
  );
}

// GLTF Model 실제 로드 컴포넌트
function GltfModel({
  fileUrl,
  position,
  rotation,
  scale,
  registerHandle,
  onPointerDown,
}) {
  // useGLTF는 항상 호출되어야 함 (훅 규칙)
  const gltf = useGLTF(fileUrl);
  const groupRef = useRef();
  const clonedScene = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone();
  }, [gltf]);

  useEffect(() => {
    if (!registerHandle) {
      return undefined;
    }
    registerHandle(groupRef.current || null);
    return () => registerHandle(null);
  }, [registerHandle]);

  if (!gltf || !gltf.scene) {
    console.warn('GLTF 로드 실패:', fileUrl);
    // 폴백 박스 표시
    return (
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerDown={onPointerDown}
      >
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={onPointerDown}
    >
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}

// This component will contain all the 3D logic and objects.
// It is rendered inside the Canvas, so it can safely use R3F hooks.
function Experience({ readOnly = false }) {
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
  const orbitControlState = useStore((state) => state.orbitControlState);
  const selectedGltfModelId = useStore((state) => state.selectedGltfModelId);
  const setSelectedGltfModel = useStore(
    (state) => state.setSelectedGltfModel
  );
  const backgroundSettings = useStore((state) => state.backgroundSettings);
  const snapEnabled = useStore((state) => state.snapEnabled);

  // Asset 상태
  const assets = useAssetStore((state) => state.assets);
  const currentHdri = useAssetStore((state) => state.currentHdri);
  const currentGltfModels = useAssetStore((state) => state.currentGltfModels);
  const updateGltfModel = useAssetStore((state) => state.updateGltfModel);
  const currentHdriAsset = assets.find(
    (asset) => getAssetId(asset) === currentHdri
  );

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
  const setMannequinScale = useStore((state) => state.setMannequinScale);
  const setDiffuserPosition = useStore((state) => state.setDiffuserPosition);
  const setDiffuserScale = useStore((state) => state.setDiffuserScale);
  const setIsTransformInteracting = useStore(
    (state) => state.setIsTransformInteracting
  );
  const updateOrbitControlState = useStore(
    (state) => state.updateOrbitControlState
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
    handleDiffuserPointerDown,
    handleGltfModelPointerDown,
  } = useSceneSelection();

  const { camera, size, gl, scene } = useThree();
  const transformControlsRef = useRef();
  const lightRefs = useRef(new Map());
  const mannequinRefs = useRef(new Map());
  const diffuserRefs = useRef(new Map());
  const lightTargetObjectsRef = useRef(new Map());
  const virtualCamera = useRef(new THREE.PerspectiveCamera());
  const draggingRef = useRef(false);
  const orbitControlsRef = useRef(null);
  const scissorActiveRef = useRef(false);
  const isRestoringOrbitRef = useRef(false); // 복원 중 플래그

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

  const gltfModelRefs = useRef(new Map());
  const registerGltfModelHandle = useCallback((assetId, node) => {
    if (!assetId) return;
    if (node) {
      gltfModelRefs.current.set(assetId, node);
    } else {
      gltfModelRefs.current.delete(assetId);
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

  // OrbitControls 상태 저장 (프로젝트 로드 시 카메라 위치 복원용)
  useEffect(() => {
    const orbit = orbitControlsRef.current;
    if (!orbit) return;

    let throttleTimer = null;

    const handleOrbitChange = () => {
      // 복원 중에는 상태 저장하지 않음 (무한 루프 방지)
      if (isRestoringOrbitRef.current) {
        return;
      }

      // 100ms throttle로 성능 최적화
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        const newOrbitState = {
          cameraPosition: [
            camera.position.x,
            camera.position.y,
            camera.position.z,
          ],
          target: [orbit.target.x, orbit.target.y, orbit.target.z],
          zoom: camera.zoom || 1,
        };
        updateOrbitControlState(newOrbitState);
        throttleTimer = null;
      }, 100);
    };

    orbit.addEventListener("change", handleOrbitChange);

    return () => {
      orbit.removeEventListener("change", handleOrbitChange);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [camera, updateOrbitControlState]);

  // 프로젝트 로드 시 OrbitControls 위치 복원
  // 이전 orbitControlState를 저장하여 실제 변경 시에만 복원 실행
  const prevOrbitStateRef = useRef(null);

  useEffect(() => {
    const orbit = orbitControlsRef.current;

    if (!orbit || !orbitControlState) {
      return;
    }

    // 이전 상태와 비교하여 실제로 변경되었는지 확인
    const prev = prevOrbitStateRef.current;
    const isSamePosition = prev &&
      prev.cameraPosition[0] === orbitControlState.cameraPosition[0] &&
      prev.cameraPosition[1] === orbitControlState.cameraPosition[1] &&
      prev.cameraPosition[2] === orbitControlState.cameraPosition[2] &&
      prev.target[0] === orbitControlState.target[0] &&
      prev.target[1] === orbitControlState.target[1] &&
      prev.target[2] === orbitControlState.target[2] &&
      (prev.zoom || 1) === (orbitControlState.zoom || 1);

    if (isSamePosition) {
      return;
    }

    // 복원 중 플래그 설정 (change 이벤트 무시)
    isRestoringOrbitRef.current = true;

    // OrbitControls 위치 복원
    camera.position.set(...orbitControlState.cameraPosition);
    orbit.target.set(...orbitControlState.target);
    camera.zoom = orbitControlState.zoom || 1;
    camera.updateProjectionMatrix();
    orbit.update();

    // 현재 상태를 이전 상태로 저장
    prevOrbitStateRef.current = {
      cameraPosition: [...orbitControlState.cameraPosition],
      target: [...orbitControlState.target],
      zoom: orbitControlState.zoom || 1,
    };

    // 복원 완료 후 플래그 해제 (다음 프레임에서)
    requestAnimationFrame(() => {
      isRestoringOrbitRef.current = false;
    });
  }, [orbitControlState, camera]);

  // Determine which object to control
  const lightToControl = lightRefs.current.get(selectedLight);
  const mannequinToControl = mannequinRefs.current.get(selectedMannequinId);
  const diffuserToControl = diffuserRefs.current.get(selectedDiffuser);
  const gltfModelToControl = gltfModelRefs.current.get(selectedGltfModelId);
  const objectToControl = selectedLight
    ? lightToControl
    : selectedDiffuser
    ? diffuserToControl
    : selectedGltfModelId
    ? gltfModelToControl
    : mannequinToControl;

  useEffect(() => {
    if (!selectedGltfModelId) {
      return;
    }
    const stillExists = currentGltfModels.some(
      (model) => model.assetId === selectedGltfModelId
    );
    if (!stillExists) {
      setSelectedGltfModel(null);
    }
  }, [currentGltfModels, selectedGltfModelId, setSelectedGltfModel]);

  const hdriActive =
    backgroundSettings.type === "hdri" && currentHdriAsset?.fileUrl;

  useEffect(() => {
    if (!scene) {
      return;
    }

    if (backgroundSettings.type === "color" || !hdriActive) {
      const colorValue = backgroundSettings.color || "#050505";
      const nextColor = new THREE.Color(colorValue);
      scene.background = nextColor;
    } else if (backgroundSettings.type === "none") {
      scene.background = null;
    } else if (backgroundSettings.type === "hdri" && hdriActive) {
      scene.background = null;
    }
  }, [scene, backgroundSettings, hdriActive]);

  useEffect(() => {
    if (!scene) {
      return;
    }
    if (typeof scene.environmentIntensity === "number") {
      scene.environmentIntensity = backgroundSettings.hdriIntensity || 1;
    }
  }, [scene, backgroundSettings.hdriIntensity]);

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

    if (!objectToControl || !objectToControl.parent) {
      transformCtrl.detach();
      return;
    }

    transformCtrl.attach(objectToControl);

    return () => {
      if (transformCtrl.object === objectToControl) {
        transformCtrl.detach();
      }
    };
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

      {/* HDRI 환경 맵 */}
      {hdriActive && (
        <React.Suspense fallback={null}>
          <HdriEnvironment
            fileUrl={currentHdriAsset.fileUrl}
            setAsBackground={backgroundSettings.type === "hdri"}
          />
        </React.Suspense>
      )}
      <ambientLight intensity={0.2} />

      {/* [Architecture 시나리오 2: 기즈모로 조명 이동 - 1단계: 조명 렌더링 및 선택] */}
      {lights.map((light) => {
        // visible이 false면 렌더링하지 않음
        if (light.visible === false) {
          return null;
        }

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
                    <spotLight
                      {...lightProps}
                      target={currentLightTargetObject}
                    />
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
      {!readOnly && objectToControl && (
        <TransformControls
          ref={transformControlsRef}
          object={objectToControl}
          mode={transformMode}
          makeDefault={false}
          translationSnap={snapEnabled ? 0.5 : null}
          rotationSnap={snapEnabled ? Math.PI / 12 : null}
          scaleSnap={snapEnabled ? 0.1 : null}
          onMouseUp={() => {
            // Transform 완료 시 히스토리 저장
            useStore.getState().saveHistory();
          }}
          onObjectChange={(e) => {
            if (e?.target?.object) {
              const obj = e.target.object;
              // [시나리오 2-2: getState()로 최신 상태 확인]
              // 이벤트 핸들러는 클로저로 인해 오래된 state를 참조할 수 있으므로
              // getState()를 사용하여 항상 최신 상태를 가져옴
              const state = useStore.getState(); // Get fresh state
              const mode = state.transformMode;

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
              } else if (state.selectedGltfModelId) {
                const assetId = state.selectedGltfModelId;
                if (mode === "rotate") {
                  const newRotation = [
                    obj.rotation.x,
                    obj.rotation.y,
                    obj.rotation.z,
                  ];
                  updateGltfModel(assetId, "rotation", newRotation);
                } else if (mode === "scale") {
                  const newScale = [
                    obj.scale.x,
                    obj.scale.y,
                    obj.scale.z,
                  ];
                  updateGltfModel(assetId, "scale", newScale);
                } else {
                  const newPosition = [
                    obj.position.x,
                    obj.position.y,
                    obj.position.z,
                  ];
                  updateGltfModel(assetId, "position", newPosition);
                }
              } else if (state.selectedDiffuser) {
                if (mode === "scale") {
                  const newScale = [
                    obj.scale.x,
                    obj.scale.y,
                    obj.scale.z,
                  ];
                  setDiffuserScale(state.selectedDiffuser, newScale);
                } else {
                  const newPosition = [
                    obj.position.x,
                    obj.position.y,
                    obj.position.z,
                  ];
                  setDiffuserPosition(state.selectedDiffuser, newPosition);
                }
              } else if (state.selectedMannequinId) {
                if (mode === "scale") {
                  const newScale = [
                    obj.scale.x,
                    obj.scale.y,
                    obj.scale.z,
                  ];
                  setMannequinScale(state.selectedMannequinId, newScale);
                } else {
                  const newPosition = [
                    obj.position.x,
                    obj.position.y,
                    obj.position.z,
                  ];
                  setMannequinPosition(state.selectedMannequinId, newPosition);
                }
              }
            }
          }}
        />
      )}

      <React.Suspense fallback={null}>
        {mannequins.map((m) => {
          // visible이 false면 렌더링하지 않음
          if (m.visible === false) {
            return null;
          }
          return (
            <Mannequin
              key={m.id}
              {...m}
              ref={(el) => registerMannequinHandle(m.id, el)}
            />
          );
        })}

        {/* GLTF 모델들 */}
        {currentGltfModels
          .filter((model) => {
            // visible이 false면 렌더링하지 않음
            if (model.visible === false) {
              return false;
            }
            const asset = assets.find(
              (a) => getAssetId(a) === model.assetId
            );
            return asset && asset.fileUrl;
          })
          .map((model, index) => {
            const asset = assets.find(
              (a) => getAssetId(a) === model.assetId
            );
            return (
              <GltfModelWrapper
                key={getGltfModelKey(model, index)}
                fileUrl={asset.fileUrl}
                position={model.position}
                rotation={model.rotation}
                scale={model.scale}
                registerHandle={(node) =>
                  registerGltfModelHandle(model.assetId, node)
                }
                onPointerDown={(event) =>
                  handleGltfModelPointerDown(event, model.assetId)
                }
              />
            );
          })}
      </React.Suspense>

      {/* Diffusers - 광목천/실크 디퓨저 */}
      {diffusers.map((diffuser) => {
        // visible이 false면 렌더링하지 않음
        if (diffuser.visible === false) {
          return null;
        }
        return (
          <Diffuser
            key={diffuser.id}
            {...diffuser}
            ref={(el) => registerDiffuserHandle(diffuser.id, el)}
            onPointerDown={(event) =>
              handleDiffuserPointerDown(event, diffuser.id)
            }
          />
        );
      })}

      {backgroundSettings.showGround && (
        <>
          <Grid
            position={[0, -1.49, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            args={[100, 100]}
            cellColor="#ffffff"
            cellSize={1}
            sectionSize={10}
            sectionColor="#444"
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
            <meshStandardMaterial
              color={backgroundSettings.groundColor || "#666666"}
              metalness={
                typeof backgroundSettings.groundReflectivity === "number"
                  ? backgroundSettings.groundReflectivity
                  : 0.15
              }
              roughness={
                1 -
                (typeof backgroundSettings.groundReflectivity === "number"
                  ? backgroundSettings.groundReflectivity
                  : 0.15)
              }
            />
          </Plane>
        </>
      )}

      <OrbitControls ref={orbitControlsRef} makeDefault />
    </>
  );
}
function Scene({ readOnly = false }) {
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
        <Experience readOnly={readOnly} />
      </Canvas>
      {viewMode === "camera" && <LetterboxOverlay safeArea={safeArea} />}
    </div>
  );
}

export default Scene;

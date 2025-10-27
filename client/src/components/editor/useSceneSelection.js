import { useCallback } from "react";
import useStore from "../../store/editorStore";

/**
 * Scene Selection Hook
 *
 * 3D Scene 내 객체(조명, 마네킹) 선택 로직을 관리하는 커스텀 훅
 * Architecture 문서의 시나리오 2 (기즈모로 조명 이동)의 선택 로직을 담당
 * 참고: docs/LumoStage-Architecture.md
 */
export const useSceneSelection = () => {
  const setSelectedLight = useStore((state) => state.setSelectedLight);
  const selectMannequin = useStore((state) => state.selectMannequin);
  const setHighlightedBone = useStore((state) => state.setHighlightedBone);
  const setSelectedDiffuser = useStore((state) => state.setSelectedDiffuser);

  const clearSelection = useCallback(() => {
    selectMannequin(null);
    setSelectedLight(null);
    setHighlightedBone(null);
    setSelectedDiffuser(null);
  }, [selectMannequin, setHighlightedBone, setSelectedLight, setSelectedDiffuser]);

  // [Architecture 시나리오 2-1: 조명 선택]
  // Scene에서 조명 헬퍼를 클릭하면 이 함수가 호출되어 setSelectedLight 액션 실행
  const focusLight = useCallback(
    (handleId) => {
      if (!handleId) {
        clearSelection();
        return;
      }
      setSelectedLight(handleId);
      selectMannequin(null);
      setHighlightedBone(null);
      setSelectedDiffuser(null);
    },
    [clearSelection, selectMannequin, setHighlightedBone, setSelectedLight, setSelectedDiffuser]
  );

  const focusMannequin = useCallback(
    (mannequinId, boneName = null) => {
      setSelectedLight(null);
      selectMannequin(mannequinId);
      setHighlightedBone(boneName);
      setSelectedDiffuser(null);
    },
    [selectMannequin, setHighlightedBone, setSelectedLight, setSelectedDiffuser]
  );

  const focusDiffuser = useCallback(
    (diffuserId) => {
      setSelectedLight(null);
      selectMannequin(null);
      setHighlightedBone(null);
      setSelectedDiffuser(diffuserId);
    },
    [selectMannequin, setHighlightedBone, setSelectedLight, setSelectedDiffuser]
  );

  const isLeftClick = (event) => {
    const button =
      event?.button !== undefined ? event.button : event?.nativeEvent?.button;
    return button === undefined || button === 0;
  };

  const handleLightPointerDown = useCallback(
    (event, handleId) => {
      if (!isLeftClick(event)) {
        return;
      }
      // R3F pointer events expose stopPropagation on the synthetic event
      event?.stopPropagation?.();
      event?.nativeEvent?.stopImmediatePropagation?.();
      focusLight(handleId);
    },
    [focusLight]
  );

  const handleStagePointerDown = useCallback(
    (event) => {
      if (!isLeftClick(event)) {
        return;
      }

      if (useStore.getState().isTransformInteracting) {
        return;
      }

      const intersectsTransformControl = (event?.intersections || []).some(
        (intersection) => {
          let current = intersection.object;
          while (current) {
            if (
              current.isTransformControlsGizmo ||
              current.isTransformControlsPlane ||
              current.type === "TransformControlsGizmo" ||
              current.type === "TransformControlsPlane"
            ) {
              return true;
            }
            current = current.parent;
          }
          return false;
        }
      );

      if (intersectsTransformControl) {
        return;
      }
      clearSelection();
    },
    [clearSelection]
  );

  const handleMannequinPointerDown = useCallback(
    (event, mannequinId) => {
      if (!isLeftClick(event)) {
        return;
      }
      event?.stopPropagation?.();
      event?.nativeEvent?.stopImmediatePropagation?.();
      focusMannequin(mannequinId);
    },
    [focusMannequin]
  );

  const handleDiffuserPointerDown = useCallback(
    (event, diffuserId) => {
      if (!isLeftClick(event)) {
        return;
      }
      event?.stopPropagation?.();
      event?.nativeEvent?.stopImmediatePropagation?.();
      focusDiffuser(diffuserId);
    },
    [focusDiffuser]
  );

  return {
    focusLight,
    focusMannequin,
    focusDiffuser,
    clearSelection,
    handleLightPointerDown,
    handleStagePointerDown,
    handleMannequinPointerDown,
    handleDiffuserPointerDown,
  };
};

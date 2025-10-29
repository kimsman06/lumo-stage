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
  const applySelection = useCallback((computeNext) => {
    useStore.setState((state) => {
      const next = computeNext(state);
      const unchanged =
        state.selectedLight === next.selectedLight &&
        state.selectedMannequinId === next.selectedMannequinId &&
        state.highlightedBone === next.highlightedBone &&
        state.selectedDiffuser === next.selectedDiffuser;

      return unchanged ? state : next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    applySelection(() => ({
      selectedLight: null,
      selectedMannequinId: null,
      highlightedBone: null,
      selectedDiffuser: null,
    }));
  }, [applySelection]);

  // [Architecture 시나리오 2-1: 조명 선택]
  // Scene에서 조명 헬퍼를 클릭하면 이 함수가 호출되어 setSelectedLight 액션 실행
  const focusLight = useCallback(
    (handleId) => {
      if (!handleId) {
        clearSelection();
        return;
      }
      applySelection(() => ({
        selectedLight: handleId,
        selectedMannequinId: null,
        highlightedBone: null,
        selectedDiffuser: null,
      }));
    },
    [applySelection, clearSelection]
  );

  const focusMannequin = useCallback(
    (mannequinId, boneName = null) => {
      applySelection(() => ({
        selectedLight: null,
        selectedMannequinId: mannequinId,
        highlightedBone: boneName,
        selectedDiffuser: null,
      }));
    },
    [applySelection]
  );

  const focusDiffuser = useCallback(
    (diffuserId) => {
      applySelection(() => ({
        selectedLight: null,
        selectedMannequinId: null,
        highlightedBone: null,
        selectedDiffuser: diffuserId,
      }));
    },
    [applySelection]
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

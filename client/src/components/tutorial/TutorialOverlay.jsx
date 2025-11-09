import React, { useEffect, useState } from 'react';
import { useTutorial } from './TutorialProvider';
import TutorialDialog from './TutorialDialog';
import TutorialTooltip from './TutorialTooltip';
import TutorialSpotlight from './TutorialSpotlight';
import KeyboardShortcutsCard from './KeyboardShortcutsCard';
import useStore from '@/store/editorStore';

/**
 * TutorialOverlay - 튜토리얼 시스템의 메인 오케스트레이터
 * 각 단계에 맞는 UI를 렌더링하고 조건을 체크하여 자동으로 다음 단계로 이동
 */
const TutorialOverlay = () => {
  const {
    isActive,
    currentStep,
    TUTORIAL_STEPS,
    nextStep,
    skipTutorial,
    completeTutorial,
    showShortcuts,
    setShowShortcuts,
  } = useTutorial();

  const lights = useStore((state) => state.lights);
  const mannequins = useStore((state) => state.mannequins);
  const setSelectedLight = useStore((state) => state.setSelectedLight);
  const selectMannequin = useStore((state) => state.selectMannequin);
  const selectCamera = useStore((state) => state.selectCamera);
  const [hasAddedLight, setHasAddedLight] = useState(false);
  const [initialLightCount] = useState(lights.length);

  // Step 3: 조명 추가 감지
  useEffect(() => {
    if (currentStep === TUTORIAL_STEPS.ADD_LIGHT) {
      if (lights.length > initialLightCount && !hasAddedLight) {
        setHasAddedLight(true);
        // 2초 후 자동으로 다음 단계
        setTimeout(() => {
          nextStep();
        }, 2000);
      }
    }
  }, [lights, currentStep, TUTORIAL_STEPS.ADD_LIGHT, initialLightCount, hasAddedLight, nextStep]);

  // 튜토리얼 단계별 선택 상태 동기화
  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (currentStep === TUTORIAL_STEPS.ADJUST_LIGHT) {
      const newestLight = lights[lights.length - 1] || lights[0];
      if (newestLight) {
        setSelectedLight(newestLight.id);
      }
    } else if (currentStep === TUTORIAL_STEPS.MANNEQUIN_POSE) {
      if (mannequins[0]) {
        selectMannequin(mannequins[0].id);
      }
    } else if (currentStep === TUTORIAL_STEPS.CAMERA_CONTROL) {
      selectCamera();
    }
  }, [
    currentStep,
    isActive,
    lights,
    mannequins,
    setSelectedLight,
    selectMannequin,
    selectCamera,
    TUTORIAL_STEPS.ADJUST_LIGHT,
    TUTORIAL_STEPS.MANNEQUIN_POSE,
    TUTORIAL_STEPS.CAMERA_CONTROL,
  ]);

  // 키보드 단축키 카드
  const handleCloseShortcuts = () => {
    setShowShortcuts(false);
  };

  // Step 0: Welcome Dialog
  if (currentStep === TUTORIAL_STEPS.WELCOME) {
    return (
      <>
        <TutorialDialog
          open={isActive}
          onOpenChange={(open) => !open && skipTutorial()}
          type="welcome"
          onStart={nextStep}
          onSkip={skipTutorial}
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  // Step 6: Complete Dialog
  if (currentStep === TUTORIAL_STEPS.COMPLETE) {
    return (
      <>
        <TutorialDialog
          open={isActive}
          onOpenChange={(open) => !open && completeTutorial()}
          type="complete"
          onClose={completeTutorial}
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  // 튜토리얼이 비활성 상태일 때는 단축키 카드만 표시
  if (!isActive) {
    return (
      <KeyboardShortcutsCard
        isOpen={showShortcuts}
        onClose={handleCloseShortcuts}
      />
    );
  }

  // Step 1: 3D Viewport 조작
  if (currentStep === TUTORIAL_STEPS.VIEWPORT) {
    return (
      <>
        <TutorialSpotlight
          targetSelector="canvas"
          isActive={true}
          padding={16}
          borderRadius={12}
        />
        <TutorialTooltip
          targetSelector="canvas"
          title="3D Viewport 조작"
          description={`마우스를 사용해 자유롭게 시점을 움직여보세요!

🖱️ 좌클릭 드래그: 카메라 회전
🖱️ 우클릭 드래그: 카메라 이동
🖱️ 스크롤: 줌 인/아웃`}
          position="left"
          isActive={true}
          onNext={nextStep}
          onSkip={skipTutorial}
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  // Step 2: 조명 추가
  if (currentStep === TUTORIAL_STEPS.ADD_LIGHT) {
    return (
      <>
        <TutorialSpotlight
          targetSelector="[data-tutorial='add-light-button']"
          isActive={true}
          padding={12}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-tutorial='add-light-button']"
          title="조명 추가하기"
          description={`왼쪽 툴바(ToolPanel)의 전구 버튼을 눌러 새로운 조명을 추가해보세요.

💡 버튼을 클릭하면 즉시 씬에 Spot Light가 생성되고
Outliner와 Properties 패널에서 편집할 수 있습니다.`}
          position="left"
          isActive={true}
          onNext={nextStep}
          onSkip={skipTutorial}
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  // Step 3: 조명 속성 조정
  if (currentStep === TUTORIAL_STEPS.ADJUST_LIGHT) {
    return (
      <>
        <TutorialSpotlight
          targetSelector="[data-tutorial='light-properties-tab']"
          isActive={true}
          padding={12}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-tutorial='light-properties-tab']"
          title="조명 속성 조정"
          description={`우측 Properties 패널에서 방금 추가한 조명의 색상과 강도를 조정해보세요.

1. Properties 탭을 열고
2. Color/Intensity 값을 바꾸면 씬에 즉시 반영됩니다.`}
          position="left"
          isActive={true}
          onNext={nextStep}
          onSkip={skipTutorial}
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  // Step 4: 마네킹 포즈 변경
  if (currentStep === TUTORIAL_STEPS.MANNEQUIN_POSE) {
    return (
      <>
        <TutorialSpotlight
          targetSelector="[data-node-type='mannequin']"
          isActive={true}
          padding={8}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-node-type='mannequin']"
          title="마네킹 포즈 변경"
          description={`우측 상단 Outliner에서 마네킹 노드를 선택해보세요.

선택 후 Properties 패널에서 프리셋 포즈를 적용하거나
관절을 직접 조정해 다양한 연출을 만들 수 있습니다.`}
          position="left"
          isActive={true}
          onNext={nextStep}
          onSkip={skipTutorial}
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  // Step 5: 카메라 조정
  if (currentStep === TUTORIAL_STEPS.CAMERA_CONTROL) {
    return (
      <>
        <TutorialSpotlight
          targetSelector="[data-tutorial='camera-section']"
          isActive={true}
          padding={12}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-tutorial='camera-section']"
          title="카메라 설정"
          description={`Scene 카메라를 선택하면 우측 Properties 패널에서
위치·피사체·FOV를 한 번에 조정할 수 있습니다.

카메라를 조정해 원하는 프레이밍을 맞춰보세요.`}
          position="left"
          isActive={true}
          onNext={nextStep}
          onSkip={skipTutorial}
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  // Step 6: 프로젝트 저장
  if (currentStep === TUTORIAL_STEPS.SAVE_PROJECT) {
    return (
      <>
        <TutorialSpotlight
          targetSelector="[data-tutorial='save-button']"
          isActive={true}
          padding={8}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-tutorial='save-button']"
          title="프로젝트 저장"
          description={`작업한 내용을 저장해보세요!

💾 "저장" 버튼을 클릭하면 현재 씬의 모든 설정이 저장됩니다.
⌨️ Ctrl+S (Mac: ⌘+S) 단축키로도 저장할 수 있습니다.

언제든지 다시 불러와서 작업을 이어갈 수 있습니다!`}
          position="bottom"
          isActive={true}
          onNext={nextStep}
          onSkip={skipTutorial}
          nextLabel="완료"
        />
        <KeyboardShortcutsCard
          isOpen={showShortcuts}
          onClose={handleCloseShortcuts}
        />
      </>
    );
  }

  return (
    <KeyboardShortcutsCard
      isOpen={showShortcuts}
      onClose={handleCloseShortcuts}
    />
  );
};

export default TutorialOverlay;

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
  const [hasAddedLight, setHasAddedLight] = useState(false);
  const [hasAdjustedLight, setHasAdjustedLight] = useState(false);
  const [hasChangedPose, setHasChangedPose] = useState(false);
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
          description={`씬에 새로운 조명을 추가해보세요!

💡 "조명 추가" 버튼을 클릭하면 다양한 타입의 조명을 선택할 수 있습니다.

지금 한번 추가해보세요!`}
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
          targetSelector="[data-tutorial='light-controls']"
          isActive={true}
          padding={12}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-tutorial='light-controls']"
          title="조명 속성 조정"
          description={`조명의 색상, 강도, 위치 등을 조절해보세요!

🎨 Color: 조명 색상
💪 Intensity: 조명 밝기
📍 Position: 조명 위치

슬라이더를 움직여 실시간으로 변화를 확인할 수 있습니다.`}
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
          targetSelector="[data-tutorial='mannequin-tab']"
          isActive={true}
          padding={8}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-tutorial='mannequin-tab']"
          title="마네킹 포즈 변경"
          description={`마네킹 탭으로 이동하여 포즈를 변경해보세요!

🧍 다양한 프리셋 포즈를 선택하거나
🦴 개별 관절을 조정하여 원하는 포즈를 만들 수 있습니다.

탭을 클릭해보세요!`}
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
          targetSelector="[data-tutorial='camera-tab']"
          isActive={true}
          padding={8}
          borderRadius={8}
        />
        <TutorialTooltip
          targetSelector="[data-tutorial='camera-tab']"
          title="카메라 설정"
          description={`카메라 탭에서 시점을 조정해보세요!

📷 카메라 위치, 각도 조정
🎯 FOV(시야각) 변경
🔄 OrbitControl과 카메라 뷰 동기화

탭을 클릭하여 카메라 설정을 확인해보세요!`}
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

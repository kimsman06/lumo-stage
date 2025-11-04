import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TutorialContext = createContext(null);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

const TUTORIAL_STEPS = {
  WELCOME: 0,
  VIEWPORT: 1,
  ADD_LIGHT: 2,
  ADJUST_LIGHT: 3,
  MANNEQUIN_POSE: 4,
  CAMERA_CONTROL: 5,
  SAVE_PROJECT: 6,
  COMPLETE: 7,
};

const STORAGE_KEYS = {
  COMPLETED: 'lumostage_tutorial_completed',
  SKIPPED: 'lumostage_tutorial_skipped',
};

const TutorialProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(TUTORIAL_STEPS.WELCOME);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // localStorage에서 상태 로드
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED) === 'true';
    const skipped = localStorage.getItem(STORAGE_KEYS.SKIPPED) === 'true';

    setIsCompleted(completed);
    setIsSkipped(skipped);

    // 첫 방문 시 자동으로 튜토리얼 시작
    if (!completed && !skipped) {
      setIsActive(true);
    }
  }, []);

  // 튜토리얼 시작
  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(TUTORIAL_STEPS.WELCOME);
    setIsCompleted(false);
    setIsSkipped(false);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.SKIPPED);
  }, []);

  // 다음 단계로 이동
  const nextStep = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.COMPLETE) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep]);

  // 특정 단계로 이동
  const goToStep = useCallback((step) => {
    if (step >= TUTORIAL_STEPS.WELCOME && step <= TUTORIAL_STEPS.COMPLETE) {
      setCurrentStep(step);
    }
  }, []);

  // 튜토리얼 건너뛰기
  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setIsSkipped(true);
    localStorage.setItem(STORAGE_KEYS.SKIPPED, 'true');
  }, []);

  // 튜토리얼 완료
  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    setCurrentStep(TUTORIAL_STEPS.COMPLETE);
    localStorage.setItem(STORAGE_KEYS.COMPLETED, 'true');
  }, []);

  // 단축키 카드 토글
  const toggleShortcuts = useCallback(() => {
    setShowShortcuts((prev) => !prev);
  }, []);

  // 키보드 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Input 요소에서는 무시
      if (event.target.tagName.toLowerCase() === 'input' ||
          event.target.tagName.toLowerCase() === 'textarea') {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'escape':
          if (isActive) {
            skipTutorial();
          }
          break;
        case '?':
          event.preventDefault();
          toggleShortcuts();
          break;
        case 'h':
          event.preventDefault();
          startTutorial();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, skipTutorial, toggleShortcuts, startTutorial]);

  const value = {
    // 상태
    isActive,
    currentStep,
    isCompleted,
    isSkipped,
    showShortcuts,
    TUTORIAL_STEPS,

    // 액션
    startTutorial,
    nextStep,
    goToStep,
    skipTutorial,
    completeTutorial,
    toggleShortcuts,
    setShowShortcuts,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export default TutorialProvider;

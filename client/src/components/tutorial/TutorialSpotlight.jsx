import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TutorialSpotlight - 특정 UI 요소를 강조하는 스포트라이트 컴포넌트
 *
 * @param {string} targetSelector - 강조할 요소의 CSS 선택자
 * @param {boolean} isActive - 스포트라이트 활성화 여부
 * @param {number} padding - 강조 영역 주변 여백 (기본값: 8px)
 * @param {number} borderRadius - 강조 영역 모서리 둥글기 (기본값: 8px)
 */
const TutorialSpotlight = ({
  targetSelector,
  isActive = false,
  padding = 8,
  borderRadius = 8
}) => {
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setTargetRect(null);
      }
    };

    // 초기 위치 계산
    updateTargetRect();

    // 윈도우 리사이즈 시 재계산
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    // MutationObserver로 DOM 변화 감지
    const observer = new MutationObserver(updateTargetRect);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
      observer.disconnect();
    };
  }, [targetSelector, isActive, padding]);

  if (!isActive || !targetRect) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998 }}
      >

        {/* 강조 테두리 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute border-2 border-blue-400 ring-4 ring-blue-400/40"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: `${borderRadius}px`,
            pointerEvents: 'none',
          }}
        >
          {/* 펄스 애니메이션 */}
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 border-2 border-blue-300/70 rounded-[inherit]"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialSpotlight;

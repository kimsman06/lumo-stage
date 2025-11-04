import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';

/**
 * TutorialTooltip - 특정 요소 근처에 표시되는 튜토리얼 안내 Tooltip
 *
 * @param {string} targetSelector - 타겟 요소의 CSS 선택자
 * @param {string} title - Tooltip 제목
 * @param {string} description - Tooltip 설명
 * @param {string} position - Tooltip 위치 ('top' | 'bottom' | 'left' | 'right')
 * @param {boolean} isActive - Tooltip 활성화 여부
 * @param {function} onNext - '다음' 버튼 클릭 핸들러
 * @param {function} onSkip - '건너뛰기' 버튼 클릭 핸들러
 * @param {string} nextLabel - '다음' 버튼 레이블 (기본값: '다음')
 * @param {boolean} showSkip - '건너뛰기' 버튼 표시 여부 (기본값: true)
 */
const TutorialTooltip = ({
  targetSelector,
  title,
  description,
  position = 'right',
  isActive = false,
  onNext,
  onSkip,
  nextLabel = '다음',
  showSkip = true,
}) => {
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const [arrowStyle, setArrowStyle] = useState(null);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setTooltipStyle(null);
      setArrowStyle(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (!element) {
        setTooltipStyle(null);
        setArrowStyle(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 200; // 대략적인 높이
      const gap = 16; // 타겟과의 간격
      const arrowSize = 8;

      let top, left;
      let arrowPosition = {};

      switch (position) {
        case 'top':
          top = rect.top - tooltipHeight - gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = {
            bottom: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            borderTop: '1px solid hsl(var(--border))',
            borderLeft: '1px solid hsl(var(--border))',
          };
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = {
            top: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            borderBottom: '1px solid hsl(var(--border))',
            borderRight: '1px solid hsl(var(--border))',
          };
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - gap;
          arrowPosition = {
            top: '50%',
            right: -arrowSize,
            transform: 'translateY(-50%) rotate(45deg)',
            borderTop: '1px solid hsl(var(--border))',
            borderRight: '1px solid hsl(var(--border))',
          };
          break;
        case 'right':
        default:
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + gap;
          arrowPosition = {
            top: '50%',
            left: -arrowSize,
            transform: 'translateY(-50%) rotate(45deg)',
            borderBottom: '1px solid hsl(var(--border))',
            borderLeft: '1px solid hsl(var(--border))',
          };
          break;
      }

      // 화면 밖으로 나가지 않도록 조정
      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      if (top < padding) top = padding;

      setTooltipStyle({ top, left, width: tooltipWidth });
      setArrowStyle(arrowPosition);
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      observer.disconnect();
    };
  }, [targetSelector, isActive, position]);

  if (!isActive || !tooltipStyle) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed bg-card border border-border rounded-lg shadow-2xl p-4"
        style={{
          ...tooltipStyle,
          zIndex: 9999,
        }}
      >
        {/* 화살표 */}
        {arrowStyle && (
          <div
            className="absolute w-4 h-4 bg-card"
            style={arrowStyle}
          />
        )}

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {showSkip && (
            <button
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="건너뛰기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 설명 */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">
          {description}
        </p>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-end gap-2">
          {showSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              size="sm"
            >
              나중에
            </Button>
          )}
          <Button
            onClick={onNext}
            size="sm"
            className="gap-2"
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialTooltip;

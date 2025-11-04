import React from 'react';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CenteredDialogContent } from '@/components/ui/centered-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle } from 'lucide-react';

/**
 * TutorialDialog - Welcome과 Complete 단계에서 사용하는 Dialog
 *
 * @param {boolean} open - Dialog 열림 여부
 * @param {function} onOpenChange - Dialog 상태 변경 핸들러
 * @param {string} type - Dialog 타입 ('welcome' | 'complete')
 * @param {function} onStart - 시작하기 버튼 클릭 핸들러
 * @param {function} onSkip - 나중에 버튼 클릭 핸들러
 * @param {function} onClose - 닫기 버튼 클릭 핸들러
 */
const TutorialDialog = ({
  open,
  onOpenChange,
  type = 'welcome',
  onStart,
  onSkip,
  onClose,
}) => {
  if (type === 'welcome') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <CenteredDialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <DialogTitle className="text-2xl">LumoStage에 오신 것을 환영합니다!</DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed">
              3D 조명 시뮬레이션 툴을 처음 사용하시나요?
              <br />
              <br />
              5분 안에 핵심 기능을 익힐 수 있는 간단한 튜토리얼을 준비했습니다.
              <br />
              <br />
              <span className="text-sm text-muted-foreground">
                💡 언제든 <kbd className="px-2 py-1 text-xs bg-muted rounded">ESC</kbd> 키를 눌러 건너뛸 수 있습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full sm:w-auto"
            >
              나중에 할게요
            </Button>
            <Button
              onClick={onStart}
              className="w-full sm:w-auto"
            >
              시작하기
            </Button>
          </DialogFooter>
        </CenteredDialogContent>
      </Dialog>
    );
  }

  if (type === 'complete') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <CenteredDialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <DialogTitle className="text-2xl">튜토리얼 완료!</DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed">
              축하합니다! LumoStage의 핵심 기능을 모두 익히셨습니다.
              <br />
              <br />
              이제 자유롭게 조명과 카메라를 조정하여 멋진 씬을 만들어보세요.
              <br />
              <br />
              <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-foreground">유용한 단축키</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">W</kbd>
                    <span>이동 모드</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">E</kbd>
                    <span>회전 모드</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">?</kbd>
                    <span>단축키 도움말</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">H</kbd>
                    <span>튜토리얼 다시 보기</span>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={onClose}
              className="w-full"
            >
              시작하기
            </Button>
          </DialogFooter>
        </CenteredDialogContent>
      </Dialog>
    );
  }

  return null;
};

export default TutorialDialog;

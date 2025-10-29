import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

/**
 * ShareButton - 공유 버튼 컴포넌트
 *
 * @param {string} projectId - 프로젝트 ID
 * @param {'dropdown' | 'button'} variant - 렌더링 형태
 * @param {function} onOpenDialog - ShareDialog 열기 콜백
 * @param {string} className - 추가 CSS 클래스
 */
export default function ShareButton({ projectId, variant = 'button', onOpenDialog, className = '' }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onOpenDialog?.();
  };

  if (variant === 'dropdown') {
    return (
      <DropdownMenuItem
        onClick={handleClick}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        공유
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className={className}
      aria-label="프로젝트 공유"
    >
      <Share2 className="w-4 h-4 mr-2" />
      공유
    </Button>
  );
}

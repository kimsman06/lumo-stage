import { Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * ShareStatusBadge - 공유 상태 뱃지 컴포넌트
 *
 * @param {boolean} isShared - 공유 중 여부
 * @param {boolean} isActive - 활성화 상태
 * @param {'view' | 'edit'} permission - 권한
 */
export default function ShareStatusBadge({ isShared, isActive, permission = 'view' }) {
  if (!isShared) return null;

  const getTooltipText = () => {
    if (!isActive) return '공유가 비활성화되어 있습니다';
    return permission === 'view'
      ? '읽기 전용으로 공유 중'
      : '편집 가능으로 공유 중';
  };

  const getBadgeVariant = () => {
    if (!isActive) return 'secondary';
    return 'default';
  };

  const getBadgeText = () => {
    if (!isActive) return '비활성';
    return '공유 중';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getBadgeVariant()}
            className="flex items-center gap-1 px-2 py-1"
          >
            <LinkIcon className="w-3 h-3" />
            {getBadgeText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

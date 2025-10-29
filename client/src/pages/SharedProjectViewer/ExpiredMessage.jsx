import { Link } from 'react-router-dom';
import { Link as LinkIcon, AlertCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ExpiredMessage - 만료/비활성 메시지 컴포넌트
 *
 * @param {'expired' | 'inactive' | 'not-found'} reason - 표시 이유
 */
export default function ExpiredMessage({ reason = 'expired' }) {
  const getIcon = () => {
    switch (reason) {
      case 'expired':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'inactive':
        return <Ban className="w-16 h-16 text-red-500" />;
      case 'not-found':
        return <LinkIcon className="w-16 h-16 text-muted-foreground" />;
      default:
        return <LinkIcon className="w-16 h-16 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (reason) {
      case 'expired':
        return '이 공유 링크는 만료되었습니다';
      case 'inactive':
        return '이 공유 링크는 비활성화되었습니다';
      case 'not-found':
        return '프로젝트를 찾을 수 없습니다';
      default:
        return '접근할 수 없습니다';
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'expired':
        return '프로젝트 소유자에게 새 링크를 요청하세요.';
      case 'inactive':
        return '프로젝트 소유자가 공유를 비활성화했습니다.';
      case 'not-found':
        return '링크가 올바르지 않거나 프로젝트가 삭제되었습니다.';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-studio-950">
      <div className="flex flex-col items-center justify-center max-w-md p-8 text-center space-y-6">
        {getIcon()}
        <h1 className="text-2xl font-semibold text-white">
          {getTitle()}
        </h1>
        <p className="text-muted-foreground">
          {getDescription()}
        </p>
        <Link to="/">
          <Button variant="outline" size="lg">
            LumoStage 홈으로
          </Button>
        </Link>
      </div>
    </div>
  );
}

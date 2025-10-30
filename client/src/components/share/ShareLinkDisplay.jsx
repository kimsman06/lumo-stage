import { useState, useRef } from 'react';
import { Clipboard, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SHARE_MESSAGES } from '@/lib/toast-messages';

/**
 * ShareLinkDisplay - 공유 링크 표시 및 복사 컴포넌트
 *
 * @param {string} shareUrl - 공유 URL
 * @param {Date} createdAt - 생성 시간
 * @param {Date | null} expiresAt - 만료 시간
 * @param {function} onCopy - 복사 콜백 (옵션)
 */
export default function ShareLinkDisplay({ shareUrl, createdAt, expiresAt, onCopy }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const handleCopy = async () => {
    try {
      // 클립보드 API 사용
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // 폴백: 수동 선택 및 복사
        inputRef.current?.select();
        document.execCommand('copy');
      }

      toast.success(SHARE_MESSAGES.linkCopied);
      setCopied(true);
      onCopy?.();

      // 2초 후 원래 상태로 복귀
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error(SHARE_MESSAGES.linkCopyError);
      // 대체 UI: 링크를 선택하여 수동 복사하도록 안내
      inputRef.current?.select();
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExpirationText = () => {
    if (!expiresAt) return '무제한';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return '만료됨';
    return `${formatDate(expiresAt)} (${diffDays}일 후)`;
  };

  return (
    <div className="space-y-4 p-4 bg-studio-800 rounded-lg border border-studio-700">
      <div className="flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-primary-500" />
        <Label className="text-sm font-medium">공유 링크</Label>
      </div>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={shareUrl}
          readOnly
          className="font-mono text-sm bg-studio-900 border-studio-700"
          onClick={(e) => e.target.select()}
        />
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label="공유 링크 복사"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              복사됨
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4 mr-1" />
              복사
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>생성일: {formatDate(createdAt)}</p>
        <p>만료: {getExpirationText()}</p>
      </div>

      {/* 접근성: 복사 상태 알림 */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? '복사됨' : ''}
      </span>
    </div>
  );
}

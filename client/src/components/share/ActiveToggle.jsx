import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

/**
 * ActiveToggle - 공유 활성화/비활성화 토글 컴포넌트
 *
 * @param {boolean} checked - 현재 활성화 상태
 * @param {function} onChange - 상태 변경 콜백
 * @param {boolean} disabled - 비활성화 여부
 */
export default function ActiveToggle({ checked, onChange, disabled = false }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-studio-700">
      <div className="flex-1">
        <Label htmlFor="share-active" className="text-sm font-medium cursor-pointer">
          공유 활성화
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          {checked
            ? '공유 링크로 접근할 수 있습니다'
            : '비활성화 시 공유 링크로 접근할 수 없습니다'}
        </p>
      </div>
      <Switch
        id="share-active"
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

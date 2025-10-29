import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/**
 * PermissionSelector - 권한 선택 컴포넌트
 *
 * @param {'view' | 'edit'} value - 현재 선택된 권한
 * @param {function} onChange - 권한 변경 콜백
 * @param {boolean} disabled - 비활성화 여부
 */
export default function PermissionSelector({ value, onChange, disabled = false }) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">권한 설정</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        aria-label="권한 설정"
        className="space-y-3"
      >
        {/* 읽기 전용 */}
        <div className="flex items-start space-x-3 p-3 rounded-lg border border-studio-700 hover:border-studio-600 transition-colors">
          <RadioGroupItem value="view" id="permission-view" className="mt-1" />
          <div className="flex-1">
            <Label
              htmlFor="permission-view"
              className="font-medium cursor-pointer"
            >
              읽기 전용
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              조회만 가능합니다. 조명/카메라 조정이 불가능합니다.
            </p>
            <p className="text-xs text-primary-500 mt-1">
              권장: 피드백 받기, 포트폴리오 공유
            </p>
          </div>
        </div>

        {/* 편집 가능 */}
        <div className="flex items-start space-x-3 p-3 rounded-lg border border-studio-700 hover:border-studio-600 transition-colors">
          <RadioGroupItem value="edit" id="permission-edit" className="mt-1" />
          <div className="flex-1">
            <Label
              htmlFor="permission-edit"
              className="font-medium cursor-pointer"
            >
              편집 가능
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              조명/카메라를 조정할 수 있지만 저장은 불가능합니다.
            </p>
            <p className="text-xs text-primary-500 mt-1">
              권장: 협업, 실시간 조명 테스트
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}

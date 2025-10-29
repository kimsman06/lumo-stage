import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * ExpirationSelector - 만료 시간 선택 컴포넌트
 *
 * @param {null | 1 | 7 | 30} value - 현재 선택된 만료 일수 (null: 무제한)
 * @param {function} onChange - 만료 시간 변경 콜백
 * @param {boolean} disabled - 비활성화 여부
 */
export default function ExpirationSelector({ value, onChange, disabled = false }) {
  const handleValueChange = (val) => {
    if (val === 'never') {
      onChange(null);
    } else {
      onChange(Number(val));
    }
  };

  const getDisplayValue = () => {
    if (value === null) return 'never';
    return String(value);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="expiration-select" className="text-sm font-medium">
        만료 시간
      </Label>
      <Select
        value={getDisplayValue()}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="expiration-select" className="w-full">
          <SelectValue placeholder="만료 시간 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="never">무제한</SelectItem>
          <SelectItem value="1">1일</SelectItem>
          <SelectItem value="7">7일</SelectItem>
          <SelectItem value="30">30일</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {value === null
          ? '링크가 만료되지 않습니다'
          : `${value}일 후 링크가 만료됩니다`}
      </p>
    </div>
  );
}

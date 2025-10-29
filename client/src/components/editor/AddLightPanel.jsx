import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddLightPanel = ({
  lightType,
  onLightTypeChange,
  onAddLight,
  disabled = false,
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">새 조명 추가</h3>
      <div className="flex gap-2">
        <Select
          value={lightType}
          onValueChange={onLightTypeChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="조명 종류" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="point">Point Light</SelectItem>
            <SelectItem value="spot">Spot Light</SelectItem>
            <SelectItem value="directional">Directional Light</SelectItem>
          </SelectContent>
        </Select>
        <Button className="" onClick={onAddLight} disabled={disabled}>
          추가
        </Button>
      </div>
    </div>
  );
};

export default AddLightPanel;

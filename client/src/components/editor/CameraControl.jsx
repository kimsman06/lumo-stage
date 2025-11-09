import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useStore from "../../store/editorStore";
import { ASPECT_RATIO_OPTIONS } from "../../lib/aspectRatio";

const Vector3Input = ({ label, value, onChange, disabled }) => {
  const handleChange = (index, newValue) => {
    const updated = [...value];
    updated[index] = parseFloat(newValue) || 0;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{label}</h3>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-[10px] text-muted-foreground mb-1">X</Label>
          <Input
            type="number"
            step="0.01"
            value={value[0]}
            onChange={(e) => handleChange(0, e.target.value)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground mb-1">Y</Label>
          <Input
            type="number"
            step="0.01"
            value={value[1]}
            onChange={(e) => handleChange(1, e.target.value)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground mb-1">Z</Label>
          <Input
            type="number"
            step="0.01"
            value={value[2]}
            onChange={(e) => handleChange(2, e.target.value)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

const CameraControl = ({ readOnly = false }) => {
  const {
    cameraState,
    updateCameraState,
    viewMode,
    setViewMode,
    aspectRatio,
    setAspectRatio,
  } = useStore();

  const isDisabled = readOnly;

  const handlePositionChange = (newPosition) => {
    updateCameraState("position", newPosition);
  };

  const handleTargetChange = (newTarget) => {
    updateCameraState("target", newTarget);
  };

  return (
    <div className="space-y-4">
      {/* View Mode Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">View Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setViewMode("free")}
            variant={viewMode === "free" ? "default" : "outline"}
            disabled={isDisabled}
            size="sm"
          >
            자유 시점
          </Button>
          <Button
            onClick={() => setViewMode("camera")}
            variant={viewMode === "camera" ? "default" : "outline"}
            disabled={isDisabled}
            size="sm"
          >
            카메라 시점
          </Button>
        </div>
      </div>

      <Separator />

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">화면 비율</h3>
        <Select
          value={aspectRatio}
          onValueChange={setAspectRatio}
          disabled={isDisabled}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="화면 비율 선택" />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIO_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Position Controls */}
      <Vector3Input
        label="Position"
        value={cameraState.position}
        onChange={handlePositionChange}
        disabled={isDisabled}
      />

      <Separator />

      {/* Target Controls */}
      <Vector3Input
        label="Target"
        value={cameraState.target}
        onChange={handleTargetChange}
        disabled={isDisabled}
      />

      <Separator />

      {/* Focal Length Control */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Focal Length</h3>
        <Input
          type="number"
          step="0.1"
          value={cameraState.focalLength}
          onChange={(e) =>
            updateCameraState("focalLength", parseFloat(e.target.value) || 18)
          }
          className="h-8 text-xs"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default CameraControl;

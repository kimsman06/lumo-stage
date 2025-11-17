import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import useStore from "@/store/editorStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LightPropertiesSection = ({ light, readOnly = false }) => {
  const { updateLight, changeLightType } = useStore();

  if (!light) return null;

  const handleUpdate = (property, value) => {
    if (readOnly) return;
    updateLight(light.id, property, value);
  };

  const handleTypeChange = (nextType) => {
    if (readOnly) return;
    changeLightType(light.id, nextType);
  };

  return (
    <div className="space-y-4">
      {/* Light Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">조명 종류</Label>
        <Select value={light.type} onValueChange={handleTypeChange} disabled={readOnly}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="타입 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="point">Point Light</SelectItem>
            <SelectItem value="spot">Spot Light</SelectItem>
            <SelectItem value="directional">Directional Light</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Intensity */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Intensity</Label>
        <Input
          type="number"
          step="0.1"
          value={light.intensity}
          onChange={(e) => handleUpdate("intensity", parseFloat(e.target.value) || 0)}
          disabled={readOnly}
          className="h-8 text-xs"
        />
      </div>

      <Separator />

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Color</Label>
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-8 rounded border flex-shrink-0 ${!readOnly ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            style={{ backgroundColor: light.color }}
            onClick={() => {
              if (readOnly) return;
              const input = document.createElement("input");
              input.type = "color";
              input.value = light.color;
              input.onchange = (e) => handleUpdate("color", e.target.value);
              input.click();
            }}
          />
          <Input
            type="text"
            value={light.color}
            onChange={(e) => handleUpdate("color", e.target.value)}
            disabled={readOnly}
            className="h-8 text-xs flex-1"
          />
        </div>
      </div>

      <Separator />

      {/* Cast Shadow */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Cast Shadow</Label>
        <Checkbox
          checked={light.castShadow}
          onCheckedChange={(checked) => handleUpdate("castShadow", checked)}
          disabled={readOnly}
        />
      </div>

      {/* Spot Light specific */}
      {light.type === "spot" && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Angle (radians)</Label>
            <Input
              type="number"
              step="0.01"
              value={light.angle}
              onChange={(e) => handleUpdate("angle", parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Penumbra</Label>
            <Input
              type="number"
              step="0.01"
              value={light.penumbra}
              onChange={(e) => handleUpdate("penumbra", parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Distance</Label>
            <Input
              type="number"
              step="0.1"
              value={light.distance}
              onChange={(e) => handleUpdate("distance", parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Decay</Label>
            <Input
              type="number"
              step="0.1"
              value={light.decay}
              onChange={(e) => handleUpdate("decay", parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="h-8 text-xs"
            />
          </div>
        </>
      )}

      {/* Point Light specific */}
      {light.type === "point" && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Distance</Label>
            <Input
              type="number"
              step="0.1"
              value={light.distance}
              onChange={(e) => handleUpdate("distance", parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Decay</Label>
            <Input
              type="number"
              step="0.1"
              value={light.decay}
              onChange={(e) => handleUpdate("decay", parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="h-8 text-xs"
            />
          </div>
        </>
      )}

      {/* Directional Light specific */}
      {light.type === "directional" && (
        <>
          <Separator />
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            Directional lights illuminate the entire scene from a specific direction.
          </div>
        </>
      )}
    </div>
  );
};

export default LightPropertiesSection;

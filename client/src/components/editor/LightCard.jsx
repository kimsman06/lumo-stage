import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Lightbulb } from "lucide-react";
import useStore from "../../store/editorStore";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LightCard = React.forwardRef(
  ({ light, isSelected, readOnly = false }, ref) => {
    const { updateLight, changeLightType } = useStore();

    const isDisabled = readOnly;

    const handleUpdate = (property, value) => {
      if (isDisabled) return;
      updateLight(light.id, property, value);
    };

    const handlePositionChange = (axisIndex, value) => {
      if (isDisabled) return;
      const newPosition = [...light.position];
      newPosition[axisIndex] = parseFloat(value);
      updateLight(light.id, "position", newPosition);
    };

    const handleLightTypeChange = (nextType) => {
      if (isDisabled) return;
      changeLightType(light.id, nextType);
    };

    return (
      <Card ref={ref} className={cn(isSelected && "ring-2 ring-primary")}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              {light.name || "Light"}
            </CardTitle>
            <Select
              value={light.type}
              onValueChange={handleLightTypeChange}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-8 w-40 text-xs capitalize">
                <SelectValue placeholder="타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="point">Point Light</SelectItem>
                <SelectItem value="spot">Spot Light</SelectItem>
                <SelectItem value="directional">Directional Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Intensity</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[light.intensity]}
                max={50}
                step={0.5}
                onValueChange={(v) => handleUpdate("intensity", v[0])}
                className="flex-1"
                disabled={isDisabled}
              />
              <Input
                type="number"
                value={light.intensity}
                onChange={(e) =>
                  handleUpdate("intensity", parseFloat(e.target.value))
                }
                className="w-20 h-8"
                disabled={isDisabled}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Color</Label>
            <div className="relative w-8 h-8">
              <div
                className="absolute inset-0 rounded-md border"
                style={{ backgroundColor: light.color }}
              />
              <input
                type="color"
                value={light.color}
                onChange={(e) => handleUpdate("color", e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isDisabled}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={`pos-x-${light.id}`} className="w-4">
                  X
                </Label>
                <Slider
                  id={`pos-x-${light.id}`}
                  value={[light.position[0]]}
                  max={10}
                  min={-10}
                  step={0.1}
                  onValueChange={(v) => handlePositionChange(0, v[0])}
                  className="flex-1"
                  disabled={isDisabled}
                />
                <Input
                  type="number"
                  value={light.position[0]}
                  onChange={(e) => handlePositionChange(0, e.target.value)}
                  className="w-20 h-8"
                  disabled={isDisabled}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`pos-y-${light.id}`} className="w-4">
                  Y
                </Label>
                <Slider
                  id={`pos-y-${light.id}`}
                  value={[light.position[1]]}
                  max={10}
                  min={-10}
                  step={0.1}
                  onValueChange={(v) => handlePositionChange(1, v[0])}
                  className="flex-1"
                  disabled={isDisabled}
                />
                <Input
                  type="number"
                  value={light.position[1]}
                  onChange={(e) => handlePositionChange(1, e.target.value)}
                  className="w-20 h-8"
                  disabled={isDisabled}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`pos-z-${light.id}`} className="w-4">
                  Z
                </Label>
                <Slider
                  id={`pos-z-${light.id}`}
                  value={[light.position[2]]}
                  max={10}
                  min={-10}
                  step={0.1}
                  onValueChange={(v) => handlePositionChange(2, v[0])}
                  className="flex-1"
                  disabled={isDisabled}
                />
                <Input
                  type="number"
                  value={light.position[2]}
                  onChange={(e) => handlePositionChange(2, e.target.value)}
                  className="w-20 h-8"
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>
          {light.type === "spot" && (
            <>
              <div className="space-y-2">
                <Label>Angle</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[light.angle]}
                    max={Math.PI / 2}
                    step={0.01}
                    onValueChange={(v) => handleUpdate("angle", v[0])}
                    className="flex-1"
                    disabled={isDisabled}
                  />
                  <Input
                    type="number"
                    value={light.angle.toFixed(2)}
                    onChange={(e) =>
                      handleUpdate("angle", parseFloat(e.target.value))
                    }
                    className="w-20 h-8"
                    disabled={isDisabled}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Penumbra</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[light.penumbra]}
                    max={1}
                    step={0.01}
                    onValueChange={(v) => handleUpdate("penumbra", v[0])}
                    className="flex-1"
                    disabled={isDisabled}
                  />
                  <Input
                    type="number"
                    value={light.penumbra.toFixed(2)}
                    onChange={(e) =>
                      handleUpdate("penumbra", parseFloat(e.target.value))
                    }
                    className="w-20 h-8"
                    disabled={isDisabled}
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`cast-shadow-${light.id}`}
              checked={light.castShadow}
              onCheckedChange={(checked) => handleUpdate("castShadow", checked)}
              disabled={isDisabled}
            />
            <Label
              htmlFor={`cast-shadow-${light.id}`}
              className="text-sm font-medium leading-none"
            >
              Cast Shadow
            </Label>
          </div>
        </CardContent>
      </Card>
    );
  }
);

export default LightCard;

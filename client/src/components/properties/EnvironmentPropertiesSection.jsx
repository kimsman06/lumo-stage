import { useMemo } from "react";
import useStore from "@/store/editorStore";
import useAssetStore from "@/store/assetStore";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const BACKGROUND_OPTIONS = [
  { value: "color", label: "Solid Color" },
  { value: "hdri", label: "HDRI" },
  { value: "none", label: "None" },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const EnvironmentPropertiesSection = () => {
  const backgroundSettings = useStore((state) => state.backgroundSettings);
  const updateBackgroundSettings = useStore(
    (state) => state.updateBackgroundSettings
  );
  const currentHdri = useAssetStore((state) => state.currentHdri);

  const { type, color, hdriIntensity, showGround, groundColor, groundReflectivity } =
    backgroundSettings;

  const selectedBackgroundLabel = useMemo(() => {
    const option = BACKGROUND_OPTIONS.find((candidate) => candidate.value === type);
    return option ? option.label : "Solid Color";
  }, [type]);

  const handleColorInput = (nextColor) => {
    if (!nextColor) return;
    updateBackgroundSettings({ color: nextColor });
  };

  const handleGroundColorInput = (nextColor) => {
    if (!nextColor) return;
    updateBackgroundSettings({ groundColor: nextColor });
  };

  const openColorPicker = (currentValue, onChange) => {
    const input = document.createElement("input");
    input.type = "color";
    input.value = currentValue || "#000000";
    input.onchange = (event) => onChange(event.target.value);
    input.click();
  };

  return (
    <div className="space-y-4" aria-label="Environment Settings">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Environment</p>
          <p className="text-xs text-muted-foreground">{selectedBackgroundLabel}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">배경 타입</Label>
        <Select
          value={type}
          onValueChange={(value) => updateBackgroundSettings({ type: value })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="배경 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            {BACKGROUND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type !== "hdri" && type !== "none" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">배경 색상</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-10 h-8 rounded border cursor-pointer flex-shrink-0"
              style={{ backgroundColor: color }}
              onClick={() => openColorPicker(color, handleColorInput)}
              aria-label="배경 색상 선택"
            />
            <Input
              value={color || ""}
              onChange={(event) => handleColorInput(event.target.value)}
              className="h-8 text-xs flex-1"
              placeholder="#000000"
            />
          </div>
        </div>
      )}

      {type === "hdri" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">HDRI Intensity</Label>
            <span className="text-xs text-muted-foreground">
              {hdriIntensity.toFixed(1)}
            </span>
          </div>
          <Slider
            min={0}
            max={5}
            step={0.1}
            value={[clamp(hdriIntensity, 0, 5)]}
            onValueChange={([value]) =>
              updateBackgroundSettings({ hdriIntensity: value })
            }
          />
          {!currentHdri && (
            <p className="text-[11px] text-muted-foreground">
              HDRI가 선택되지 않았습니다. Outliner &gt; Scene &gt; HDRI 항목을 선택해
              에셋을 적용하세요.
            </p>
          )}
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium">Ground Plane</p>
          <p className="text-[11px] text-muted-foreground">
            Grid 및 받침면 표시
          </p>
        </div>
        <Switch
          checked={showGround}
          onCheckedChange={(checked) =>
            updateBackgroundSettings({ showGround: checked })
          }
        />
      </div>

      {showGround && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Ground Color</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-10 h-8 rounded border cursor-pointer flex-shrink-0"
                style={{ backgroundColor: groundColor }}
                onClick={() => openColorPicker(groundColor, handleGroundColorInput)}
                aria-label="그라운드 색상 선택"
              />
              <Input
                value={groundColor || ""}
                onChange={(event) => handleGroundColorInput(event.target.value)}
                className="h-8 text-xs flex-1"
                placeholder="#1f1f1f"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Reflectivity</Label>
              <span className="text-xs text-muted-foreground">
                {(groundReflectivity ?? 0).toFixed(2)}
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[clamp(groundReflectivity ?? 0, 0, 1)]}
              onValueChange={([value]) =>
                updateBackgroundSettings({ groundReflectivity: value })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentPropertiesSection;

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import useStore from "../../store/editorStore";
import { X } from "lucide-react";

const DiffuserCard = ({ diffuser, isSelected }) => {
  const {
    updateDiffuser,
    deleteDiffuser,
    lights,
    linkDiffuserToLight,
    unlinkDiffuserFromLight,
  } = useStore();

  // 연결되지 않은 조명 목록
  const availableLights = lights.filter(
    (light) => !diffuser.linkedLightIds.includes(light.id)
  );

  // 조명 연결 핸들러
  const handleLinkLight = (lightId) => {
    if (lightId) {
      linkDiffuserToLight(diffuser.id, lightId);
    }
  };

  // 조명 연결 해제 핸들러
  const handleUnlinkLight = (lightId) => {
    unlinkDiffuserFromLight(diffuser.id, lightId);
  };

  return (
    <Card className={isSelected ? "border-primary" : ""}>
      <CardHeader>
        <CardTitle className="text-sm">디퓨저 #{diffuser.id.substring(0, 6)}</CardTitle>
        <CardDescription>광목천/실크 디퓨저</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linked Lights */}
        <div className="space-y-2">
          <Label>연결된 조명</Label>
          <div className="space-y-2">
            {diffuser.linkedLightIds.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                연결된 조명이 없습니다
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {diffuser.linkedLightIds.map((lightId) => {
                  const light = lights.find((l) => l.id === lightId);
                  if (!light) return null;
                  return (
                    <Badge
                      key={lightId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: light.color }}
                      />
                      {light.type} #{lightId.substring(0, 6)}
                      <button
                        onClick={() => handleUnlinkLight(lightId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            {availableLights.length > 0 && (
              <Select onValueChange={handleLinkLight}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="조명 연결..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLights.map((light) => (
                    <SelectItem key={light.id} value={light.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: light.color }}
                        />
                        {light.type} #{light.id.substring(0, 6)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            💡 조명을 연결하면 해당 조명의 빛이 디퓨저를 통과하며 부드럽게
            확산됩니다
          </p>
        </div>

        <Separator />

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor={`diffuser-color-${diffuser.id}`}>색상</Label>
          <div className="flex gap-2">
            <Input
              id={`diffuser-color-${diffuser.id}`}
              type="color"
              value={diffuser.diffuseColor}
              onChange={(e) =>
                updateDiffuser(diffuser.id, "diffuseColor", e.target.value)
              }
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={diffuser.diffuseColor}
              onChange={(e) =>
                updateDiffuser(diffuser.id, "diffuseColor", e.target.value)
              }
              className="flex-1 h-10"
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <Label htmlFor={`diffuser-opacity-${diffuser.id}`}>
            불투명도: {diffuser.opacity.toFixed(2)}
          </Label>
          <Slider
            id={`diffuser-opacity-${diffuser.id}`}
            value={[diffuser.opacity]}
            max={1}
            min={0}
            step={0.01}
            onValueChange={(v) =>
              updateDiffuser(diffuser.id, "opacity", v[0])
            }
          />
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <Label htmlFor={`diffuser-transmission-${diffuser.id}`}>
            투과율: {diffuser.transmission.toFixed(2)}
          </Label>
          <Slider
            id={`diffuser-transmission-${diffuser.id}`}
            value={[diffuser.transmission]}
            max={1}
            min={0}
            step={0.01}
            onValueChange={(v) =>
              updateDiffuser(diffuser.id, "transmission", v[0])
            }
          />
          <p className="text-xs text-muted-foreground">
            빛이 통과하는 정도 (높을수록 더 많이 투과)
          </p>
        </div>

        {/* Thickness */}
        <div className="space-y-2">
          <Label htmlFor={`diffuser-thickness-${diffuser.id}`}>
            두께: {diffuser.thickness.toFixed(2)}
          </Label>
          <Slider
            id={`diffuser-thickness-${diffuser.id}`}
            value={[diffuser.thickness]}
            max={2}
            min={0.1}
            step={0.1}
            onValueChange={(v) =>
              updateDiffuser(diffuser.id, "thickness", v[0])
            }
          />
          <p className="text-xs text-muted-foreground">
            재질의 두께 (두꺼울수록 빛이 더 확산됨)
          </p>
        </div>

        {/* Roughness */}
        <div className="space-y-2">
          <Label htmlFor={`diffuser-roughness-${diffuser.id}`}>
            거칠기: {diffuser.roughness.toFixed(2)}
          </Label>
          <Slider
            id={`diffuser-roughness-${diffuser.id}`}
            value={[diffuser.roughness]}
            max={1}
            min={0}
            step={0.01}
            onValueChange={(v) =>
              updateDiffuser(diffuser.id, "roughness", v[0])
            }
          />
          <p className="text-xs text-muted-foreground">
            표면의 거칠기 (높을수록 더 부드러운 확산)
          </p>
        </div>

        {/* Secondary Light Intensity */}
        <div className="space-y-2">
          <Label htmlFor={`diffuser-light-intensity-${diffuser.id}`}>
            확산 조명 강도: {diffuser.secondaryLightIntensity?.toFixed(1) || '5.0'}
          </Label>
          <Slider
            id={`diffuser-light-intensity-${diffuser.id}`}
            value={[diffuser.secondaryLightIntensity || 5]}
            max={20}
            min={0}
            step={0.5}
            onValueChange={(v) =>
              updateDiffuser(diffuser.id, "secondaryLightIntensity", v[0])
            }
          />
          <p className="text-xs text-muted-foreground">
            디퓨저를 통과한 빛의 강도 (높을수록 더 밝은 확산)
          </p>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <Label>크기</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor={`diffuser-scale-x-${diffuser.id}`} className="text-xs">
                가로
              </Label>
              <Input
                id={`diffuser-scale-x-${diffuser.id}`}
                type="number"
                value={diffuser.scale[0]}
                onChange={(e) =>
                  updateDiffuser(diffuser.id, "scale", [
                    parseFloat(e.target.value),
                    diffuser.scale[1],
                    diffuser.scale[2],
                  ])
                }
                step={0.1}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor={`diffuser-scale-y-${diffuser.id}`} className="text-xs">
                세로
              </Label>
              <Input
                id={`diffuser-scale-y-${diffuser.id}`}
                type="number"
                value={diffuser.scale[1]}
                onChange={(e) =>
                  updateDiffuser(diffuser.id, "scale", [
                    diffuser.scale[0],
                    parseFloat(e.target.value),
                    diffuser.scale[2],
                  ])
                }
                step={0.1}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor={`diffuser-scale-z-${diffuser.id}`} className="text-xs">
                깊이
              </Label>
              <Input
                id={`diffuser-scale-z-${diffuser.id}`}
                type="number"
                value={diffuser.scale[2]}
                onChange={(e) =>
                  updateDiffuser(diffuser.id, "scale", [
                    diffuser.scale[0],
                    diffuser.scale[1],
                    parseFloat(e.target.value),
                  ])
                }
                step={0.1}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Block Original Light */}
        {diffuser.linkedLightIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`diffuser-block-light-${diffuser.id}`}
              checked={diffuser.blockOriginalLight}
              onCheckedChange={(checked) =>
                updateDiffuser(diffuser.id, "blockOriginalLight", checked)
              }
            />
            <Label
              htmlFor={`diffuser-block-light-${diffuser.id}`}
              className="text-sm font-normal cursor-pointer"
            >
              원본 조명 차단 (디퓨저만 빛 방출)
            </Label>
          </div>
        )}

        <Separator />

        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => deleteDiffuser(diffuser.id)}
        >
          디퓨저 삭제
        </Button>
      </CardContent>
    </Card>
  );
};

const DiffuserControl = () => {
  const { diffusers, addDiffuser, selectedDiffuser } = useStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-medium">새 디퓨저 추가</h3>
        <p className="text-sm text-muted-foreground">
          조명 앞에 배치하여 빛을 부드럽게 확산시키는 광목천/실크 디퓨저
        </p>
        <Button className="w-full" onClick={addDiffuser}>
          디퓨저 추가
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">디퓨저 목록</h3>
        {diffusers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            디퓨저가 없습니다. 위 버튼을 눌러 추가해보세요.
          </p>
        ) : (
          diffusers.map((diffuser) => (
            <DiffuserCard
              key={diffuser.id}
              diffuser={diffuser}
              isSelected={diffuser.id === selectedDiffuser}
            />
          ))
        )}
      </div>

      <div className="p-4 border rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">💡 사용 팁</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 조명과 마네킹 사이에 디퓨저를 배치하세요</li>
          <li>• 투과율을 높이면 빛이 더 많이 통과합니다</li>
          <li>• 두께를 조절하여 확산 정도를 제어하세요</li>
          <li>• 거칠기를 높이면 더 부드러운 빛을 얻을 수 있습니다</li>
          <li>• 3D Scene에서 드래그하여 위치를 조절할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default DiffuserControl;

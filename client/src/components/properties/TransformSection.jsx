import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useStore from "@/store/editorStore";
import useAssetStore from "@/store/assetStore";

const Vector3Input = ({ label, value, onChange }) => {
  const handleChange = (index, newValue) => {
    const updated = [...value];
    updated[index] = parseFloat(newValue) || 0;
    onChange(updated);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-[10px] text-muted-foreground mb-1">X</Label>
          <Input
            type="number"
            step="0.01"
            value={value[0]}
            onChange={(e) => handleChange(0, e.target.value)}
            className="h-8 text-xs"
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
          />
        </div>
      </div>
    </div>
  );
};

const TransformSection = ({ objectType, objectId }) => {
  const {
    lights,
    mannequins,
    diffusers,
    updateLight,
    setMannequinPosition,
    setMannequinScale,
    setDiffuserPosition,
    setDiffuserRotation,
    setDiffuserScale,
  } = useStore();

  const { currentGltfModels, updateGltfModel } = useAssetStore();

  // 객체 찾기
  let object = null;
  if (objectType === "light") {
    object = lights.find((l) => l.id === objectId);
  } else if (objectType === "mannequin") {
    object = mannequins.find((m) => m.id === objectId);
  } else if (objectType === "diffuser") {
    object = diffusers.find((d) => d.id === objectId);
  } else if (objectType === "gltfModel") {
    object = currentGltfModels.find((g) => g.assetId === objectId);
  }

  if (!object) return null;

  const handlePositionChange = (newPosition) => {
    if (objectType === "light") {
      updateLight(objectId, "position", newPosition);
    } else if (objectType === "mannequin") {
      setMannequinPosition(objectId, newPosition);
    } else if (objectType === "diffuser") {
      setDiffuserPosition(objectId, newPosition);
    } else if (objectType === "gltfModel") {
      updateGltfModel(objectId, "position", newPosition);
    }
  };

  const handleTargetPositionChange = (newTargetPosition) => {
    if (objectType === "light") {
      updateLight(objectId, "targetPosition", newTargetPosition);
    }
  };

  const handleRotationChange = (newRotation) => {
    if (objectType === "diffuser") {
      setDiffuserRotation(objectId, newRotation);
    } else if (objectType === "gltfModel") {
      updateGltfModel(objectId, "rotation", newRotation);
    }
  };

  const handleScaleChange = (newScale) => {
    if (objectType === "mannequin") {
      setMannequinScale(objectId, newScale);
    } else if (objectType === "diffuser") {
      setDiffuserScale(objectId, newScale);
    } else if (objectType === "gltfModel") {
      updateGltfModel(objectId, "scale", newScale);
    }
  };

  const showTarget = objectType === "light" && (object.type === "spot" || object.type === "directional");
  const showRotation = objectType === "diffuser" || objectType === "gltfModel";
  const showScale = objectType === "mannequin" || objectType === "diffuser" || objectType === "gltfModel";

  return (
    <div className="space-y-4">
      {/* Position */}
      <Vector3Input
        label="Position"
        value={object.position || [0, 0, 0]}
        onChange={handlePositionChange}
      />

      {/* Target Position - Light의 Spot/Directional */}
      {showTarget && (
        <>
          <Separator />
          <Vector3Input
            label="Target Position"
            value={object.targetPosition || [0, 0, 0]}
            onChange={handleTargetPositionChange}
          />
        </>
      )}

      {/* Rotation */}
      {showRotation && (
        <>
          <Separator />
          <Vector3Input
            label="Rotation"
            value={object.rotation || [0, 0, 0]}
            onChange={handleRotationChange}
          />
        </>
      )}

      {/* Scale */}
      {showScale && (
        <>
          <Separator />
          <Vector3Input
            label="Scale"
            value={object.scale || [1, 1, 1]}
            onChange={handleScaleChange}
          />
        </>
      )}
    </div>
  );
};

export default TransformSection;

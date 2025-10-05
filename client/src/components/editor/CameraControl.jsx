import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import useStore from "../../store"

const CameraControl = () => {
  const { cameraState, updateCameraState, viewMode, setViewMode } = useStore();

  const handlePositionChange = (axisIndex, value) => {
    const newPosition = [...cameraState.position];
    newPosition[axisIndex] = parseFloat(value);
    updateCameraState('position', newPosition);
  };

  const handleTargetChange = (axisIndex, value) => {
    const newTarget = [...cameraState.target];
    newTarget[axisIndex] = parseFloat(value);
    updateCameraState('target', newTarget);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">View Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setViewMode('free')} variant={viewMode === 'free' ? 'default' : 'outline'}>자유 시점</Button>
          <Button onClick={() => setViewMode('camera')} variant={viewMode === 'camera' ? 'default' : 'outline'}>카메라 시점</Button>
        </div>
      </div>

      <Separator />

      {/* Position Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Position</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="cam-pos-x" className="w-4">X</Label>
            <Slider id="cam-pos-x" value={[cameraState.position[0]]} max={50} min={-50} step={0.1} onValueChange={(v) => handlePositionChange(0, v[0])} className="flex-1" />
            <Input type="number" value={cameraState.position[0]} onChange={(e) => handlePositionChange(0, e.target.value)} className="w-20 h-8" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="cam-pos-y" className="w-4">Y</Label>
            <Slider id="cam-pos-y" value={[cameraState.position[1]]} max={50} min={-50} step={0.1} onValueChange={(v) => handlePositionChange(1, v[0])} className="flex-1" />
            <Input type="number" value={cameraState.position[1]} onChange={(e) => handlePositionChange(1, e.target.value)} className="w-20 h-8" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="cam-pos-z" className="w-4">Z</Label>
            <Slider id="cam-pos-z" value={[cameraState.position[2]]} max={50} min={-50} step={0.1} onValueChange={(v) => handlePositionChange(2, v[0])} className="flex-1" />
            <Input type="number" value={cameraState.position[2]} onChange={(e) => handlePositionChange(2, e.target.value)} className="w-20 h-8" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Target Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Target</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="cam-tar-x" className="w-4">X</Label>
            <Slider id="cam-tar-x" value={[cameraState.target[0]]} max={50} min={-50} step={0.1} onValueChange={(v) => handleTargetChange(0, v[0])} className="flex-1" />
            <Input type="number" value={cameraState.target[0]} onChange={(e) => handleTargetChange(0, e.target.value)} className="w-20 h-8" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="cam-tar-y" className="w-4">Y</Label>
            <Slider id="cam-tar-y" value={[cameraState.target[1]]} max={50} min={-50} step={0.1} onValueChange={(v) => handleTargetChange(1, v[0])} className="flex-1" />
            <Input type="number" value={cameraState.target[1]} onChange={(e) => handleTargetChange(1, e.target.value)} className="w-20 h-8" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="cam-tar-z" className="w-4">Z</Label>
            <Slider id="cam-tar-z" value={[cameraState.target[2]]} max={50} min={-50} step={0.1} onValueChange={(v) => handleTargetChange(2, v[0])} className="flex-1" />
            <Input type="number" value={cameraState.target[2]} onChange={(e) => handleTargetChange(2, e.target.value)} className="w-20 h-8" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Focal Length Control */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Focal Length</h3>
        <div className="flex items-center gap-2">
            <Slider id="focal-length" value={[cameraState.focalLength]} max={200} min={18} step={1} onValueChange={(v) => updateCameraState('focalLength', v[0])} className="flex-1" />
            <Input type="number" value={cameraState.focalLength} onChange={(e) => updateCameraState('focalLength', parseFloat(e.target.value))} className="w-20 h-8" />
        </div>
      </div>
    </div>
  );
};

export default CameraControl;

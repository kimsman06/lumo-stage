import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import LightCard from "./LightCard"
import useStore from "../../store"

const LightsControl = () => {
  const { lights, addLight } = useStore();
  const [newLightType, setNewLightType] = useState('point');

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-medium">새 조명 추가</h3>
        <div className="flex gap-2">
          <Select value={newLightType} onValueChange={setNewLightType}>
            <SelectTrigger>
              <SelectValue placeholder="조명 종류" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="point">Point Light</SelectItem>
              <SelectItem value="spot">Spot Light</SelectItem>
              <SelectItem value="directional">Directional Light</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={() => addLight(newLightType)}>추가</Button>
        </div>
      </div>
      
      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">조명 목록</h3>
        {lights.map(light => (
          <LightCard key={light.id} light={light} />
        ))}
      </div>
    </div>
  );
};

export default LightsControl;

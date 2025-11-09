import { useEffect, useRef } from "react"
import LightCard from "./LightCard";
import useStore from "../../store/editorStore";

const LightsControl = ({ readOnly = false }) => {
  const { lights, selectedLight } = useStore();
  const lightCardRefs = useRef(new Map());

  useEffect(() => {
    if (selectedLight) {
      const baseLightId = selectedLight.replace(/-target$/, "");
      const cardRef = lightCardRefs.current.get(baseLightId);
      if (cardRef) {
        cardRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedLight]);

  return (
    <div className="space-y-4" data-tutorial="light-controls">
      <h3 className="text-lg font-medium">조명 목록</h3>
      {lights.map((light) => (
        <LightCard
          key={light.id}
          light={light}
          ref={(el) => lightCardRefs.current.set(light.id, el)}
          isSelected={
            light.id === selectedLight ||
            `${light.id}-target` === selectedLight
          }
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};

export default LightsControl;

import MannequinControl from "@/components/editor/MannequinControl";

const MannequinPropertiesSection = ({ mannequin, readOnly = false }) => {
  if (!mannequin) return null;

  return (
    <div>
      <MannequinControl readOnly={readOnly} selectedMannequinId={mannequin.id} />
    </div>
  );
};

export default MannequinPropertiesSection;

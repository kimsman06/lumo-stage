import MannequinControl from "@/components/editor/MannequinControl";

const MannequinPropertiesSection = ({ mannequin }) => {
  if (!mannequin) return null;

  return (
    <div>
      <MannequinControl readOnly={false} selectedMannequinId={mannequin.id} />
    </div>
  );
};

export default MannequinPropertiesSection;

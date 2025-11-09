import DiffuserControl from "@/components/editor/DiffuserControl";

const DiffuserPropertiesSection = ({ diffuser }) => {
  if (!diffuser) return null;

  return (
    <div>
      <DiffuserControl selectedDiffuserId={diffuser.id} />
    </div>
  );
};

export default DiffuserPropertiesSection;

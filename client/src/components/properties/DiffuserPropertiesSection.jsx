import DiffuserControl from "@/components/editor/DiffuserControl";

const DiffuserPropertiesSection = ({ diffuser, readOnly = false }) => {
  if (!diffuser) return null;

  return (
    <div>
      <DiffuserControl selectedDiffuserId={diffuser.id} readOnly={readOnly} />
    </div>
  );
};

export default DiffuserPropertiesSection;

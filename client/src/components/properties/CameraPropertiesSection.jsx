import CameraControl from "@/components/editor/CameraControl";

const CameraPropertiesSection = ({ readOnly = false }) => {
  return (
    <div className="space-y-4" data-tutorial="camera-section">
      <CameraControl readOnly={readOnly} />
    </div>
  );
};

export default CameraPropertiesSection;

import AssetControl from "@/components/editor/AssetControl";

const AssetManagementSection = ({ projectId }) => {
  return (
    <div>
      <AssetControl projectId={projectId} />
    </div>
  );
};

export default AssetManagementSection;

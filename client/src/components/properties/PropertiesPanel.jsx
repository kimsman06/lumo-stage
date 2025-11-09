import { Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useStore from "@/store/editorStore";
import useAssetStore from "@/store/assetStore";
import TransformSection from "./TransformSection";
import LightPropertiesSection from "./LightPropertiesSection";
import MannequinPropertiesSection from "./MannequinPropertiesSection";
import CameraPropertiesSection from "./CameraPropertiesSection";
import DiffuserPropertiesSection from "./DiffuserPropertiesSection";
import ModelLibrarySection from "./ModelLibrarySection";
import HdriPropertiesSection from "./HdriPropertiesSection";
import EnvironmentPropertiesSection from "./EnvironmentPropertiesSection";

const PropertiesPanel = () => {
  const {
    selectedLight,
    selectedMannequinId,
    selectedDiffuser,
    selectedGltfModelId,
    selectedCamera,
    selectedHdri,
    selectedModelLibrary,
    selectedEnvironment,
    lights,
    mannequins,
    diffusers,
  } = useStore();

  const { currentGltfModels, assets, currentHdri } = useAssetStore();

  // 선택된 객체 정보 가져오기
  const selectedLightObj = lights.find((l) => l.id === selectedLight);
  const selectedMannequinObj = mannequins.find(
    (m) => m.id === selectedMannequinId
  );
  const selectedDiffuserObj = diffusers.find((d) => d.id === selectedDiffuser);
  const selectedGltfModelObj = currentGltfModels.find(
    (g) => g.assetId === selectedGltfModelId
  );
  const selectedHdriAsset = assets.find(
    (asset) => asset.id === currentHdri || asset._id === currentHdri
  );

  // 선택된 객체 타입 결정
  const selectedType = selectedLightObj
    ? "light"
    : selectedMannequinObj
    ? "mannequin"
    : selectedDiffuserObj
    ? "diffuser"
    : selectedGltfModelObj
    ? "gltfModel"
    : selectedModelLibrary
    ? "modelLibrary"
    : selectedHdri
    ? "hdri"
    : selectedCamera
    ? "camera"
    : selectedEnvironment
    ? "environment"
    : null;

  const showTransformTabs = ["light", "mannequin", "diffuser", "gltfModel"].includes(
    selectedType
  );

  return (
    <div className="w-full bg-background h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Settings className="w-4 h-4" />
          <span>Properties</span>
        </div>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-hidden">
        {showTransformTabs ? (
          <Tabs defaultValue="transform" className="h-full flex flex-col">
            <div className="flex-shrink-0 px-2 pt-2">
              <TabsList className="w-full grid grid-cols-2 h-9">
                <TabsTrigger value="transform" className="text-xs">
                  Transform
                </TabsTrigger>
                <TabsTrigger
                  value="properties"
                  className="text-xs"
                  data-tutorial="light-properties-tab"
                >
                  Properties
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="transform" className="p-4 m-0">
                <TransformSection
                  objectType={selectedType}
                  objectId={
                    selectedLight ||
                    selectedMannequinId ||
                    selectedDiffuser ||
                    selectedGltfModelId
                  }
                />
              </TabsContent>

              <TabsContent value="properties" className="p-4 m-0">
                {selectedType === "light" && (
                  <LightPropertiesSection light={selectedLightObj} />
                )}
                {selectedType === "mannequin" && (
                  <MannequinPropertiesSection
                    mannequin={selectedMannequinObj}
                  />
                )}
                {selectedType === "diffuser" && (
                  <DiffuserPropertiesSection diffuser={selectedDiffuserObj} />
                )}
                {selectedType === "gltfModel" && (
                  <ModelLibrarySection model={selectedGltfModelObj} />
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {selectedType === "environment" && <EnvironmentPropertiesSection />}

              {selectedType === "hdri" && (
                <HdriPropertiesSection asset={selectedHdriAsset} />
              )}

              {selectedType === "modelLibrary" && <ModelLibrarySection />}

              {(selectedType === "camera" ||
                selectedType === null ||
                selectedType === undefined) && <CameraPropertiesSection />}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;

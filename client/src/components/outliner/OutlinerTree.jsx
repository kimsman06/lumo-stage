import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Lightbulb,
  User,
  Box,
  Sparkles,
  Camera as CameraIcon,
  Image as ImageIcon,
  ScanEye,
  Maximize2,
} from "lucide-react";
import useStore from "@/store/editorStore";
import useAssetStore from "@/store/assetStore";
import TreeNode from "./TreeNode";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CategoryHeader = ({ icon: Icon, label, isExpanded, onToggle, count }) => (
  <div
    className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent/50 cursor-pointer select-none"
    onClick={onToggle}
  >
    {isExpanded ? (
      <ChevronDown className="w-3 h-3" />
    ) : (
      <ChevronRight className="w-3 h-3" />
    )}
    <Icon className="w-3 h-3" />
    <span>{label}</span>
    <span className="ml-auto text-[10px] opacity-60">({count})</span>
  </div>
);

const OutlinerTree = ({ searchQuery, readOnly = false }) => {
  const {
    lights,
    mannequins,
    diffusers,
    setCameraViewToOrbit,
    setOrbitToCameraView,
  } = useStore();
  const { currentGltfModels = [], assets = [], currentHdri } = useAssetStore();

  const currentHdriAsset = assets.find(
    (asset) => asset.id === currentHdri || asset._id === currentHdri
  );

  const handleViewFromCamera = (event) => {
    event.stopPropagation();
    setOrbitToCameraView();
  };

  const handleSetCameraToView = (event) => {
    event.stopPropagation();
    setCameraViewToOrbit();
  };

  // GLTF 모델에 Asset 정보 결합 (name 추가)
  const gltfModelsWithInfo = currentGltfModels.map((model) => {
    const asset = assets.find(
      (a) => a.id === model.assetId || a._id === model.assetId
    );
    return {
      ...model,
      name:
        asset?.fileName || asset?.metadata?.originalName || "Untitled Model",
      visible: model.visible !== false,
    };
  });

  const sceneNodes = [
    {
      id: "scene-camera",
      name: "Scene Camera",
      type: "camera",
      visible: true,
      icon: CameraIcon,
    },
    {
      id: "scene-hdri",
      name: currentHdriAsset
        ? `HDRI · ${currentHdriAsset.fileName || "Untitled"}`
        : "HDRI (미지정)",
      type: "hdri",
      visible: true,
      icon: ImageIcon,
    },
    {
      id: "scene-environment",
      name: "Environment",
      type: "environment",
      visible: true,
      icon: Sparkles,
    },
    {
      id: "scene-model-library",
      name: "3D Models",
      type: "modelLibrary",
      visible: true,
      icon: Box,
    },
  ];

  const [expandedCategories, setExpandedCategories] = useState({
    scene: true,
    lights: true,
    mannequins: true,
    diffusers: true,
    gltfModels: true,
  });

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 검색 필터
  const filterBySearch = (items = []) => {
    if (!items || !Array.isArray(items)) return [];
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name?.toLowerCase().includes(query));
  };

  const filteredSceneNodes = filterBySearch(sceneNodes);
  const filteredLights = filterBySearch(lights);
  const filteredMannequins = filterBySearch(mannequins);
  const filteredGltfModels = filterBySearch(gltfModelsWithInfo);

  return (
    <div className="p-1">
      {/* Scene */}
      <div className="mb-1">
        <CategoryHeader
          icon={CameraIcon}
          label="Scene"
          count={filteredSceneNodes.length}
          isExpanded={expandedCategories.scene}
          onToggle={() => toggleCategory("scene")}
        />
        {expandedCategories.scene && (
          <div className="ml-3 space-y-1">
            {filteredSceneNodes.map((node) => {
              const actions =
                node.type === "camera" ? (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleViewFromCamera}
                          className="h-6 w-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          aria-label="카메라 시점을 미리보기로 전환"
                        >
                          <ScanEye className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        카메라 시점을 미리보기로 전환
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleSetCameraToView}
                          className="h-6 w-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          aria-label="현재 뷰를 카메라에 반영"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        현재 뷰를 카메라에 반영
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : null;

              return (
                <TreeNode
                  key={node.id}
                  id={node.id}
                  name={node.name}
                  type={node.type}
                  icon={node.icon}
                  visible={true}
                  showVisibilityToggle={false}
                  showContextMenu={false}
                  actions={actions}
                  readOnly={readOnly}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Lights */}
      <div className="mb-1">
        <CategoryHeader
          icon={Lightbulb}
          label="Lights"
          count={filteredLights.length}
          isExpanded={expandedCategories.lights}
          onToggle={() => toggleCategory("lights")}
        />
        {expandedCategories.lights && (
          <div className="ml-3">
            {filteredLights.map((light) => (
              <TreeNode
                key={light.id}
                id={light.id}
                name={light.name}
                type="light"
                visible={light.visible}
                icon={Lightbulb}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mannequins */}
      <div className="mb-1">
        <CategoryHeader
          icon={User}
          label="Mannequins"
          count={filteredMannequins.length}
          isExpanded={expandedCategories.mannequins}
          onToggle={() => toggleCategory("mannequins")}
        />
        {expandedCategories.mannequins && (
          <div className="ml-3">
            {filteredMannequins.map((mannequin) => (
              <TreeNode
                key={mannequin.id}
                id={mannequin.id}
                name={mannequin.name}
                type="mannequin"
                visible={mannequin.visible}
                icon={User}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>

      {/* GLTF Models */}
      <div className="mb-1">
        <CategoryHeader
          icon={Box}
          label="3D Models"
          count={filteredGltfModels.length}
          isExpanded={expandedCategories.gltfModels}
          onToggle={() => toggleCategory("gltfModels")}
        />
        {expandedCategories.gltfModels && (
          <div className="ml-3">
            {filteredGltfModels.map((model) => (
              <TreeNode
                key={model.assetId}
                id={model.assetId}
                name={model.name || "Untitled Model"}
                type="gltfModel"
                visible={model.visible !== false}
                icon={Box}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlinerTree;

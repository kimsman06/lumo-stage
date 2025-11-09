import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, CheckCircle } from "lucide-react";
import useAssetStore from "@/store/assetStore";
import toast from "@/lib/toast";

const formatFileSize = (bytes) => {
  if (!bytes) return "알 수 없음";
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
};

const ModelLibrarySection = ({ model }) => {
  const {
    assets,
    currentGltfModels,
    addGltfModel,
    removeGltfModel,
    deleteAsset,
  } = useAssetStore();

  const gltfAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const type = asset?.type?.toLowerCase();
        if (type) {
          return type === "gltf" || type === "glb" || type === "model";
        }
        const mime = asset?.mimeType?.toLowerCase();
        return mime?.includes("glb") || mime?.includes("gltf");
      }),
    [assets]
  );

  const isAssetAdded = (assetId) =>
    currentGltfModels.some((entry) => entry.assetId === assetId);

  const getAssetLabel = (asset) =>
    asset?.fileName || asset?.metadata?.originalName || "Untitled";

  const handleToggleModel = (asset) => {
    const assetId = asset.id;
    if (isAssetAdded(assetId)) {
      removeGltfModel(assetId);
      toast.success(`"${getAssetLabel(asset)}" 모델을 씬에서 제거했습니다.`);
    } else {
      addGltfModel(assetId);
    }
  };

  const handleDeleteAsset = async (asset) => {
    const label = getAssetLabel(asset);
    await toast.promise(deleteAsset(asset.id), {
      loading: `"${label}" 모델을 삭제하는 중...`,
      success: `"${label}" 모델을 삭제했습니다.`,
      error: `"${label}" 모델 삭제에 실패했습니다.`,
    });
  };

  const selectedAsset = model
    ? gltfAssets.find(
        (asset) => asset.id === model.assetId || asset._id === model.assetId
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">3D 모델 라이브러리</Label>
        {gltfAssets.length > 0 ? (
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {gltfAssets.map((asset) => {
                const added = isAssetAdded(asset.id);
                return (
                  <div
                    key={asset.id}
                    className="p-3 border rounded-lg flex flex-wrap items-center gap-2 text-xs"
                  >
                    {added && (
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                      <div
                        className="font-medium truncate"
                        title={getAssetLabel(asset)}
                      >
                        {getAssetLabel(asset)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatFileSize(asset.fileSize)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={added ? "secondary" : "outline"}
                      onClick={() => handleToggleModel(asset)}
                      className="shrink-0 whitespace-nowrap min-w-[112px]"
                    >
                      {added ? "씬에서 제거" : "씬에 추가"}
                    </Button>
                    <button
                      type="button"
                      className="h-8 w-8 flex items-center justify-center text-destructive/70 hover:text-destructive shrink-0"
                      onClick={() => handleDeleteAsset(asset)}
                      aria-label="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-xs text-muted-foreground">
            사용 가능한 GLB가 없습니다. Assets 패널에서 업로드하세요.
          </p>
        )}
      </div>

      {selectedAsset ? (
        <div className="space-y-3 text-sm w-full overflow-hidden">
          <div className="overflow-hidden">
            <Label className="text-xs text-muted-foreground">선택한 파일</Label>
            <p className="mt-1 truncate" title={getAssetLabel(selectedAsset)}>
              {getAssetLabel(selectedAsset)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="uppercase tracking-wide">Size</p>
              <p className="text-foreground text-sm mt-0.5">
                {formatFileSize(selectedAsset.fileSize)}
              </p>
            </div>
            <div>
              <p className="uppercase tracking-wide">Type</p>
              <p className="text-foreground text-sm mt-0.5">
                {selectedAsset.mimeType || "GLB"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Outliner에서 특정 모델을 선택하면 파일 정보를 볼 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default ModelLibrarySection;

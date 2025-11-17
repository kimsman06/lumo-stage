import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";
import useAssetStore from "@/store/assetStore";
import toast from "@/lib/toast";

const HdriPropertiesSection = ({ asset, readOnly = false }) => {
  const { assets, currentHdri, setCurrentHdri, deleteAsset } = useAssetStore();
  const NO_HDRI_VALUE = "__none__";

  const hdriAssets = assets.filter((candidate) => {
    const type = candidate?.type?.toLowerCase();
    if (type) {
      return type === "hdri";
    }
    const mime = candidate?.mimeType?.toLowerCase();
    return mime?.includes("hdr") || mime?.includes("exr");
  });

  const activeAsset =
    asset ||
    hdriAssets.find(
      (candidate) => candidate.id === currentHdri || candidate._id === currentHdri
    );

  const selectValue = currentHdri || NO_HDRI_VALUE;

  const handleHdriChange = (value) => {
    if (readOnly) return;
    if (value === NO_HDRI_VALUE) {
      setCurrentHdri(null);
      return;
    }
    setCurrentHdri(value);
  };

  const handleDeleteAsset = async (assetId) => {
    if (readOnly) return;
    if (!assetId) return;

    const deletePromise = deleteAsset(assetId);
    toast.promise(deletePromise, {
      loading: "HDRI를 삭제하는 중...",
      success: "HDRI가 삭제되었습니다.",
      error: (err) => err.error || "HDRI 삭제에 실패했습니다.",
    });

    await deletePromise;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "알 수 없음";
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">HDRI 선택</Label>
        {hdriAssets.length > 0 ? (
          <Select value={selectValue} onValueChange={handleHdriChange} disabled={readOnly}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="HDRI 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_HDRI_VALUE}>설정 안 함</SelectItem>
              {hdriAssets.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.fileName || candidate.metadata?.originalName || "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-xs text-muted-foreground">
            사용 가능한 HDRI가 없습니다. Assets 탭에서 업로드하세요.
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-medium">HDRI Assets</Label>
        {hdriAssets.length > 0 ? (
          <ScrollArea className="max-h-64 pr-2">
            <div className="space-y-2">
              {hdriAssets.map((candidate) => {
                const isActive = currentHdri === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    className="p-3 border rounded-lg flex items-center gap-2 text-xs"
                  >
                    {isActive && (
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium truncate">
                        {candidate.fileName ||
                          candidate.metadata?.originalName ||
                          "Untitled"}
                      </p>
                      <p className="text-muted-foreground">
                        {formatFileSize(candidate.fileSize)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={isActive ? "secondary" : "outline"}
                      onClick={() =>
                        handleHdriChange(
                          isActive ? NO_HDRI_VALUE : candidate.id
                        )
                      }
                      disabled={readOnly}
                    >
                      {isActive ? "해제" : "적용"}
                    </Button>
                    <button
                      type="button"
                      className={`h-8 w-8 flex items-center justify-center ${!readOnly ? 'text-destructive/70 hover:text-destructive' : 'cursor-not-allowed opacity-50'}`}
                      onClick={() => handleDeleteAsset(candidate.id)}
                      aria-label="Delete HDRI"
                      disabled={readOnly}
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
            등록된 HDRI가 없습니다. Assets 패널에서 업로드하세요.
          </p>
        )}
      </div>

      {activeAsset ? (
        <div className="space-y-3 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">파일명</Label>
            <p className="mt-1 break-all">
              {activeAsset.fileName || activeAsset.metadata?.originalName || "Untitled"}
            </p>
          </div>
          {activeAsset.fileSize && (
            <div>
              <Label className="text-xs text-muted-foreground">파일 크기</Label>
              <p className="mt-1">{formatFileSize(activeAsset.fileSize)}</p>
            </div>
          )}
          {activeAsset.mimeType && (
            <div>
              <Label className="text-xs text-muted-foreground">타입</Label>
              <p className="mt-1">{activeAsset.mimeType}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          선택된 HDRI가 없습니다. 목록에서 하나를 선택하면 씬에 즉시 반영됩니다.
        </p>
      )}

      {currentHdri && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setCurrentHdri(null)}
          disabled={readOnly}
        >
          HDRI 제거
        </Button>
      )}
    </div>
  );
};

export default HdriPropertiesSection;

import { useState } from "react";
import { Eye, EyeOff, Edit2, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import useStore from "@/store/editorStore";
import useAssetStore from "@/store/assetStore";
import { cn } from "@/lib/utils";

const TreeNode = ({
  id,
  name,
  type,
  visible,
  icon: Icon,
  showVisibilityToggle = true,
  showContextMenu = true,
  actions = null,
  readOnly = false,
}) => {
  const {
    selectedLight,
    selectedMannequinId,
    selectedDiffuser,
    selectedGltfModelId,
    selectedModelLibrary,
    selectedCamera,
    selectedHdri,
    selectedEnvironment,
    setSelectedLight,
    selectMannequin,
    setSelectedDiffuser,
    setSelectedGltfModel,
    selectModelLibrary,
    selectCamera,
    selectHdri,
    selectEnvironment,
    deleteLight,
    deleteMannequin,
    deleteDiffuser,
    setObjectVisibility,
    renameObject,
  } = useStore();

  const { setGltfModelVisibility, removeGltfModel } = useAssetStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  // 선택 상태 확인
  const isSelected =
    (type === "light" && selectedLight === id) ||
    (type === "mannequin" && selectedMannequinId === id) ||
    (type === "diffuser" && selectedDiffuser === id) ||
    (type === "gltfModel" && selectedGltfModelId === id) ||
    (type === "modelLibrary" && selectedModelLibrary) ||
    (type === "camera" && selectedCamera) ||
    (type === "hdri" && selectedHdri) ||
    (type === "environment" && selectedEnvironment);

  // 클릭 시 객체 선택
  const handleClick = () => {
    switch (type) {
      case "light":
        setSelectedLight(id);
        break;
      case "mannequin":
        selectMannequin(id);
        break;
      case "diffuser":
        setSelectedDiffuser(id);
        break;
      case "gltfModel":
        setSelectedGltfModel(id);
        break;
      case "modelLibrary":
        selectModelLibrary();
        break;
      case "camera":
        selectCamera();
        break;
      case "hdri":
        selectHdri();
        break;
      case "environment":
        selectEnvironment();
        break;
      default:
        break;
    }
  };

  // 가시성 토글
  const handleVisibilityToggle = (e) => {
    if (!showVisibilityToggle || readOnly) {
      return;
    }
    e.stopPropagation();
    if (type === "gltfModel") {
      setGltfModelVisibility(id, !visible);
    } else {
      setObjectVisibility(id, type, !visible);
    }
  };

  // 삭제
  const handleDelete = () => {
    if (readOnly) return;

    switch (type) {
      case "light":
        deleteLight(id);
        break;
      case "mannequin":
        deleteMannequin(id);
        break;
      case "diffuser":
        deleteDiffuser(id);
        break;
      case "gltfModel":
        removeGltfModel(id);
        break;
      case "camera":
      case "hdri":
      case "modelLibrary":
        return;
      default:
        break;
    }
  };

  // 이름 변경 시작
  const handleRenameStart = () => {
    if (readOnly) return;

    setIsEditing(true);
    setEditedName(name);
  };

  // 이름 변경 완료
  const handleRenameComplete = () => {
    if (editedName.trim() && editedName !== name) {
      renameObject(id, type, editedName.trim());
    }
    setIsEditing(false);
  };

  // Enter 키로 이름 변경 완료
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRenameComplete();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedName(name);
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs rounded cursor-pointer group hover:bg-accent/70 transition-colors",
        isSelected && "bg-accent"
      )}
      onClick={handleClick}
      data-node-type={type || "unknown"}
      data-node-id={id}
    >
      {/* Icon */}
      <Icon className="w-3 h-3 flex-shrink-0 text-muted-foreground" />

      {/* Name (Editable) */}
      {isEditing ? (
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleRenameComplete}
          onKeyDown={handleKeyDown}
          className="h-5 text-xs px-1 py-0 flex-1"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate select-none">{name}</span>
      )}

      {actions && (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}

      {/* Visibility Toggle */}
      {showVisibilityToggle && (
        <button
          onClick={handleVisibilityToggle}
          disabled={readOnly}
          className={cn(
            "flex-shrink-0 p-0.5 rounded transition-opacity",
            readOnly
              ? "cursor-not-allowed opacity-30"
              : "hover:bg-accent cursor-pointer",
            !readOnly && (visible ? "opacity-60 hover:opacity-100" : "opacity-30 hover:opacity-60")
          )}
        >
          {visible ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );

  // readOnly이거나 showContextMenu가 false면 컨텍스트 메뉴 없이 반환
  if (!showContextMenu || readOnly) {
    return content;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{content}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleRenameStart}>
          <Edit2 className="w-3 h-3 mr-2" />
          이름 변경
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="w-3 h-3 mr-2" />
          삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TreeNode;

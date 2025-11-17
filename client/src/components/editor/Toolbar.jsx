import React from "react";
import {
  Move,
  RotateCw,
  Expand,
  Undo2,
  Redo2,
  Grid3x3,
  Magnet
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import useStore from "@/store/editorStore";

/**
 * Toolbar - 중앙 상단 floating 툴바
 * Transform 모드, Grid/Snap 토글, Undo/Redo 버튼 제공
 */
function Toolbar() {
  const {
    transformMode,
    setTransformMode,
    backgroundSettings,
    updateBackgroundSettings,
    snapEnabled,
    setSnapEnabled,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStore();

  const canUndoNow = canUndo();
  const canRedoNow = canRedo();
  const gridEnabled = backgroundSettings.showGround;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg shadow-xl flex items-center px-3 py-2 gap-2">
      <TooltipProvider delayDuration={300}>
        {/* Transform Mode Buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={transformMode === "translate" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTransformMode("translate")}
                className={`h-8 w-8 p-0 ${transformMode === "translate" ? "" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                aria-label="이동 모드 (W)"
              >
                <Move className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>이동 (W)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={transformMode === "rotate" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTransformMode("rotate")}
                className={`h-8 w-8 p-0 ${transformMode === "rotate" ? "" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                aria-label="회전 모드 (E)"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>회전 (E)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={transformMode === "scale" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTransformMode("scale")}
                className={`h-8 w-8 p-0 ${transformMode === "scale" ? "" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                aria-label="크기 조절 모드 (R)"
              >
                <Expand className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>크기 조절 (R)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Grid & Snap Toggles */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={gridEnabled ? "default" : "ghost"}
                size="sm"
                onClick={() => updateBackgroundSettings({ showGround: !gridEnabled })}
                className={`h-8 w-8 p-0 ${gridEnabled ? "" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                aria-label="그리드 표시"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>그리드 {gridEnabled ? "숨기기" : "표시"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={snapEnabled ? "default" : "ghost"}
                size="sm"
                onClick={() => setSnapEnabled(!snapEnabled)}
                className={`h-8 w-8 p-0 ${snapEnabled ? "" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                aria-label="스냅 활성화"
              >
                <Magnet className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>스냅 {snapEnabled ? "비활성화" : "활성화"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndoNow}
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 disabled:text-white/30"
                aria-label="실행 취소 (⌘+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>실행 취소 (⌘+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedoNow}
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 disabled:text-white/30"
                aria-label="다시 실행 (⌘+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>다시 실행 (⌘+Shift+Z)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

export default Toolbar;

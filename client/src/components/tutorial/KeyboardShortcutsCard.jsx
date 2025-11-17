import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const shortcuts = [
  {
    category: "Transform 모드",
    items: [
      { key: "W", description: "이동 모드로 전환" },
      { key: "E", description: "회전 모드로 전환" },
      { key: "R", description: "크기 조절 모드로 전환" },
    ],
  },
  {
    category: "뷰 모드",
    items: [
      { key: "F", description: "Free View 모드 전환" },
      { key: "C", description: "Camera View 모드 전환" },
    ],
  },
  {
    category: "프로젝트",
    items: [
      { key: "Ctrl+S", description: "프로젝트 저장", mac: "⌘+S" },
    ],
  },
  {
    category: "편집",
    items: [
      { key: "Ctrl+Z", description: "실행 취소", mac: "⌘+Z" },
      {
        key: "Ctrl+Shift+Z",
        description: "다시 실행",
        mac: "⌘+Shift+Z",
      },
    ],
  },
  {
    category: "기타",
    items: [
      { key: "ESC", description: "선택 해제" },
    ],
  },
  {
    category: "도움말",
    items: [
      { key: "?", description: "단축키 도움말 (이 카드)" },
      { key: "H", description: "튜토리얼 다시 시작" },
    ],
  },
];

/**
 * KeyboardShortcutsCard - 단축키 목록을 표시하는 카드
 *
 * @param {boolean} isOpen - 카드 표시 여부
 * @param {function} onClose - 닫기 버튼 클릭 핸들러
 */
const KeyboardShortcutsCard = ({ isOpen, onClose }) => {
  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 반투명 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            onClick={onClose}
          />

          {/* 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl overflow-auto"
            style={{ zIndex: 9999 }}
          >
            <Card>
              <CardHeader className="relative">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl">키보드 단축키</CardTitle>
                </div>
                <CardDescription>
                  LumoStage를 더 효율적으로 사용하기 위한 단축키 목록입니다.
                </CardDescription>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {shortcuts.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                            item.disabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <span className="text-foreground text-sm">
                            {item.description}
                            {item.disabled && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (준비 중)
                              </span>
                            )}
                          </span>
                          <kbd className="px-3 py-1.5 text-xs font-mono bg-muted text-foreground rounded border border-border shadow-sm">
                            {isMac && item.mac ? item.mac : item.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsCard;

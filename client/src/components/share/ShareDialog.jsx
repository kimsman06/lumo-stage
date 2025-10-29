import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import useShareStore from "@/store/shareStore";
import { SHARE_MESSAGES } from "@/lib/toast-messages";
import ShareLinkDisplay from "./ShareLinkDisplay";
import PermissionSelector from "./PermissionSelector";
import ExpirationSelector from "./ExpirationSelector";
import ActiveToggle from "./ActiveToggle";
import { CenteredDialogContent } from "../ui/centered-dialog";

/**
 * ShareDialog - 공유 설정 다이얼로그 (메인 컴포넌트)
 *
 * @param {string} projectId - 프로젝트 ID
 * @param {boolean} open - 다이얼로그 열림 상태
 * @param {function} onOpenChange - 다이얼로그 상태 변경 콜백
 */
export default function ShareDialog({ projectId, open, onOpenChange }) {
  const {
    shareConfig,
    isLoading,
    generateShareLink,
    getShareConfig,
    updateShareConfig,
    regenerateToken,
  } = useShareStore();

  const [localPermission, setLocalPermission] = useState("view");
  const [localExpiration, setLocalExpiration] = useState(null);
  const [localActive, setLocalActive] = useState(true);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 공유 설정 로드
  useEffect(() => {
    if (open && projectId) {
      loadShareConfig();
    }
  }, [open, projectId]);

  // 로컬 상태와 shareConfig 동기화
  useEffect(() => {
    if (shareConfig) {
      setLocalPermission(shareConfig.permission);
      setLocalExpiration(
        shareConfig.expiresAt
          ? calculateExpirationDays(shareConfig.expiresAt)
          : null
      );
      setLocalActive(shareConfig.isActive);
    }
  }, [shareConfig]);

  // 변경사항 감지
  useEffect(() => {
    if (shareConfig.token) {
      const currentExpiration = shareConfig.expiresAt
        ? calculateExpirationDays(shareConfig.expiresAt)
        : null;
      const changed =
        localPermission !== shareConfig.permission ||
        localExpiration !== currentExpiration ||
        localActive !== shareConfig.isActive;
      setHasChanges(changed);
    }
  }, [localPermission, localExpiration, localActive, shareConfig]);

  const loadShareConfig = async () => {
    try {
      await getShareConfig(projectId);
    } catch (error) {
      console.error("공유 설정 조회 실패:", error);
    }
  };

  const calculateExpirationDays = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    // 가장 가까운 옵션으로 매핑
    if (diffDays <= 1) return 1;
    if (diffDays <= 7) return 7;
    if (diffDays <= 30) return 30;
    return null; // 30일 이상은 무제한으로 간주
  };

  const calculateExpiresAt = (days) => {
    if (days === null) return null;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt.toISOString();
  };

  const handleGenerateLink = async () => {
    try {
      const result = await generateShareLink(projectId, {
        permission: localPermission,
        expiresAt: calculateExpiresAt(localExpiration),
        isActive: localActive,
      });

      toast.success(SHARE_MESSAGES.createLinkSuccess);

      // 자동으로 클립보드에 복사
      const shareUrl = `${window.location.origin}/shared/${result.token}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(SHARE_MESSAGES.linkCopied);
      }
    } catch (error) {
      console.error("공유 링크 생성 실패:", error);
      toast.error(error.message || SHARE_MESSAGES.createLinkError);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateShareConfig(projectId, {
        permission: localPermission,
        expiresAt: calculateExpiresAt(localExpiration),
        isActive: localActive,
      });

      toast.success(SHARE_MESSAGES.updateSettingsSuccess);
      setHasChanges(false);
    } catch (error) {
      console.error("공유 설정 업데이트 실패:", error);
      toast.error(error.message || SHARE_MESSAGES.updateSettingsError);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      const result = await regenerateToken(projectId);
      toast.success(SHARE_MESSAGES.regenerateLinkSuccess);

      // 자동으로 클립보드에 복사
      const shareUrl = `${window.location.origin}/shared/${result.token}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(SHARE_MESSAGES.linkCopied);
      }

      setShowRegenerateDialog(false);
    } catch (error) {
      console.error("토큰 재생성 실패:", error);
      toast.error(error.message || SHARE_MESSAGES.regenerateLinkError);
    }
  };

  const shareUrl = shareConfig.token
    ? `${window.location.origin}/shared/${shareConfig.token}`
    : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <CenteredDialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              프로젝트 공유
            </DialogTitle>
            <DialogDescription>
              이 프로젝트를 다른 사람과 공유하세요. 조회 권한과 만료 시간을
              설정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 링크 없음 상태 */}
            {!shareConfig.token && (
              <div className="flex flex-col items-center justify-center p-8 bg-studio-800 rounded-lg border border-studio-700 border-dashed">
                <LinkIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-4">
                  공유 링크가 아직 생성되지 않았습니다.
                </p>
                <Button
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                  className="w-full max-w-xs"
                >
                  {isLoading ? "생성 중..." : "공유 링크 생성"}
                </Button>
              </div>
            )}

            {/* 링크 있음 상태 */}
            {shareConfig.token && (
              <>
                {/* 링크 표시 */}
                <ShareLinkDisplay
                  shareUrl={shareUrl}
                  createdAt={shareConfig.createdAt}
                  expiresAt={shareConfig.expiresAt}
                />

                {/* 링크 재생성 버튼 */}
                <Button
                  onClick={() => setShowRegenerateDialog(true)}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  링크 재생성
                </Button>

                <Separator />

                {/* 권한 설정 */}
                <PermissionSelector
                  value={localPermission}
                  onChange={setLocalPermission}
                  disabled={isLoading}
                />

                <Separator />

                {/* 만료 시간 */}
                <ExpirationSelector
                  value={localExpiration}
                  onChange={setLocalExpiration}
                  disabled={isLoading}
                />

                <Separator />

                {/* 활성화 토글 */}
                <ActiveToggle
                  checked={localActive}
                  onChange={setLocalActive}
                  disabled={isLoading}
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={isLoading}
            >
              {shareConfig.token ? "닫기" : "취소"}
            </Button>
            {shareConfig.token && (
              <Button
                onClick={handleSaveSettings}
                disabled={isLoading || !hasChanges}
              >
                {isLoading ? "저장 중..." : "설정 저장"}
              </Button>
            )}
          </DialogFooter>
        </CenteredDialogContent>
      </Dialog>

      {/* 링크 재생성 확인 다이얼로그 */}
      <AlertDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>링크 재생성</AlertDialogTitle>
            <AlertDialogDescription>
              이전 링크는 더 이상 사용할 수 없습니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateToken}
              disabled={isLoading}
            >
              {isLoading ? "재생성 중..." : "재생성"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

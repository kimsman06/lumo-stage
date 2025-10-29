import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useProjectStore from "../../store/projectStore";
import toast from "../../lib/toast";
import { CenteredDialogContent } from "../ui/centered-dialog";

const CreateProjectDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { createProject, isLoading } = useProjectStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("프로젝트 이름을 입력해주세요.");
      return;
    }

    setError("");

    // 프로젝트 생성 API 호출 (Promise 기반 Toast)
    const createPromise = createProject({
      name: name.trim(),
      description: description.trim(),
      sceneData: {
        mannequins: [],
        lights: [],
        cameraState: {
          position: [0, 2, 8],
          target: [0, 2, 0],
          focalLength: 50,
        },
        aspectRatio: "16:9",
      },
    });

    // Toast로 진행 상황 표시
    toast.project.create(createPromise);

    const result = await createPromise;

    if (result.success) {
      // 성공 시 폼 초기화 및 다이얼로그 닫기
      setName("");
      setDescription("");
      onOpenChange(false);

      // 생성된 프로젝트의 에디터로 이동
      navigate(`/editor/${result.project._id || result.project.id}`);
    } else {
      setError(result.error || "프로젝트 생성에 실패했습니다.");
    }
  };

  // 다이얼로그가 닫힐 때 폼 초기화
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <CenteredDialogContent>
        <DialogHeader className="space-y-1">
          <DialogTitle>새 프로젝트 만들기</DialogTitle>
          <DialogDescription>
            새로운 조명 시뮬레이션 프로젝트를 시작하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">프로젝트 이름 *</Label>
            <Input
              id="name"
              placeholder="예: Product Shoot"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="조명 설정에 대한 설명을 입력하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isLoading}>
            {isLoading ? "생성 중..." : "프로젝트 만들기"}
          </Button>
        </div>
      </CenteredDialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;

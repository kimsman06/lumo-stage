import React, { useEffect, useState } from "react";
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
import { CenteredDialogContent } from "../ui/centered-dialog";

const EditProjectDialog = ({ open, project, onOpenChange }) => {
  const { updateProject, isLoading } = useProjectStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setError("");
    }
  }, [project]);

  const handleUpdate = async () => {
    if (!project?.id && !project?._id) {
      setError("잘못된 프로젝트입니다.");
      return;
    }

    if (!name.trim()) {
      setError("프로젝트 이름을 입력해주세요.");
      return;
    }

    setError("");

    const projectId = project.id || project._id;
    const result = await updateProject(projectId, {
      name: name.trim(),
      description: description.trim(),
    });

    if (result.success) {
      onOpenChange(false);
    } else {
      setError(result.error || "프로젝트 수정에 실패했습니다.");
    }
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setError("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <CenteredDialogContent>
        <DialogHeader className="space-y-1">
          <DialogTitle>프로젝트 정보 수정</DialogTitle>
          <DialogDescription>
            프로젝트 이름과 설명을 편집합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">프로젝트 이름 *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">설명</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

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
          <Button onClick={handleUpdate} disabled={!name.trim() || isLoading}>
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </CenteredDialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;

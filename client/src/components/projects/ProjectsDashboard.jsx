import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Grid3x3, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ProjectCard from "./ProjectCard";
import NewProjectDialog from "./NewProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import EmptyState from "./EmptyState";
import useProjectStore from "../../store/projectStore";
import AuthNavbar from "../layout/AuthNavbar";

// ============================================
// Main Projects Dashboard (API Connected)
// ============================================
export default function ProjectsDashboard() {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // 컴포넌트 마운트 시 프로젝트 목록 로드
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 검색 필터링
  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 프로젝트 열기
  const handleOpenProject = (id) => {
    navigate(`/editor/${id}`);
  };

  // 프로젝트 삭제
  const handleDeleteProject = async (id) => {
    if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      const result = await deleteProject(id);
      if (result.success) {
        console.log("프로젝트가 삭제되었습니다.");
      } else {
        alert(`삭제 실패: ${result.error}`);
      }
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen bg-background pt-16">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">내 프로젝트</h1>
                <p className="text-muted-foreground">
                  조명 시뮬레이션 프로젝트를 관리하세요
                </p>
              </div>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gap-2"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                새 프로젝트
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="프로젝트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  aria-label="그리드 뷰로 전환"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  aria-label="리스트 뷰로 전환"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className="container mx-auto px-4 py-8">
          {/* 에러 표시 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProjects}
                className="mt-2"
              >
                다시 시도
              </Button>
            </div>
          )}

          {/* 로딩 중 */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredProjects.length === 0 && searchQuery === "" ? (
            // 프로젝트가 없을 때
            <EmptyState onCreateNew={() => setDialogOpen(true)} />
          ) : filteredProjects.length === 0 ? (
            // 검색 결과가 없을 때
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                "{searchQuery}"에 대한 검색 결과가 없습니다.
              </p>
            </div>
          ) : (
            // 프로젝트 목록 표시
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4 w-full mx-auto"
              }
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id || project.id}
                  project={project}
                  viewMode={viewMode}
                  onOpen={handleOpenProject}
                  onEdit={() => handleEditProject(project)}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* New Project Dialog */}
        <NewProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        <EditProjectDialog
          open={editDialogOpen}
          project={selectedProject}
          onOpenChange={setEditDialogOpen}
        />
      </div>
    </>
  );
}

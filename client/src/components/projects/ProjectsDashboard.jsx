import React, { useState } from "react";
import { Plus, Search, Grid3x3, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ProjectCard from "./ProjectCard";
import NewProjectDialog from "./NewProjectDialog";
import EmptyState from "./EmptyState";

// ============================================
// Demo Data
// ============================================
const initialProjects = [
  {
    id: "1",
    name: "Product Shoot",
    description:
      "Three-point lighting setup for product photography with dramatic shadows",
    thumbnail: "",
    updatedAt: new Date("2025-01-20T14:30:00"),
    lightsCount: 3,
    lastEdited: "2 days ago",
  },
  {
    id: "2",
    name: "Interview Scene",
    description: "Dramatic side lighting for cinematic interview setup",
    thumbnail: "",
    updatedAt: new Date("2025-01-18T10:15:00"),
    lightsCount: 4,
    lastEdited: "4 days ago",
  },
  {
    id: "3",
    name: "Night Exterior",
    description:
      "Moonlight simulation with practical lights and ambient occlusion",
    thumbnail: "",
    updatedAt: new Date("2025-01-15T16:45:00"),
    lightsCount: 5,
    lastEdited: "1 week ago",
  },
  {
    id: "4",
    name: "Music Video",
    description: "Colorful dynamic lighting with multiple RGB sources",
    thumbnail: "",
    updatedAt: new Date("2025-01-12T09:20:00"),
    lightsCount: 7,
    lastEdited: "1 week ago",
  },
  {
    id: "5",
    name: "Corporate Headshot",
    description: "Professional studio lighting setup for corporate portraits",
    thumbnail: "",
    updatedAt: new Date("2025-01-10T13:00:00"),
    lightsCount: 2,
    lastEdited: "2 weeks ago",
  },
  {
    id: "6",
    name: "Food Photography",
    description: "Soft overhead lighting with reflectors for food styling",
    thumbnail: "",
    updatedAt: new Date("2025-01-08T11:30:00"),
    lightsCount: 3,
    lastEdited: "2 weeks ago",
  },
];

// ============================================
// Main Projects Dashboard
// ============================================
export default function ProjectsDashboard() {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      thumbnail: "",
      updatedAt: new Date(),
      lightsCount: 0,
      lastEdited: "Just now",
    };
    setProjects([newProject, ...projects]);
  };

  const handleOpenProject = (id) => {
    alert(`Opening project ${id} in editor...`);
    // In real app: navigate to /projects/:id
  };

  const handleEditProject = (id) => {
    alert(`Editing project ${id} details...`);
  };

  const handleDeleteProject = (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Projects</h1>
              <p className="text-muted-foreground">
                Manage your lighting simulation projects
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className="container mx-auto px-4 py-8">
        {filteredProjects.length === 0 && searchQuery === "" ? (
          <EmptyState onCreateNew={() => setDialogOpen(true)} />
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No projects found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4 w-full mx-auto"
            }
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewMode={viewMode}
                onOpen={handleOpenProject}
                onEdit={handleEditProject}
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
        onCreate={handleCreateProject}
      />
    </div>
  );
}

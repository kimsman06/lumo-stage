import React, { useState } from "react";
import {
  Trash2,
  Edit,
  MoreVertical,
  FolderOpen,
  Clock,
  Lightbulb,
  Camera,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProjectCard = ({ project, onOpen, onEdit, onDelete, viewMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  if (viewMode === "list") {
    return (
      <Card className="group hover:border-primary/50 transition-all cursor-pointer">
        <div className="p-4 flex items-center gap-3">
          {/* Thumbnail */}
          <div className="w-24 h-16 rounded-md bg-gradient-to-br from-primary/20 via-yellow-500/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Camera className="w-8 h-8 text-muted-foreground/50" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0" onClick={() => onOpen(project.id)}>
            <h3 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {project.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                <span>{project.lightsCount} lights</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{project.lastEdited}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="프로젝트 메뉴 열기">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  onOpen(project.id);
                  setMenuOpen(false);
                }}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onEdit(project.id);
                  setMenuOpen(false);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onDelete(project.id);
                  setMenuOpen(false);
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:border-primary/50 transition-all cursor-pointer">
      {/* Thumbnail */}
      <div
        className="rounded-tl-xl rounded-tr-xl aspect-video bg-gradient-to-br from-primary/20 via-yellow-500/10 to-orange-500/10 flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onOpen(project.id)}
      >
        <Camera className="w-16 h-16 text-muted-foreground/30" />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" size="sm" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Open Project
          </Button>
        </div>

        {/* Lights Badge */}
        <Badge className="absolute top-2 right-2 gap-1">
          <Lightbulb className="w-3 h-3" />
          {project.lightsCount}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {project.description}
            </CardDescription>
          </div>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 -mt-1"
                aria-label="프로젝트 메뉴 열기"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  onOpen(project.id);
                  setMenuOpen(false);
                }}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onEdit(project.id);
                  setMenuOpen(false);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onDelete(project.id);
                  setMenuOpen(false);
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Edited {project.lastEdited}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;

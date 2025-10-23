import React, { useState } from "react";
import {
  Plus,
  Search,
  Grid3x3,
  List,
  Trash2,
  Edit,
  MoreVertical,
  FolderOpen,
  Clock,
  Lightbulb,
  Camera,
  ArrowRight,
} from "lucide-react";

// ============================================
// UI Components (shadcn/ui style)
// ============================================
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow hover:shadow-lg",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "text-foreground border border-input",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg">{children}</div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }) => (
  <div
    className={`bg-background rounded-lg shadow-lg border animate-in fade-in-0 zoom-in-95 ${className}`}
  >
    {children}
  </div>
);

const DialogHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const DialogTitle = ({ children, className = "" }) => (
  <h2
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h2>
);

const DialogDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const Label = ({ children, className = "", ...props }) => (
  <label
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
);

const DropdownMenu = ({ trigger, children, open, onOpenChange }) => {
  return (
    <div className="relative">
      <div onClick={() => onOpenChange(!open)}>{trigger}</div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 z-50 rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
            {children}
          </div>
        </>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className = "" }) => (
  <button
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

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
// Project Card Component
// ============================================
const ProjectCard = ({ project, onOpen, onEdit, onDelete, viewMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  if (viewMode === "list") {
    return (
      <Card className="group hover:border-primary/50 transition-all cursor-pointer">
        <div className="p-4 flex items-center gap-4">
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
          <DropdownMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            trigger={
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            }
          >
            <div className="p-1">
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
            </div>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:border-primary/50 transition-all overflow-hidden">
      {/* Thumbnail */}
      <div
        className="aspect-video bg-gradient-to-br from-primary/20 via-yellow-500/10 to-orange-500/10 flex items-center justify-center cursor-pointer relative overflow-hidden"
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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {project.description}
            </CardDescription>
          </div>

          <DropdownMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 -mt-1"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            }
          >
            <div className="p-1">
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
            </div>
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

// ============================================
// New Project Dialog
// ============================================
const NewProjectDialog = ({ open, onOpenChange, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (name.trim()) {
      onCreate({ name, description });
      setName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            새로운 조명 시뮬레이션 프로젝트를 시작하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Product Shoot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Describe your lighting setup..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Empty State Component
// ============================================
const EmptyState = ({ onCreateNew }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <Lightbulb className="w-12 h-12 text-primary" />
    </div>
    <h3 className="text-2xl font-bold mb-2">No Projects Yet</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      프로젝트를 생성하여 3D 조명 시뮬레이션을 시작하세요.
    </p>
    <Button size="lg" onClick={onCreateNew} className="gap-2">
      <Plus className="w-5 h-5" />
      Create Your First Project
    </Button>
  </div>
);

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
                : "space-y-4 max-w-4xl mx-auto"
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

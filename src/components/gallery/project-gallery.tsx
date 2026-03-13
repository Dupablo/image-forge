"use client";

import { Plus } from "lucide-react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./project-card";

interface ProjectGalleryProps {
  projects: Project[];
  onCreateProject: () => void;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectGallery({
  projects,
  onCreateProject,
  onOpenProject,
  onDeleteProject,
}: ProjectGalleryProps) {
  const sorted = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* New Project card */}
      <button
        onClick={onCreateProject}
        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors"
      >
        <div className="rounded-full bg-muted p-3">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          New Project
        </span>
      </button>

      {/* Project cards */}
      {sorted.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={() => onOpenProject(project.id)}
          onDelete={() => onDeleteProject(project.id)}
        />
      ))}
    </div>
  );
}

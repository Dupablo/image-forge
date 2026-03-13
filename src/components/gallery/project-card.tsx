"use client";

import { Trash2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  return (
    <div
      onClick={onOpen}
      className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-colors hover:border-muted-foreground/30"
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-muted">
        {project.thumbnailDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailDataUrl}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-3xl text-muted-foreground/30">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-sm font-medium truncate">{project.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {project.versions.length} version
          {project.versions.length !== 1 ? "s" : ""} &middot;{" "}
          {formatTimeAgo(project.updatedAt)}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 rounded-md bg-background/80 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </button>
    </div>
  );
}

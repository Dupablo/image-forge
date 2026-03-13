"use client";

import type { Project } from "@/lib/types";
import { VersionTree } from "./version-tree";
import type { VersionTreeNode } from "@/lib/types";

interface VersionSidebarProps {
  project: Project;
  activeVersionId: string;
  tree: VersionTreeNode[];
  onSelectVersion: (versionId: string) => void;
}

export function VersionSidebar({
  project,
  activeVersionId,
  tree,
  onSelectVersion,
}: VersionSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <h3 className="text-xs font-semibold">Versions</h3>
          <p className="text-[10px] text-muted-foreground">
            {project.versions.length} version
            {project.versions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
        <VersionTree
          tree={tree}
          activeVersionId={activeVersionId}
          starredIds={project.starred}
          onSelect={onSelectVersion}
        />
      </div>
    </div>
  );
}

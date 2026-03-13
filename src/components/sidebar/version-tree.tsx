"use client";

import type { VersionTreeNode } from "@/lib/types";
import { VersionNode } from "./version-node";
import { cn } from "@/lib/utils";

interface VersionTreeProps {
  tree: VersionTreeNode[];
  activeVersionId: string;
  starredIds: string[];
  onSelect: (versionId: string) => void;
}

function TreeNode({
  node,
  activeVersionId,
  starredIds,
  onSelect,
}: {
  node: VersionTreeNode;
  activeVersionId: string;
  starredIds: string[];
  onSelect: (versionId: string) => void;
}) {
  return (
    <div>
      <VersionNode
        version={node.version}
        isActive={node.version.id === activeVersionId}
        isStarred={starredIds.includes(node.version.id)}
        onSelect={() => onSelect(node.version.id)}
      />
      {node.children.length > 0 && (
        <div className={cn("ml-3 border-l border-border pl-1 space-y-0.5")}>
          {node.children.map((child) => (
            <TreeNode
              key={child.version.id}
              node={child}
              activeVersionId={activeVersionId}
              starredIds={starredIds}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function VersionTree({
  tree,
  activeVersionId,
  starredIds,
  onSelect,
}: VersionTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
        No versions yet
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <TreeNode
          key={node.version.id}
          node={node}
          activeVersionId={activeVersionId}
          starredIds={starredIds}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

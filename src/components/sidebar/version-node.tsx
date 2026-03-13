"use client";

import { Star } from "lucide-react";
import type { Version } from "@/lib/types";
import { cn, formatTimeAgo } from "@/lib/utils";

interface VersionNodeProps {
  version: Version;
  isActive: boolean;
  isStarred: boolean;
  onSelect: () => void;
}

export function VersionNode({
  version,
  isActive,
  isStarred,
  onSelect,
}: VersionNodeProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
        isActive
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-accent border-l-2 border-transparent"
      )}
    >
      {/* Thumbnail */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
        {version.thumbnailDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={version.thumbnailDataUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            v{version.number}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">v{version.number}</span>
          {isStarred && (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          {version.editInstruction || version.prompt}
        </p>
        <p className="text-[9px] text-muted-foreground/70">
          {formatTimeAgo(version.createdAt)}
        </p>
      </div>
    </button>
  );
}

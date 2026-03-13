"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Version } from "@/lib/types";
import { CompareSlider } from "@/components/canvas/compare-slider";

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: Version[];
  loadImage: (versionId: string) => Promise<string | null>;
}

export function CompareDialog({
  open,
  onOpenChange,
  versions,
  loadImage,
}: CompareDialogProps) {
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");
  const [leftUrl, setLeftUrl] = useState<string | null>(null);
  const [rightUrl, setRightUrl] = useState<string | null>(null);

  useEffect(() => {
    if (versions.length >= 2 && !leftId && !rightId) {
      setLeftId(versions[versions.length - 2].id);
      setRightId(versions[versions.length - 1].id);
    }
  }, [versions, leftId, rightId]);

  useEffect(() => {
    if (leftId) loadImage(leftId).then(setLeftUrl);
  }, [leftId, loadImage]);

  useEffect(() => {
    if (rightId) loadImage(rightId).then(setRightUrl);
  }, [rightId, loadImage]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b px-4 py-2">
        <h2 className="text-sm font-semibold">Compare Versions</h2>
        <div className="flex items-center gap-2 ml-4">
          <select
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.number}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">vs</span>
          <select
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.number}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="ml-auto rounded-md p-1.5 hover:bg-accent transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Slider */}
      <div className="flex-1">
        {leftUrl && rightUrl ? (
          <CompareSlider
            leftImageUrl={leftUrl}
            rightImageUrl={rightUrl}
            leftLabel={`v${versions.find((v) => v.id === leftId)?.number || "?"}`}
            rightLabel={`v${versions.find((v) => v.id === rightId)?.number || "?"}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select two versions to compare
          </div>
        )}
      </div>
    </div>
  );
}

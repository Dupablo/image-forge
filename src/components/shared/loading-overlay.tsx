"use client";

import { Loader2, X } from "lucide-react";
import type { WorkspaceStatus } from "@/lib/types";

const STATUS_TEXT: Record<string, string> = {
  generating: "Generating image...",
  editing: "Editing image...",
  inpainting: "Inpainting...",
  upscaling: "Upscaling image...",
  enhancing_prompt: "Enhancing prompt...",
};

interface LoadingOverlayProps {
  status: WorkspaceStatus;
  onCancel: () => void;
}

export function LoadingOverlay({ status, onCancel }: LoadingOverlayProps) {
  if (status === "idle" || status === "error") return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-sm font-medium text-foreground mb-4">
        {STATUS_TEXT[status] || "Processing..."}
      </p>
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
        Cancel
      </button>
    </div>
  );
}

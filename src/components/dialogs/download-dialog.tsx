"use client";

import { useState, useCallback } from "react";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  versionNumber: number;
}

type ImageFormat = "png" | "jpeg" | "webp";

export function DownloadDialog({
  open,
  onOpenChange,
  imageUrl,
  versionNumber,
}: DownloadDialogProps) {
  const [format, setFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState(90);

  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const mimeType =
        format === "png"
          ? "image/png"
          : format === "jpeg"
            ? "image/jpeg"
            : "image/webp";
      const qualityVal = format === "png" ? undefined : quality / 100;
      const dataUrl = canvas.toDataURL(mimeType, qualityVal);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `image-forge-v${versionNumber}-${Date.now()}.${format}`;
      a.click();
    };
    img.src = imageUrl;
  }, [imageUrl, format, quality, versionNumber]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Download Image</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-medium text-muted-foreground">
            Format
          </label>
          <div className="flex gap-1.5">
            {(["png", "jpeg", "webp"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "flex-1 rounded-md border py-1.5 text-xs font-medium uppercase transition-colors",
                  format === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Quality (for JPEG/WebP) */}
        {format !== "png" && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Quality
              </label>
              <span className="text-xs font-mono text-muted-foreground">
                {quality}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-1.5 accent-primary"
            />
          </div>
        )}

        <button
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
}

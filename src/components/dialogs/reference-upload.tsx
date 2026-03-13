"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ImageDropZone } from "@/components/shared/image-drop-zone";

interface ReferenceUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
}

export function ReferenceUpload({
  open,
  onOpenChange,
  onUpload,
}: ReferenceUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  const handleDrop = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      setPreview(null);
      setFile(null);
      onOpenChange(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Reference Image</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {preview ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-md object-contain max-h-[200px]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="flex-1 rounded-md border py-1.5 text-sm hover:bg-accent transition-colors"
              >
                Change
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 rounded-md bg-primary py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Use as reference
              </button>
            </div>
          </div>
        ) : (
          <ImageDropZone onDrop={handleDrop} />
        )}
      </div>
    </div>
  );
}

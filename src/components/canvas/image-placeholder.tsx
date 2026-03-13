"use client";

import { ImagePlus } from "lucide-react";
import { SAMPLE_PROMPTS } from "@/lib/constants";

interface ImagePlaceholderProps {
  onSamplePrompt: (prompt: string) => void;
}

export function ImagePlaceholder({ onSamplePrompt }: ImagePlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-muted p-4">
          <ImagePlus className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Create your first image</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Type a prompt and click Generate to get started, or try one of these
          examples:
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {SAMPLE_PROMPTS.slice(0, 3).map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSamplePrompt(prompt)}
            className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left max-w-[250px] truncate"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

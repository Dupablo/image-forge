"use client";

import { useRef, useCallback } from "react";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import type { WorkspaceStatus } from "@/lib/types";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onEnhance: () => void;
  enhancedPrompt?: string;
  status: WorkspaceStatus;
}

export function PromptInput({
  value,
  onChange,
  onGenerate,
  onEnhance,
  enhancedPrompt,
  status,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isWorking = status !== "idle" && status !== "error";

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isWorking && value.trim()) onGenerate();
      }
    },
    [isWorking, value, onGenerate]
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        Prompt
      </label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to create..."
          className="w-full min-h-[100px] resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          disabled={isWorking}
        />
        <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
          {value.length}
        </span>
      </div>
      {enhancedPrompt && (
        <div className="rounded-md border bg-muted/50 px-3 py-2">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            Enhanced prompt:
          </p>
          <p className="text-xs text-foreground/80 line-clamp-3">
            {enhancedPrompt}
          </p>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={onEnhance}
          disabled={isWorking || !value.trim()}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {status === "enhancing_prompt" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Enhance
        </button>
        <button
          onClick={onGenerate}
          disabled={isWorking || !value.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {status === "generating" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wand2 className="h-3.5 w-3.5" />
          )}
          Generate
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Ctrl+Enter to generate
      </p>
    </div>
  );
}

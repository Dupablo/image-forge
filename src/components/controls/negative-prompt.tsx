"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface NegativePromptProps {
  value: string;
  onChange: (value: string) => void;
  autoFilled?: string;
}

export function NegativePrompt({
  value,
  onChange,
  autoFilled,
}: NegativePromptProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Negative Prompt
      </button>

      {open && (
        <div className="space-y-1.5">
          {autoFilled && (
            <div className="rounded bg-muted/50 px-2 py-1">
              <p className="text-[10px] text-muted-foreground">
                Auto-filled from style:
              </p>
              <p className="text-[10px] text-muted-foreground/80 italic">
                {autoFilled}
              </p>
            </div>
          )}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Things to avoid in the image..."
            className="w-full min-h-[60px] resize-none rounded-md border bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}
    </div>
  );
}

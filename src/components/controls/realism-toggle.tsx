"use client";

import { cn } from "@/lib/utils";

interface RealismToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function RealismToggle({ enabled, onToggle }: RealismToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
        enabled ? "border-primary/30 bg-primary/5" : "border-border"
      )}
    >
      <div>
        <p className="text-xs font-medium">Realism Boost</p>
        <p className="text-[10px] text-muted-foreground">
          Enhance for photorealistic output
        </p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          enabled ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5",
            enabled ? "translate-x-4 ml-0.5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

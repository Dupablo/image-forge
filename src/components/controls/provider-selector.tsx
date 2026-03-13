"use client";

import { cn } from "@/lib/utils";
import type { ProviderInfo } from "@/lib/types";

interface ProviderSelectorProps {
  providers: ProviderInfo[];
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
}

export function ProviderSelector({
  providers,
  selectedProvider,
  onSelectProvider,
}: ProviderSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Provider
      </label>
      <div className="flex gap-1">
        {providers.map((p) => (
          <button
            key={p.name}
            onClick={() => p.configured && onSelectProvider(p.name)}
            disabled={!p.configured}
            className={cn(
              "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
              selectedProvider === p.name
                ? "border-primary bg-primary/10 text-primary"
                : p.configured
                  ? "border-border hover:bg-accent"
                  : "border-border opacity-40 cursor-not-allowed"
            )}
          >
            {p.displayName}
            {!p.configured && (
              <span className="block text-[9px] text-muted-foreground">
                Not configured
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

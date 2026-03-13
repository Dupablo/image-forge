"use client";

import { cn } from "@/lib/utils";

interface VariationCountProps {
  count: number;
  onChange: (count: number) => void;
  max: number;
}

export function VariationCount({ count, onChange, max }: VariationCountProps) {
  const options = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Variations
      </label>
      <div className="flex gap-1">
        {options.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 rounded-md border py-1 text-xs font-medium transition-colors",
              count === n
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-accent"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

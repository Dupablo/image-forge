"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { LOCK_OPTIONS } from "@/lib/constants";
import type { LockElement } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LockElementsProps {
  selected: LockElement[];
  onChange: (elements: LockElement[]) => void;
}

export function LockElements({ selected, onChange }: LockElementsProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    const elem = id as LockElement;
    if (selected.includes(elem)) {
      onChange(selected.filter((e) => e !== elem));
    } else {
      onChange([...selected, elem]);
    }
  };

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
        Preserve Elements
        {selected.length > 0 && (
          <span className="ml-1 text-[10px] text-primary">
            ({selected.length})
          </span>
        )}
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {LOCK_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
                selected.includes(opt.id as LockElement)
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-accent text-muted-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

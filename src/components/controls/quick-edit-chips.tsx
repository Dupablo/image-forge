"use client";

import {
  Camera,
  User,
  Crosshair,
  Sun,
  Eraser,
  Layers,
  Maximize,
} from "lucide-react";
import { QUICK_EDITS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ReactNode> = {
  Camera: <Camera className="h-3 w-3" />,
  Hand: <span className="text-[10px]">&#9995;</span>,
  User: <User className="h-3 w-3" />,
  Crosshair: <Crosshair className="h-3 w-3" />,
  Sun: <Sun className="h-3 w-3" />,
  Eraser: <Eraser className="h-3 w-3" />,
  Layers: <Layers className="h-3 w-3" />,
  Rainbow: <span className="text-[10px]">&#127752;</span>,
  Maximize: <Maximize className="h-3 w-3" />,
};

interface QuickEditChipsProps {
  onApplyEdit: (instruction: string) => void;
  disabled?: boolean;
}

export function QuickEditChips({
  onApplyEdit,
  disabled,
}: QuickEditChipsProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Quick Edits
      </label>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_EDITS.map((edit) => (
          <button
            key={edit.id}
            onClick={() => onApplyEdit(edit.instruction)}
            disabled={disabled}
            className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {ICON_MAP[edit.icon]}
            {edit.label}
          </button>
        ))}
      </div>
    </div>
  );
}

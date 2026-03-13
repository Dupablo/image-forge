"use client";

import { ArrowUp, Loader2 } from "lucide-react";

interface EditInstructionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
  disabled?: boolean;
}

export function EditInstruction({
  value,
  onChange,
  onSubmit,
  isEditing,
  disabled,
}: EditInstructionProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Edit Instruction
      </label>
      <div className="flex gap-1.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled && value.trim()) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Tell me what to change..."
          className="flex-1 rounded-md border bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          disabled={disabled}
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {isEditing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

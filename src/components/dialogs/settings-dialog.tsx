"use client";

import { X } from "lucide-react";
import { useThemeContext } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useThemeContext();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Theme
          </label>
          <div className="flex gap-1.5">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex-1 rounded-md border py-1.5 text-xs font-medium capitalize transition-colors",
                  theme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[10px] text-muted-foreground">
          API keys are configured via environment variables (.env.local).
        </p>
      </div>
    </div>
  );
}

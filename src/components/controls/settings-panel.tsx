"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Dice5 } from "lucide-react";
import { ASPECT_RATIOS } from "@/lib/constants";
import type { GenerationParams } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  params: GenerationParams;
  onParamsChange: (params: Partial<GenerationParams>) => void;
  showStrength?: boolean;
}

export function SettingsPanel({
  params,
  onParamsChange,
  showStrength = false,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(true);

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
        Advanced Settings
      </button>

      {open && (
        <div className="space-y-3 pt-1">
          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              Aspect Ratio
            </label>
            <div className="flex gap-1">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() =>
                    onParamsChange({
                      aspectRatio: ar.value,
                      width: ar.width,
                      height: ar.height,
                    })
                  }
                  className={cn(
                    "flex-1 rounded-md border px-1 py-1 text-[11px] font-medium transition-colors",
                    params.aspectRatio === ar.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guidance Scale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">
                Guidance Scale
              </label>
              <span className="text-xs font-mono text-muted-foreground">
                {params.guidanceScale}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={params.guidanceScale}
              onChange={(e) =>
                onParamsChange({ guidanceScale: Number(e.target.value) })
              }
              className="w-full h-1.5 accent-primary"
            />
          </div>

          {/* Steps */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Steps</label>
              <span className="text-xs font-mono text-muted-foreground">
                {params.numInferenceSteps}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={1}
              value={params.numInferenceSteps}
              onChange={(e) =>
                onParamsChange({ numInferenceSteps: Number(e.target.value) })
              }
              className="w-full h-1.5 accent-primary"
            />
          </div>

          {/* Seed */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Seed</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={params.seed}
                onChange={(e) =>
                  onParamsChange({ seed: Number(e.target.value) })
                }
                className="flex-1 rounded-md border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="-1 = random"
              />
              <button
                onClick={() =>
                  onParamsChange({
                    seed: Math.floor(Math.random() * 2147483647),
                  })
                }
                className="rounded-md border p-1.5 hover:bg-accent transition-colors"
                title="Random seed"
              >
                <Dice5 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Strength (for edit/inpaint) */}
          {showStrength && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Strength
                </label>
                <span className="text-xs font-mono text-muted-foreground">
                  {params.strength.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={params.strength}
                onChange={(e) =>
                  onParamsChange({ strength: Number(e.target.value) })
                }
                className="w-full h-1.5 accent-primary"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import {
  Camera,
  Aperture,
  Film,
  Box,
  User,
  Building2,
  Palette,
  Sparkles,
  Brush,
  PaintBucket,
  Droplets,
  Type,
} from "lucide-react";
import { STYLE_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  Camera: <Camera className="h-4 w-4" />,
  Aperture: <Aperture className="h-4 w-4" />,
  Film: <Film className="h-4 w-4" />,
  Box: <Box className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Brush: <Brush className="h-4 w-4" />,
  PaintBucket: <PaintBucket className="h-4 w-4" />,
  Droplets: <Droplets className="h-4 w-4" />,
  Type: <Type className="h-4 w-4" />,
};

interface StylePresetsProps {
  selectedStyle: string;
  onSelectStyle: (styleId: string) => void;
}

export function StylePresets({
  selectedStyle,
  onSelectStyle,
}: StylePresetsProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        Style
      </label>
      <div className="grid grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto scrollbar-thin pr-1">
        {STYLE_PRESETS.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelectStyle(style.id)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-colors",
              selectedStyle === style.id
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent"
            )}
          >
            <span className="shrink-0 text-muted-foreground">
              {ICON_MAP[style.icon] || <Sparkles className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{style.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {style.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

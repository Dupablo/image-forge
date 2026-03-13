"use client";

import { ArrowLeft, Moon, Sun, Sparkles } from "lucide-react";
import { useThemeContext } from "@/components/shared/theme-provider";

interface AppHeaderProps {
  projectName?: string;
  onBack?: () => void;
}

export function AppHeader({ projectName, onBack }: AppHeaderProps) {
  const { resolvedTheme, setTheme } = useThemeContext();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-md p-1.5 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Image Forge</span>
        {projectName && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {projectName}
            </span>
          </>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          className="rounded-md p-2 hover:bg-accent transition-colors"
          title="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  sidebar: React.ReactNode;
  canvas: React.ReactNode;
  controls: React.ReactNode;
}

export function WorkspaceLayout({
  sidebar,
  canvas,
  controls,
}: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "shrink-0 border-r bg-background overflow-y-auto scrollbar-thin transition-all duration-200",
          sidebarOpen ? "w-[240px]" : "w-0"
        )}
      >
        {sidebarOpen && sidebar}
      </div>

      {/* Canvas */}
      <div className="relative flex-1 flex flex-col min-w-0">
        <div className="absolute top-2 left-2 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md border bg-background p-1.5 shadow-sm hover:bg-accent transition-colors"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
        </div>
        {canvas}
      </div>

      {/* Controls */}
      <div className="shrink-0 w-[320px] border-l bg-background overflow-y-auto scrollbar-thin">
        {controls}
      </div>
    </div>
  );
}

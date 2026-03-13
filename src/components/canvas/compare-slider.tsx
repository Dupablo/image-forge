"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CompareSliderProps {
  leftImageUrl: string;
  rightImageUrl: string;
  leftLabel?: string;
  rightLabel?: string;
}

export function CompareSlider({
  leftImageUrl,
  rightImageUrl,
  leftLabel = "Before",
  rightLabel = "After",
}: CompareSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden select-none",
        isDragging ? "cursor-ew-resize" : "cursor-default"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Right image (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={rightImageUrl}
        alt={rightLabel}
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Left image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={leftImageUrl}
          alt={leftLabel}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ width: `${containerRef.current?.clientWidth || 0}px` }}
          draggable={false}
        />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-ew-resize"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
          <span className="text-xs font-bold text-gray-600">&#x2194;</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
        {leftLabel}
      </div>
      <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
        {rightLabel}
      </div>
    </div>
  );
}

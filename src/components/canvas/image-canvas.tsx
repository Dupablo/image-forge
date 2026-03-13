"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ImageCanvasProps {
  imageUrl: string | null;
  isLoading: boolean;
}

export function ImageCanvas({ imageUrl, isLoading }: ImageCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(4, Math.max(0.25, prev * delta)));
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      setIsPanning(true);
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    },
    [zoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  if (!imageUrl) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-full items-center justify-center overflow-hidden checkerboard",
        isPanning ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Generated image"
        className={cn(
          "max-w-full max-h-full object-contain transition-opacity",
          isLoading && "opacity-50"
        )}
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
        }}
        draggable={false}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-md border bg-background/90 backdrop-blur-sm px-1 py-0.5 shadow-sm">
        <button
          onClick={() => setZoom((z) => Math.max(0.25, z / 1.25))}
          className="px-1.5 py-0.5 text-xs hover:bg-accent rounded transition-colors"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="px-1.5 py-0.5 text-xs hover:bg-accent rounded transition-colors min-w-[40px] text-center"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(4, z * 1.25))}
          className="px-1.5 py-0.5 text-xs hover:bg-accent rounded transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

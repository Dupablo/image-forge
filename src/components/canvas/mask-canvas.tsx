"use client";

import { useRef, useEffect, useCallback } from "react";
import { Undo2, Trash2, Check } from "lucide-react";
import { useMaskDrawing } from "@/hooks/use-mask-drawing";

interface MaskCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onDone: (maskBase64: string) => void;
  onCancel: () => void;
}

export function MaskCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  onDone,
  onCancel,
}: MaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    brushSize,
    setBrushSize,
    startDraw,
    continueDraw,
    endDraw,
    undo,
    clear,
    initCanvas,
    getMaskAsBase64,
    hasMaskContent,
  } = useMaskDrawing(canvasRef);

  useEffect(() => {
    initCanvas(imageWidth, imageHeight);
  }, [imageWidth, imageHeight, initCanvas]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handleDone = useCallback(() => {
    if (hasMaskContent()) {
      onDone(getMaskAsBase64());
    }
  }, [hasMaskContent, getMaskAsBase64, onDone]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) undo();
      if (e.key === "[") setBrushSize((s) => Math.max(5, s - 5));
      if (e.key === "]") setBrushSize((s) => Math.min(100, s + 5));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel, undo, setBrushSize]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-3 py-2 z-30">
        <span className="text-xs font-medium">Mask Mode</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Brush:</label>
          <input
            type="range"
            min={5}
            max={100}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 h-1 accent-primary"
          />
          <span className="text-xs text-muted-foreground w-6">
            {brushSize}
          </span>
        </div>
        <button
          onClick={undo}
          className="rounded-md p-1.5 hover:bg-accent transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={clear}
          className="rounded-md p-1.5 hover:bg-accent transition-colors"
          title="Clear mask"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border px-3 py-1 text-xs hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Check className="h-3 w-3" />
            Apply
          </button>
        </div>
      </div>

      {/* Canvas overlay */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="max-w-full max-h-full object-contain absolute"
          draggable={false}
        />
        {/* Mask canvas */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain absolute opacity-40 cursor-crosshair"
          style={{ mixBlendMode: "multiply" }}
          onMouseDown={(e) => {
            const pos = getCanvasCoords(e);
            startDraw(pos.x, pos.y);
          }}
          onMouseMove={(e) => {
            const pos = getCanvasCoords(e);
            continueDraw(pos.x, pos.y);
          }}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />
      </div>
    </div>
  );
}

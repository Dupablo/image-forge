"use client";

import { useRef, useState, useCallback } from "react";

export function useMaskDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const historyRef = useRef<ImageData[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const getCtx = useCallback(
    () => canvasRef.current?.getContext("2d") ?? null,
    [canvasRef]
  );

  const saveHistory = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    const data = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    historyRef.current.push(data);
    if (historyRef.current.length > 50) historyRef.current.shift();
  }, [getCtx, canvasRef]);

  const drawCircle = useCallback(
    (x: number, y: number) => {
      const ctx = getCtx();
      if (!ctx) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [getCtx, brushSize]
  );

  const drawLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const ctx = getCtx();
      if (!ctx) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "white";
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [getCtx, brushSize]
  );

  const startDraw = useCallback(
    (x: number, y: number) => {
      saveHistory();
      setIsDrawing(true);
      drawCircle(x, y);
      lastPosRef.current = { x, y };
    },
    [saveHistory, drawCircle]
  );

  const continueDraw = useCallback(
    (x: number, y: number) => {
      if (!isDrawing) return;
      if (lastPosRef.current) {
        drawLine(lastPosRef.current, { x, y });
      }
      lastPosRef.current = { x, y };
    },
    [isDrawing, drawLine]
  );

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const undo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current || historyRef.current.length === 0) return;
    const data = historyRef.current.pop()!;
    ctx.putImageData(data, 0, 0);
  }, [getCtx, canvasRef]);

  const clear = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    saveHistory();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [getCtx, canvasRef, saveHistory]);

  const initCanvas = useCallback(
    (width: number, height: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
      }
      historyRef.current = [];
    },
    [canvasRef]
  );

  const getMaskAsBase64 = useCallback((): string => {
    return canvasRef.current?.toDataURL("image/png") ?? "";
  }, [canvasRef]);

  const getMaskBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        resolve(null);
        return;
      }
      canvasRef.current.toBlob(resolve, "image/png");
    });
  }, [canvasRef]);

  const hasMaskContent = useCallback((): boolean => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return false;
    const data = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    // Check if any pixel is white (mask drawn)
    for (let i = 0; i < data.data.length; i += 4) {
      if (data.data[i] > 128) return true;
    }
    return false;
  }, [getCtx, canvasRef]);

  return {
    brushSize,
    setBrushSize,
    isDrawing,
    startDraw,
    continueDraw,
    endDraw,
    undo,
    clear,
    initCanvas,
    getMaskAsBase64,
    getMaskBlob,
    hasMaskContent,
  };
}

"use client";

import { useState, useRef, useCallback } from "react";
import type {
  WorkspaceStatus,
  GenerateRequest,
  EditRequest,
  InpaintRequest,
  GenerateResponse,
  EnhancePromptResponse,
} from "@/lib/types";
import * as api from "@/lib/api-client";

export function useGeneration() {
  const [status, setStatus] = useState<WorkspaceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (params: GenerateRequest): Promise<GenerateResponse> => {
      setStatus("generating");
      setError(null);
      abortRef.current = new AbortController();
      try {
        const result = await api.generateImage(
          params,
          abortRef.current.signal
        );
        setStatus("idle");
        return result;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
          setStatus("idle");
          throw e;
        }
        const message =
          e instanceof Error ? e.message : "Generation failed";
        setError(message);
        setStatus("error");
        throw e;
      }
    },
    []
  );

  const edit = useCallback(
    async (params: EditRequest): Promise<GenerateResponse> => {
      setStatus("editing");
      setError(null);
      abortRef.current = new AbortController();
      try {
        const result = await api.editImage(params, abortRef.current.signal);
        setStatus("idle");
        return result;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
          setStatus("idle");
          throw e;
        }
        const message =
          e instanceof Error ? e.message : "Edit failed";
        setError(message);
        setStatus("error");
        throw e;
      }
    },
    []
  );

  const inpaint = useCallback(
    async (params: InpaintRequest): Promise<GenerateResponse> => {
      setStatus("inpainting");
      setError(null);
      abortRef.current = new AbortController();
      try {
        const result = await api.inpaintImage(
          params,
          abortRef.current.signal
        );
        setStatus("idle");
        return result;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
          setStatus("idle");
          throw e;
        }
        const message =
          e instanceof Error ? e.message : "Inpainting failed";
        setError(message);
        setStatus("error");
        throw e;
      }
    },
    []
  );

  const enhance = useCallback(
    async (
      prompt: string,
      style?: string
    ): Promise<EnhancePromptResponse> => {
      setStatus("enhancing_prompt");
      setError(null);
      abortRef.current = new AbortController();
      try {
        const result = await api.enhancePrompt(
          prompt,
          style,
          abortRef.current.signal
        );
        setStatus("idle");
        return result;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
          setStatus("idle");
          throw e;
        }
        const message =
          e instanceof Error ? e.message : "Prompt enhancement failed";
        setError(message);
        setStatus("error");
        throw e;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { status, error, generate, edit, inpaint, enhance, cancel, clearError };
}

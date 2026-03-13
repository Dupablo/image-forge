"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  saveImage,
  getImageAsObjectUrl,
  deleteImage,
} from "@/lib/image-db";

export function useImageStore() {
  const objectUrls = useRef<Map<string, string>>(new Map());

  const save = useCallback(
    async (blob: Blob, projectId: string): Promise<string> => {
      const id = crypto.randomUUID();
      await saveImage(id, blob, projectId);
      return id;
    },
    []
  );

  const load = useCallback(async (imageId: string): Promise<string | null> => {
    if (objectUrls.current.has(imageId)) {
      return objectUrls.current.get(imageId)!;
    }
    const url = await getImageAsObjectUrl(imageId);
    if (url) {
      objectUrls.current.set(imageId, url);
    }
    return url;
  }, []);

  const remove = useCallback(async (imageId: string): Promise<void> => {
    const url = objectUrls.current.get(imageId);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(imageId);
    }
    await deleteImage(imageId);
  }, []);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return { save, load, remove };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, Version, VersionTreeNode } from "@/lib/types";
import { getProject, saveProject } from "@/lib/storage";
import { useImageStore } from "./use-image-store";

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);
  const imageStore = useImageStore();

  useEffect(() => {
    const p = getProject(projectId);
    setProject(p);
    setLoaded(true);
  }, [projectId]);

  const activeVersion =
    project?.versions.find((v) => v.id === project.activeVersionId) ?? null;

  const persist = useCallback((updated: Project) => {
    saveProject(updated);
    setProject(updated);
  }, []);

  const selectVersion = useCallback(
    (versionId: string) => {
      if (!project) return;
      persist({
        ...project,
        activeVersionId: versionId,
        updatedAt: new Date().toISOString(),
      });
    },
    [project, persist]
  );

  const addVersion = useCallback(
    async (
      versionData: Omit<Version, "id" | "number" | "createdAt" | "childVersionIds">,
      imageBlob: Blob,
      thumbnailDataUrl: string
    ): Promise<Version> => {
      if (!project) throw new Error("No project loaded");
      const imageId = await imageStore.save(imageBlob, project.id);
      const version: Version = {
        ...versionData,
        id: crypto.randomUUID(),
        number: project.versions.length + 1,
        createdAt: new Date().toISOString(),
        imageId,
        thumbnailDataUrl,
        childVersionIds: [],
      };
      const updatedVersions = project.versions.map((v) =>
        v.id === version.parentVersionId
          ? { ...v, childVersionIds: [...v.childVersionIds, version.id] }
          : v
      );
      updatedVersions.push(version);
      persist({
        ...project,
        versions: updatedVersions,
        activeVersionId: version.id,
        updatedAt: new Date().toISOString(),
        thumbnailDataUrl,
      });
      return version;
    },
    [project, persist, imageStore]
  );

  const toggleStar = useCallback(
    (versionId: string) => {
      if (!project) return;
      const starred = project.starred.includes(versionId)
        ? project.starred.filter((id) => id !== versionId)
        : [...project.starred, versionId];
      persist({ ...project, starred, updatedAt: new Date().toISOString() });
    },
    [project, persist]
  );

  const renameProject = useCallback(
    (name: string) => {
      if (!project) return;
      persist({ ...project, name, updatedAt: new Date().toISOString() });
    },
    [project, persist]
  );

  const deleteVersion = useCallback(
    (versionId: string) => {
      if (!project) return;
      const version = project.versions.find((v) => v.id === versionId);
      if (!version) return;

      const updatedVersions = project.versions
        .filter((v) => v.id !== versionId)
        .map((v) => ({
          ...v,
          childVersionIds: v.childVersionIds.filter((id) => id !== versionId),
        }));

      let newActiveId = project.activeVersionId;
      if (newActiveId === versionId) {
        newActiveId =
          version.parentVersionId ||
          updatedVersions[updatedVersions.length - 1]?.id ||
          "";
      }

      persist({
        ...project,
        versions: updatedVersions,
        activeVersionId: newActiveId,
        starred: project.starred.filter((id) => id !== versionId),
        updatedAt: new Date().toISOString(),
      });
    },
    [project, persist]
  );

  const getVersionTree = useCallback((): VersionTreeNode[] => {
    if (!project) return [];
    const map = new Map<string, VersionTreeNode>();

    // Create nodes
    for (const v of project.versions) {
      map.set(v.id, { version: v, children: [], depth: 0 });
    }

    // Build tree
    const roots: VersionTreeNode[] = [];
    for (const v of project.versions) {
      const node = map.get(v.id)!;
      if (v.parentVersionId && map.has(v.parentVersionId)) {
        const parent = map.get(v.parentVersionId)!;
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }, [project]);

  const loadVersionImage = useCallback(
    async (versionId: string): Promise<string | null> => {
      const version = project?.versions.find((v) => v.id === versionId);
      if (!version) return null;
      return imageStore.load(version.imageId);
    },
    [project, imageStore]
  );

  return {
    project,
    loaded,
    activeVersion,
    selectVersion,
    addVersion,
    toggleStar,
    renameProject,
    deleteVersion,
    getVersionTree,
    loadVersionImage,
    imageStore,
  };
}

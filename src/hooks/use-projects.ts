"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/types";
import {
  loadProjects,
  saveProject,
  deleteProjectFromStorage,
} from "@/lib/storage";
import { deleteProjectImages } from "@/lib/image-db";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setLoaded(true);
  }, []);

  const createProject = useCallback((name: string): Project => {
    const rootVersionId = crypto.randomUUID();
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rootVersionId,
      activeVersionId: "",
      versions: [],
      starred: [],
    };
    saveProject(project);
    setProjects((prev) => [...prev, project]);
    return project;
  }, []);

  const remove = useCallback(async (id: string) => {
    deleteProjectFromStorage(id);
    await deleteProjectImages(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const update = useCallback((project: Project) => {
    saveProject(project);
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? project : p))
    );
  }, []);

  return {
    projects,
    loaded,
    createProject,
    deleteProject: remove,
    updateProject: update,
  };
}

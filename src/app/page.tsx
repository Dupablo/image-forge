"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { ProjectGallery } from "@/components/gallery/project-gallery";
import { NewProjectDialog } from "@/components/gallery/new-project-dialog";
import { useProjects } from "@/hooks/use-projects";

export default function HomePage() {
  const router = useRouter();
  const { projects, loaded, createProject, deleteProject } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = (name: string) => {
    const project = createProject(name);
    router.push(`/project/${project.id}`);
  };

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your image generation projects
          </p>
        </div>
        <ProjectGallery
          projects={projects}
          onCreateProject={() => setDialogOpen(true)}
          onOpenProject={(id) => router.push(`/project/${id}`)}
          onDeleteProject={deleteProject}
        />
      </main>
      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateProject={handleCreate}
      />
    </div>
  );
}

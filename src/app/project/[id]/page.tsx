"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Download, GitCompare, Paintbrush } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { VersionSidebar } from "@/components/sidebar/version-sidebar";
import { ImageCanvas } from "@/components/canvas/image-canvas";
import { ImagePlaceholder } from "@/components/canvas/image-placeholder";
import { MaskCanvas } from "@/components/canvas/mask-canvas";
import { LoadingOverlay } from "@/components/shared/loading-overlay";
import { ErrorBanner } from "@/components/shared/error-banner";
import { PromptInput } from "@/components/controls/prompt-input";
import { StylePresets } from "@/components/controls/style-presets";
import { SettingsPanel } from "@/components/controls/settings-panel";
import { ProviderSelector } from "@/components/controls/provider-selector";
import { RealismToggle } from "@/components/controls/realism-toggle";
import { NegativePrompt } from "@/components/controls/negative-prompt";
import { EditInstruction } from "@/components/controls/edit-instruction";
import { QuickEditChips } from "@/components/controls/quick-edit-chips";
import { LockElements } from "@/components/controls/lock-elements";
import { VariationCount } from "@/components/controls/variation-count";
import { DownloadDialog } from "@/components/dialogs/download-dialog";
import { CompareDialog } from "@/components/dialogs/compare-dialog";
import { useProject } from "@/hooks/use-project";
import { useGeneration } from "@/hooks/use-generation";
import { DEFAULT_PARAMS, STYLE_PRESETS } from "@/lib/constants";
import { base64ToBlob, blobToBase64, createThumbnail } from "@/lib/utils";
import { getImage } from "@/lib/image-db";
import type { GenerationParams, ProviderInfo } from "@/lib/types";
import * as api from "@/lib/api-client";

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const {
    project,
    loaded,
    activeVersion,
    selectVersion,
    addVersion,
    getVersionTree,
    loadVersionImage,
  } = useProject(projectId);

  const { status, error, generate, edit, inpaint, enhance, cancel, clearError } =
    useGeneration();

  // Form state
  const [prompt, setPrompt] = useState("");
  const [editInstr, setEditInstr] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | undefined>();
  const [genParams, setGenParams] = useState<GenerationParams>({
    ...DEFAULT_PARAMS,
  });

  // UI state
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [maskMode, setMaskMode] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);

  // Load providers on mount
  useEffect(() => {
    api.getProviders().then((res) => {
      setProviders(res.providers);
      if (res.defaultProvider) {
        setGenParams((p) => ({ ...p, provider: res.defaultProvider }));
      }
    }).catch(() => {
      // Providers API not available, use defaults
      setProviders([
        {
          name: "openai",
          displayName: "OpenAI",
          configured: false,
          capabilities: {
            name: "openai",
            displayName: "OpenAI",
            models: [],
            supportsTextToImage: true,
            supportsImageToImage: true,
            supportsInpainting: true,
            supportsUpscale: false,
            supportsNegativePrompt: false,
            supportsGuidanceScale: false,
            supportsSeed: false,
            supportsVariations: true,
            maxVariations: 4,
            supportedAspectRatios: ["1:1", "16:9", "9:16"],
            maxResolution: { width: 1536, height: 1536 },
          },
        },
      ]);
    });
  }, []);

  // Load active version image
  useEffect(() => {
    if (activeVersion) {
      loadVersionImage(activeVersion.id).then(setActiveImageUrl);
    } else {
      setActiveImageUrl(null);
    }
  }, [activeVersion, loadVersionImage]);

  const handleParamsChange = useCallback(
    (partial: Partial<GenerationParams>) => {
      setGenParams((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const getCurrentStyle = useCallback(() => {
    return STYLE_PRESETS.find((s) => s.id === genParams.style);
  }, [genParams.style]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !project) return;
    try {
      const result = await generate({
        prompt: enhancedPrompt || prompt,
        negativePrompt: genParams.negativePrompt,
        width: genParams.width,
        height: genParams.height,
        guidanceScale: genParams.guidanceScale,
        numInferenceSteps: genParams.numInferenceSteps,
        seed: genParams.seed,
        style: genParams.style,
        realismBoost: genParams.realismBoost,
        numVariations: genParams.numVariations,
        provider: genParams.provider,
        model: genParams.model,
      });

      if (result.images.length > 0) {
        const img = result.images[0];
        const blob = base64ToBlob(img.base64);
        const thumbnail = await createThumbnail(blob);

        await addVersion(
          {
            prompt,
            enhancedPrompt,
            finalPrompt: result.finalPrompt,
            params: { ...genParams },
            parentVersionId: activeVersion?.id || null,
            provider: result.provider,
            model: result.model,
            revisedPrompt: img.revisedPrompt,
            seed: result.seed,
            durationMs: result.durationMs,
            finalNegativePrompt: result.finalNegativePrompt,
            imageId: "", // Will be set by addVersion
          },
          blob,
          thumbnail
        );
        setEnhancedPrompt(undefined);
      }
    } catch {
      // Error is handled by useGeneration
    }
  }, [
    prompt,
    enhancedPrompt,
    genParams,
    project,
    activeVersion,
    generate,
    addVersion,
  ]);

  const handleEdit = useCallback(
    async (instruction: string) => {
      if (!activeVersion || !project) return;
      try {
        const blob = await getImage(activeVersion.imageId);
        if (!blob) return;
        const sourceBase64 = await blobToBase64(blob);

        const result = await edit({
          sourceImageBase64: sourceBase64,
          instruction,
          prompt: activeVersion.prompt,
          negativePrompt: genParams.negativePrompt,
          width: genParams.width,
          height: genParams.height,
          strength: genParams.strength,
          lockElements: genParams.lockElements,
          style: genParams.style,
          realismBoost: genParams.realismBoost,
          provider: genParams.provider,
          model: genParams.model,
        });

        if (result.images.length > 0) {
          const img = result.images[0];
          const newBlob = base64ToBlob(img.base64);
          const thumbnail = await createThumbnail(newBlob);

          await addVersion(
            {
              prompt: activeVersion.prompt,
              editInstruction: instruction,
              finalPrompt: result.finalPrompt,
              params: { ...genParams },
              parentVersionId: activeVersion.id,
              provider: result.provider,
              model: result.model,
              revisedPrompt: img.revisedPrompt,
              seed: result.seed,
              durationMs: result.durationMs,
              finalNegativePrompt: result.finalNegativePrompt,
              imageId: "",
            },
            newBlob,
            thumbnail
          );
          setEditInstr("");
        }
      } catch {
        // Error handled by useGeneration
      }
    },
    [activeVersion, project, genParams, edit, addVersion]
  );

  const handleInpaint = useCallback(
    async (maskBase64: string) => {
      if (!activeVersion || !project) return;
      setMaskMode(false);
      try {
        const blob = await getImage(activeVersion.imageId);
        if (!blob) return;
        const sourceBase64 = await blobToBase64(blob);

        // Strip data URL prefix from mask
        const cleanMask = maskBase64.replace(/^data:image\/\w+;base64,/, "");

        const result = await inpaint({
          sourceImageBase64: sourceBase64,
          maskBase64: cleanMask,
          prompt: prompt || activeVersion.prompt,
          negativePrompt: genParams.negativePrompt,
          width: genParams.width,
          height: genParams.height,
          style: genParams.style,
          realismBoost: genParams.realismBoost,
          provider: genParams.provider,
          model: genParams.model,
        });

        if (result.images.length > 0) {
          const img = result.images[0];
          const newBlob = base64ToBlob(img.base64);
          const thumbnail = await createThumbnail(newBlob);

          await addVersion(
            {
              prompt: prompt || activeVersion.prompt,
              editInstruction: "Inpaint masked area",
              finalPrompt: result.finalPrompt,
              params: { ...genParams },
              parentVersionId: activeVersion.id,
              provider: result.provider,
              model: result.model,
              durationMs: result.durationMs,
              finalNegativePrompt: result.finalNegativePrompt,
              imageId: "",
            },
            newBlob,
            thumbnail
          );
        }
      } catch {
        // Error handled by useGeneration
      }
    },
    [activeVersion, project, prompt, genParams, inpaint, addVersion]
  );

  const handleEnhance = useCallback(async () => {
    if (!prompt.trim()) return;
    try {
      const result = await enhance(prompt, genParams.style);
      setEnhancedPrompt(result.enhancedPrompt);
    } catch {
      // Error handled by useGeneration
    }
  }, [prompt, genParams.style, enhance]);

  const isWorking = status !== "idle" && status !== "error";
  const currentProvider = providers.find((p) => p.name === genParams.provider);
  const maxVariations = currentProvider?.capabilities.maxVariations || 4;

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">Project not found</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Back to projects
        </button>
      </div>
    );
  }

  const versionTree = getVersionTree();

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader projectName={project.name} onBack={() => router.push("/")} />
      <WorkspaceLayout
        sidebar={
          <VersionSidebar
            project={project}
            activeVersionId={project.activeVersionId}
            tree={versionTree}
            onSelectVersion={selectVersion}
          />
        }
        canvas={
          <div className="relative h-full">
            {activeVersion && activeImageUrl ? (
              <>
                <ImageCanvas
                  imageUrl={activeImageUrl}
                  isLoading={isWorking}
                />
                {/* Action buttons */}
                <div className="absolute top-2 right-2 z-20 flex gap-1">
                  {project.versions.length >= 2 && (
                    <button
                      onClick={() => setCompareOpen(true)}
                      className="rounded-md border bg-background/90 backdrop-blur-sm p-1.5 shadow-sm hover:bg-accent transition-colors"
                      title="Compare versions"
                    >
                      <GitCompare className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setMaskMode(true)}
                    className="rounded-md border bg-background/90 backdrop-blur-sm p-1.5 shadow-sm hover:bg-accent transition-colors"
                    title="Inpaint (mask mode)"
                  >
                    <Paintbrush className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDownloadOpen(true)}
                    className="rounded-md border bg-background/90 backdrop-blur-sm p-1.5 shadow-sm hover:bg-accent transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                {/* Mask canvas overlay */}
                {maskMode && (
                  <MaskCanvas
                    imageUrl={activeImageUrl}
                    imageWidth={activeVersion.params.width}
                    imageHeight={activeVersion.params.height}
                    onDone={handleInpaint}
                    onCancel={() => setMaskMode(false)}
                  />
                )}
              </>
            ) : (
              <ImagePlaceholder onSamplePrompt={setPrompt} />
            )}
            <LoadingOverlay status={status} onCancel={cancel} />
            <ErrorBanner error={error} onDismiss={clearError} />
          </div>
        }
        controls={
          <div className="space-y-4 p-4">
            {providers.length > 0 && (
              <ProviderSelector
                providers={providers}
                selectedProvider={genParams.provider}
                onSelectProvider={(p) => handleParamsChange({ provider: p })}
              />
            )}

            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onGenerate={handleGenerate}
              onEnhance={handleEnhance}
              enhancedPrompt={enhancedPrompt}
              status={status}
            />

            <StylePresets
              selectedStyle={genParams.style}
              onSelectStyle={(s) => handleParamsChange({ style: s })}
            />

            <RealismToggle
              enabled={genParams.realismBoost}
              onToggle={(v) => handleParamsChange({ realismBoost: v })}
            />

            <VariationCount
              count={genParams.numVariations}
              onChange={(n) => handleParamsChange({ numVariations: n })}
              max={maxVariations}
            />

            <SettingsPanel
              params={genParams}
              onParamsChange={handleParamsChange}
              showStrength={!!activeVersion}
            />

            <NegativePrompt
              value={genParams.negativePrompt}
              onChange={(v) => handleParamsChange({ negativePrompt: v })}
              autoFilled={getCurrentStyle()?.negativePrompt}
            />

            {activeVersion && (
              <>
                <div className="border-t pt-4">
                  <EditInstruction
                    value={editInstr}
                    onChange={setEditInstr}
                    onSubmit={() => handleEdit(editInstr)}
                    isEditing={status === "editing"}
                    disabled={isWorking}
                  />
                </div>

                <QuickEditChips
                  onApplyEdit={handleEdit}
                  disabled={isWorking}
                />

                <LockElements
                  selected={genParams.lockElements}
                  onChange={(e) => handleParamsChange({ lockElements: e })}
                />
              </>
            )}
          </div>
        }
      />

      {/* Dialogs */}
      <DownloadDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        imageUrl={activeImageUrl}
        versionNumber={activeVersion?.number || 0}
      />
      <CompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        versions={project.versions}
        loadImage={loadVersionImage}
      />
    </div>
  );
}

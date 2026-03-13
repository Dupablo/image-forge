// === Core Data Model ===

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnailDataUrl?: string;
  rootVersionId: string;
  activeVersionId: string;
  versions: Version[];
  starred: string[];
}

export interface Version {
  id: string;
  parentVersionId: string | null;
  number: number;
  createdAt: string;
  label?: string;

  // Generation inputs
  prompt: string;
  enhancedPrompt?: string;
  finalPrompt?: string;
  editInstruction?: string;
  params: GenerationParams;

  // Image references (IndexedDB keys)
  imageId: string;
  thumbnailDataUrl?: string;
  maskImageId?: string;
  referenceImageId?: string;

  // Provider metadata
  provider: string;
  model: string;
  revisedPrompt?: string;
  seed?: number;
  durationMs: number;
  finalNegativePrompt?: string;

  // Tree structure
  childVersionIds: string[];
  isFavorite?: boolean;
}

export interface GenerationParams {
  width: number;
  height: number;
  aspectRatio: string;
  guidanceScale: number;
  numInferenceSteps: number;
  seed: number;
  style: string;
  realismBoost: boolean;
  promptEnhancement: boolean;
  negativePrompt: string;
  strength: number;
  lockElements: LockElement[];
  numVariations: number;
  provider: string;
  model?: string;
}

export type LockElement =
  | "face"
  | "pose"
  | "outfit"
  | "background"
  | "composition"
  | "colors"
  | "style";

export type WorkspaceStatus =
  | "idle"
  | "generating"
  | "editing"
  | "inpainting"
  | "upscaling"
  | "enhancing_prompt"
  | "error";

export type GenerationMode =
  | "text-to-image"
  | "image-to-image"
  | "inpaint"
  | "variations";

// === Style System ===

export interface StylePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptPrefix: string;
  promptSuffix: string;
  negativePrompt: string;
  defaultGuidance: number;
  defaultSteps: number;
}

export interface QuickEdit {
  id: string;
  label: string;
  instruction: string;
  icon: string;
}

export interface AspectRatioOption {
  label: string;
  value: string;
  width: number;
  height: number;
}

// === API Types ===

export interface GenerateRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
  seed?: number;
  style?: string;
  realismBoost?: boolean;
  numVariations?: number;
  provider: string;
  model?: string;
}

export interface EditRequest {
  sourceImageBase64: string;
  instruction: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  strength?: number;
  lockElements?: LockElement[];
  style?: string;
  realismBoost?: boolean;
  provider: string;
  model?: string;
}

export interface InpaintRequest {
  sourceImageBase64: string;
  maskBase64: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  style?: string;
  realismBoost?: boolean;
  provider: string;
  model?: string;
}

export interface GenerateResponse {
  images: Array<{
    base64: string;
    width: number;
    height: number;
    revisedPrompt?: string;
  }>;
  provider: string;
  model: string;
  seed?: number;
  durationMs: number;
  finalPrompt: string;
  finalNegativePrompt: string;
}

export interface EnhancePromptRequest {
  prompt: string;
  style?: string;
}

export interface EnhancePromptResponse {
  enhancedPrompt: string;
  method: "llm" | "rules";
}

export interface ProviderInfo {
  name: string;
  displayName: string;
  configured: boolean;
  capabilities: ProviderCapabilities;
}

export interface ProviderCapabilities {
  name: string;
  displayName: string;
  models: ModelInfo[];
  supportsTextToImage: boolean;
  supportsImageToImage: boolean;
  supportsInpainting: boolean;
  supportsUpscale: boolean;
  supportsNegativePrompt: boolean;
  supportsGuidanceScale: boolean;
  supportsSeed: boolean;
  supportsVariations: boolean;
  maxVariations: number;
  supportedAspectRatios: string[];
  maxResolution: { width: number; height: number };
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

// === Version Tree ===

export interface VersionTreeNode {
  version: Version;
  children: VersionTreeNode[];
  depth: number;
}

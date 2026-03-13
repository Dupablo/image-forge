export interface ImageProvider {
  readonly name: string;
  generateImage(params: ProviderGenerateParams): Promise<ProviderResult>;
  editImage(params: ProviderEditParams): Promise<ProviderResult>;
  inpaint(params: ProviderInpaintParams): Promise<ProviderResult>;
  upscale(params: ProviderUpscaleParams): Promise<ProviderResult>;
  getCapabilities(): ProviderCapabilities;
  isConfigured(): boolean;
}

export interface ProviderGenerateParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
  seed?: number;
  numVariations?: number;
  model?: string;
}

export interface ProviderEditParams extends ProviderGenerateParams {
  sourceImage: Buffer;
  instruction?: string;
  strength?: number;
}

export interface ProviderInpaintParams extends ProviderEditParams {
  mask: Buffer;
}

export interface ProviderUpscaleParams {
  sourceImage: Buffer;
  scaleFactor: 2 | 4;
  model?: string;
}

export interface ProviderResult {
  images: ProviderImage[];
  provider: string;
  model: string;
  seed?: number;
  durationMs: number;
}

export interface ProviderImage {
  data: Buffer;
  mimeType: string;
  width: number;
  height: number;
  revisedPrompt?: string;
}

export interface ProviderCapabilities {
  name: string;
  displayName: string;
  models: Array<{
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
  }>;
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

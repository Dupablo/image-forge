import type {
  ImageProvider,
  ProviderGenerateParams,
  ProviderEditParams,
  ProviderInpaintParams,
  ProviderUpscaleParams,
  ProviderResult,
  ProviderCapabilities,
} from "./types";

const MODEL_MAP: Record<string, string> = {
  "sd3.5-large": "sd3.5-large",
  "sd3.5-medium": "sd3.5-medium",
};

function aspectRatioFromDimensions(width: number, height: number): string {
  const ratio = width / height;
  // Map to closest supported aspect ratio
  if (Math.abs(ratio - 1) < 0.1) return "1:1";
  if (Math.abs(ratio - 16 / 9) < 0.1) return "16:9";
  if (Math.abs(ratio - 9 / 16) < 0.1) return "9:16";
  if (Math.abs(ratio - 4 / 3) < 0.1) return "4:3";
  if (Math.abs(ratio - 3 / 2) < 0.1) return "3:2";
  if (Math.abs(ratio - 3 / 4) < 0.1) return "3:4";
  if (Math.abs(ratio - 5 / 4) < 0.1) return "5:4";
  if (Math.abs(ratio - 4 / 5) < 0.1) return "4:5";
  if (Math.abs(ratio - 21 / 9) < 0.15) return "21:9";
  if (Math.abs(ratio - 9 / 21) < 0.15) return "9:21";
  return "1:1";
}

export class StabilityProvider implements ImageProvider {
  readonly name = "stability";

  constructor(private apiKey: string) {}

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      name: "stability",
      displayName: "Stability AI",
      models: [
        {
          id: "sd3.5-large",
          name: "SD 3.5 Large",
          description: "Best quality",
          isDefault: true,
        },
        {
          id: "sd3.5-medium",
          name: "SD 3.5 Medium",
          description: "Balanced",
          isDefault: false,
        },
      ],
      supportsTextToImage: true,
      supportsImageToImage: true,
      supportsInpainting: true,
      supportsUpscale: true,
      supportsNegativePrompt: true,
      supportsGuidanceScale: true,
      supportsSeed: true,
      supportsVariations: false,
      maxVariations: 1,
      supportedAspectRatios: [
        "1:1",
        "16:9",
        "9:16",
        "4:3",
        "3:2",
        "3:4",
        "5:4",
        "4:5",
        "21:9",
        "9:21",
      ],
      maxResolution: { width: 2048, height: 2048 },
    };
  }

  async generateImage(params: ProviderGenerateParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const modelId = params.model || "sd3.5-large";
    const sdModel = MODEL_MAP[modelId] || modelId;
    const aspectRatio = aspectRatioFromDimensions(params.width, params.height);

    const formData = new FormData();
    formData.append("prompt", params.prompt);
    formData.append("model", sdModel);
    formData.append("aspect_ratio", aspectRatio);
    formData.append("output_format", "png");

    if (params.negativePrompt) {
      formData.append("negative_prompt", params.negativePrompt);
    }
    if (params.guidanceScale !== undefined) {
      formData.append("cfg_scale", String(params.guidanceScale));
    }
    if (params.numInferenceSteps !== undefined) {
      formData.append("steps", String(params.numInferenceSteps));
    }
    if (params.seed !== undefined && params.seed >= 0) {
      formData.append("seed", String(params.seed));
    }

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as Record<string, string>).message ||
        `Stability API error: ${response.status}`;
      throw new Error(message);
    }

    const data = (await response.json()) as {
      image: string;
      seed?: number;
      finish_reason?: string;
    };

    const buffer = Buffer.from(data.image, "base64");

    return {
      images: [
        {
          data: buffer,
          mimeType: "image/png",
          width: params.width,
          height: params.height,
        },
      ],
      provider: "stability",
      model: modelId,
      seed: data.seed ?? params.seed,
      durationMs: Date.now() - startTime,
    };
  }

  async editImage(params: ProviderEditParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const modelId = params.model || "sd3.5-large";
    const sdModel = MODEL_MAP[modelId] || modelId;

    let prompt = params.prompt;
    if (params.instruction) {
      prompt = `${params.instruction}. ${prompt}`;
    }

    const formData = new FormData();
    const imageBlob = new Blob([new Uint8Array(params.sourceImage)], { type: "image/png" });
    formData.append("image", imageBlob, "image.png");
    formData.append("prompt", prompt);
    formData.append("model", sdModel);
    formData.append("mode", "image-to-image");
    formData.append("output_format", "png");
    formData.append("strength", String(params.strength ?? 0.75));

    if (params.negativePrompt) {
      formData.append("negative_prompt", params.negativePrompt);
    }
    if (params.guidanceScale !== undefined) {
      formData.append("cfg_scale", String(params.guidanceScale));
    }
    if (params.seed !== undefined && params.seed >= 0) {
      formData.append("seed", String(params.seed));
    }

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as Record<string, string>).message ||
        `Stability API error: ${response.status}`;
      throw new Error(message);
    }

    const data = (await response.json()) as {
      image: string;
      seed?: number;
    };

    const buffer = Buffer.from(data.image, "base64");

    return {
      images: [
        {
          data: buffer,
          mimeType: "image/png",
          width: params.width,
          height: params.height,
        },
      ],
      provider: "stability",
      model: modelId,
      seed: data.seed ?? params.seed,
      durationMs: Date.now() - startTime,
    };
  }

  async inpaint(params: ProviderInpaintParams): Promise<ProviderResult> {
    const startTime = Date.now();

    let prompt = params.prompt;
    if (params.instruction) {
      prompt = `${params.instruction}. ${prompt}`;
    }

    const formData = new FormData();
    const imageBlob = new Blob([new Uint8Array(params.sourceImage)], { type: "image/png" });
    const maskBlob = new Blob([new Uint8Array(params.mask)], { type: "image/png" });
    formData.append("image", imageBlob, "image.png");
    formData.append("mask", maskBlob, "mask.png");
    formData.append("prompt", prompt);
    formData.append("output_format", "png");

    if (params.negativePrompt) {
      formData.append("negative_prompt", params.negativePrompt);
    }
    if (params.seed !== undefined && params.seed >= 0) {
      formData.append("seed", String(params.seed));
    }

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/edit/inpaint",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as Record<string, string>).message ||
        `Stability API error: ${response.status}`;
      throw new Error(message);
    }

    const data = (await response.json()) as {
      image: string;
      seed?: number;
    };

    const buffer = Buffer.from(data.image, "base64");

    return {
      images: [
        {
          data: buffer,
          mimeType: "image/png",
          width: params.width,
          height: params.height,
        },
      ],
      provider: "stability",
      model: params.model || "sd3.5-large",
      seed: data.seed ?? params.seed,
      durationMs: Date.now() - startTime,
    };
  }

  async upscale(params: ProviderUpscaleParams): Promise<ProviderResult> {
    const startTime = Date.now();

    const formData = new FormData();
    const imageBlob = new Blob([new Uint8Array(params.sourceImage)], { type: "image/png" });
    formData.append("image", imageBlob, "image.png");
    formData.append("output_format", "png");

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/upscale/conservative",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as Record<string, string>).message ||
        `Stability API error: ${response.status}`;
      throw new Error(message);
    }

    const data = (await response.json()) as {
      image: string;
      seed?: number;
    };

    const buffer = Buffer.from(data.image, "base64");

    return {
      images: [
        {
          data: buffer,
          mimeType: "image/png",
          width: 0, // Actual dimensions depend on upscale factor
          height: 0,
        },
      ],
      provider: "stability",
      model: "stable-image-upscale-conservative",
      durationMs: Date.now() - startTime,
    };
  }
}

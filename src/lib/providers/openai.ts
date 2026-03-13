import type {
  ImageProvider,
  ProviderGenerateParams,
  ProviderEditParams,
  ProviderInpaintParams,
  ProviderUpscaleParams,
  ProviderResult,
  ProviderCapabilities,
} from "./types";

export class OpenAIProvider implements ImageProvider {
  readonly name = "openai";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      name: "openai",
      displayName: "OpenAI",
      models: [
        {
          id: "gpt-image-1",
          name: "GPT Image 1",
          description: "Latest OpenAI image model with high quality output",
          isDefault: true,
        },
        {
          id: "dall-e-3",
          name: "DALL-E 3",
          description: "Previous generation, good prompt adherence",
          isDefault: false,
        },
      ],
      supportsTextToImage: true,
      supportsImageToImage: true,
      supportsInpainting: true,
      supportsUpscale: false,
      supportsNegativePrompt: false,
      supportsGuidanceScale: false,
      supportsSeed: false,
      supportsVariations: true,
      maxVariations: 4,
      supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"],
      maxResolution: { width: 1536, height: 1536 },
    };
  }

  private mapSize(width: number, height: number): string {
    // Map to closest supported size
    if (Math.abs(width - height) < 100) return "1024x1024";
    if (width > height) return "1536x1024";
    return "1024x1536";
  }

  async generateImage(params: ProviderGenerateParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const model = params.model || "gpt-image-1";
    const size = this.mapSize(params.width, params.height);

    const body: Record<string, unknown> = {
      model,
      prompt: params.prompt,
      n: params.numVariations || 1,
      size,
      quality: "high",
    };

    // gpt-image-1 returns b64_json by default
    if (model === "gpt-image-1") {
      body.output_format = "png";
    } else {
      body.response_format = "b64_json";
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        err?.error?.message || `OpenAI API error: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const images = data.data.map(
      (item: { b64_json: string; revised_prompt?: string }) => {
        const buffer = Buffer.from(item.b64_json, "base64");
        // Parse size from the size string
        const [w, h] = size.split("x").map(Number);
        return {
          data: buffer,
          mimeType: "image/png",
          width: w,
          height: h,
          revisedPrompt: item.revised_prompt,
        };
      }
    );

    return {
      images,
      provider: "openai",
      model,
      durationMs: Date.now() - startTime,
    };
  }

  async editImage(params: ProviderEditParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const model = params.model || "gpt-image-1";

    // Build the edit prompt
    let prompt = params.prompt;
    if (params.instruction) {
      prompt = `${params.instruction}. ${prompt}`;
    }

    // Use FormData for the edits endpoint
    const formData = new FormData();
    const imageBlob = new Blob([new Uint8Array(params.sourceImage)], { type: "image/png" });
    formData.append("image", imageBlob, "image.png");
    formData.append("prompt", prompt);
    formData.append("model", model);
    formData.append("n", String(params.numVariations || 1));
    formData.append("size", this.mapSize(params.width, params.height));

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        err?.error?.message || `OpenAI API error: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const size = this.mapSize(params.width, params.height);
    const [w, h] = size.split("x").map(Number);
    const images = data.data.map(
      (item: { b64_json: string; revised_prompt?: string }) => ({
        data: Buffer.from(item.b64_json, "base64"),
        mimeType: "image/png",
        width: w,
        height: h,
        revisedPrompt: item.revised_prompt,
      })
    );

    return {
      images,
      provider: "openai",
      model,
      durationMs: Date.now() - startTime,
    };
  }

  async inpaint(params: ProviderInpaintParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const model = params.model || "gpt-image-1";

    const formData = new FormData();
    const imageBlob = new Blob([new Uint8Array(params.sourceImage)], { type: "image/png" });
    const maskBlob = new Blob([new Uint8Array(params.mask)], { type: "image/png" });
    formData.append("image", imageBlob, "image.png");
    formData.append("mask", maskBlob, "mask.png");
    formData.append("prompt", params.prompt);
    formData.append("model", model);
    formData.append("n", String(params.numVariations || 1));
    formData.append("size", this.mapSize(params.width, params.height));

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        err?.error?.message || `OpenAI API error: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const size = this.mapSize(params.width, params.height);
    const [w, h] = size.split("x").map(Number);
    const images = data.data.map(
      (item: { b64_json: string; revised_prompt?: string }) => ({
        data: Buffer.from(item.b64_json, "base64"),
        mimeType: "image/png",
        width: w,
        height: h,
        revisedPrompt: item.revised_prompt,
      })
    );

    return {
      images,
      provider: "openai",
      model,
      durationMs: Date.now() - startTime,
    };
  }

  async upscale(_params: ProviderUpscaleParams): Promise<ProviderResult> {
    throw new Error("OpenAI does not support image upscaling");
  }
}

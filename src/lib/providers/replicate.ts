import type {
  ImageProvider,
  ProviderGenerateParams,
  ProviderEditParams,
  ProviderInpaintParams,
  ProviderUpscaleParams,
  ProviderResult,
  ProviderImage,
  ProviderCapabilities,
} from "./types";

const MODEL_MAP: Record<string, string> = {
  "flux-1.1-pro": "black-forest-labs/flux-1.1-pro",
  "flux-schnell": "black-forest-labs/flux-schnell",
};

const UPSCALE_MODEL = "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa";

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_DURATION_MS = 120_000;

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | string[] | null;
  error: string | null;
  metrics?: { predict_time?: number };
}

export class ReplicateProvider implements ImageProvider {
  readonly name = "replicate";

  constructor(private apiToken: string) {}

  isConfigured(): boolean {
    return !!this.apiToken;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      name: "replicate",
      displayName: "Replicate",
      models: [
        {
          id: "flux-1.1-pro",
          name: "FLUX 1.1 Pro",
          description: "Highest quality",
          isDefault: true,
        },
        {
          id: "flux-schnell",
          name: "FLUX Schnell",
          description: "Fast generation",
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
      supportsVariations: true,
      maxVariations: 4,
      supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:2"],
      maxResolution: { width: 1536, height: 1536 },
    };
  }

  async generateImage(params: ProviderGenerateParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const modelId = params.model || "flux-1.1-pro";
    const replicateModel = this.mapModelToVersion(modelId);

    const input: Record<string, unknown> = {
      prompt: params.prompt,
      width: params.width,
      height: params.height,
      num_outputs: params.numVariations || 1,
    };

    if (params.negativePrompt) {
      input.negative_prompt = params.negativePrompt;
    }
    if (params.guidanceScale !== undefined) {
      input.guidance_scale = params.guidanceScale;
    }
    if (params.numInferenceSteps !== undefined) {
      input.num_inference_steps = params.numInferenceSteps;
    }
    if (params.seed !== undefined && params.seed >= 0) {
      input.seed = params.seed;
    }

    const prediction = await this.createPrediction(replicateModel, input);
    const completed = await this.pollPrediction(prediction.id);

    const outputUrls = Array.isArray(completed.output)
      ? completed.output
      : completed.output
        ? [completed.output]
        : [];

    const images = await this.fetchOutputImages(
      outputUrls,
      params.width,
      params.height
    );

    return {
      images,
      provider: "replicate",
      model: modelId,
      seed: params.seed,
      durationMs: Date.now() - startTime,
    };
  }

  async editImage(params: ProviderEditParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const modelId = params.model || "flux-1.1-pro";
    const replicateModel = this.mapModelToVersion(modelId);

    const imageDataUri = `data:image/png;base64,${params.sourceImage.toString("base64")}`;

    let prompt = params.prompt;
    if (params.instruction) {
      prompt = `${params.instruction}. ${prompt}`;
    }

    const input: Record<string, unknown> = {
      prompt,
      image: imageDataUri,
      width: params.width,
      height: params.height,
      prompt_strength: params.strength ?? 0.8,
      num_outputs: params.numVariations || 1,
    };

    if (params.negativePrompt) {
      input.negative_prompt = params.negativePrompt;
    }
    if (params.guidanceScale !== undefined) {
      input.guidance_scale = params.guidanceScale;
    }
    if (params.seed !== undefined && params.seed >= 0) {
      input.seed = params.seed;
    }

    const prediction = await this.createPrediction(replicateModel, input);
    const completed = await this.pollPrediction(prediction.id);

    const outputUrls = Array.isArray(completed.output)
      ? completed.output
      : completed.output
        ? [completed.output]
        : [];

    const images = await this.fetchOutputImages(
      outputUrls,
      params.width,
      params.height
    );

    return {
      images,
      provider: "replicate",
      model: modelId,
      seed: params.seed,
      durationMs: Date.now() - startTime,
    };
  }

  async inpaint(params: ProviderInpaintParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const modelId = params.model || "flux-1.1-pro";
    const replicateModel = this.mapModelToVersion(modelId);

    const imageDataUri = `data:image/png;base64,${params.sourceImage.toString("base64")}`;
    const maskDataUri = `data:image/png;base64,${params.mask.toString("base64")}`;

    const input: Record<string, unknown> = {
      prompt: params.prompt,
      image: imageDataUri,
      mask: maskDataUri,
      width: params.width,
      height: params.height,
      num_outputs: params.numVariations || 1,
    };

    if (params.negativePrompt) {
      input.negative_prompt = params.negativePrompt;
    }
    if (params.guidanceScale !== undefined) {
      input.guidance_scale = params.guidanceScale;
    }
    if (params.seed !== undefined && params.seed >= 0) {
      input.seed = params.seed;
    }

    const prediction = await this.createPrediction(replicateModel, input);
    const completed = await this.pollPrediction(prediction.id);

    const outputUrls = Array.isArray(completed.output)
      ? completed.output
      : completed.output
        ? [completed.output]
        : [];

    const images = await this.fetchOutputImages(
      outputUrls,
      params.width,
      params.height
    );

    return {
      images,
      provider: "replicate",
      model: modelId,
      seed: params.seed,
      durationMs: Date.now() - startTime,
    };
  }

  async upscale(params: ProviderUpscaleParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const imageDataUri = `data:image/png;base64,${params.sourceImage.toString("base64")}`;

    const [owner, rest] = UPSCALE_MODEL.split("/");
    const [modelName, version] = rest.split(":");

    const input: Record<string, unknown> = {
      image: imageDataUri,
      scale: params.scaleFactor,
      face_enhance: true,
    };

    const response = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({ version, input }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        (err as Record<string, string>).detail ||
          `Replicate API error: ${response.status}`
      );
    }

    let prediction = (await response.json()) as ReplicatePrediction;

    // If the prediction didn't complete synchronously, poll for it
    if (prediction.status !== "succeeded") {
      prediction = await this.pollPrediction(prediction.id);
    }

    const outputUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;

    if (!outputUrl) {
      throw new Error("Replicate upscale returned no output");
    }

    const imgResponse = await fetch(outputUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch upscaled image: ${imgResponse.status}`);
    }
    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = imgResponse.headers.get("content-type") || "image/png";

    return {
      images: [
        {
          data: buffer,
          mimeType: contentType,
          width: 0, // Actual dimensions depend on input; caller can inspect
          height: 0,
        },
      ],
      provider: "replicate",
      model: `${owner}/${modelName}`,
      durationMs: Date.now() - startTime,
    };
  }

  // ---- Private helpers ----

  private mapModelToVersion(modelId: string): string {
    const mapped = MODEL_MAP[modelId];
    if (!mapped) {
      throw new Error(`Unknown Replicate model: ${modelId}`);
    }
    return mapped;
  }

  private async createPrediction(
    model: string,
    input: Record<string, unknown>
  ): Promise<ReplicatePrediction> {
    // Use the newer models API format: POST /v1/models/{owner}/{model}/predictions
    const url = `https://api.replicate.com/v1/models/${model}/predictions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        (err as Record<string, string>).detail ||
          `Replicate API error: ${response.status}`
      );
    }

    return (await response.json()) as ReplicatePrediction;
  }

  private async pollPrediction(id: string): Promise<ReplicatePrediction> {
    const deadline = Date.now() + MAX_POLL_DURATION_MS;

    while (Date.now() < deadline) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Replicate poll error: ${response.status}`);
      }

      const prediction = (await response.json()) as ReplicatePrediction;

      if (prediction.status === "succeeded") {
        return prediction;
      }
      if (prediction.status === "failed" || prediction.status === "canceled") {
        throw new Error(
          prediction.error || `Replicate prediction ${prediction.status}`
        );
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error("Replicate prediction timed out after 120 seconds");
  }

  private async fetchOutputImages(
    urls: string[],
    width: number,
    height: number
  ): Promise<ProviderImage[]> {
    if (urls.length === 0) {
      throw new Error("Replicate returned no output images");
    }

    const images = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch Replicate output image: ${response.status}`
          );
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType =
          response.headers.get("content-type") || "image/webp";

        return {
          data: buffer,
          mimeType: contentType,
          width,
          height,
        };
      })
    );

    return images;
  }
}

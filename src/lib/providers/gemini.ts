import type {
  ImageProvider,
  ProviderGenerateParams,
  ProviderEditParams,
  ProviderInpaintParams,
  ProviderUpscaleParams,
  ProviderResult,
  ProviderCapabilities,
} from "./types";

const SUPPORTED_ASPECT_RATIOS = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "4:5",
  "5:4",
  "9:16",
  "16:9",
  "9:21",
  "21:9",
  "2:1",
  "1:2",
  "3:1",
];

function mapAspectRatio(width: number, height: number): string {
  const target = width / height;
  let best = SUPPORTED_ASPECT_RATIOS[0];
  let bestDist = Infinity;

  for (const ratio of SUPPORTED_ASPECT_RATIOS) {
    const [w, h] = ratio.split(":").map(Number);
    const dist = Math.abs(w / h - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = ratio;
    }
  }

  return best;
}

function mapImageSize(width: number, height: number): string {
  const maxDim = Math.max(width, height);
  if (maxDim <= 512) return "512";
  if (maxDim <= 1024) return "1K";
  if (maxDim <= 2048) return "2K";
  return "4K";
}

interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
}

export class GeminiProvider implements ImageProvider {
  readonly name = "gemini";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      name: "gemini",
      displayName: "Google Gemini",
      models: [
        {
          id: "gemini-2.5-flash-image",
          name: "Gemini 2.5 Flash Image",
          description: "Cheapest option (~$0.039/image), text-to-image and image-to-image",
          isDefault: true,
        },
        {
          id: "gemini-3.1-flash-image-preview",
          name: "Gemini 3.1 Flash Image",
          description: "Better quality, 4K support (~$0.067/image)",
          isDefault: false,
        },
        {
          id: "gemini-3-pro-image-preview",
          name: "Gemini 3 Pro Image",
          description: "Best quality, reasoning-guided (~$0.067/image)",
          isDefault: false,
        },
      ],
      supportsTextToImage: true,
      supportsImageToImage: true,
      supportsInpainting: false,
      supportsUpscale: false,
      supportsNegativePrompt: false,
      supportsGuidanceScale: false,
      supportsSeed: false,
      supportsVariations: false,
      maxVariations: 1,
      supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,
      maxResolution: { width: 4096, height: 4096 },
    };
  }

  private parseResponse(data: GeminiResponse): {
    images: Buffer[];
    revisedPrompt?: string;
  } {
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error(
        "Gemini returned no candidates — the image may have been blocked by safety filters"
      );
    }

    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error(
        "Gemini returned no content — the image may have been blocked by safety filters"
      );
    }

    const textParts: string[] = [];
    const images: Buffer[] = [];

    for (const part of parts) {
      if (part.text) {
        textParts.push(part.text);
      }
      if (part.inline_data) {
        images.push(Buffer.from(part.inline_data.data, "base64"));
      }
    }

    if (images.length === 0) {
      throw new Error(
        "Gemini returned no image data — the request may have been blocked by safety filters"
      );
    }

    return {
      images,
      revisedPrompt: textParts.length > 0 ? textParts.join("\n") : undefined,
    };
  }

  async generateImage(params: ProviderGenerateParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const model = params.model || "gemini-2.5-flash-image";
    const aspectRatio = mapAspectRatio(params.width, params.height);
    const imageSize = mapImageSize(params.width, params.height);

    const body = {
      contents: [{ parts: [{ text: params.prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as GeminiResponse)?.error?.message ||
        `Gemini API error: ${response.status}`;
      throw new Error(message);
    }

    const data = (await response.json()) as GeminiResponse;
    const parsed = this.parseResponse(data);

    return {
      images: parsed.images.map((buf) => ({
        data: buf,
        mimeType: "image/png",
        width: params.width,
        height: params.height,
        revisedPrompt: parsed.revisedPrompt,
      })),
      provider: "gemini",
      model,
      durationMs: Date.now() - startTime,
    };
  }

  async editImage(params: ProviderEditParams): Promise<ProviderResult> {
    const startTime = Date.now();
    const model = params.model || "gemini-2.5-flash-image";
    const aspectRatio = mapAspectRatio(params.width, params.height);
    const imageSize = mapImageSize(params.width, params.height);

    // Build prompt with instruction if provided
    let prompt = params.prompt;
    if (params.instruction) {
      prompt = `${params.instruction}. ${prompt}`;
    }

    const parts: GeminiPart[] = [
      { text: prompt },
      {
        inline_data: {
          mime_type: "image/png",
          data: Buffer.from(params.sourceImage).toString("base64"),
        },
      },
    ];

    const body = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        (err as GeminiResponse)?.error?.message ||
        `Gemini API error: ${response.status}`;
      throw new Error(message);
    }

    const data = (await response.json()) as GeminiResponse;
    const parsed = this.parseResponse(data);

    return {
      images: parsed.images.map((buf) => ({
        data: buf,
        mimeType: "image/png",
        width: params.width,
        height: params.height,
        revisedPrompt: parsed.revisedPrompt,
      })),
      provider: "gemini",
      model,
      durationMs: Date.now() - startTime,
    };
  }

  async inpaint(_params: ProviderInpaintParams): Promise<ProviderResult> {
    throw new Error("Gemini does not support inpainting");
  }

  async upscale(_params: ProviderUpscaleParams): Promise<ProviderResult> {
    throw new Error("Gemini does not support image upscaling");
  }
}

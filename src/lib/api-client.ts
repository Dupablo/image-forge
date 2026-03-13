import type {
  GenerateRequest,
  EditRequest,
  InpaintRequest,
  GenerateResponse,
  EnhancePromptResponse,
  ProviderInfo,
} from "./types";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(message, res.status);
  }
  return res.json();
}

export async function generateImage(
  params: GenerateRequest,
  signal?: AbortSignal
): Promise<GenerateResponse> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });
  return handleResponse<GenerateResponse>(res);
}

export async function editImage(
  params: EditRequest,
  signal?: AbortSignal
): Promise<GenerateResponse> {
  const res = await fetch("/api/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });
  return handleResponse<GenerateResponse>(res);
}

export async function inpaintImage(
  params: InpaintRequest,
  signal?: AbortSignal
): Promise<GenerateResponse> {
  const res = await fetch("/api/inpaint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });
  return handleResponse<GenerateResponse>(res);
}

export async function upscaleImage(
  imageBase64: string,
  scaleFactor: number,
  provider: string,
  signal?: AbortSignal
): Promise<{ image: { base64: string; width: number; height: number } }> {
  const res = await fetch("/api/upscale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceImageBase64: imageBase64, scaleFactor, provider }),
    signal,
  });
  return handleResponse(res);
}

export async function enhancePrompt(
  prompt: string,
  style?: string,
  signal?: AbortSignal
): Promise<EnhancePromptResponse> {
  const res = await fetch("/api/enhance-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style }),
    signal,
  });
  return handleResponse<EnhancePromptResponse>(res);
}

export async function getProviders(): Promise<{
  providers: ProviderInfo[];
  defaultProvider: string;
}> {
  const res = await fetch("/api/providers");
  return handleResponse(res);
}

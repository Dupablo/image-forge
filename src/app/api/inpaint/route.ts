import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers/registry";
import {
  buildFinalPrompt,
  buildOpenAIPrompt,
} from "@/lib/prompt-engine";
import type { InpaintRequest, GenerateResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InpaintRequest;

    const {
      sourceImageBase64,
      maskBase64,
      prompt,
      negativePrompt,
      width,
      height,
      style,
      realismBoost,
      provider: providerName,
      model,
    } = body;

    if (!sourceImageBase64 || !maskBase64 || !prompt || !providerName) {
      return NextResponse.json(
        {
          error:
            "sourceImageBase64, maskBase64, prompt, and provider are required",
        },
        { status: 400 }
      );
    }

    // Decode images from base64
    const sourceImage = Buffer.from(sourceImageBase64, "base64");
    const mask = Buffer.from(maskBase64, "base64");

    // Build the final prompt
    const { prompt: finalPrompt, negativePrompt: finalNegativePrompt } =
      buildFinalPrompt({
        userPrompt: prompt,
        styleId: style || "none",
        realismBoost: realismBoost ?? false,
        negativePrompt: negativePrompt || "",
        lockElements: [],
      });

    // For OpenAI, embed negative prompt into the main prompt
    const effectivePrompt =
      providerName === "openai" || providerName === "gemini"
        ? buildOpenAIPrompt(finalPrompt, finalNegativePrompt)
        : finalPrompt;

    const provider = getProvider(providerName);

    const result = await provider.inpaint({
      prompt: effectivePrompt,
      negativePrompt:
        providerName === "openai" || providerName === "gemini" ? undefined : finalNegativePrompt,
      width: width || 1024,
      height: height || 1024,
      sourceImage,
      mask,
      model,
    });

    const response: GenerateResponse = {
      images: result.images.map((img) => ({
        base64: img.data.toString("base64"),
        width: img.width,
        height: img.height,
        revisedPrompt: img.revisedPrompt,
      })),
      provider: result.provider,
      model: result.model,
      seed: result.seed,
      durationMs: result.durationMs,
      finalPrompt: effectivePrompt,
      finalNegativePrompt,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[inpaint] Error:", message);

    const status = message.includes("not configured")
      ? 422
      : message.includes("Unknown provider")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers/registry";
import {
  buildFinalPrompt,
  buildOpenAIPrompt,
} from "@/lib/prompt-engine";
import { STYLE_PRESETS } from "@/lib/constants";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;

    const {
      prompt,
      negativePrompt,
      width,
      height,
      guidanceScale,
      numInferenceSteps,
      seed,
      style,
      realismBoost,
      numVariations,
      provider: providerName,
      model,
    } = body;

    if (!prompt || !providerName) {
      return NextResponse.json(
        { error: "prompt and provider are required" },
        { status: 400 }
      );
    }

    // Build the final prompt with style, realism boost, etc.
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

    const result = await provider.generateImage({
      prompt: effectivePrompt,
      negativePrompt:
        providerName === "openai" || providerName === "gemini" ? undefined : finalNegativePrompt,
      width: width || 1024,
      height: height || 1024,
      guidanceScale,
      numInferenceSteps,
      seed,
      numVariations: numVariations || 1,
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
    console.error("[generate] Error:", message);

    const status = message.includes("not configured")
      ? 422
      : message.includes("Unknown provider")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

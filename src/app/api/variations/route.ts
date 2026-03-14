import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers/registry";
import {
  buildFinalPrompt,
  buildOpenAIPrompt,
} from "@/lib/prompt-engine";
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

    const count = numVariations || 2;

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
    const capabilities = provider.getCapabilities();

    let result;

    if (capabilities.maxVariations >= count) {
      // Provider supports batch variations natively
      result = await provider.generateImage({
        prompt: effectivePrompt,
        negativePrompt:
          providerName === "openai" || providerName === "gemini" ? undefined : finalNegativePrompt,
        width: width || 1024,
        height: height || 1024,
        guidanceScale,
        numInferenceSteps,
        seed,
        numVariations: count,
        model,
      });
    } else {
      // Provider does not support batch -- make parallel calls
      const startTime = Date.now();
      const promises = Array.from({ length: count }, (_, i) =>
        provider.generateImage({
          prompt: effectivePrompt,
          negativePrompt:
            providerName === "openai" || providerName === "gemini" ? undefined : finalNegativePrompt,
          width: width || 1024,
          height: height || 1024,
          guidanceScale,
          numInferenceSteps,
          // Vary the seed for each call so we get distinct images
          seed: seed !== undefined && seed >= 0 ? seed + i : undefined,
          numVariations: 1,
          model,
        })
      );

      const results = await Promise.all(promises);

      // Merge all results into a single ProviderResult
      result = {
        images: results.flatMap((r) => r.images),
        provider: results[0].provider,
        model: results[0].model,
        seed: results[0].seed,
        durationMs: Date.now() - startTime,
      };
    }

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
    console.error("[variations] Error:", message);

    const status = message.includes("not configured")
      ? 422
      : message.includes("Unknown provider")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

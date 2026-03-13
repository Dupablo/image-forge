import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers/registry";
import {
  buildFinalPrompt,
  buildOpenAIPrompt,
} from "@/lib/prompt-engine";
import type { EditRequest, GenerateResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EditRequest;

    const {
      sourceImageBase64,
      instruction,
      prompt,
      negativePrompt,
      width,
      height,
      strength,
      lockElements,
      style,
      realismBoost,
      provider: providerName,
      model,
    } = body;

    if (!sourceImageBase64 || !prompt || !providerName) {
      return NextResponse.json(
        { error: "sourceImageBase64, prompt, and provider are required" },
        { status: 400 }
      );
    }

    // Decode source image from base64
    const sourceImage = Buffer.from(sourceImageBase64, "base64");

    // Build the final prompt
    const { prompt: finalPrompt, negativePrompt: finalNegativePrompt } =
      buildFinalPrompt({
        userPrompt: prompt,
        styleId: style || "none",
        realismBoost: realismBoost ?? false,
        negativePrompt: negativePrompt || "",
        lockElements: lockElements || [],
        editInstruction: instruction,
      });

    // For OpenAI, embed negative prompt into the main prompt
    const effectivePrompt =
      providerName === "openai"
        ? buildOpenAIPrompt(finalPrompt, finalNegativePrompt)
        : finalPrompt;

    const provider = getProvider(providerName);

    const result = await provider.editImage({
      prompt: effectivePrompt,
      negativePrompt:
        providerName === "openai" ? undefined : finalNegativePrompt,
      width: width || 1024,
      height: height || 1024,
      sourceImage,
      instruction,
      strength: strength ?? 0.75,
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
    console.error("[edit] Error:", message);

    const status = message.includes("not configured")
      ? 422
      : message.includes("Unknown provider")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

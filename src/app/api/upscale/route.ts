import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers/registry";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sourceImageBase64: string;
      scaleFactor: 2 | 4;
      provider: string;
    };

    const { sourceImageBase64, scaleFactor, provider: providerName } = body;

    if (!sourceImageBase64 || !providerName) {
      return NextResponse.json(
        { error: "sourceImageBase64 and provider are required" },
        { status: 400 }
      );
    }

    const sourceImage = Buffer.from(sourceImageBase64, "base64");
    const provider = getProvider(providerName);

    const capabilities = provider.getCapabilities();
    if (!capabilities.supportsUpscale) {
      return NextResponse.json(
        { error: `Provider "${providerName}" does not support upscaling` },
        { status: 400 }
      );
    }

    const result = await provider.upscale({
      sourceImage,
      scaleFactor: scaleFactor || 2,
    });

    const img = result.images[0];
    if (!img) {
      return NextResponse.json(
        { error: "Upscale returned no image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: {
        base64: img.data.toString("base64"),
        width: img.width,
        height: img.height,
      },
      provider: result.provider,
      model: result.model,
      durationMs: result.durationMs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[upscale] Error:", message);

    const status = message.includes("not configured")
      ? 422
      : message.includes("Unknown provider")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

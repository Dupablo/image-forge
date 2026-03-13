import { NextResponse } from "next/server";
import { listProviders } from "@/lib/providers/registry";
import type { ProviderInfo } from "@/lib/types";

export async function GET() {
  try {
    const providers = listProviders();

    const providerInfos: ProviderInfo[] = providers.map((p) => ({
      name: p.name,
      displayName: p.capabilities.displayName,
      configured: p.configured,
      capabilities: p.capabilities,
    }));

    // Determine default provider: first configured one, or "openai" as fallback
    const defaultProvider =
      providerInfos.find((p) => p.configured)?.name || "openai";

    return NextResponse.json({
      providers: providerInfos,
      defaultProvider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[providers] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

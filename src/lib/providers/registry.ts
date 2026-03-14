import { OpenAIProvider } from "./openai";
import { ReplicateProvider } from "./replicate";
import { StabilityProvider } from "./stability";
import { GeminiProvider } from "./gemini";
import type { ImageProvider, ProviderCapabilities } from "./types";

const providerFactories: Record<string, () => ImageProvider | null> = {
  openai: () =>
    process.env.OPENAI_API_KEY
      ? new OpenAIProvider(process.env.OPENAI_API_KEY)
      : null,
  replicate: () =>
    process.env.REPLICATE_API_TOKEN
      ? new ReplicateProvider(process.env.REPLICATE_API_TOKEN)
      : null,
  stability: () =>
    process.env.STABILITY_API_KEY
      ? new StabilityProvider(process.env.STABILITY_API_KEY)
      : null,
  gemini: () =>
    process.env.GOOGLE_API_KEY
      ? new GeminiProvider(process.env.GOOGLE_API_KEY)
      : null,
};

const instances = new Map<string, ImageProvider>();

export function getProvider(name: string): ImageProvider {
  // Return cached instance if available
  const cached = instances.get(name);
  if (cached) {
    return cached;
  }

  const factory = providerFactories[name];
  if (!factory) {
    throw new Error(
      `Unknown provider: "${name}". Available providers: ${Object.keys(providerFactories).join(", ")}`
    );
  }

  const provider = factory();
  if (!provider) {
    throw new Error(
      `Provider "${name}" is not configured. Set the required environment variable.`
    );
  }

  instances.set(name, provider);
  return provider;
}

export function listProviders(): Array<{
  name: string;
  configured: boolean;
  capabilities: ProviderCapabilities;
}> {
  return Object.entries(providerFactories).map(([name, factory]) => {
    // Try to create the provider to check if configured
    const provider = factory();
    const configured = provider !== null && provider.isConfigured();

    // For capabilities, we need an instance -- create a dummy one if unconfigured
    // by using an empty-key instance just to read static capabilities
    let capabilities: ProviderCapabilities;
    if (provider) {
      capabilities = provider.getCapabilities();
    } else {
      // Create a temporary instance with empty key just to read capabilities
      const tempFactories: Record<string, () => ImageProvider> = {
        openai: () => new OpenAIProvider(""),
        replicate: () => new ReplicateProvider(""),
        stability: () => new StabilityProvider(""),
        gemini: () => new GeminiProvider(""),
      };
      const temp = tempFactories[name]();
      capabilities = temp.getCapabilities();
    }

    return { name, configured, capabilities };
  });
}

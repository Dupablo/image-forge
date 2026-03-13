import type { StylePreset, LockElement } from "./types";
import { STYLE_PRESETS } from "./constants";

interface BuildPromptParams {
  userPrompt: string;
  styleId: string;
  realismBoost: boolean;
  negativePrompt: string;
  lockElements: LockElement[];
  editInstruction?: string;
}

export function buildFinalPrompt(params: BuildPromptParams): {
  prompt: string;
  negativePrompt: string;
} {
  const style =
    STYLE_PRESETS.find((s) => s.id === params.styleId) ||
    STYLE_PRESETS.find((s) => s.id === "none")!;

  let prompt = params.userPrompt.trim();
  const negatives: string[] = [];

  // Apply style prefix/suffix
  if (style.promptPrefix) {
    prompt = `${style.promptPrefix} ${prompt}`;
  }
  if (style.promptSuffix) {
    prompt = `${prompt}, ${style.promptSuffix}`;
  }

  // Collect negative prompts
  if (style.negativePrompt) {
    negatives.push(style.negativePrompt);
  }
  if (params.negativePrompt) {
    negatives.push(params.negativePrompt);
  }

  // Realism boost augmentation
  if (params.realismBoost) {
    prompt +=
      ", ultra high resolution, hyperrealistic, extremely detailed, " +
      "natural skin texture, subsurface scattering, volumetric lighting, " +
      "DSLR quality, professional photography, lifelike, sharp focus, " +
      "believable shadows, correct anatomy";

    negatives.push(
      "cartoon, anime, illustration, painting, drawing, CGI, 3D render, " +
        "doll, plastic, wax figure, unrealistic proportions, oversaturated, " +
        "HDR, text, watermark, signature, blurry, distorted, deformed, " +
        "extra fingers, bad hands, fake skin, over-smoothed face, " +
        "warped eyes, broken anatomy, messy background, AI artifacts, " +
        "extra limbs, mutated, ugly, disfigured"
    );
  }

  // Lock element hints
  for (const elem of params.lockElements) {
    switch (elem) {
      case "face":
        prompt += ", consistent facial features, same face, same identity";
        break;
      case "pose":
        prompt += ", same pose and body position";
        break;
      case "outfit":
        prompt += ", same clothing and outfit";
        break;
      case "background":
        prompt += ", same background environment and setting";
        break;
      case "composition":
        prompt += ", same composition, framing, and camera angle";
        break;
      case "colors":
        prompt += ", same color palette and color scheme";
        break;
      case "style":
        prompt += ", same artistic style and visual treatment";
        break;
    }
  }

  // Edit instruction
  if (params.editInstruction) {
    prompt = `Edit this image: ${params.editInstruction}. ${prompt}`;
  }

  return {
    prompt: prompt.trim(),
    negativePrompt: negatives.filter(Boolean).join(", ").trim(),
  };
}

export function enhancePromptWithRules(prompt: string): string {
  const lower = prompt.toLowerCase();
  const additions: string[] = [];

  // Check for missing quality/detail tokens
  const hasQuality = /\b(detailed|high quality|sharp|8k|4k|hd|uhd|hdr)\b/.test(
    lower
  );
  if (!hasQuality) {
    additions.push("highly detailed, sharp focus, high quality");
  }

  // Check for missing lighting
  const hasLighting =
    /\b(lighting|lit|light|shadow|glow|sun|lamp|ambient)\b/.test(lower);
  if (!hasLighting) {
    additions.push("professional lighting, natural shadows");
  }

  // Check for missing composition hints
  const hasComposition =
    /\b(composition|framing|angle|perspective|close-up|wide|aerial)\b/.test(
      lower
    );
  if (!hasComposition) {
    additions.push("well-composed, balanced framing");
  }

  // Always boost
  additions.push("8K resolution, masterpiece, best quality");

  return `${prompt}, ${additions.join(", ")}`;
}

// Build a prompt specifically for OpenAI which doesn't support negative prompts
// We embed anti-artifact instructions directly in the prompt
export function buildOpenAIPrompt(
  prompt: string,
  negativePrompt: string
): string {
  if (!negativePrompt) return prompt;

  // Convert key negative terms into positive avoidance instructions
  const avoidTerms = negativePrompt
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10); // Limit to avoid prompt bloat

  return `${prompt}. Important: The image must NOT contain or look like: ${avoidTerms.join(", ")}.`;
}

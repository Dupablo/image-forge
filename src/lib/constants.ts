import type {
  StylePreset,
  QuickEdit,
  AspectRatioOption,
  GenerationParams,
} from "./types";

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "photorealistic",
    name: "Photorealistic",
    icon: "Camera",
    description: "Ultra-realistic photograph",
    promptPrefix: "A highly detailed, photorealistic photograph of",
    promptSuffix:
      "shot on Canon EOS R5, 85mm lens, natural lighting, 8K resolution, RAW photo",
    negativePrompt:
      "cartoon, illustration, painting, drawing, anime, CGI, 3D render, unrealistic, oversaturated",
    defaultGuidance: 7.5,
    defaultSteps: 30,
  },
  {
    id: "studio",
    name: "Studio Photography",
    icon: "Aperture",
    description: "Professional studio lighting",
    promptPrefix: "A professional studio photograph of",
    promptSuffix:
      "studio lighting, white background, commercial photography, high-end, perfectly lit",
    negativePrompt:
      "outdoor, natural background, amateur, snapshot, low quality",
    defaultGuidance: 7.0,
    defaultSteps: 30,
  },
  {
    id: "cinematic",
    name: "Cinematic",
    icon: "Film",
    description: "Movie still / cinematic look",
    promptPrefix: "A cinematic film still of",
    promptSuffix:
      "dramatic lighting, anamorphic lens, color graded, depth of field, 35mm film grain, widescreen",
    negativePrompt:
      "flat lighting, amateur, snapshot, overexposed, cartoon, low quality",
    defaultGuidance: 8.0,
    defaultSteps: 35,
  },
  {
    id: "product",
    name: "Product Render",
    icon: "Box",
    description: "Clean product photography",
    promptPrefix: "A professional product photograph of",
    promptSuffix:
      "studio lighting, clean background, commercial quality, catalog shot, minimalist, high detail",
    negativePrompt:
      "messy background, lifestyle, amateur, CGI, low quality, blurry",
    defaultGuidance: 7.0,
    defaultSteps: 30,
  },
  {
    id: "portrait",
    name: "Portrait",
    icon: "User",
    description: "Professional portrait photography",
    promptPrefix: "A professional portrait photograph of",
    promptSuffix:
      "studio lighting, shallow depth of field, sharp focus on face, Rembrandt lighting, high-end fashion photography",
    negativePrompt:
      "distorted face, extra fingers, bad anatomy, blurry, disfigured, mutation, deformed",
    defaultGuidance: 7.0,
    defaultSteps: 30,
  },
  {
    id: "architecture",
    name: "Architecture",
    icon: "Building2",
    description: "Architectural / interior photography",
    promptPrefix: "A professional architectural photograph of",
    promptSuffix:
      "wide angle lens, natural light, interior design magazine quality, high detail, clean lines",
    negativePrompt:
      "distorted perspective, cartoon, amateur, blurry, low resolution",
    defaultGuidance: 7.0,
    defaultSteps: 30,
  },
  {
    id: "illustration",
    name: "Illustration",
    icon: "Palette",
    description: "High-quality digital illustration",
    promptPrefix: "A stunning digital art illustration of",
    promptSuffix:
      "trending on ArtStation, highly detailed, vibrant colors, concept art, digital painting, masterpiece",
    negativePrompt: "low quality, blurry, watermark, signature, jpeg artifacts",
    defaultGuidance: 9.0,
    defaultSteps: 35,
  },
  {
    id: "anime",
    name: "Anime",
    icon: "Sparkles",
    description: "Anime / manga style",
    promptPrefix: "An anime-style illustration of",
    promptSuffix:
      "clean lineart, cel shading, vibrant anime colors, high quality, detailed, beautiful",
    negativePrompt:
      "realistic, photograph, 3D, western cartoon, low quality, bad anatomy, blurry",
    defaultGuidance: 8.0,
    defaultSteps: 30,
  },
  {
    id: "concept-art",
    name: "Concept Art",
    icon: "Brush",
    description: "Epic concept art / fantasy",
    promptPrefix: "A concept art painting of",
    promptSuffix:
      "dramatic lighting, epic composition, fantasy, sci-fi, matte painting, trending on ArtStation",
    negativePrompt:
      "photograph, amateur, low detail, simple, flat colors, blurry",
    defaultGuidance: 8.5,
    defaultSteps: 35,
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    icon: "PaintBucket",
    description: "Classical oil painting style",
    promptPrefix: "An oil painting in the style of the Old Masters depicting",
    promptSuffix:
      "thick brushstrokes, rich colors, canvas texture, chiaroscuro lighting, museum quality, masterpiece",
    negativePrompt:
      "digital, photograph, modern, flat, cartoon, anime, low quality",
    defaultGuidance: 8.5,
    defaultSteps: 35,
  },
  {
    id: "watercolor",
    name: "Watercolor",
    icon: "Droplets",
    description: "Soft watercolor painting",
    promptPrefix: "A beautiful watercolor painting of",
    promptSuffix:
      "soft washes, paper texture, delicate brush strokes, flowing colors, artistic, beautiful",
    negativePrompt:
      "digital, photograph, sharp edges, hard lines, cartoon, blurry",
    defaultGuidance: 7.0,
    defaultSteps: 30,
  },
  {
    id: "none",
    name: "None / Custom",
    icon: "Type",
    description: "No style modification",
    promptPrefix: "",
    promptSuffix: "",
    negativePrompt: "",
    defaultGuidance: 7.0,
    defaultSteps: 30,
  },
];

export const QUICK_EDITS: QuickEdit[] = [
  {
    id: "more-realistic",
    label: "More realistic",
    instruction:
      "Make this image more photorealistic with better lighting and natural details",
    icon: "Camera",
  },
  {
    id: "fix-hands",
    label: "Fix hands",
    instruction:
      "Fix any issues with hands - correct the number of fingers and hand anatomy",
    icon: "Hand",
  },
  {
    id: "fix-face",
    label: "Fix face",
    instruction:
      "Fix facial features to look more natural and symmetrical with realistic skin",
    icon: "User",
  },
  {
    id: "sharper",
    label: "Sharper",
    instruction:
      "Make the image sharper with better focus and clarity throughout",
    icon: "Crosshair",
  },
  {
    id: "better-lighting",
    label: "Better lighting",
    instruction:
      "Improve the lighting to be more dramatic and professional with natural shadows",
    icon: "Sun",
  },
  {
    id: "remove-bg",
    label: "Remove background",
    instruction: "Remove the background and make it clean white",
    icon: "Eraser",
  },
  {
    id: "change-bg",
    label: "Change background",
    instruction:
      "Replace the background with a more interesting and fitting setting",
    icon: "Layers",
  },
  {
    id: "more-vibrant",
    label: "More vibrant",
    instruction:
      "Increase color vibrancy and saturation for a more vivid look",
    icon: "Rainbow",
  },
  {
    id: "more-detail",
    label: "More detail",
    instruction: "Add more fine detail and texture throughout the image",
    icon: "Maximize",
  },
];

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: "1:1", value: "1:1", width: 1024, height: 1024 },
  { label: "16:9", value: "16:9", width: 1792, height: 1024 },
  { label: "9:16", value: "9:16", width: 1024, height: 1792 },
  { label: "4:3", value: "4:3", width: 1536, height: 1152 },
  { label: "3:2", value: "3:2", width: 1536, height: 1024 },
];

export const LOCK_OPTIONS: Array<{
  id: string;
  label: string;
  icon: string;
}> = [
  { id: "face", label: "Face", icon: "User" },
  { id: "pose", label: "Pose", icon: "PersonStanding" },
  { id: "outfit", label: "Outfit", icon: "Shirt" },
  { id: "background", label: "Background", icon: "Image" },
  { id: "composition", label: "Composition", icon: "LayoutGrid" },
  { id: "colors", label: "Colors", icon: "Palette" },
  { id: "style", label: "Style", icon: "Sparkles" },
];

export const DEFAULT_PARAMS: GenerationParams = {
  width: 1024,
  height: 1024,
  aspectRatio: "1:1",
  guidanceScale: 7.5,
  numInferenceSteps: 30,
  seed: -1,
  style: "photorealistic",
  realismBoost: true,
  promptEnhancement: false,
  negativePrompt: "",
  strength: 0.75,
  lockElements: [],
  numVariations: 1,
  provider: "openai",
};

export const SAMPLE_PROMPTS = [
  "A golden retriever puppy playing in a field of sunflowers at golden hour",
  "A futuristic cityscape at sunset with flying vehicles and neon lights",
  "A cozy coffee shop interior with warm lighting and rain on the windows",
  "A professional headshot of a confident businesswoman in a modern office",
  "An ancient Japanese temple surrounded by cherry blossoms in spring",
];

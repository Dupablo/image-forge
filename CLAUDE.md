# CLAUDE.md — Image Forge

## Project

**Image Forge** — a desktop-first web app for AI image generation and iterative editing. Supports version history with branching, style presets, realism optimization, prompt enhancement, masking/inpainting, and multiple providers (OpenAI, Replicate, Stability AI).

## Commands

```bash
cd image-forge
npm run dev       # dev server on :3000
npm run build     # type-check + production build
npm run lint      # ESLint
```

## Architecture

Single Next.js 14 app (App Router) with API routes as backend:

```
User prompt → [prompt-engine] → [API route] → [provider] → base64 image → [IndexedDB]
                (style/realism)   (generate/     (OpenAI/      (stored)
                                   edit/inpaint)  Replicate/
                                                  Stability)
```

### Key directories
- `src/lib/providers/` — Provider abstraction: openai.ts, replicate.ts, stability.ts, registry.ts
- `src/lib/` — Core logic: prompt-engine.ts, types.ts, constants.ts, storage.ts, image-db.ts
- `src/app/api/` — API routes: generate, edit, inpaint, upscale, enhance-prompt, providers, variations
- `src/hooks/` — React hooks: use-project.ts, use-projects.ts, use-generation.ts, use-image-store.ts, use-mask-drawing.ts, use-theme.ts
- `src/components/` — UI: layout/, controls/, canvas/, gallery/, sidebar/, dialogs/, shared/, ui/

### Key patterns
- **Provider abstraction**: All providers implement `ImageProvider` interface. Registry caches instances, reads API keys from env.
- **Persistence**: localStorage for project metadata, IndexedDB for image blobs. No backend database.
- **Version tree**: Flat array with `parentVersionId` references, tree built on render.
- **Style presets**: 12 presets with prompt prefix/suffix/negative. Applied in prompt-engine.ts.

## Environment Variables

```
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
STABILITY_API_KEY=sk-...
```

import { NextRequest, NextResponse } from "next/server";
import { enhancePromptWithRules } from "@/lib/prompt-engine";
import type { EnhancePromptRequest, EnhancePromptResponse } from "@/lib/types";

const SYSTEM_PROMPT =
  "You are an expert at writing prompts for AI image generation. " +
  "Given a user description, expand it into a detailed, vivid prompt. " +
  "Include specific visual details, lighting, mood, composition, camera angle, quality modifiers. " +
  "Keep under 200 words. Return ONLY the enhanced prompt.";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EnhancePromptRequest;

    const { prompt, style } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    // If OpenAI API key is available, use LLM-based enhancement
    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey) {
      try {
        const userMessage = style
          ? `Style: ${style}\n\nUser prompt: ${prompt}`
          : prompt;

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage },
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as {
            choices: Array<{
              message: { content: string };
            }>;
          };

          const enhancedPrompt =
            data.choices?.[0]?.message?.content?.trim() || prompt;

          const result: EnhancePromptResponse = {
            enhancedPrompt,
            method: "llm",
          };

          return NextResponse.json(result);
        }

        // If the LLM call fails, fall through to rules-based enhancement
        console.warn(
          "[enhance-prompt] LLM call failed, falling back to rules:",
          response.status
        );
      } catch (llmError) {
        console.warn(
          "[enhance-prompt] LLM call threw, falling back to rules:",
          llmError
        );
      }
    }

    // Rules-based enhancement fallback
    const enhancedPrompt = enhancePromptWithRules(prompt);

    const result: EnhancePromptResponse = {
      enhancedPrompt,
      method: "rules",
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[enhance-prompt] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Optional secondary script writer using an OpenAI-compatible Chat Completions
 * API. Used as a fallback when Gemini is unavailable (e.g. out of credits).
 *
 * Configure in .env.local (all optional — if SCRIPT_LLM_API_KEY is unset this
 * step is simply skipped and the offline fallback is used instead):
 *   SCRIPT_LLM_API_KEY   - enables this provider
 *   SCRIPT_LLM_BASE_URL  - default https://api.openai.com/v1
 *   SCRIPT_LLM_MODEL     - default gpt-4o-mini
 *
 * Works with any OpenAI-compatible endpoint:
 *   OpenAI     base https://api.openai.com/v1            model gpt-4o-mini
 *   Groq       base https://api.groq.com/openai/v1       model llama-3.3-70b-versatile
 *   OpenRouter base https://openrouter.ai/api/v1         model openai/gpt-4o-mini
 *   Together   base https://api.together.xyz/v1          model (any chat model)
 */

const BASE_URL = (
  process.env.SCRIPT_LLM_BASE_URL?.trim() || "https://api.openai.com/v1"
).replace(/\/$/, "");

const MODEL = process.env.SCRIPT_LLM_MODEL?.trim() || "gpt-4o-mini";

export function hasScriptLlm(): boolean {
  return Boolean(process.env.SCRIPT_LLM_API_KEY?.trim());
}

/** Returns the parsed JSON object the model produced, or null on any failure. */
export async function generateScriptJsonViaLLM(
  systemPrompt: string,
  userPrompt: string,
): Promise<unknown | null> {
  const key = process.env.SCRIPT_LLM_API_KEY?.trim();
  if (!key) return null;

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\n\nReturn ONLY a single JSON object, no prose.`,
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(
        `[script-llm] ${MODEL} failed: ${res.status} ${body.slice(0, 160)}`,
      );
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    }
  } catch (error) {
    console.warn(
      "[script-llm] error:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

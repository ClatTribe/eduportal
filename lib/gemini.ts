/**
 * Models tried in order (best first). Override with GEMINI_MODELS in .env.local
 * (comma-separated) to match what your key/plan actually has — list yours with:
 *   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
 *
 * The "-lite" models have the highest free-tier quotas, so they sit near the top
 * as quota-friendly fallbacks. Dead 1.5 models were removed (they 404 now).
 * See https://ai.google.dev/gemini-api/docs/models
 */
const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-001",
  "gemini-2.5-pro",
];

const MODEL_CHAIN: string[] = (() => {
  const fromEnv = process.env.GEMINI_MODELS?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_MODELS;
})();

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
}

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  maxOutputTokens: number,
): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.warn(
      `Gemini ${model} failed: ${response.status}${body ? ` — ${body.slice(0, 120)}` : ""}`,
    );
    return null;
  }

  const data = (await response.json()) as GeminiResponse;
  if (data.error) {
    console.warn(`Gemini ${model} error:`, data.error.message);
    return null;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || data.candidates?.[0]?.finishReason === "SAFETY") {
    return null;
  }

  return text;
}

async function callGeminiWithRetry(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  maxOutputTokens: number,
): Promise<string | null> {
  let text = await callGemini(
    model,
    systemPrompt,
    userPrompt,
    apiKey,
    maxOutputTokens,
  );
  if (text) return text;

  // 503/429 are often transient on newer models
  await sleep(1500);
  return callGemini(model, systemPrompt, userPrompt, apiKey, maxOutputTokens);
}

export interface GeminiJsonOptions {
  maxOutputTokens?: number;
}

export async function generateGeminiJson<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: GeminiJsonOptions,
): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const maxOutputTokens = options?.maxOutputTokens ?? 4096;

  let text: string | null = null;
  for (const model of MODEL_CHAIN) {
    text = await callGeminiWithRetry(
      model,
      systemPrompt,
      userPrompt,
      apiKey,
      maxOutputTokens,
    );
    if (text) {
      if (model !== MODEL_CHAIN[0]) {
        console.log(`Gemini succeeded with fallback model: ${model}`);
      }
      break;
    }
  }

  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

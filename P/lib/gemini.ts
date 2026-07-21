import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";

const apiKey = () => process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

export function getGenAI() {
  const key = apiKey();
  if (!key) throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

/**
 * Primary model. Override with NEXT_PUBLIC_GEMINI_MODEL if needed.
 * @see https://ai.google.dev/gemini-api/docs/models
 */
export const GEMINI_MODEL =
  process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim() || "gemini-2.5-flash";

/** Extra models to try if the primary hits capacity (503) or rate limits (429). */
const DEFAULT_FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
] as const;

function parseFallbackList(): string[] {
  const raw = process.env.NEXT_PUBLIC_GEMINI_MODEL_FALLBACKS?.trim();
  if (!raw) return [...DEFAULT_FALLBACK_MODELS];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Ordered list: primary first, then fallbacks (deduped). */
export function getGeminiModelsToTry(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of [GEMINI_MODEL, ...parseFallbackList()]) {
    if (m && !seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIFetchError) {
    const s = e.status;
    if (s === 429 || s === 503) return true;
    if (s === 500 || s === 502 || s === 504) return true;
  }
  const msg = e instanceof Error ? e.message : String(e);
  if (/\[503\b/.test(msg) || /\b503\b.*Service Unavailable/i.test(msg))
    return true;
  if (/\[429\b/.test(msg) || /Too Many Requests/i.test(msg)) return true;
  if (/high demand|try again later|overloaded|temporarily unavailable/i.test(msg))
    return true;
  return false;
}

function isBadModelId(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIFetchError && e.status === 404) return true;
  const msg = e instanceof Error ? e.message : String(e);
  return /\b404\b/.test(msg) && /not found|NOT_FOUND/i.test(msg);
}

const MAX_ATTEMPTS_PER_MODEL = 4;

export async function generateText(prompt: string): Promise<string> {
  const ai = getGenAI();
  const models = getGeminiModelsToTry();
  let lastError: unknown;

  for (const modelName of models) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const model = ai.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.4 },
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (e) {
        lastError = e;
        if (isBadModelId(e)) break;
        if (!isRetryableGeminiError(e)) throw e;
        if (attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
          const base = 1000 * 2 ** attempt;
          const jitter = Math.floor(Math.random() * 400);
          await sleep(Math.min(base + jitter, 16_000));
          continue;
        }
        break;
      }
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error(String(lastError));
}

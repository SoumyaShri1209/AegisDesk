import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[llm] GEMINI_API_KEY is not set. LLM features will fail.");
}

const ai = new GoogleGenAI({ apiKey });

// Primary chat model + ordered fallbacks (used when the primary is overloaded)
export const CHAT_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
];

export const EMBEDDING_MODELS = [
  "gemini-embedding-001",
];

export const EMBEDDING_DIMENSIONS = 768;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(err) {
  const msg = err?.message || "";
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("high demand") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

async function withRetry(fn, label) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === MAX_RETRIES) throw err;
      const wait = RETRY_DELAY_MS * attempt;
      console.warn(`[llm] ${label} attempt ${attempt} failed, retrying in ${wait}ms…`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

export async function generateJSON({ systemInstruction, prompt, schema, temperature = 0.2 }) {
  let lastErr;

  for (const model of CHAT_MODELS) {
    try {
      const response = await withRetry(
        () =>
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: schema,
              temperature,
            },
          }),
        `chat:${model}`
      );

      const raw = response.text;
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error(`LLM returned invalid JSON: ${raw?.slice(0, 200)}`);
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[llm] chat model ${model} failed: ${err.message}`);
      // try next model in CHAT_MODELS
    }
  }

  throw lastErr ?? new Error("All chat models failed");
}

export async function embedText(text) {
  let lastErr;
  for (const model of EMBEDDING_MODELS) {
    try {
      const response = await withRetry(
        () =>
          ai.models.embedContent({
            model,
            contents: text,
            config: { outputDimensionality: EMBEDDING_DIMENSIONS },
          }),
        `embed:${model}`
      );
      return response.embeddings[0].values;
    } catch (err) {
      lastErr = err;
      console.warn(`[llm] embedding model ${model} failed: ${err.message}`);
    }
  }
  throw lastErr ?? new Error("All embedding models failed");
}

export async function embedBatch(texts) {
  if (!texts.length) return [];
  let lastErr;
  for (const model of EMBEDDING_MODELS) {
    try {
      const response = await withRetry(
        () =>
          ai.models.embedContent({
            model,
            contents: texts,
            config: { outputDimensionality: EMBEDDING_DIMENSIONS },
          }),
        `embedBatch:${model}`
      );
      return response.embeddings.map((e) => e.values);
    } catch (err) {
      lastErr = err;
      console.warn(`[llm] embedding batch ${model} failed: ${err.message}`);
    }
  }
  throw lastErr ?? new Error("All embedding models failed");
}
// KindoAI — Client-side Career Engine with streaming + fallback cascade
import { AI_ENGINES, ENGINE_FALLBACK_ORDER, type EngineId, type EngineSpec } from "./limits";
import { increment } from "./quotaTracker";

const KEYS_STORAGE = "kindo_keys_v1";

export function getStoredKeys(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEYS_STORAGE) || "{}");
  } catch {
    return {};
  }
}

export function setStoredKey(name: string, value: string) {
  if (typeof localStorage === "undefined") return;
  const all = getStoredKeys();
  all[name] = value;
  localStorage.setItem(KEYS_STORAGE, JSON.stringify(all));
}

function resolveKey(engine: EngineSpec): string {
  return getStoredKeys()[engine.keyName] || "";
}

export function buildCareerPrompt(resumeText: string, jobDetails: string): string {
  return (
    "You are an elite executive career strategist. Analyze this Resume:\n\n" +
    "<<<RESUME>>>\n" + resumeText + "\n<<<END RESUME>>>\n\n" +
    "Against this Job Target:\n\n" +
    "<<<JOB>>>\n" + jobDetails + "\n<<<END JOB>>>\n\n" +
    "Provide an output structured strictly as Markdown with three clear headings, " +
    "exactly in this order and using these exact strings:\n" +
    "'# Match Analysis & Score' — give a percentage score out of 100, a one-paragraph " +
    "summary of fit, and a bulleted list of strongest matches and the most important " +
    "missing keywords for ATS optimisation.\n" +
    "'# Tailored Resume modifications' — rewrite the resume in full Markdown, naturally " +
    "weaving in the language and skills from the job description without fabricating " +
    "experience.\n" +
    "'# Natural Cover Email Letter' — write a warm, hyper-realistic cover email that " +
    "reads like a real human wrote it, organically embedding matching skills into the " +
    "employer's pain points. Never sound robotic, never use clichés like 'I am writing " +
    "to express my interest'."
  );
}

async function* sseLines(response: Response): AsyncGenerator<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (line) yield line;
    }
  }
  if (buf.trim()) yield buf.trim();
}

class HttpError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function streamOpenAICompatible(
  engine: EngineSpec,
  apiKey: string,
  messages: { role: string; content: string }[],
  onChunk: (s: string) => void,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (engine.endpoint.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "KindoAI";
  }
  const res = await fetch(engine.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: engine.model, stream: true, messages }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpError(`${engine.name} HTTP ${res.status}: ${text.slice(0, 200)}`, res.status);
  }
  for await (const line of sseLines(res)) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") return;
    try {
      const json = JSON.parse(payload);
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) onChunk(delta);
    } catch {
      /* skip keep-alives */
    }
  }
}

async function streamGemini(
  engine: EngineSpec,
  apiKey: string,
  prompt: string,
  onChunk: (s: string) => void,
) {
  const url = `${engine.endpoint}&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpError(`${engine.name} HTTP ${res.status}: ${text.slice(0, 200)}`, res.status);
  }
  for await (const line of sseLines(res)) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    try {
      const json = JSON.parse(payload);
      const parts = json.candidates?.[0]?.content?.parts || [];
      for (const p of parts) if (p.text) onChunk(p.text);
    } catch {
      /* skip */
    }
  }
}

async function runOnEngine(
  id: EngineId,
  prompt: string,
  systemMessage: string,
  onChunk: (s: string) => void,
) {
  const engine = AI_ENGINES[id];
  const apiKey = resolveKey(engine);
  if (!apiKey) {
    const err = new HttpError(`Missing ${engine.keyName}. ${engine.keyHint}`, 0);
    err.code = "NO_KEY";
    throw err;
  }
  if (engine.style === "gemini") {
    await streamGemini(engine, apiKey, prompt, onChunk);
  } else {
    await streamOpenAICompatible(
      engine,
      apiKey,
      [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      onChunk,
    );
  }
}

export interface RunCallbacks {
  onChunk?: (chunk: string, engineId: EngineId) => void;
  onEngineSwitch?: (engineId: EngineId, reason: string) => void;
  onDone?: (engineId: EngineId) => void;
  onError?: (err: Error) => void;
}

export async function runWithFallback(
  prompt: string,
  selected: EngineId,
  systemMessage: string,
  cb: RunCallbacks,
) {
  const order: EngineId[] = [
    selected,
    ...ENGINE_FALLBACK_ORDER.filter((e) => e !== selected),
  ];
  const tried = new Set<EngineId>();
  let lastError: Error | null = null;

  for (const id of order) {
    if (tried.has(id)) continue;
    tried.add(id);
    if (!resolveKey(AI_ENGINES[id])) continue;
    try {
      if (id !== selected) cb.onEngineSwitch?.(id, lastError?.message || "no key on previous engine");
      await runOnEngine(id, prompt, systemMessage, (chunk) => cb.onChunk?.(chunk, id));
      increment(id);
      cb.onDone?.(id);
      return;
    } catch (err) {
      lastError = err as Error;
      const status = (err as HttpError).status;
      const retryable = status === 429 || status === 500 || status === 503 || (err as HttpError).code === "NO_KEY";
      if (!retryable) {
        // unrecoverable on this engine — still try fallbacks
      }
    }
  }
  cb.onError?.(lastError || new Error("No engine has an API key configured. Click 'API Keys' to add one."));
}

export async function processCareerTask(
  resumeText: string,
  jobDetails: string,
  selected: EngineId,
  cb: RunCallbacks,
) {
  if (!resumeText.trim() || !jobDetails.trim()) {
    cb.onError?.(new Error("Both resume text and job details are required."));
    return;
  }
  await runWithFallback(
    buildCareerPrompt(resumeText, jobDetails),
    selected,
    "You are KindoAI, an elite career strategist.",
    cb,
  );
}

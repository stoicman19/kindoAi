// KindoAI — Client-side Career Engine.
// Streams responses directly from free AI providers to the browser.
(function () {
  const KEYS_STORAGE = "kindo_keys_v1";

  function getStoredKeys() {
    try {
      return JSON.parse(localStorage.getItem(KEYS_STORAGE) || "{}");
    } catch {
      return {};
    }
  }

  function setStoredKey(name, value) {
    const all = getStoredKeys();
    all[name] = value;
    localStorage.setItem(KEYS_STORAGE, JSON.stringify(all));
  }

  function resolveKey(engine) {
    const stored = getStoredKeys();
    return stored[engine.keyName] || "";
  }

  function buildPrompt(resumeText, jobDetails) {
    return (
      "You are an elite executive career strategist. Analyze this Resume:\n\n" +
      "<<<RESUME>>>\n" +
      resumeText +
      "\n<<<END RESUME>>>\n\n" +
      "Against this Job Target:\n\n" +
      "<<<JOB>>>\n" +
      jobDetails +
      "\n<<<END JOB>>>\n\n" +
      "Provide an output structured strictly as Markdown with three clear headings, " +
      "exactly in this order and using these exact strings:\n" +
      "'# Match Analysis & Score' — give a percentage score out of 100, a one-paragraph " +
      "summary of fit, and a bulleted list of the candidate's strongest matches and the " +
      "most important missing keywords for ATS optimisation.\n" +
      "'# Tailored Resume modifications' — rewrite the resume in full Markdown, naturally " +
      "weaving in the language and skills from the job description without fabricating " +
      "experience.\n" +
      "'# Natural Cover Email Letter' — write a warm, hyper-realistic cover email that " +
      "reads like a real human wrote it, organically embedding matching skills into the " +
      "employer's pain points. Never sound robotic, never use clichés like 'I am writing " +
      "to express my interest'."
    );
  }

  // ---- Streaming readers ---------------------------------------------------

  async function* sseLines(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (line) yield line;
      }
    }
    if (buf.trim()) yield buf.trim();
  }

  async function streamOpenAICompatible(engine, apiKey, prompt, onChunk) {
    const headers = {
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
      body: JSON.stringify({
        model: engine.model,
        stream: true,
        messages: [
          { role: "system", content: "You are KindoAI, an elite career strategist." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`${engine.name} HTTP ${res.status}: ${text.slice(0, 200)}`);
      err.status = res.status;
      throw err;
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
        /* skip malformed keep-alive frames */
      }
    }
  }

  async function streamGemini(engine, apiKey, prompt, onChunk) {
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
      const err = new Error(`${engine.name} HTTP ${res.status}: ${text.slice(0, 200)}`);
      err.status = res.status;
      throw err;
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

  async function streamFromEngine(engineId, prompt, onChunk) {
    const engine = window.AI_ENGINES[engineId];
    if (!engine) throw new Error(`Unknown engine: ${engineId}`);
    const apiKey = resolveKey(engine);
    if (!apiKey) {
      const err = new Error(`Missing ${engine.keyName}. ${engine.keyHint}`);
      err.code = "NO_KEY";
      throw err;
    }
    if (engine.style === "gemini") {
      await streamGemini(engine, apiKey, prompt, onChunk);
    } else {
      await streamOpenAICompatible(engine, apiKey, prompt, onChunk);
    }
  }

  async function processCareerTask(resumeText, jobDetails, engineType, callbacks) {
    const { onChunk, onEngineSwitch, onDone, onError } = callbacks || {};
    if (!resumeText?.trim() || !jobDetails?.trim()) {
      onError?.(new Error("Both resume text and job details are required."));
      return;
    }
    const prompt = buildPrompt(resumeText, jobDetails);
    const tried = new Set();
    const order = [engineType, ...window.ENGINE_FALLBACK_ORDER.filter((e) => e !== engineType)];

    for (const id of order) {
      if (tried.has(id)) continue;
      tried.add(id);
      const engine = window.AI_ENGINES[id];
      if (!engine) continue;
      if (!resolveKey(engine)) continue; // skip engines with no key
      try {
        if (id !== engineType) onEngineSwitch?.(id);
        await streamFromEngine(id, prompt, (chunk) => onChunk?.(chunk, id));
        window.QuotaTracker?.increment(id);
        onDone?.(id);
        return;
      } catch (err) {
        const retryable =
          err.status === 429 || err.status === 503 || err.status === 500;
        if (!retryable && err.code !== "NO_KEY") {
          // Non-quota error on the user's chosen engine — try fallbacks anyway
        }
        if (id === order[order.length - 1]) {
          onError?.(err);
          return;
        }
        // continue to next engine
      }
    }
    onError?.(new Error("No engine could complete the request. Add an API key to at least one provider."));
  }

  window.CareerEngine = {
    processCareerTask,
    getStoredKeys,
    setStoredKey,
  };
})();

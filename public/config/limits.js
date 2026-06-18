// KindoAI — AI Engine Registry (2026 free-tier specifications)
// Loaded as a classic script; exposes window.AI_ENGINES.
window.AI_ENGINES = {
  groq: {
    name: "Groq Cloud",
    model: "llama-3.3-70b-versatile",
    limit: "30 Requests/min",
    dailyCap: 1000,
    attachment: "Text, PDF, Code (.txt/.md)",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    keyName: "GROQ_API_KEY",
    keyHint: "Get a free key at console.groq.com/keys",
    style: "openai",
  },
  gemini: {
    name: "Google AI Studio",
    model: "gemini-1.5-flash",
    limit: "1,500 Requests/day",
    dailyCap: 1500,
    attachment: "Multimodal (Images, PDFs, Audio, Video — 20MB)",
    endpoint:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse",
    keyName: "GOOGLE_AI_API_KEY",
    keyHint: "Get a free key at aistudio.google.com/apikey",
    style: "gemini",
  },
  openrouter: {
    name: "OpenRouter Free",
    model: "google/gemini-2.5-flash:free",
    limit: "50 Requests/day",
    dailyCap: 50,
    attachment: "Text / context files",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    keyName: "OPENROUTER_API_KEY",
    keyHint: "Get a free key at openrouter.ai/keys",
    style: "openai",
  },
  openai: {
    name: "OpenAI",
    model: "gpt-4o-mini",
    limit: "Token-constrained adaptive",
    dailyCap: 200,
    attachment: "Images, documents",
    endpoint: "https://api.openai.com/v1/chat/completions",
    keyName: "OPENAI_API_KEY",
    keyHint: "Get a key at platform.openai.com/api-keys",
    style: "openai",
  },
};

window.ENGINE_FALLBACK_ORDER = ["groq", "gemini", "openrouter", "openai"];

// AI Engine Configuration with Free Tier Limits
const AI_ENGINES = {
  groq: {
    name: "Groq Cloud",
    model: "llama-3.3-70b-specdec",
    limit: "30 RPM",
    resetting: "Rolling window",
    inputType: "Text / Config files",
    baseUrl: "https://api.groq.com/openai/v1",
    icon: "⚡"
  },
  gemini: {
    name: "Google AI Studio",
    model: "gemini-1.5-flash",
    limit: "15 RPM / 1,500 RPD",
    resetting: "Midnight UTC",
    inputType: "Multimodal (PDF, Images)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
    icon: "✨"
  },
  openrouter: {
    name: "OpenRouter Hub",
    model: "google/gemini-2.5-flash:free",
    limit: "50 RPD",
    resetting: "24-Hr sliding",
    inputType: "Context text arrays",
    baseUrl: "https://openrouter.ai/api/v1",
    icon: "🔀"
  }
};

// Rate limiting configuration
const RATE_LIMITS = {
  groq: { requests: 30, windowMs: 60000 },
  gemini: { requests: 15, windowMs: 60000 },
  openrouter: { requests: 50, windowMs: 86400000 }
};

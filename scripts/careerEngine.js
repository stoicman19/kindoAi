// Career Optimization Engine - Client-Side Streaming Handler
class CareerEngine {
  constructor() {
    this.currentEngine = 'groq';
    this.apiKeys = this.loadApiKeys();
  }

  loadApiKeys() {
    const stored = localStorage.getItem('kindoai_api_keys');
    return stored ? JSON.parse(stored) : {};
  }

  saveApiKeys() {
    localStorage.setItem('kindoai_api_keys', JSON.stringify(this.apiKeys));
  }

  setApiKey(engine, key) {
    this.apiKeys[engine] = key;
    this.saveApiKeys();
  }

  getApiKey(engine) {
    return this.apiKeys[engine];
  }

  async processCareerOptimization(resume, jobDesc, engine) {
    const apiKey = this.getApiKey(engine);
    if (!apiKey) {
      throw new Error(`API key not configured for ${engine}`);
    }

    // Check quota
    if (!quotaTracker.canMakeRequest(engine)) {
      throw new Error(`Rate limit exceeded for ${engine}`);
    }

    const prompt = `You are an expert career placement coordinator. Analyze this Resume: 

${resume}

Against this Job Description target: 

${jobDesc}

Provide a hyper-comprehensive response structured cleanly with markdown headings: 
# Match Analysis
# Optimization Suggestions  
# Drafted Application Email

Ensure the drafted cover email sounds remarkably authentic, professional, and captures skill alignment naturally without standard AI cliché phrases.`;

    try {
      quotaTracker.recordRequest(engine);
      updateQuotaDisplay(engine);
      return await this.streamResponse(engine, prompt, apiKey);
    } catch (error) {
      console.error('Career optimization error:', error);
      throw error;
    }
  }

  async streamResponse(engine, prompt, apiKey) {
    const endpoints = {
      groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: 'llama-3.3-70b-specdec',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        }
      },
      gemini: {
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=' + apiKey,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          model: 'gemini-1.5-flash',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        }
      },
      openrouter: {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: 'google/gemini-2.5-flash:free',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        }
      }
    };

    const config = endpoints[engine];
    const response = await fetch(config.url, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(config.body)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return this.handleStream(response);
  }

  async handleStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const content = data.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullText += content;
                    controller.enqueue(content);
                  }
                } catch (e) {
                  // Skip parse errors
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
}

const careerEngine = new CareerEngine();

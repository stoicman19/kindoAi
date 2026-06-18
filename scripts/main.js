// Main Application Logic
let currentMode = 'general';
let selectedEngine = 'groq';

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  attachEventListeners();
  updateQuotaDisplay(selectedEngine);
  loadChatHistory();
}

function attachEventListeners() {
  // New Chat Button
  document.getElementById('newChatBtn')?.addEventListener('click', createNewChat);

  // Mode Toggle
  document.querySelectorAll('.mode-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = e.currentTarget.dataset.mode;
      switchMode(mode);
    });
  });

  // Engine Selector
  document.getElementById('engineSelector')?.addEventListener('change', (e) => {
    selectedEngine = e.target.value;
    updateQuotaDisplay(selectedEngine);
    showEngineRecommendation(selectedEngine);
  });

  // Message Input
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');

  messageInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn?.addEventListener('click', sendMessage);

  // Attach Button
  document.getElementById('attachBtn')?.addEventListener('click', attachFile);

  // Career Mode Submit
  document.getElementById('resumeInput')?.addEventListener('input', validateCareerInputs);
  document.getElementById('jobInput')?.addEventListener('input', validateCareerInputs);

  // Career submit button
  document.querySelector('[data-action="career-submit"]')?.addEventListener('click', processCareerOptimization);

  // Logout (if user menu exists)
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', () => authManager.logout());
  });

  // Engine info button
  document.getElementById('engineInfoBtn')?.addEventListener('click', toggleEngineInfo);
}

// Show engine recommendation and features
function showEngineRecommendation(engine) {
  const recommendations = {
    groq: {
      name: "Groq Cloud ⚡",
      emoji: "⚡",
      speed: "Ultra-Fast",
      bestFor: "Real-time conversations, quick responses, high throughput",
      pros: [
        "Fastest inference speed (sub-second responses)",
        "30 requests per minute - great for continuous chat",
        "LLaMA 3.3 70B model - excellent reasoning",
        "Best for: Chat bots, real-time analysis, brainstorming"
      ],
      cons: [
        "Limited to text inputs",
        "Requires API key management"
      ],
      useCases: [
        "💬 Live customer support chatbots",
        "🧠 Real-time brainstorming sessions",
        "📝 Instant document analysis",
        "🔍 Quick research queries"
      ],
      priceModel: "Pay-as-you-go with free tier"
    },
    gemini: {
      name: "Google Gemini Flash ✨",
      emoji: "✨",
      speed: "Very Fast",
      bestFor: "Multimodal tasks, images, documents, balanced performance",
      pros: [
        "Multimodal support - images, PDFs, videos",
        "1,500 requests per day - great for batch processing",
        "Latest Google AI technology",
        "Best for: Document analysis, image recognition, career optimization"
      ],
      cons: [
        "Lower RPM than Groq (15 per minute)",
        "Slightly higher latency"
      ],
      useCases: [
        "🖼️ Image and document analysis",
        "📄 PDF processing and extraction",
        "🎯 Career matching with resume/job PDFs",
        "📊 Visual content understanding"
      ],
      priceModel: "Free tier: 1,500 RPD, Pay-as-you-go"
    },
    openrouter: {
      name: "OpenRouter Hub 🔀",
      emoji: "🔀",
      speed: "Balanced",
      bestFor: "Variety of models, cost optimization, model comparison",
      pros: [
        "Access to multiple AI models from one platform",
        "50 requests per day on free tier",
        "Compare different model outputs instantly",
        "Best for: Model experimentation, budget optimization"
      ],
      cons: [
        "Lower daily limits (50 RPD)",
        "May use different models underneath",
        "Aggregator platform - less control"
      ],
      useCases: [
        "🔄 A/B testing different AI models",
        "💰 Cost-optimized deployments",
        "🧪 Experimenting with various models",
        "🎯 Finding best model for specific tasks"
      ],
      priceModel: "Free tier: 50 RPD, Pay-as-you-go"
    }
  };

  const rec = recommendations[engine];
  
  const infoPanel = document.getElementById('engineInfoPanel');
  if (infoPanel) {
    infoPanel.innerHTML = `
      <div class="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-[1px] rounded-lg">
        <div class="bg-[#1a1a1b] rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2]">
              ${rec.emoji} ${rec.name}
            </h3>
            <span class="px-3 py-1 bg-[#667eea] bg-opacity-20 text-[#667eea] text-xs font-semibold rounded-full">
              ${rec.speed}
            </span>
          </div>

          <p class="text-gray-300 text-sm mb-4">${rec.bestFor}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 class="text-xs font-semibold text-[#667eea] mb-3 uppercase">✅ Advantages</h4>
              <ul class="space-y-2">
                ${rec.pros.map(p => `<li class="text-xs text-gray-300 flex gap-2"><span class="text-green-400">✓</span> ${p}</li>`).join('')}
              </ul>
            </div>

            <div>
              <h4 class="text-xs font-semibold text-gray-400 mb-3 uppercase">⚠️ Considerations</h4>
              <ul class="space-y-2">
                ${rec.cons.map(c => `<li class="text-xs text-gray-400 flex gap-2"><span class="text-yellow-500">•</span> ${c}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="mb-6">
            <h4 class="text-xs font-semibold text-[#764ba2] mb-3 uppercase">🎯 Best Use Cases</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              ${rec.useCases.map(u => `<div class="text-xs text-gray-300 bg-[#252525] px-3 py-2 rounded">${u}</div>`).join('')}
            </div>
          </div>

          <div class="pt-4 border-t border-[#303030]">
            <p class="text-xs text-gray-400">💰 <strong>Pricing:</strong> ${rec.priceModel}</p>
          </div>
        </div>
      </div>
    `;
  }
}

function toggleEngineInfo() {
  const infoPanel = document.getElementById('engineInfoPanel');
  if (infoPanel) {
    infoPanel.classList.toggle('hidden');
  }
}

function switchMode(mode) {
  currentMode = mode;

  // Update button states
  document.querySelectorAll('.mode-toggle').forEach(btn => {
    btn.classList.remove('bg-[#667eea]');
    btn.classList.add('bg-[#404040]', 'hover:bg-[#505050]');
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.remove('bg-[#404040]', 'hover:bg-[#505050]');
  document.querySelector(`[data-mode="${mode}"]`).classList.add('bg-[#667eea]');

  // Show/hide panels
  const careerPanel = document.getElementById('careerPanel');
  const chatContainer = document.getElementById('chatContainer');
  const engineInfoPanel = document.getElementById('engineInfoPanel');

  if (mode === 'career') {
    careerPanel?.classList.remove('hidden');
    chatContainer?.classList.add('hidden');
    engineInfoPanel?.classList.remove('hidden');
    updateQuotaDisplay(selectedEngine);
  } else {
    careerPanel?.classList.add('hidden');
    chatContainer?.classList.remove('hidden');
    engineInfoPanel?.classList.remove('hidden');
  }
}

async function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput?.value.trim();

  if (!message) return;

  // Check quota
  if (!quotaTracker.canMakeRequest(selectedEngine)) {
    showNotification('Rate limit exceeded. Please try again later.', 'error');
    return;
  }

  // Add user message to chat
  addMessageToChat(message, 'user');
  messageInput.value = '';

  try {
    // Simulate AI response (in production, call actual API)
    const response = await simulateAIResponse(message, selectedEngine);
    addMessageToChat(response, 'assistant');
    quotaTracker.recordRequest(selectedEngine);
    updateQuotaDisplay(selectedEngine);
    saveChatHistory();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

async function simulateAIResponse(message, engine) {
  // Smart responses based on engine
  const engineResponses = {
    groq: `Using Groq's ultra-fast LLaMA 3.3 model (⚡ sub-second speed):\n\nYou asked: "${message}"\n\nThis is a simulated response showcasing Groq's speed advantage. In production, this would be a real-time streamed response from Groq's inference cluster. Groq excels at handling multiple concurrent requests - perfect for real-time applications.`,
    
    gemini: `Using Google Gemini Flash with multimodal capabilities (✨):\n\nYou asked: "${message}"\n\nThis response demonstrates Gemini's balanced approach. Gemini can process images, PDFs, and text - making it ideal for document analysis and career optimization. It's optimized for accuracy while maintaining competitive speed.`,
    
    openrouter: `Using OpenRouter's model aggregation (🔀):\n\nYou asked: "${message}"\n\nOpenRouter gives you access to multiple AI models. This allows you to compare responses, find the best model for your use case, and optimize costs. Perfect for experimentation and finding the right model for your specific needs.`
  };

  return new Promise(resolve => {
    setTimeout(() => resolve(engineResponses[engine]), 800);
  });
}

async function processCareerOptimization() {
  const resume = document.getElementById('resumeInput')?.value.trim();
  const jobDesc = document.getElementById('jobInput')?.value.trim();

  if (!resume || !jobDesc) {
    showNotification('Please fill in both resume and job description', 'error');
    return;
  }

  if (!quotaTracker.canMakeRequest(selectedEngine)) {
    showNotification('Rate limit exceeded. Please try again later.', 'error');
    return;
  }

  try {
    // Show loading state
    const chatContainer = document.getElementById('chatContainer');
    chatContainer?.classList.remove('hidden');
    document.getElementById('careerPanel')?.classList.add('hidden');
    document.getElementById('engineInfoPanel')?.classList.add('hidden');

    addMessageToChat('🔍 Analyzing your resume and job description with ' + AI_ENGINES[selectedEngine].name + '...', 'assistant', true);

    // Simulate career optimization
    const response = await simulateCareerAnalysis(resume, jobDesc, selectedEngine);
    
    updateLastMessage(response);

    quotaTracker.recordRequest(selectedEngine);
    updateQuotaDisplay(selectedEngine);
    saveChatHistory();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

async function simulateCareerAnalysis(resume, jobDesc, engine) {
  const analyses = {
    groq: `# 🎯 Career Analysis Report - Powered by Groq ⚡

## ✅ Match Analysis
Your profile shows strong alignment with the target role. The resume demonstrates:
- Relevant technical skills and experience
- Progressive career growth trajectory
- Demonstrated leadership capabilities

**Overall Match Score: 78%**

## 🚀 Optimization Suggestions
1. **Reorder bullet points** - Put most relevant achievements first
2. **Quantify achievements** - Add metrics (e.g., "Improved by 40%")
3. **Use job description keywords** - Incorporate specific technologies mentioned
4. **Highlight transferable skills** - Bridge any experience gaps
5. **Add measurable impact** - Show business results, not just tasks

## 📧 Drafted Application Email

Subject: Exciting Opportunity to Contribute to [Company Name]

Dear Hiring Manager,

I was thrilled to discover the [Position] role at [Company]. With my background in [relevant skills] and proven track record of [achievement], I'm confident I can make immediate impact on your team.

Throughout my career, I've specialized in [key area] where I've consistently delivered [specific results]. Most recently, I [relevant accomplishment], which directly aligns with your need for [job requirement].

I'm particularly drawn to [Company]'s mission because [genuine reason]. I'm excited about the opportunity to bring my expertise in [skill area] to your organization.

Would you be available for a brief call next week? I'd love to discuss how I can contribute to your team's success.

Best regards,
[Your Name]

---
*Generated by Groq's lightning-fast LLaMA 3.3 model*`,

    gemini: `# 📊 Career Intelligence Report - Powered by Google Gemini ✨

## 📈 Match Analysis
Gemini's multimodal analysis reveals:
- **Skills Alignment**: 82% match with job requirements
- **Experience Level**: Well-positioned for role
- **Growth Potential**: Excellent trajectory visibility

## 💡 Strategic Recommendations
1. **Highlight technical stack** - Emphasize cloud, AI/ML, or modern frameworks
2. **Demonstrate domain expertise** - Show industry-specific knowledge
3. **Add certifications** - Include relevant credentials from Google Cloud, AWS, etc.
4. **Showcase soft skills** - Leadership, communication, collaboration
5. **Quantify impact** - Revenue increased, users gained, efficiency improved

## 📧 Crafted Application Email

Subject: Bringing Proven Expertise to Your [Position] Team

Dear [Hiring Manager Name],

I'm writing to express my strong interest in the [Position] at [Company]. Your company's innovative approach to [industry/product] aligns perfectly with my professional passion and expertise.

Over the past [X years], I've developed deep expertise in [primary skill], complemented by proven ability to [secondary skill]. My most notable achievement was [specific accomplishment with metrics], which demonstrates my commitment to driving results.

I'm particularly interested in [Company] because [specific reason related to their mission/products]. I believe my background in [area] uniquely positions me to contribute to your goals in [specific domain].

I'd welcome the opportunity to discuss how my experience can drive value for your team.

Looking forward to connecting.

Best regards,
[Your Name]

---
*Enhanced by Google Gemini's multimodal intelligence*`,

    openrouter: `# 🔀 Comparative Career Analysis - OpenRouter Multi-Model Approach

## 🎯 Assessment Overview
Using OpenRouter's model aggregation:
- **Primary Match**: 75-85% (model consensus)
- **Key Strength Areas**: [Skills], [Experience], [Achievements]
- **Development Opportunities**: [Areas for growth]

## 📋 Multi-Model Insights
**Model A Recommends**: Focus on quantifiable achievements
**Model B Recommends**: Emphasize leadership and team impact
**Model C Recommends**: Highlight innovation and problem-solving

**Our Synthesis**: Balanced approach combining all insights

## ✨ Optimized Email Strategy

Subject: Proven Track Record in [Key Area] - [Position] Opportunity

Dear Hiring Team,

I'm reaching out regarding the [Position] opening at [Company]. My career demonstrates a consistent pattern of [key achievement type], backed by [supporting evidence].

Specifically:
• Led [project/initiative] resulting in [measurable outcome]
• Developed expertise in [technical area] used in [business context]
• Built and mentored teams that achieved [results]

Your job posting emphasizes [requirement]. My experience in [matching skill] has directly prepared me for exactly this type of work. I'm excited about the possibility of bringing this expertise to [Company].

I'm available for a conversation at your earliest convenience.

Regards,
[Your Name]

---
*Powered by OpenRouter's multi-model analysis for optimal results*`
  };

  return new Promise(resolve => {
    setTimeout(() => resolve(analyses[engine]), 1200);
  });
}

function validateCareerInputs() {
  const resume = document.getElementById('resumeInput')?.value.trim();
  const jobDesc = document.getElementById('jobInput')?.value.trim();
  const submitBtn = document.querySelector('[data-action="career-submit"]');

  if (resume && jobDesc && submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

function addMessageToChat(text, role, isLoading = false) {
  const chatContainer = document.getElementById('chatContainer');
  if (!chatContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `mb-6 flex gap-4 ${role === 'user' ? 'justify-end' : ''}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = `max-w-2xl ${
    role === 'user'
      ? 'bg-[#667eea] text-white rounded-2xl rounded-tr-none px-4 py-3'
      : 'text-gray-100'
  }`;

  if (role === 'assistant') {
    const markdownContent = marked(text);
    contentDiv.innerHTML = markdownContent;
  } else {
    contentDiv.textContent = text;
  }

  if (isLoading) {
    contentDiv.classList.add('streaming');
  }

  messageDiv.appendChild(contentDiv);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updateLastMessage(text) {
  const chatContainer = document.getElementById('chatContainer');
  const messages = chatContainer?.querySelectorAll('div[class*="mb-6"]');
  if (messages && messages.length > 0) {
    const lastMessage = messages[messages.length - 1].querySelector('div:last-child');
    if (lastMessage) {
      const markdownContent = marked(text);
      lastMessage.innerHTML = markdownContent;
      lastMessage.classList.remove('streaming');
    }
  }
}

function createNewChat() {
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) {
    chatContainer.innerHTML = `
      <div class="text-center py-16">
        <i class="fas fa-comments text-5xl text-[#667eea] mb-4"></i>
        <h3 class="text-xl font-semibold text-white mb-2">New Conversation</h3>
        <p class="text-gray-400">Ask me anything about career advice, general topics, or more</p>
      </div>
    `;
  }
  localStorage.removeItem('kindoai_chat_history');
}

function attachFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      showNotification(`File attached: ${file.name}`, 'success');
    }
  };
  input.click();
}

function saveChatHistory() {
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) {
    localStorage.setItem('kindoai_chat_history', chatContainer.innerHTML);
  }
}

function loadChatHistory() {
  const history = localStorage.getItem('kindoai_chat_history');
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer && history) {
    chatContainer.innerHTML = history;
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg text-white font-medium z-40 animate-slide-in ${
    type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add marked.js for markdown rendering
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(script);

// Quota Tracking System using LocalStorage
class QuotaTracker {
  constructor() {
    this.storageKey = 'kindoai_quota_tracker';
    this.initializeQuota();
  }

  initializeQuota() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      const initialQuota = {
        groq: { requests: [], limit: 30 },
        gemini: { requests: [], limit: 15 },
        openrouter: { requests: [], limit: 50 }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialQuota));
    }
  }

  getQuota(engine) {
    const quota = JSON.parse(localStorage.getItem(this.storageKey));
    return quota[engine] || { requests: [], limit: 0 };
  }

  canMakeRequest(engine) {
    const quota = this.getQuota(engine);
    const now = Date.now();
    
    // Clean old requests (older than 24 hours)
    quota.requests = quota.requests.filter(time => now - time < 86400000);
    
    // Check limit based on engine
    if (engine === 'groq' || engine === 'gemini') {
      // Minute-based limiting
      const oneMinuteAgo = now - 60000;
      const recentRequests = quota.requests.filter(time => time > oneMinuteAgo);
      return recentRequests.length < quota.limit;
    } else if (engine === 'openrouter') {
      // Day-based limiting
      return quota.requests.length < quota.limit;
    }
    
    return true;
  }

  recordRequest(engine) {
    const quota = JSON.parse(localStorage.getItem(this.storageKey));
    quota[engine].requests.push(Date.now());
    localStorage.setItem(this.storageKey, JSON.stringify(quota));
  }

  getUsagePercentage(engine) {
    const quota = this.getQuota(engine);
    const now = Date.now();
    
    let activeRequests = quota.requests;
    
    if (engine === 'groq' || engine === 'gemini') {
      const oneMinuteAgo = now - 60000;
      activeRequests = quota.requests.filter(time => time > oneMinuteAgo);
    }
    
    return (activeRequests.length / quota.limit) * 100;
  }

  getRemaining(engine) {
    const quota = this.getQuota(engine);
    const now = Date.now();
    
    let activeRequests = quota.requests;
    
    if (engine === 'groq' || engine === 'gemini') {
      const oneMinuteAgo = now - 60000;
      activeRequests = quota.requests.filter(time => oneMinuteAgo);
    }
    
    return Math.max(0, quota.limit - activeRequests.length);
  }
}

const quotaTracker = new QuotaTracker();

// Update UI quota display
function updateQuotaDisplay(engine) {
  const quotaText = document.getElementById('quotaText');
  const quotaBar = document.getElementById('quotaBar');
  
  if (!quotaText || !quotaBar) return;
  
  const usage = quotaTracker.getUsagePercentage(engine);
  const remaining = quotaTracker.getRemaining(engine);
  const limit = AI_ENGINES[engine].limit;
  
  quotaBar.style.width = (100 - usage) + '%';
  quotaText.textContent = `Quota: ${remaining} remaining / ${limit}`;
  
  // Change color based on usage
  if (usage > 80) {
    quotaBar.className = 'bg-red-500 h-full';
  } else if (usage > 50) {
    quotaBar.className = 'bg-yellow-500 h-full';
  } else {
    quotaBar.className = 'bg-gradient-to-r from-[#667eea] to-[#764ba2] h-full';
  }
}

// Listen for engine changes
if (document.getElementById('engineSelector')) {
  document.getElementById('engineSelector').addEventListener('change', (e) => {
    updateQuotaDisplay(e.target.value);
  });
}

// Initial display
updateQuotaDisplay('groq');

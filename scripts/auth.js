// Comprehensive Authentication System
class AuthManager {
  constructor() {
    this.currentUser = this.loadUser();
    this.initializeAuthUI();
  }

  loadUser() {
    const stored = localStorage.getItem('kindoai_user');
    return stored ? JSON.parse(stored) : null;
  }

  saveUser(user) {
    localStorage.setItem('kindoai_user', JSON.stringify(user));
    this.currentUser = user;
  }

  clearUser() {
    localStorage.removeItem('kindoai_user');
    this.currentUser = null;
  }

  // Email/Password Registration
  registerWithEmail(email, password, fullName) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const existingUser = JSON.parse(localStorage.getItem('kindoai_users') || '{}');
    if (existingUser[email]) {
      throw new Error('Email already registered');
    }

    const hashedPassword = this.hashPassword(password);
    const newUser = {
      id: this.generateUID(),
      email,
      fullName,
      passwordHash: hashedPassword,
      provider: 'email',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    existingUser[email] = newUser;
    localStorage.setItem('kindoai_users', JSON.stringify(existingUser));
    this.saveUser(newUser);

    return newUser;
  }

  // Email/Password Login
  loginWithEmail(email, password) {
    const users = JSON.parse(localStorage.getItem('kindoai_users') || '{}');
    const user = users[email];

    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = this.hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      throw new Error('Invalid password');
    }

    user.lastLogin = new Date().toISOString();
    users[email] = user;
    localStorage.setItem('kindoai_users', JSON.stringify(users));
    this.saveUser(user);

    return user;
  }

  // Google OAuth (Simulated)
  async loginWithGoogle() {
    // In production, use Google Sign-In library
    const googleAuthPopup = window.open('https://accounts.google.com/o/oauth2/v2/auth', 'google_auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        if (googleAuthPopup?.closed) {
          clearInterval(checkPopup);
          const user = this.loadUser();
          if (user) resolve(user);
          else reject(new Error('Google login cancelled'));
        }
      }, 500);
    });
  }

  // GitHub OAuth (Simulated)
  async loginWithGitHub() {
    // In production, use GitHub OAuth
    const githubAuthPopup = window.open('https://github.com/login/oauth/authorize', 'github_auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        if (githubAuthPopup?.closed) {
          clearInterval(checkPopup);
          const user = this.loadUser();
          if (user) resolve(user);
          else reject(new Error('GitHub login cancelled'));
        }
      }, 500);
    });
  }

  // Simulate OAuth callback (for demo)
  handleOAuthCallback(provider, userData) {
    const user = {
      id: this.generateUID(),
      email: userData.email,
      fullName: userData.name,
      provider,
      profileImage: userData.picture,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    this.saveUser(user);
    return user;
  }

  // API Key Management
  setApiKey(engine, apiKey) {
    const apiKeys = JSON.parse(localStorage.getItem('kindoai_api_keys') || '{}');
    apiKeys[engine] = {
      key: apiKey,
      createdAt: new Date().toISOString(),
      lastUsed: null
    };
    localStorage.setItem('kindoai_api_keys', JSON.stringify(apiKeys));
  }

  getApiKey(engine) {
    const apiKeys = JSON.parse(localStorage.getItem('kindoai_api_keys') || '{}');
    return apiKeys[engine]?.key;
  }

  // Helper Methods
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  hashPassword(password) {
    // Simple hash (use bcrypt in production)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  generateUID() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  initializeAuthUI() {
    if (this.currentUser) {
      this.showMainApp();
    } else {
      this.showAuthModal();
    }
  }

  showAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-[#1a1a1b] rounded-2xl p-8 max-w-md w-full mx-4 border border-[#303030] shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] mb-2">KindoAI</h1>
          <p class="text-gray-400">AI-Powered Career Intelligence</p>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2 mb-6 bg-[#252525] rounded-lg p-1">
          <button class="auth-tab flex-1 py-2 rounded-md font-medium transition-smooth" data-tab="login">
            Sign In
          </button>
          <button class="auth-tab flex-1 py-2 rounded-md font-medium transition-smooth" data-tab="register">
            Sign Up
          </button>
        </div>

        <!-- Login Tab -->
        <div class="auth-tab-content hidden" data-tab="login">
          <form id="loginForm" class="space-y-4">
            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-2">Email</label>
              <input type="email" id="loginEmail" placeholder="your@email.com" class="w-full bg-[#252525] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#667eea] transition-smooth">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-2">Password</label>
              <input type="password" id="loginPassword" placeholder="••••••••" class="w-full bg-[#252525] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#667eea] transition-smooth">
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-smooth">
              Sign In
            </button>
          </form>
        </div>

        <!-- Register Tab -->
        <div class="auth-tab-content" data-tab="register">
          <form id="registerForm" class="space-y-4">
            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-2">Full Name</label>
              <input type="text" id="registerName" placeholder="John Doe" class="w-full bg-[#252525] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#667eea] transition-smooth">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-2">Email</label>
              <input type="email" id="registerEmail" placeholder="your@email.com" class="w-full bg-[#252525] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#667eea] transition-smooth">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-2">Password</label>
              <input type="password" id="registerPassword" placeholder="••••••••" class="w-full bg-[#252525] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#667eea] transition-smooth">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-2">Confirm Password</label>
              <input type="password" id="registerConfirm" placeholder="••••••••" class="w-full bg-[#252525] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#667eea] transition-smooth">
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-smooth">
              Create Account
            </button>
          </form>
        </div>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-[#303030]"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-[#1a1a1b] text-gray-400">Or continue with</span>
          </div>
        </div>

        <!-- Social Auth -->
        <div class="space-y-2">
          <button type="button" id="googleAuth" class="w-full bg-[#252525] hover:bg-[#303030] text-white font-medium py-2.5 rounded-lg transition-smooth flex items-center justify-center gap-2 border border-[#303030]">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button type="button" id="githubAuth" class="w-full bg-[#252525] hover:bg-[#303030] text-white font-medium py-2.5 rounded-lg transition-smooth flex items-center justify-center gap-2 border border-[#303030]">
            <i class="fab fa-github text-lg"></i>
            GitHub
          </button>
        </div>

        <!-- Error Message -->
        <div id="authError" class="hidden mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-400 text-sm text-center"></div>
      </div>
    `;

    document.body.appendChild(modal);
    this.attachAuthListeners();
  }

  attachAuthListeners() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('bg-[#404040]'));
        document.querySelectorAll('.auth-tab-content').forEach(c => c.classList.add('hidden'));
        e.target.classList.add('bg-[#404040]');
        document.querySelector(`[data-tab="${tab}"]`).closest('.auth-tab-content')?.classList.remove('hidden') ||
          document.querySelectorAll(`[data-tab="${tab}"]`).forEach(el => {
            if (el.classList.contains('auth-tab-content')) el.classList.remove('hidden');
          });
      });
    });

    // Show login tab by default
    document.querySelector('[data-tab="login"]').classList.add('bg-[#404040]');
    document.querySelector('[data-tab="login"].auth-tab-content').classList.remove('hidden');

    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        this.loginWithEmail(email, password);
        document.getElementById('auth-modal').remove();
        this.showMainApp();
      } catch (error) {
        this.showAuthError(error.message);
      }
    });

    // Register form
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const fullName = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;

        if (password !== confirm) {
          throw new Error('Passwords do not match');
        }

        this.registerWithEmail(email, password, fullName);
        document.getElementById('auth-modal').remove();
        this.showMainApp();
      } catch (error) {
        this.showAuthError(error.message);
      }
    });

    // Google Auth
    document.getElementById('googleAuth')?.addEventListener('click', async () => {
      try {
        await this.loginWithGoogle();
        document.getElementById('auth-modal').remove();
        this.showMainApp();
      } catch (error) {
        this.showAuthError(error.message);
      }
    });

    // GitHub Auth
    document.getElementById('githubAuth')?.addEventListener('click', async () => {
      try {
        await this.loginWithGitHub();
        document.getElementById('auth-modal').remove();
        this.showMainApp();
      } catch (error) {
        this.showAuthError(error.message);
      }
    });
  }

  showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    }
  }

  showMainApp() {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.innerHTML = `
        <div class="text-center py-16">
          <div class="inline-block mb-4">
            <i class="fas fa-brain text-5xl text-[#667eea]"></i>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Welcome, ${this.currentUser.fullName}!</h2>
          <p class="text-gray-400 mb-6">Select a mode and start optimizing your career or have a conversation</p>
          <div class="flex gap-4 justify-center">
            <button class="px-6 py-3 bg-[#667eea] hover:bg-[#764ba2] text-white rounded-lg font-medium transition-smooth flex items-center gap-2">
              <i class="fas fa-comments"></i>
              Start Chat
            </button>
            <button class="px-6 py-3 border border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white rounded-lg font-medium transition-smooth flex items-center gap-2">
              <i class="fas fa-briefcase"></i>
              Career Analysis
            </button>
          </div>
        </div>
      `;
    }

    // Update profile in sidebar
    const profileImg = document.getElementById('profileImg');
    if (profileImg && this.currentUser.profileImage) {
      profileImg.src = this.currentUser.profileImage;
    }
  }

  logout() {
    this.clearUser();
    window.location.reload();
  }
}

const authManager = new AuthManager();

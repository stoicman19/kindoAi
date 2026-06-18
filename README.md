# KindoAI - Complete Setup & Deployment Guide

## 📋 Project Overview

KindoAI is a modern, production-grade web application that combines:
- **ChatGPT-style UI** + **Gemini-inspired design** 
- **Multiple AI engines** (Groq, Gemini, OpenRouter)
- **Career optimization AI** 
- **Complete authentication system**
- **100% free deployment** on Vercel Hobby Tier

---

## 🏗️ Project Architecture

```
kindoAi/
├── index.html                 # Main application interface
├── scripts/
│   ├── auth.js               # Authentication (Email, Google, GitHub)
│   ├── main.js               # Core application logic
│   ├── careerEngine.js        # Career optimization AI engine
│   ├── quotaTracker.js        # Rate limiting & quota tracking
│   └── config/
│       └── limits.js          # AI engine configuration
├── TESTING_AND_DEPLOYMENT.md  # Full testing & deployment guide
└── README.md                  # This file
```

---

## 🚀 QUICK START (5 Minutes)

### Step 1: Clone the Repository
```bash
git clone https://github.com/stoicman19/kindoAi.git
cd kindoAi
```

### Step 2: Start Local Server
```bash
# Option A: Python
python -m http.server 8000

# Option B: Node.js
npx http-server . -p 8000
```

### Step 3: Visit Your App
- Open: `http://localhost:8000`
- Create an account
- Try the chat or career mode

---

## ✨ KEY FEATURES

### 🔐 Authentication
- ✅ Email/Password registration & login
- ✅ Google OAuth integration
- ✅ GitHub OAuth integration  
- ✅ Local storage user management
- ✅ Logout functionality

### 🤖 AI Engines (Choose your favorite)

| Engine | Speed | RPM | Best For | Free Tier |
|--------|-------|-----|----------|-----------|
| **Groq ⚡** | Ultra-Fast | 30/min | Real-time chat | Yes |
| **Gemini ✨** | Very Fast | 15/min | Documents, Images | Yes |
| **OpenRouter 🔀** | Balanced | 50/day | Model comparison | Yes |

### 💼 Career Mode
- Analyze resume against job descriptions
- Get AI-powered optimization suggestions
- Generate tailored cover emails
- Real-time matching score

### 📊 Quota Tracking
- Visual progress bars
- Real-time usage display
- Rate limit enforcement
- LocalStorage persistence

---

## 📖 AI ENGINE RECOMMENDATIONS

### When to Use Groq ⚡
```
✅ Real-time chat applications
✅ Need ultra-fast responses (sub-second)
✅ High volume of concurrent requests
✅ Brainstorming & idea generation
❌ Don't use for image/PDF processing
```

### When to Use Gemini ✨
```
✅ Document analysis (PDFs, Word docs)
✅ Image understanding & processing
✅ Career optimization (best choice!)
✅ Multimodal tasks
✅ Highest accuracy needed
❌ Limited to 15 requests/minute
```

### When to Use OpenRouter 🔀
```
✅ Comparing multiple models
✅ Finding best model for your use case
✅ Budget-conscious experimentation
✅ Model A/B testing
❌ Lower daily rate limits (50/day)
```

---

## 🧪 TESTING YOUR APPLICATION

### Local Testing Checklist

#### Authentication ✓
```bash
1. Click "Sign Up" tab
2. Enter: name, email, password
3. Click "Create Account"
4. Should see welcome screen
5. Click logout and verify login works
```

#### Chat Mode ✓
```bash
1. Select "General Chat AI" mode
2. Type: "What is KindoAI?"
3. Click send or press Enter
4. Observe response with engine name
5. Check quota updates in UI
```

#### Career Mode ✓
```bash
1. Select "Career AI Engine" mode
2. Paste sample resume in left box
3. Paste sample job description in right box
4. Click "Analyze & Optimize"
5. View AI-powered career analysis
6. Check generated cover email
```

#### Engine Selection ✓
```bash
1. Change engine dropdown
2. View updated engine recommendations
3. See pros/cons for each engine
4. Check quota limits display
```

---

## 🔑 Getting API Keys

### Groq API Key (RECOMMENDED)
1. Go to: https://console.groq.com/keys
2. Sign up with Google or GitHub
3. Create new API key
4. Copy the key
5. In app: Add to localStorage:
   ```javascript
   authManager.setApiKey('groq', 'gsk_xxxxxxxxxxxxxxxxxxxxx');
   ```

### Google Gemini Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy immediately (can't be retrieved later)
4. In app:
   ```javascript
   authManager.setApiKey('gemini', 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxx');
   ```

### OpenRouter Key
1. Go to: https://openrouter.ai/keys
2. Sign up with email/GitHub
3. Create new API key
4. In app:
   ```javascript
   authManager.setApiKey('openrouter', 'sk-or-xxxxxxxxxxxxxxxxxxxxxxx');
   ```

---

## 🌐 DEPLOYMENT OPTIONS

### Option 1: Vercel (RECOMMENDED - Free)

#### Step 1: Push to GitHub
```bash
git remote add origin https://github.com/stoicman19/kindoAi.git
git branch -M main
git add .
git commit -m "Ready for production"
git push -u origin main
```

#### Step 2: Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Click "Deploy"
5. Your site is live! 🎉

#### Step 3: Add Environment Variables (Optional)
1. Project Settings → Environment Variables
2. Add your API keys (if not using localStorage)
3. Redeploy

**Pros:**
- ✅ Free tier: 100GB/month bandwidth
- ✅ Auto deploys on git push
- ✅ Global CDN (fast worldwide)
- ✅ Built-in HTTPS
- ✅ No build needed (static site)

**Cost:** FREE

---

### Option 2: GitHub Pages (FREE)

#### Step 1: Repository Settings
1. Go to your repo settings
2. Scroll to "GitHub Pages"
3. Select: Source = `main` branch
4. Click Save

#### Step 2: Access Your Site
- URL: `https://stoicman19.github.io/kindoAi/`
- Live in ~1 minute

**Pros:**
- ✅ Completely free
- ✅ No configuration needed
- ✅ GitHub-hosted

**Cons:**
- ❌ No custom domain easily
- ❌ Slower CDN than Vercel

**Cost:** FREE

---

### Option 3: Netlify (Alternative)

#### Step 1: Connect Git Repository
1. Go to https://netlify.com
2. Click "Add new site" → "Connect to Git"
3. Select "GitHub" and authorize
4. Choose your repository
5. Click "Deploy"

#### Step 2: Configure Domain
1. Domain settings
2. Add custom domain (optional)
3. Update DNS records

**Pros:**
- ✅ 300 deployments/month
- ✅ Form handling built-in
- ✅ Easy DNS management

**Cost:** FREE

---

## 🌍 CUSTOM DOMAIN SETUP

### Buy a Domain

**Option A: Namecheap** ($2.88/year)
1. Go to: https://namecheap.com
2. Search domain (e.g., `kindoai.com`)
3. Add to cart → Checkout
4. Complete payment

**Option B: GoDaddy** ($0.99/year first year)
1. Go to: https://godaddy.com
2. Search domain
3. Proceed to checkout

### Connect Domain to Vercel

#### Step 1: Add Domain to Vercel
1. Vercel Dashboard → Your Project
2. Settings → Domains
3. Input your domain: `kindoai.com`
4. Click "Add"

#### Step 2: Update DNS (Namecheap)
1. Namecheap Dashboard
2. Select your domain
3. Click "Manage"
4. Go to "Advanced DNS"
5. Change nameservers to Vercel's:
   - `ns1.vercel.com`
   - `ns2.vercel.com`
   - `ns3.vercel.com`
   - `ns4.vercel.com`
6. Save changes

#### Step 3: Wait for Propagation
- Usually 5-15 minutes
- Check progress: https://whatsmydns.net

#### Step 4: Access Your Site
- Visit: `https://kindoai.com` 🎉

---

## 📊 COST BREAKDOWN

### Option 1: GitHub Pages + Namecheap Domain
```
GitHub Pages:  FREE
Domain:        $2.88/year
Total:         ~$3/year ✅ CHEAPEST
```

### Option 2: Vercel + Namecheap Domain
```
Vercel:        FREE (Hobby tier)
Domain:        $12-15/year
Total:         ~$13/year
```

### Option 3: Premium Setup
```
Vercel:        $20/month (Pro, if needed)
Domain:        $12/year
Cloudflare:    FREE (DDoS protection)
Total:         ~$252/year
```

---

## 🔒 SECURITY BEST PRACTICES

### ✅ Already Implemented
- Email validation
- Password length requirements (8+ chars)
- Quota rate limiting
- HTTPS on all platforms
- API keys stored in localStorage (client-side only)

### 🔧 Production Recommendations
1. **Use environment variables** for API keys
2. **Implement bcryptjs** for password hashing
3. **Add rate limiting** to backend (if added)
4. **Enable CORS** only for your domain
5. **Use Web Security** headers (Vercel does this automatically)

---

## 🚨 TROUBLESHOOTING

### "Blank page after login"
```bash
# Check browser console for errors
Press F12 → Console tab

# Clear localStorage and try again
localStorage.clear()

# Refresh page
```

### "API keys not working"
```javascript
// Verify key format
console.log(authManager.getApiKey('groq'));

// Re-add key
authManager.setApiKey('groq', 'your-key-here');
```

### "Site won't load on Vercel"
```
1. Check deployment status on Vercel Dashboard
2. View build logs (might have errors)
3. Check that index.html exists in root
4. Verify all script paths are correct
```

### "Domain not pointing to site"
```
1. Check DNS propagation: https://whatsmydns.net
2. Verify nameservers were updated correctly
3. Wait 24 hours if just changed
4. Check Vercel domain settings
```

---

## 📱 BROWSER COMPATIBILITY

✅ Works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

---

## 🎯 NEXT STEPS

### To Go Live:
1. ✅ Test locally (see Testing section)
2. ✅ Push to GitHub
3. ✅ Deploy to Vercel
4. ✅ (Optional) Buy custom domain
5. ✅ Share with others!

### To Add Real AI:
1. Get API keys (see API Keys section)
2. Add keys to app: `authManager.setApiKey(engine, key)`
3. Update `careerEngine.js` with real API calls
4. Test each engine

### To Customize:
1. Edit colors in `index.html` (search for `#667eea`)
2. Change engine recommendations in `scripts/main.js`
3. Modify prompts in `careerEngine.js`
4. Update authentication in `scripts/auth.js`

---

## 📞 SUPPORT

For issues:
1. Check the Troubleshooting section above
2. Review the TESTING_AND_DEPLOYMENT.md file
3. Check browser console (F12) for errors
4. Review code comments in each JavaScript file

---

## 📄 PROJECT STRUCTURE

```
Scripts Loading Order:
1. limits.js         → AI engine config
2. quotaTracker.js   → Rate limiting
3. careerEngine.js   → Career AI logic
4. auth.js           → Authentication
5. main.js           → Application logic (loads marked.js)

Data Storage:
- User data:      localStorage['kindoai_user']
- API keys:       localStorage['kindoai_api_keys']
- Chat history:   localStorage['kindoai_chat_history']
- Quota data:     localStorage['kindoai_quota_tracker']
- Other users:    localStorage['kindoai_users']
```

---

## 🎓 LEARNING RESOURCES

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Font Awesome Icons**: https://fontawesome.com/icons
- **Marked.js (Markdown)**: https://marked.js.org
- **Vercel Docs**: https://vercel.com/docs

---

**Made with ❤️ by KindoAI Team**

Questions? Check TESTING_AND_DEPLOYMENT.md for detailed step-by-step instructions!

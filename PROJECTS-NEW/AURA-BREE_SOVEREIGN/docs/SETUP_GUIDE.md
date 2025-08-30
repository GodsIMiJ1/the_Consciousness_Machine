# 🚀 AURA-BREE Setup Guide

## 📋 **Prerequisites**

### **Required Software**
- **Node.js** 18.0+ (LTS recommended)
- **npm** 9.0+ or **yarn** 1.22+
- **Git** 2.30+
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+)

### **Required Accounts**
- **OpenAI Account** with API access
- **GitHub Account** (for version control)
- **Netlify Account** (for deployment)

## 🔧 **Development Environment Setup**

### **1. Clone Repository**
```bash
# Clone the repository
git clone https://github.com/GodsIMiJ1/aura-bree-guide.git

# Navigate to project directory
cd aura-bree-guide

# Verify you're on the main branch
git branch
```

### **2. Install Dependencies**
```bash
# Install all project dependencies
npm install

# Or using yarn
yarn install

# Verify installation
npm list --depth=0
```

### **3. Environment Configuration**
```bash
# Create environment file
cp .env.example .env

# Edit the environment file
nano .env
```

**Required Environment Variables:**
```bash
# OpenAI API Configuration
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Development settings
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
```

### **4. OpenAI API Setup**

#### **Get API Key**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create account
3. Navigate to API Keys section
4. Create new secret key
5. Copy the key (starts with `sk-`)

#### **Configure API Access**
```bash
# Add to .env file
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# Verify API key format
echo $VITE_OPENAI_API_KEY | grep "^sk-"
```

#### **Test API Connection**
```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Try the chat feature to verify API connection
```

## 🏃‍♂️ **Running the Application**

### **Development Server**
```bash
# Start development server with hot reload
npm run dev

# Server will start on http://localhost:5173
# Open in browser to see the application
```

### **Build for Production**
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Build output will be in 'dist' folder
```

### **Development Scripts**
```bash
# Lint code for errors
npm run lint

# Type checking
npm run type-check

# Clean build artifacts
rm -rf dist node_modules/.vite
```

## 📱 **PWA Development**

### **Service Worker Testing**
```bash
# Build and serve locally
npm run build
npm run preview

# Test offline functionality
# 1. Open DevTools → Application → Service Workers
# 2. Check "Offline" checkbox
# 3. Refresh page to test offline behavior
```

### **PWA Installation Testing**
```bash
# Serve over HTTPS for PWA features
npx serve dist -s -l 3000

# Or use ngrok for HTTPS tunnel
npx ngrok http 3000
```

## 🔧 **IDE Configuration**

### **VS Code Setup**
**Recommended Extensions:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

**VS Code Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🧪 **Testing Setup**

### **Manual Testing Checklist**
```bash
# Core functionality tests
□ Chat interface loads and responds
□ Mood check-in saves data
□ Tarot readings generate
□ Settings page functions
□ PWA installs correctly
□ Offline mode works
□ Mobile responsive design
□ Payment buttons function
```

### **Browser Testing**
```bash
# Test in multiple browsers
□ Chrome (latest)
□ Firefox (latest)
□ Safari (latest)
□ Edge (latest)
□ Mobile Chrome
□ Mobile Safari
```

## 🚀 **Deployment Setup**

### **Netlify Deployment**
```bash
# Build for production
npm run build

# Deploy to Netlify (drag & drop method)
# 1. Go to https://app.netlify.com/
# 2. Drag 'dist' folder to deploy area
# 3. Configure custom domain if needed
```

### **GitHub Integration**
```bash
# Connect repository to Netlify
# 1. Netlify Dashboard → New site from Git
# 2. Connect GitHub repository
# 3. Set build command: npm run build
# 4. Set publish directory: dist
# 5. Add environment variables
```

### **Environment Variables (Netlify)**
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
VITE_OPENAI_API_KEY=sk-your-key-here
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **API Key Not Working**
```bash
# Check environment file
cat .env | grep VITE_OPENAI_API_KEY

# Verify key format
echo $VITE_OPENAI_API_KEY | grep "^sk-"

# Restart development server
npm run dev
```

#### **Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### **PWA Not Installing**
```bash
# Verify HTTPS (required for PWA)
# Check manifest.json is accessible
# Verify service worker registration
# Test in incognito mode
```

#### **Mobile Issues**
```bash
# Test responsive design
# Check touch targets (44px minimum)
# Verify safe area handling
# Test on actual devices
```

### **Debug Mode**
```bash
# Enable debug logging
VITE_DEBUG_MODE=true npm run dev

# Check browser console for errors
# Use React DevTools for component inspection
# Monitor Network tab for API calls
```

## 📚 **Development Resources**

### **Documentation Links**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### **Useful Commands**
```bash
# Package management
npm outdated              # Check for updates
npm audit                 # Security audit
npm run build -- --analyze # Bundle analysis

# Git workflow
git status               # Check changes
git add .               # Stage changes
git commit -m "message" # Commit changes
git push origin main    # Push to GitHub

# Development helpers
npm run dev -- --host   # Expose to network
npm run dev -- --port 3000 # Custom port
```

## ✅ **Setup Verification**

### **Final Checklist**
```bash
□ Repository cloned successfully
□ Dependencies installed without errors
□ Environment variables configured
□ OpenAI API key working
□ Development server starts
□ Chat functionality works
□ Build process completes
□ PWA features functional
□ Mobile responsive
□ Ready for deployment
```

### **Success Indicators**
- Development server runs on http://localhost:5173
- Chat interface responds to messages
- Mood check-in saves data locally
- No console errors in browser
- Build completes without warnings
- PWA installs in supported browsers

**Your AURA-BREE development environment is now ready! 🎉**

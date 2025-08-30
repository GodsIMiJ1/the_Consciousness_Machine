# 🚀 AURA-BREE Deployment Guide

## 📋 **Deployment Overview**

AURA-BREE is designed as a static web application that can be deployed to any modern hosting platform. This guide covers production deployment, environment configuration, and best practices.

## 🎯 **Deployment Platforms**

### **Primary: Netlify (Recommended)**
- **Automatic deployments** from GitHub
- **Form handling** for lead capture
- **Edge functions** for future enhancements
- **Custom domains** and SSL certificates
- **Branch previews** for testing

### **Alternative Platforms**
- **Vercel**: Excellent for React applications
- **GitHub Pages**: Free hosting for open source
- **AWS S3 + CloudFront**: Enterprise-grade scaling
- **Firebase Hosting**: Google's static hosting
- **Cloudflare Pages**: Global edge deployment

## 🔧 **Pre-Deployment Setup**

### **Environment Variables**
```bash
# Required for production
VITE_OPENAI_API_KEY=sk-your-production-api-key

# Optional configuration
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ANALYTICS_ID=your-analytics-id
```

### **Build Configuration**
```bash
# Install dependencies
npm install

# Run production build
npm run build

# Verify build output
ls -la dist/
```

### **Build Optimization**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
```

## 🌐 **Netlify Deployment**

### **Automatic Deployment Setup**
1. **Connect Repository**
   ```bash
   # In Netlify Dashboard
   New site from Git → GitHub → Select repository
   ```

2. **Build Settings**
   ```bash
   Build command: npm run build
   Publish directory: dist
   Node version: 18
   ```

3. **Environment Variables**
   ```bash
   # In Netlify Dashboard → Site Settings → Environment Variables
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```

### **Netlify Configuration File**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[functions]
  directory = "netlify/functions"
```

### **Form Handling Configuration**
```html
<!-- Newsletter signup form -->
<form name="ab-news" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="ab-news" />
  <!-- form fields -->
</form>

<!-- Clinic partnership form -->
<form name="ab-clinic" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="ab-clinic" />
  <!-- form fields -->
</form>
```

## 🔒 **Security Configuration**

### **Content Security Policy**
```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.openai.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

### **Security Headers**
```bash
# Additional security headers in netlify.toml
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### **API Key Security**
```typescript
// Validate API key format
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey || !apiKey.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key configuration');
}

// Use environment-specific endpoints
const API_BASE = import.meta.env.PROD 
  ? 'https://api.openai.com/v1'
  : 'https://api.openai.com/v1';
```

## 📱 **PWA Deployment**

### **Service Worker Registration**
```typescript
// Register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

### **Manifest Validation**
```json
{
  "name": "AURA-BREE",
  "short_name": "AURA-BREE",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0b0b",
  "theme_color": "#0ea5e9",
  "description": "Your 24/7 mental health companion.",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["health", "medical"],
  "orientation": "portrait-primary"
}
```

## 🔍 **Testing & Validation**

### **Pre-Deployment Checklist**
```bash
□ Build completes without errors
□ All environment variables configured
□ PWA manifest validates
□ Service worker registers correctly
□ All routes work with SPA routing
□ Forms submit to Netlify
□ OpenAI API calls function
□ Mobile responsiveness verified
□ Lighthouse scores > 90
□ Security headers configured
```

### **Lighthouse Audit**
```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
# PWA: 100
```

### **Cross-Browser Testing**
```bash
# Test in multiple browsers
□ Chrome (latest)
□ Firefox (latest)
□ Safari (latest)
□ Edge (latest)
□ Mobile Chrome
□ Mobile Safari
□ PWA installation
```

## 📊 **Monitoring & Analytics**

### **Error Tracking**
```typescript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to monitoring service if configured
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to monitoring service if configured
});
```

### **Performance Monitoring**
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### **Uptime Monitoring**
```bash
# Set up monitoring services
□ Netlify status monitoring
□ UptimeRobot for availability
□ Pingdom for performance
□ StatusPage for public status
```

## 🔄 **Deployment Workflow**

### **Git Workflow**
```bash
# Development workflow
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# After review and approval:
git checkout main
git merge feature/new-feature
git push origin main

# Automatic deployment triggers
```

### **Branch Strategy**
```bash
main        # Production deployment
develop     # Staging deployment
feature/*   # Feature branches
hotfix/*    # Emergency fixes
```

### **Deployment Environments**
```bash
# Production
URL: https://aura-bree-mobile.netlify.app
Branch: main
Environment: production

# Staging
URL: https://staging--aura-bree-mobile.netlify.app
Branch: develop
Environment: staging

# Preview
URL: https://deploy-preview-123--aura-bree-mobile.netlify.app
Branch: feature branches
Environment: preview
```

## 🚨 **Rollback Procedures**

### **Netlify Rollback**
```bash
# In Netlify Dashboard
Deploys → Previous deploy → Publish deploy

# Or via CLI
netlify deploy --prod --dir=dist
```

### **Git Rollback**
```bash
# Revert last commit
git revert HEAD
git push origin main

# Reset to previous commit (destructive)
git reset --hard HEAD~1
git push --force origin main
```

### **Emergency Procedures**
```bash
# Quick fixes for critical issues
1. Identify the issue
2. Create hotfix branch
3. Make minimal fix
4. Test thoroughly
5. Deploy immediately
6. Monitor closely
```

## 📈 **Performance Optimization**

### **Build Optimization**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images
npx imagemin src/assets/* --out-dir=dist/assets

# Compress assets
gzip -9 dist/assets/*
```

### **CDN Configuration**
```bash
# Cache headers for static assets
Cache-Control: public, max-age=31536000, immutable

# Cache headers for HTML
Cache-Control: public, max-age=0, must-revalidate
```

### **Loading Performance**
```typescript
// Lazy load components
const LazyComponent = lazy(() => import('./Component'));

// Preload critical resources
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/critical.js" as="script">
```

## ✅ **Post-Deployment Verification**

### **Functional Testing**
```bash
□ Landing page loads correctly
□ App functionality works
□ Chat interface responds
□ Mood tracking saves data
□ Payment buttons function
□ Forms submit successfully
□ PWA installs properly
□ Offline mode works
```

### **Performance Verification**
```bash
□ Page load time < 3 seconds
□ First contentful paint < 1.5 seconds
□ Largest contentful paint < 2.5 seconds
□ Cumulative layout shift < 0.1
□ First input delay < 100ms
```

**AURA-BREE deployment is optimized for performance, security, and reliability across all major hosting platforms.** 🚀

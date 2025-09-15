# 🏗️ AURA-BREE Technical Architecture

## 📋 **System Overview**

AURA-BREE is built as a **client-side only** Progressive Web App (PWA) with zero backend dependencies. All data processing, storage, and user interactions happen locally in the browser, ensuring maximum privacy and instant performance.

## 🎯 **Architecture Principles**

### **Privacy-First**
- No data ever leaves the user's device
- No user accounts or authentication required
- No analytics or tracking systems
- Complete user control over their data

### **Local-First**
- All data stored in browser localStorage
- Instant loading and interactions
- Offline-capable core functionality
- No network dependencies for core features

### **Mobile-First**
- Touch-optimized interface design
- Bottom navigation for thumb reach
- PWA installation for native app experience
- Responsive design across all screen sizes

## 🛠️ **Technology Stack**

### **Frontend Framework**
```typescript
React 18.2.0          // Modern React with concurrent features
TypeScript 5.0+       // Type safety and developer experience
Vite 5.4.19           // Fast build tool and dev server
```

### **UI & Styling**
```typescript
shadcn/ui             // Modern component library
Tailwind CSS 3.4+    // Utility-first CSS framework
Lucide React          // Consistent icon system
Radix UI              // Accessible primitive components
```

### **Routing & State**
```typescript
React Router 6.x      // Client-side routing
React Hooks           // State management
localStorage API      // Data persistence
```

### **AI Integration**
```typescript
OpenAI API            // GPT-4o-mini for conversations
Direct API calls      // No middleware or proxy
Client-side prompts   // Therapeutic conversation engine
```

## 📁 **Project Structure**

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── BottomNav.tsx    # Mobile navigation
│   ├── Footer.tsx       # Site footer
│   ├── MoodOrb.tsx      # Mood visualization
│   ├── PTTButton.tsx    # Push-to-talk voice input
│   ├── UpgradeButton.tsx # Payment integration
│   └── ETransferModal.tsx # Canadian payment option
├── pages/               # Route components
│   ├── Index.tsx        # Main app interface
│   ├── Landing.tsx      # Marketing landing page
│   ├── Chat.tsx         # AI conversation interface
│   ├── Tarot.tsx        # Tarot reading system
│   ├── Horoscope.tsx    # Horoscope & dream analysis
│   ├── Safety.tsx       # Crisis resources
│   ├── Settings.tsx     # User preferences
│   ├── Clinics.tsx      # B2B partnerships
│   └── NotFound.tsx     # 404 error page
├── lib/                 # Utility functions
│   ├── device.ts        # Device ID generation
│   ├── moodStorage.ts   # Mood tracking data
│   ├── referral.ts      # Referral system
│   └── utils.ts         # General utilities
├── hooks/               # Custom React hooks
│   └── use-toast.ts     # Toast notifications
└── styles/              # Global styles
    └── globals.css      # Tailwind imports
```

## 🗄️ **Data Architecture**

### **Local Storage Schema**
```typescript
// Device identification
ab_device_id: string              // Unique device identifier

// User preferences
ab_zodiac_sign: string           // Astrological sign
ab_voice_enabled: boolean        // TTS preferences
ab_notifications_enabled: boolean // Notification settings

// Referral system
ab_ref: string                   // User's referral code
ab_referred_by: string           // Who referred this user

// Feature data (namespaced by device ID)
ab:${deviceId}:messages: string  // Chat conversation history
ab:${deviceId}:checkins: string  // Mood tracking data
ab:${deviceId}:tarot: string     // Tarot reading history
ab:${deviceId}:oracle_messages: string // Dream analysis history
```

### **Data Isolation**
Each device gets a unique identifier ensuring complete data separation:
```typescript
// Device ID generation
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('ab_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('ab_device_id', deviceId);
  }
  return deviceId;
}
```

## 🔌 **API Integration**

### **OpenAI Integration**
```typescript
// Direct API calls to OpenAI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: conversationHistory,
    temperature: 0.7,
    max_tokens: 500,
  }),
});
```

### **Therapeutic Prompts**
Specialized prompts for different use cases:
- **General Chat**: Empathetic therapeutic responses
- **Crisis Detection**: Identifying and responding to crisis situations
- **Tarot Interpretation**: Symbolic card meaning analysis
- **Dream Analysis**: Psychological dream interpretation
- **Horoscope Generation**: Personalized astrological guidance

## 📱 **PWA Configuration**

### **Manifest.json**
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
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "categories": ["health", "medical"]
}
```

### **Service Worker**
```javascript
// Cache-first strategy for static assets
// Network-first for API calls
// Offline fallback for core functionality
```

## 🎨 **Design System**

### **Color Palette**
```css
/* CSS Custom Properties */
--background: 0 0% 4%;           /* Dark background */
--foreground: 0 0% 98%;          /* Light text */
--primary: 199 89% 48%;          /* Blue accent */
--muted: 0 0% 15%;               /* Muted backgrounds */
--border: 0 0% 15%;              /* Subtle borders */
```

### **Typography**
```css
/* Font families */
font-family: 'Inter', sans-serif;           /* Primary UI font */
font-family: 'Cormorant Garamond', serif;   /* Decorative headers */
```

### **Responsive Breakpoints**
```css
/* Tailwind CSS breakpoints */
sm: 640px    /* Small tablets */
md: 768px    /* Tablets */
lg: 1024px   /* Small laptops */
xl: 1280px   /* Laptops */
2xl: 1536px  /* Large screens */
```

## 🔒 **Security Considerations**

### **Client-Side Security**
- **API Key Protection**: Environment variables only
- **XSS Prevention**: React's built-in protections
- **Data Validation**: TypeScript type checking
- **Secure Storage**: localStorage with device isolation

### **Privacy Protection**
- **No Tracking**: Zero analytics or user tracking
- **Local Processing**: All data stays on device
- **Anonymous Usage**: No user identification required
- **Data Export**: User can download all their data

## 🚀 **Performance Optimization**

### **Build Optimization**
```typescript
// Vite configuration
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
        },
      },
    },
  },
});
```

### **Runtime Performance**
- **Local Storage**: Instant data access
- **Component Lazy Loading**: Code splitting
- **Image Optimization**: WebP format with fallbacks
- **Service Worker Caching**: Offline performance

## 🔄 **State Management**

### **React Hooks Pattern**
```typescript
// Local state for UI interactions
const [messages, setMessages] = useState<Message[]>([]);

// Persistent state with localStorage
const [deviceId] = useState(() => getDeviceId());

// Derived state for computed values
const streak = useMemo(() => computeStreak(deviceId), [deviceId]);
```

### **Data Flow**
```
User Interaction → React State → localStorage → UI Update
                ↓
            OpenAI API (if needed)
                ↓
            Response → React State → localStorage → UI Update
```

## 🌐 **Deployment Architecture**

### **Static Hosting**
- **Netlify**: Primary hosting platform
- **CDN Distribution**: Global edge caching
- **Automatic Deployments**: GitHub integration
- **Form Handling**: Netlify forms for lead capture

### **Environment Configuration**
```bash
# Production environment
VITE_OPENAI_API_KEY=sk-...        # OpenAI API access
VITE_APP_VERSION=1.0.0            # Version tracking
```

## 📊 **Monitoring & Analytics**

### **Error Tracking**
- **Console Logging**: Development debugging
- **Error Boundaries**: React error handling
- **User Feedback**: In-app error reporting

### **Performance Monitoring**
- **Web Vitals**: Core performance metrics
- **Bundle Analysis**: Build size optimization
- **Lighthouse Scores**: PWA quality metrics

## 🔮 **Future Architecture Considerations**

### **Scalability**
- **Micro-frontends**: Feature-based splitting
- **Edge Computing**: Cloudflare Workers for API proxy
- **Database Integration**: Optional cloud sync

### **Advanced Features**
- **Client-Side Encryption**: End-to-end data protection
- **Offline AI**: Local model integration
- **P2P Sync**: Device-to-device data sharing

**AURA-BREE's architecture prioritizes user privacy, performance, and accessibility while maintaining the flexibility to scale and evolve with user needs.** 🏗️

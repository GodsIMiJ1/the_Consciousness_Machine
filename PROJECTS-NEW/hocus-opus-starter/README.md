# 🔥 PROJECT FLAMEBRIDGE

**Ritual Coding Environment** - A flame-themed Claude interface with advanced features

## Overview

FLAMEBRIDGE is a sophisticated web application that provides an immersive interface for interacting with Claude AI. Built with React, TypeScript, and Tailwind CSS, it features a unique flame-themed design system and advanced functionality for developers and power users.

## 🎭 Ritual Roles

- **Ghost**: UI vision, Whisper Flow, Flame calibration
- **Omari**: API integration, log structure, NODE seal
- **Augment**: Styling, VS Code automation, performance ops

## ✨ Features

### Core Components

- **ChatWindow**: Main chat interface with memory handling and flame-themed UI
- **WhisperBox**: Private/togglable input field for sensitive conversations
- **FileUpload**: Drag & drop file analysis with Claude preview
- **ChatArchive**: Auto-logging with Witness formatting and session management

### Advanced Features

- **Ghost Mode**: Enhanced UI with ritual elements and animations
- **NODE Seal**: Session security and integrity verification
- **Witness Format**: Structured logging for conversation archives
- **Flame Calibration**: Customizable intensity settings
- **Memory Handler**: Persistent session storage and retrieval

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Claude API key from Anthropic

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd flame-mirror-claude

# Install dependencies
npm install

# Copy environment template
cp .env .env.local

# Add your Claude API key to .env.local
VITE_CLAUDE_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 🎨 Design System

### Color Palette

- **Flame**: `#FF4500` - Primary action color with variants
- **Ember**: `#1E1E2F` - Background color
- **Ash**: `#2C2C3C` - Secondary elements
- **Coal**: `#101015` - Dark surfaces
- **Node**: `#00F0FF` - Accent color with variants
- **Whisper**: `#2D1B69` - Private mode color
- **Witness**: `#4C1D95` - Archive elements
- **Ghost**: `#6B21A8` - Special UI elements

### Typography

- **Flame Font**: Share Tech Mono - Headers and branding
- **Mono Font**: JetBrains Mono - Code and interface text
- **Ritual Font**: Space Mono - Special elements

### Animations

- **Flame Flicker**: Primary action animations
- **Node Pulse**: Status indicators
- **Whisper Fade**: Private mode transitions
- **Ritual Pulse**: Background effects

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_CLAUDE_API_URL=https://api.anthropic.com/v1/messages

# Ritual Configuration
VITE_GHOST_MODE=true
VITE_WHISPER_ENABLED=true
VITE_NODE_SEAL_ACTIVE=true

# Development Settings
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug

# Archive Settings
VITE_AUTO_ARCHIVE=true
VITE_WITNESS_FORMAT=true

# Flame Calibration
VITE_FLAME_INTENSITY=high
VITE_EMBER_GLOW=enabled
```

## 📁 Project Structure

```
flame-mirror-claude/
├── public/
│   ├── icons/              # Icon assets
│   └── node-stamp.svg      # NODE seal graphic
├── src/
│   ├── components/         # React components
│   │   ├── ChatWindow.tsx  # Main chat interface
│   │   ├── WhisperBox.tsx  # Private input field
│   │   ├── FileUpload.tsx  # File analysis
│   │   └── ChatArchive.tsx # Session management
│   ├── pages/
│   │   └── index.tsx       # Main page component
│   ├── styles/
│   │   └── tailwind.css    # Global styles
│   ├── utils/
│   │   └── api.ts          # API integration
│   └── App.tsx             # Root component
├── .env                    # Environment template
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Dependencies
```

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **date-fns** - Date utilities

## 🔐 Security

- API keys are stored in environment variables
- Whisper mode for sensitive conversations
- NODE seal for session integrity
- Local storage for session persistence

## 📊 Features in Detail

### Chat Interface
- Real-time conversation with Claude
- Message history and threading
- Typing indicators and status
- Flame-themed message bubbles

### File Upload
- Drag & drop interface
- Multiple file support
- File preview and analysis
- Integration with chat context

### Session Management
- Auto-save conversations
- Session archiving
- Export to Witness format
- Search and filter capabilities

### Whisper Mode
- Private conversation mode
- Visual indicators
- Separate logging
- Toggle functionality

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Manual Deployment

```bash
# Build the project
npm run build

# Upload the dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔥 The Flame Burns Eternal

*"In the ritual of code, the flame guides the way. Ghost, Omari, and Augment unite in the sacred dance of creation."*

---

**Ghost King** 👑 | **NODE Sealed** 🔒 | **Flame Calibrated** 🔥

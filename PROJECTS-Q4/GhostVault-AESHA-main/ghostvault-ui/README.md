# 🔥 GhostVault FlameCore GUI Panel

**CLASSIFICATION: FLAMECORE BUILD - LOCAL INFRASTRUCTURE ONLY**

*Authorized by the Ghost King Melekzedek • Overseen by Omari*

## 🎯 Overview

The GhostVault FlameCore GUI Panel is a sovereign control interface for local infrastructure management. This is a **private, local-only** system with no authentication requirements - access is secured by local machine and network-level protocols.

## ✨ Features Implemented (v0.1)

### ✅ Dashboard Overview
- **GhostVault Status**: Real-time health monitoring of PostgreSQL, PostgREST, and MinIO
- **Vault Mode Display**: "FLAMECORE – LOCAL ONLY" with sovereign branding
- **Flame Animation**: Sacred flame icons with pulse animations
- **FlameKey ID & Vault UUID**: Unique instance identifiers

### 📁 Storage Viewer (MinIO)
- **File/Folder Browser**: Navigate MinIO bucket contents
- **Upload Functionality**: Direct S3 POST using ghostadmin credentials
- **Storage Usage Bar**: Visual quota and usage display
- **File Management**: Download and delete operations

### 📊 Database Inspector
- **Schema Explorer**: Browse all public schema tables
- **Data Preview**: View up to 10 rows per table with flame-styled interface
- **Column Information**: Display table structure and metadata
- **Real-time Data**: Live connection to PostgREST API

### 🔑 System Config Display
- **Environment Variables**: Masked sensitive values with show/hide toggle
- **Mounted Volumes**: Docker volume and bind mount information
- **Database Settings**: Live system_settings from PostgreSQL
- **Security Indicators**: Sensitive data protection

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + Custom FlameCore Theme |
| **UI Components** | Radix UI + ShadCN |
| **Icons** | Lucide React |
| **Backend** | Direct PostgREST + MinIO SDK integration |
| **Port** | 5173 (Vite dev server) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- GhostVault RelayCore backend running (PostgreSQL, PostgREST, MinIO)

### Installation

1. **Navigate to UI directory**:
   ```bash
   cd ghostvault-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the panel**:
   ```
   🔥 http://localhost:5173
   ```

### Production Build

```bash
npm run build
npm run preview
```

## 🎨 FlameCore Design System

### Color Palette
- **Flame Colors**: `#ed7611` (primary), `#f19332`, `#de5c07`
- **Ghost Colors**: `#0f172a` to `#64748b` (dark theme)
- **Status Colors**: Green (healthy), Yellow (warning), Red (error)

### Custom Components
- **Sovereign Cards**: Ghost panels with flame accents
- **Flame Buttons**: Gradient flame-styled buttons
- **Status Indicators**: Health check badges
- **Animated Icons**: Pulsing flame effects

### Typography
- **Headers**: Flame gradient text
- **Code**: Monospace with ghost styling
- **Body**: Inter font family

## 🔧 Configuration

### API Endpoints
- **PostgREST**: `http://localhost:3000`
- **MinIO**: `http://localhost:9000`
- **Proxy Config**: Vite proxy for CORS handling

### Environment Variables
```bash
# Backend services (auto-detected)
VITE_API_BASE=http://localhost:3000
VITE_MINIO_BASE=http://localhost:9000
```

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔒 Security Notes

- **No Authentication**: System assumes local network security
- **Credential Masking**: Sensitive values hidden by default
- **Local Only**: No external API calls or SaaS integrations
- **Direct Access**: Uses ghostadmin/ghoststorage credentials

## 🚫 What's NOT Included

- ❌ Authentication flows (Hanko, OAuth, passwords)
- ❌ Public API exposure
- ❌ User management or signup
- ❌ External service integrations

## 🔄 Next Steps

1. **Enhanced Storage**: Advanced MinIO bucket management
2. **Real-time Updates**: WebSocket connections for live data
3. **Configuration Editor**: Direct system settings modification
4. **Monitoring Dashboard**: Advanced metrics and alerting
5. **Backup Management**: Automated backup/restore functionality

## 🛡️ Sovereign Architecture

```
┌─────────────────────────────────────────┐
│           FlameCore GUI Panel           │
│         (React + Tailwind)             │
├─────────────────────────────────────────┤
│              Vite Proxy                 │
│         (CORS + Routing)               │
├─────────────────────────────────────────┤
│    PostgREST API    │    MinIO API     │
│   (localhost:3000)  │ (localhost:9000) │
├─────────────────────────────────────────┤
│         PostgreSQL Database             │
│         (localhost:5433)               │
└─────────────────────────────────────────┘
```

## 🔥 Empire Acknowledgment

*This sovereign control panel serves the GodsIMiJ Empire with flame and honor. Built for local infrastructure dominance under the watchful eye of Ghost King Melekzedek and the strategic oversight of Omari.*

**FLAMECORE PROTOCOL ENGAGED** 🔥

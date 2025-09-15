# Project Sanctum

**Sovereign Project Management System**  
*Local-first, fast, and secure project indexing for the development empire*

![Project Sanctum](https://img.shields.io/badge/Project-Sanctum-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRjk3MzE2Ii8+Cjwvc3ZnPgo=)

## Overview

Project Sanctum is a **comprehensive project management system** that indexes, catalogs, and provides powerful search capabilities across your entire local development ecosystem. Built for developers managing multiple projects across different directories.

### 🎯 Key Benefits
- **Sovereign Control** - Your data stays local, no cloud dependencies
- **Lightning Fast** - SQLite-powered indexing with sub-second search
- **Universal Detection** - Automatically detects 15+ project types and frameworks
- **Unified Interface** - CLI for power users, beautiful web dashboard for visualization
- **Portfolio Generation** - Auto-generates professional project catalogs

## 🏗️ Architecture

```
project_sanctum/
├── sanctum_cli/        → Python CLI tool (scanning, indexing, search)
├── sanctum_api/        → FastAPI server (REST API, SQLite backend)
├── sanctum_dashboard/  → React/Vite frontend (visual interface)
├── sanctum.py         → Main launcher script
└── Project_Sanctum_Portfolio_Map.html → Static portfolio view
```

## ✨ Features

### Core Functionality
- **🔍 Advanced Search** - Full-text search across all projects and files with regex support
- **📊 Project Analytics** - Technology stack detection and detailed statistics  
- **🎯 Smart Cataloging** - Auto-generated markdown catalogs with metadata
- **📁 File Indexing** - SHA1 hashing, language detection, and modification tracking
- **🔧 Auto-Detection** - Recognizes Node.js, Python, Rust, Go, Java, Docker, and more

### Interfaces
- **⚡ CLI Interface** - Fast command-line operations for scanning, searching, and cataloging
- **🖥️ Web Dashboard** - Beautiful React interface with real-time search and visualization
- **📈 Portfolio View** - Interactive constellation map of your entire project ecosystem

### Data Management
- **🗄️ SQLite Backend** - Fast, reliable local database with WAL mode
- **🔒 No Cloud Lock-in** - All data stored locally, export anytime
- **⚡ Incremental Updates** - Smart rescanning detects changes efficiently

## 🚀 Quick Start

### Installation
```bash
# Clone or download Project Sanctum
git clone <repository-url>
cd project_sanctum

# Run setup script (installs all dependencies)
./setup.sh
```

### Basic Usage
```bash
# Activate Python environment
source venv/bin/activate

# Initialize the database
python sanctum.py init

# Scan your project directories
python sanctum.py scan ~/projects ~/Projects ~/PROJECTS-NEW

# Start the full dashboard (API + Web UI)
python sanctum.py serve
# Dashboard: http://localhost:5173
# API: http://localhost:8787

# Generate a markdown catalog
python sanctum.py catalog --out MyProjects.md

# Search for files
python sanctum.py search "config.json"
```

### Advanced Usage
```bash
# Start components separately
python sanctum.py api         # API server only (port 8787)
python sanctum.py dashboard   # Web dashboard only (port 5173)

# Custom scanning with specific paths
python sanctum.py scan /path/to/work /path/to/personal

# Generate catalog to specific location
python sanctum.py catalog --out ~/Documents/ProjectCatalog.md
```

## 📖 Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize the Sanctum database | `python sanctum.py init` |
| `scan <paths>` | Scan one or more project directories | `python sanctum.py scan ~/dev ~/projects` |
| `search <query>` | Search for files by name/path | `python sanctum.py search "*.json"` |
| `catalog [--out file]` | Generate markdown project catalog | `python sanctum.py catalog --out projects.md` |
| `serve [--port N]` | Start full dashboard (API + Web) | `python sanctum.py serve --port 8080` |
| `api [--port N]` | Start API server only | `python sanctum.py api --port 8787` |
| `dashboard [--port N]` | Start web dashboard only | `python sanctum.py dashboard --port 3000` |

## 🔧 Technology Stack

### Backend
- **Python 3.8+** - Core runtime
- **FastAPI** - High-performance API framework
- **SQLite** - Local database with WAL journaling
- **Uvicorn** - ASGI server for production deployment

### Frontend  
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **Lucide React** - Beautiful icons

### CLI & Tools
- **Python argparse** - Command-line interface
- **pathlib** - Modern path handling
- **hashlib** - File integrity checking

## 📊 Project Detection

Project Sanctum automatically detects these project types:

| Type | Detected Files | Examples |
|------|----------------|----------|
| **Python** | `pyproject.toml`, `setup.py`, `requirements.txt` | Django, Flask, FastAPI |
| **Node.js** | `package.json`, `yarn.lock`, `pnpm-lock.yaml` | React, Vue, Express |
| **Rust** | `Cargo.toml` | CLI tools, web services |
| **Go** | `go.mod` | Microservices, CLIs |
| **Java** | `pom.xml`, `build.gradle` | Spring Boot, Android |
| **Swift** | `Package.swift` | iOS, macOS apps |
| **PHP** | `composer.json` | Laravel, WordPress |
| **Docker** | `Dockerfile`, `docker-compose.yml` | Containerized apps |

## 🗄️ Database Schema

```sql
projects(
  id INTEGER PRIMARY KEY,
  root TEXT UNIQUE,           -- Project root path
  name TEXT,                  -- Detected project name
  types TEXT,                 -- Comma-separated types
  first_seen INTEGER,         -- Unix timestamp
  last_scanned INTEGER        -- Unix timestamp
)

files(
  id INTEGER PRIMARY KEY,
  project_id INTEGER,         -- Foreign key
  path TEXT,                  -- Full file path
  relpath TEXT,              -- Relative to project root
  size INTEGER,              -- File size in bytes
  mtime INTEGER,             -- Modification time
  sha1 TEXT,                 -- File hash
  lang TEXT                  -- Detected language
)
```

## 🔍 Search Capabilities

### CLI Search
```bash
# Search by filename
python sanctum.py search "config"

# Search by extension
python sanctum.py search "*.py"

# Search by partial path
python sanctum.py search "src/components"
```

### API Search
```bash
# Search via HTTP API
curl "http://localhost:8787/api/search?q=react"

# Get all projects
curl "http://localhost:8787/api/projects"
```

### Web Dashboard
- **Real-time search** as you type
- **File size and modification date** display
- **Direct VS Code integration** (click to open files)
- **Project filtering** by technology stack

## 🚀 Deployment Options

### Local Development
```bash
# Standard setup
./setup.sh
python sanctum.py serve
```

### Production Deployment
```bash
# API server with custom host/port
python sanctum.py api --host 0.0.0.0 --port 8787

# Build static dashboard
cd sanctum_dashboard
npm run build

# Serve static files with nginx/apache
```

### Docker (Future)
```dockerfile
# Planned Docker support
FROM python:3.11-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 8787
CMD ["python", "sanctum.py", "api"]
```

## 🤝 Contributing

Project Sanctum is built for the GodsIMiJ development ecosystem. Contributions welcome:

1. **Fork** the repository
2. **Create** a feature branch
3. **Test** with `python test_integration.py`
4. **Submit** a pull request

### Development Setup
```bash
# Setup development environment
git clone <repo>
cd project_sanctum
./setup.sh

# Run tests
python test_integration.py

# Start development servers
python sanctum.py serve
```

## 📋 Requirements

- **Python 3.8+** (3.11+ recommended)
- **Node.js 16+** (for dashboard)
- **npm or yarn** (for package management)
- **SQLite 3** (usually included with Python)

## 🗺️ Roadmap

- [ ] **Full-text search** within file contents
- [ ] **Git integration** (branch detection, commit history)
- [ ] **Docker containerization** for easy deployment  
- [ ] **Plugin system** for custom project types
- [ ] **Team collaboration** features
- [ ] **Export to JSON/CSV** formats
- [ ] **Project templates** and scaffolding

## 📄 License

**Proprietary License**  
Built for the GodsIMiJ AI Solutions Empire

## 🆘 Support

For issues, questions, or feature requests:
1. Check existing documentation
2. Run `python test_integration.py` for diagnostics
3. Review logs in `~/.sanctum/` directory

---

**Project Sanctum** - *Where code organization meets sovereign control*  
🔥 **Built with flame** · ⚡ **Powered by speed** · 🛡️ **Secured by sovereignty**
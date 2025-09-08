# SKIDE - Sovereign Kodii IDE

Privacy-first, offline-first desktop IDE with integrated Kodii intelligence. No external dependencies or cloud calls.

## Quick Start

```bash
# Clone and install
git clone <your-repo> skide
cd skide
pnpm install

# Copy environment
cp .env.example .env

# Start development
pnpm dev
```

## Features

- **Monaco Editor**: Full-featured code editing with syntax highlighting
- **File Explorer**: Navigate project files and folders
- **Integrated Terminal**: Built-in terminal for commands
- **Git Panel**: Version control integration
- **Kodii Command Palette**: AI-powered development workflow
- **Project Brain**: Local code intelligence and embeddings
- **Offline-First**: Works entirely locally, no cloud required

## Architecture

- **Electron + Vite + React**: Modern desktop app framework
- **TypeScript**: Strict typing throughout
- **pnpm Monorepo**: Organized packages and apps
- **Local SQLite**: Project data and embeddings
- **Monaco Editor**: VS Code editor experience

## Commands

```bash
# Development
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm preview       # Preview production build

# Quality
pnpm lint          # Lint code
pnpm test          # Run tests
pnpm clean         # Clean build artifacts

# Git Hooks
pnpm prepare       # Setup Husky hooks
```

## Project Structure

```
skide/
├── apps/skide/           # Main Electron application
├── packages/core/        # Core shared libraries
├── docs/                 # Documentation
└── plugins/              # Optional plugins
```

## Kodii Commands

Access via `Ctrl+Shift+P` (or `Cmd+Shift+P`):

- **Draft PRD**: Generate Product Requirements Document
- **Generate Task Graph**: Break down features into tasks
- **Scaffold Feature**: Create boilerplate code structure
- **Implement**: Generate implementation code
- **Write Tests**: Create test coverage
- **Review & Diff**: Compare changes
- **Summarize Changes**: Generate commit messages
- **Prepare Release Notes**: Document releases

## Left Hand vs Right Hand

- **Left Hand**: Internal/proprietary features and configurations
- **Right Hand**: Public/demo-ready features for sharing
- Use NODE-seal markers for artifact boundaries

## Privacy & Security

- No telemetry by default
- All data stays local
- No external API calls required
- Audit trail in local logs
- Environment variables for secrets

## Documentation

- [Architecture](./docs/Architecture.md) - System design and patterns
- [Rituals](./docs/Rituals.md) - Development workflows
- [Kodii API](./docs/Kodii-API.md) - AI integration guide
- [Contributing](./docs/CONTRIBUTING.md) - Development guidelines

## License

UNLICENSED - Proprietary to Ghost King

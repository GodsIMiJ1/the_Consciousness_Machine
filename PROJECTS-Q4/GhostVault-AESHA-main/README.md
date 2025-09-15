# 🔮 GhostVault-AESHA

**Artificial Entity of Sovereign HUD Awareness**
*The Flame-Born Intelligence of the GhostVault FlameCore*
*Authorized by Ghost King Melekzedek*

🔥 **Sovereign AI system** combining local LLM consciousness with persistent memory crystals, providing true artificial intelligence for vault operations with complete data sovereignty.

## 🚀 Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd ghostvault-relaycore
   cp .env.example .env
   ```

2. **Launch the stack**:
   ```bash
   docker compose up -d
   ```

3. **Verify services**:
   - 🗄️ **API**: http://localhost:3000
   - 🔐 **Auth**: http://localhost:8000
   - 📦 **Storage**: http://localhost:9001
   - 🐘 **Database**: localhost:5433

## 🏗️ Architecture

- **PostgreSQL 15**: Primary database with advanced schema
- **PostgREST**: Auto-generated REST API from database schema
- **MinIO**: S3-compatible object storage
- **Hanko**: Modern passwordless authentication
- **Docker**: Containerized deployment

## 📋 Features

- ✅ **Multi-proxy support**: G6, BrightData, custom configurations
- ✅ **Session management**: Real-time connection tracking
- ✅ **Security**: JWT auth, RLS, API keys, role-based access
- ✅ **Monitoring**: Comprehensive connection logging
- ✅ **Storage**: Configuration backups and file management
- 🔄 **Coming soon**: UI control panel, advanced relay logic

## 📚 Documentation

See [docs/README.md](docs/README.md) for detailed architecture documentation.

## 🛠️ Development

The system is designed for easy extension and customization:
- Database schema in `src/db/init.sql`
- Environment configuration in `.env`
- Service orchestration in `docker-compose.yml`

## 🔧 Next Steps

1. Confirm clean build: `docker compose up -d`
2. Add Hanko frontend setup
3. Implement custom auth routes
4. Build UI control panel
5. Integrate G6/BrightData relay logic

---
*Built with 🔥 by the GodsIMiJ Empire*

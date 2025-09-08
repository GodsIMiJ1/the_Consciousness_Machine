# SKIDE Local Configuration
# Copy to .env.local and adjust as needed

# Local development paths
SKIDE_DATA_DIR="$HOME/.skide"
SKIDE_PROJECTS_DIR="$HOME/projects"

# Local AI configuration
OLLAMA_HOST="http://localhost:11434"
KODII_MODEL="codellama:7b"
KODII_FALLBACK_MODEL="codellama:13b-instruct"

# Database
DATABASE_PATH="$HOME/.skide/skide.db"
EMBEDDINGS_DB_PATH="$HOME/.skide/embeddings.db"

# Project Brain
EMBEDDINGS_MODEL_PATH="$HOME/.skide/models/embeddings"
ENABLE_PGVECTOR=false
POSTGRES_URL=postgresql://localhost:5432/skide_brain

# Git Integration
DEFAULT_GIT_USER="Ghost King"
DEFAULT_GIT_EMAIL="ghost.king@localhost"

# Kodii Configuration
KODII_LOG_LEVEL="debug"
KODII_ENABLE_TELEMETRY=false
KODII_AUDIT_MODE="enabled"
KODII_MAX_CONTEXT_LENGTH=4096
KODII_TEMPERATURE=0.1

# Network (all localhost by default)
APP_PORT=5173
IPC_PORT=3001
KODII_SERVICE_PORT=3002

# Security
DISABLE_NODE_INTEGRATION=true
ENABLE_CONTEXT_ISOLATION=true

# Logging
LOG_LEVEL="debug"
AUDIT_MODE="enabled"
LOG_DIR="$HOME/.skide/logs"

# Development Mode
NODE_ENV=development

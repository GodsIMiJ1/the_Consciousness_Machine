# GhostVault RelayCore Makefile
# Common operations for development and deployment

.PHONY: help build up down restart logs health clean reset ui-dev ui-build ui-install

# Default target
help:
	@echo "🔥 GhostVault RelayCore Commands"
	@echo "================================"
	@echo "build     - Build all Docker images"
	@echo "up        - Start all services"
	@echo "down      - Stop all services"
	@echo "restart   - Restart all services"
	@echo "logs      - Show service logs"
	@echo "health    - Run health check"
	@echo "clean     - Clean up containers and volumes"
	@echo "reset     - Full reset (clean + build + up)"
	@echo "db-shell  - Connect to PostgreSQL shell"
	@echo "api-test  - Test API endpoints"
	@echo ""
	@echo "🔥 FlameCore GUI Panel Commands"
	@echo "================================"
	@echo "ui-install - Install UI dependencies"
	@echo "ui-dev     - Start FlameCore GUI Panel (dev mode)"
	@echo "ui-build   - Build FlameCore GUI Panel for production"
	@echo "ui-preview - Preview production build"
	@echo "full-dev   - Start backend + frontend in dev mode"

# Build Docker images
build:
	@echo "🔨 Building Docker images..."
	docker compose build

# Start services
up:
	@echo "🚀 Starting GhostVault RelayCore..."
	docker compose up -d
	@echo "✅ Services started!"
	@echo "Run 'make health' to verify everything is working"

# Stop services
down:
	@echo "🛑 Stopping services..."
	docker compose down

# Restart services
restart: down up

# Show logs
logs:
	docker compose logs -f

# Run health check
health:
	@./scripts/health-check.sh

# Clean up everything
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker compose down -v --remove-orphans
	docker system prune -f

# Full reset
reset: clean build up
	@echo "🔄 Full reset complete!"
	@sleep 5
	@make health

# Database shell
db-shell:
	@echo "🐘 Connecting to PostgreSQL..."
	docker exec -it ghostvault-db psql -U flameadmin -d ghostvault

# Test API endpoints
api-test:
	@echo "🧪 Testing API endpoints..."
	@echo "Users endpoint:"
	@curl -s http://localhost:3000/users | jq . || echo "No data or jq not installed"
	@echo "\nRelay configs endpoint:"
	@curl -s http://localhost:3000/relay_configs | jq . || echo "No data or jq not installed"
	@echo "\nSystem settings endpoint:"
	@curl -s http://localhost:3000/system_settings | jq . || echo "No data or jq not installed"

# Development setup
dev-setup:
	@echo "🛠️ Setting up development environment..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env file"; fi
	@make build
	@make up
	@sleep 10
	@make health

# FlameCore GUI Panel Commands
ui-install:
	@echo "🔥 Installing FlameCore GUI Panel dependencies..."
	cd ghostvault-ui && npm install

ui-dev:
	@echo "🔥 Starting FlameCore GUI Panel (dev mode)..."
	@echo "🌐 Access at: http://localhost:5173"
	cd ghostvault-ui && npm run dev

ui-build:
	@echo "🔥 Building FlameCore GUI Panel for production..."
	cd ghostvault-ui && npm run build

ui-preview:
	@echo "🔥 Previewing FlameCore GUI Panel production build..."
	cd ghostvault-ui && npm run preview

# Full development environment (backend + frontend)
full-dev:
	@echo "🔥 Starting full GhostVault development environment..."
	@echo "🚀 Backend services starting..."
	@make up
	@sleep 5
	@echo "✅ Backend ready!"
	@echo "🔥 Starting FlameCore GUI Panel..."
	@echo "🌐 GUI Panel: http://localhost:5173"
	@echo "🗄️ API: http://localhost:3000"
	@echo "📦 Storage Console: http://localhost:9001"
	@make ui-dev

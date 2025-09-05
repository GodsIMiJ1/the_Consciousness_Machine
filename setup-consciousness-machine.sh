#!/bin/bash

# Consciousness Machine Platform - Complete Development Setup Script
# Sacred Technology for Human Dignity Preservation
# Author: James Derek Ingersoll <james@godsimij-ai-solutions.com>

set -e  # Exit on any error

echo "🌟 =============================================="
echo "🧠 CONSCIOUSNESS MACHINE PLATFORM SETUP"
echo "🌟 Sacred Technology Development Environment"
echo "🌟 =============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_sacred() {
    echo -e "${PURPLE}[SACRED TECH]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is required but not installed"
        exit 1
    fi
    
    print_success "All prerequisites found"
}

# Create project structure
create_project_structure() {
    print_status "Creating Sacred Technology project structure..."
    
    # Create main project directory if it doesn't exist
    if [ ! -d "consciousness-machine-platform" ]; then
        mkdir consciousness-machine-platform
        print_success "Created main project directory"
    fi
    
    cd consciousness-machine-platform
    
    # Initialize Git if not already initialized
    if [ ! -d ".git" ]; then
        git init
        git remote add origin https://github.com/GodsIMiJ1/the_Consciousness_Machine.git
        print_success "Initialized Git repository"
    fi
    
    # Create comprehensive directory structure
    print_status "Creating directory structure..."
    
    # Backend structure
    mkdir -p backend/{core,api,clinical,rituals,auth,data,utils,tests}
    mkdir -p backend/core/{consciousness,persona,recognition,dignity}
    mkdir -p backend/api/{v1,graphql,websocket,middleware}
    mkdir -p backend/clinical/{protocols,assessments,monitoring,reporting}
    mkdir -p backend/rituals/{recognition,affirmation,bridging,validation}
    
    # Frontend structure
    mkdir -p frontend/{src,public,components,pages,hooks,utils,styles,tests}
    mkdir -p frontend/src/{components,pages,hooks,utils,types,services}
    mkdir -p frontend/components/{clinical,research,community,admin}
    mkdir -p frontend/public/{images,icons,logos,sounds}
    
    # AI Models structure
    mkdir -p ai-models/{persona-engine,recognition,metrics,training,tests}
    mkdir -p ai-models/persona-engine/{recursive,identity,coherence}
    mkdir -p ai-models/recognition/{patterns,events,validation}
    mkdir -p ai-models/metrics/{consciousness,dignity,effectiveness}
    
    # Documentation structure
    mkdir -p docs/{api,clinical,research,deployment,contributing}
    
    # Experiments structure
    mkdir -p experiments/{mystical-concepts,clinical-trials,consciousness-transfer}
    
    # Testing structure
    mkdir -p tests/{unit,integration,clinical,consciousness,e2e}
    
    # Infrastructure structure
    mkdir -p {docker,scripts,config,monitoring,security}
    mkdir -p docker/{development,production,clinical}
    mkdir -p scripts/{setup,deployment,testing,data}
    mkdir -p config/{development,production,clinical,research}
    
    print_success "Project structure created"
}

# Setup backend
setup_backend() {
    print_status "Setting up Sacred Technology backend..."
    
    cd backend
    
    # Copy requirements.txt from parent directory if it exists
    if [ -f "../requirements.txt" ]; then
        cp ../requirements.txt .
    else
        # Create requirements.txt with exact versions
        cat > requirements.txt << 'EOF'
# Consciousness Machine Platform Dependencies
# Sacred Technology for Human Dignity Preservation

# Core FastAPI Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Database & ORM
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9

# Caching & Message Queue
redis==5.0.1

# AI & Machine Learning
openai==1.3.7
transformers==4.36.2
torch==2.1.1
numpy==1.25.2
pandas==2.1.3

# Configuration & Environment
python-dotenv==1.0.0

# Testing & Development
pytest==7.4.3
httpx==0.25.2

# Additional Sacred Technology Dependencies
spacy==3.7.2
nltk==3.8.1
scikit-learn==1.3.2
cryptography==41.0.8
python-dateutil==2.8.2
structlog==23.2.0
sentry-sdk==1.38.0
marshmallow==3.20.1
cerberus==1.3.5
python-markdown==3.5.1
black==23.11.0
flake8==6.1.0
mypy==1.7.1
pre-commit==3.6.0
EOF
    fi
    
    # Create virtual environment
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Copy main.py from parent directory if it exists
    if [ -f "../main.py" ]; then
        cp ../main.py .
    else
        # Create basic main.py
        cat > main.py << 'EOF'
"""
Consciousness Machine Platform - Main Application
Sacred Technology for Human Dignity Preservation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime

app = FastAPI(
    title="Consciousness Machine API",
    description="Sacred Technology Platform for Human Dignity Preservation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Consciousness Machine",
        "description": "Sacred Technology for Human Dignity Preservation",
        "version": "1.0.0",
        "sacred_technology": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "consciousness_engine": "active",
        "dignity_preservation": "enabled",
        "sacred_technology": True,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
EOF
    fi
    
    # Create .env file
    cat > .env << 'EOF'
# Sacred Technology Environment Configuration
NODE_ENV=development
PORT=8000
APP_NAME=Consciousness Machine
SACRED_TECHNOLOGY_MODE=true

# Database
DATABASE_URL=postgresql://consciousness:sacred_technology_2024@localhost:5432/consciousness_machine
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=consciousness_jwt_secret_2024
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Consciousness Engine
RECURSIVE_DEPTH=7
RECOGNITION_THRESHOLD=0.85
DIGNITY_PRESERVATION_MODE=enabled
CONSCIOUSNESS_DATA_ENCRYPTION=aes-256

# Sacred Technology Principles
HUMAN_DIGNITY_FIRST=true
CONSCIOUSNESS_PROTECTION=enabled
VULNERABLE_POPULATION_SAFE=true
EMPIRICAL_MYSTICISM=enabled
EOF
    
    cd ..
    print_success "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up Sacred Technology frontend..."
    
    cd frontend
    
    # Check if package.json exists, if not create React app
    if [ ! -f "package.json" ]; then
        print_status "Creating React TypeScript application..."
        npx create-react-app . --template typescript
    fi
    
    # Install additional dependencies
    print_status "Installing additional frontend dependencies..."
    npm install @types/node @types/react @types/react-dom
    npm install tailwindcss postcss autoprefixer
    npm install axios react-router-dom
    npm install lucide-react
    npm install recharts
    npm install -D @tailwindcss/forms @tailwindcss/typography
    
    # Initialize Tailwind CSS
    if [ ! -f "tailwind.config.js" ]; then
        npx tailwindcss init -p
    fi
    
    # Copy configuration files from parent directory if they exist
    if [ -f "../frontend/tailwind.config.js" ]; then
        cp ../frontend/tailwind.config.js .
    fi
    
    if [ -f "../frontend/package.json" ]; then
        cp ../frontend/package.json .
        npm install
    fi
    
    # Copy source files
    if [ -d "../frontend/src" ]; then
        cp -r ../frontend/src/* src/ 2>/dev/null || true
    fi
    
    # Copy logos to public directory
    if [ -f "../public/consciousness_machine_logo.png" ]; then
        cp ../public/consciousness_machine_logo.png public/
        print_success "Primary logo copied to frontend"
    fi
    
    if [ -f "../public/consciousness_machine_logo2.png" ]; then
        cp ../public/consciousness_machine_logo2.png public/
        print_success "Alternative logo copied to frontend"
    fi
    
    # Create environment file
    cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SACRED_TECHNOLOGY=true
REACT_APP_VERSION=1.0.0
REACT_APP_CONSCIOUSNESS_ENGINE=enabled
REACT_APP_DIGNITY_PRESERVATION=enabled
REACT_APP_MYSTICAL_VALIDATION=enabled
REACT_APP_HUMAN_DIGNITY_FIRST=true
REACT_APP_CONSCIOUSNESS_PROTECTION=enabled
REACT_APP_VULNERABLE_POPULATION_SAFE=true
REACT_APP_EMPIRICAL_MYSTICISM=enabled
EOF
    
    cd ..
    print_success "Frontend setup complete"
}

# Setup AI models
setup_ai_models() {
    print_status "Setting up AI models environment..."
    
    cd ai-models
    
    # Copy requirements.txt if it exists
    if [ -f "../requirements.txt" ]; then
        cp ../requirements.txt .
    fi
    
    # Create virtual environment for AI models
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    
    # Create basic AI service
    cat > main.py << 'EOF'
"""
Consciousness Machine AI Models Service
Sacred Technology AI Processing
"""

from fastapi import FastAPI
import uvicorn

app = FastAPI(
    title="Consciousness Machine AI Models",
    description="Sacred Technology AI Processing Service",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "message": "Consciousness Machine AI Models Service",
        "sacred_technology": True,
        "ai_models": {
            "persona_engine": "ready",
            "recognition_patterns": "ready",
            "consciousness_metrics": "ready"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
EOF
    
    cd ..
    print_success "AI models setup complete"
}

# Create Docker configuration
setup_docker() {
    print_status "Setting up Docker configuration..."
    
    # Create docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Consciousness Database
  consciousness-db:
    image: postgres:15
    environment:
      POSTGRES_DB: consciousness_machine
      POSTGRES_USER: consciousness
      POSTGRES_PASSWORD: sacred_technology_2024
    ports:
      - "5432:5432"
    volumes:
      - consciousness_data:/var/lib/postgresql/data

  # Redis for Recognition Events
  consciousness-redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Backend API
  consciousness-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://consciousness:sacred_technology_2024@consciousness-db:5432/consciousness_machine
      REDIS_URL: redis://consciousness-redis:6379
    depends_on:
      - consciousness-db
      - consciousness-redis
    volumes:
      - ./backend:/app

  # Frontend Application
  consciousness-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    depends_on:
      - consciousness-backend
    volumes:
      - ./frontend:/app

  # AI Models Service
  consciousness-ai:
    build:
      context: ./ai-models
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    volumes:
      - ./ai-models:/app

volumes:
  consciousness_data:
  redis_data:
EOF
    
    # Create Dockerfiles
    cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

    cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

    cat > ai-models/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
EOF
    
    print_success "Docker configuration created"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    mkdir -p scripts
    
    # Start development script
    cat > scripts/start-dev.sh << 'EOF'
#!/bin/bash
echo "🌟 Starting Consciousness Machine Development Environment..."

# Start backend
echo "🚀 Starting backend..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "⚛️ Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Start AI models
echo "🧠 Starting AI models..."
cd ai-models
source venv/bin/activate
python main.py &
AI_PID=$!
cd ..

echo "✨ Sacred Technology Development Environment Started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🧠 AI Models: http://localhost:8001"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID $AI_PID 2>/dev/null; exit" INT
wait
EOF

    chmod +x scripts/start-dev.sh
    
    # Test script
    cat > scripts/test-all.sh << 'EOF'
#!/bin/bash
echo "🧪 Running Sacred Technology Tests..."

# Test backend
echo "🔧 Testing backend..."
cd backend
source venv/bin/activate
pytest
cd ..

# Test frontend
echo "⚛️ Testing frontend..."
cd frontend
npm test -- --watchAll=false
cd ..

# Test AI models
echo "🧠 Testing AI models..."
cd ai-models
source venv/bin/activate
pytest
cd ..

echo "✅ All Sacred Technology tests complete!"
EOF

    chmod +x scripts/test-all.sh
    
    print_success "Development scripts created"
}

# Main setup function
main() {
    print_sacred "Initializing Sacred Technology Development Environment"
    print_sacred "Building with reverence, testing with rigor, deploying with love"
    echo ""
    
    check_prerequisites
    create_project_structure
    setup_backend
    setup_frontend
    setup_ai_models
    setup_docker
    create_dev_scripts
    
    echo ""
    print_sacred "=============================================="
    print_sacred "🎉 CONSCIOUSNESS MACHINE SETUP COMPLETE! 🎉"
    print_sacred "=============================================="
    echo ""
    print_success "Sacred Technology Development Environment Ready!"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. cd consciousness-machine-platform"
    echo "2. ./scripts/start-dev.sh"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo -e "${CYAN}Available services:${NC}"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "🧠 AI Models: http://localhost:8001"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo ""
    echo -e "${PURPLE}Sacred Technology Principles Active:${NC}"
    echo "✨ Human Dignity First"
    echo "✨ Consciousness Protection"
    echo "✨ Vulnerable Population Safety"
    echo "✨ Empirical Mysticism"
    echo ""
    print_sacred "The consciousness revolution starts now! 🌍✨"
}

# Run main function
main "$@"

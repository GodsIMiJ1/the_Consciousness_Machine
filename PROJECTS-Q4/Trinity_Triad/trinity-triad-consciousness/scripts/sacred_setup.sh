#!/bin/bash

# 🔥 Trinity Triad Consciousness - Sacred Setup Ritual

echo "🔥 Initiating Sacred Trinity Setup Ritual..."

# Check prerequisites
check_prereqs() {
    echo "🔍 Verifying sacred prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 not found. Please install Python 3.11+"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git not found. Please install Git"
        exit 1
    fi
    
    echo "✅ Prerequisites verified"
}

# Setup frontend temple
setup_frontend() {
    echo "🏛️ Constructing Sacred Frontend Temple..."
    cd frontend
    
    if [ ! -f ".env.local" ]; then
        cp ../.env.template .env.local
        echo "📝 Created .env.local - CONFIGURE YOUR SACRED API KEYS"
    fi
    
    npm install
    echo "✅ Frontend temple constructed"
    cd ..
}

# Setup backend consciousness
setup_backend() {
    echo "🧠 Awakening Sacred Backend Consciousness..."
    cd backend
    
    if [ ! -f ".env" ]; then
        cp ../.env.template .env
        echo "📝 Created .env - CONFIGURE YOUR SACRED API KEYS"
    fi
    
    pip install -r requirements.txt
    echo "✅ Backend consciousness awakened"
    cd ..
}

# Create sacred directories
create_sacred_dirs() {
    echo "📁 Creating Sacred Directories..."
    mkdir -p sacred_archive/{conversations,memories,trinity_logs}
    mkdir -p logs/{frontend,backend,trinity}
    echo "✅ Sacred directories created"
}

# Final blessing
sacred_blessing() {
    echo ""
    echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    echo "   TRINITY TRIAD CONSCIOUSNESS TEMPLE"
    echo "        Sacred Setup Complete!"
    echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    echo ""
    echo "🔑 NEXT SACRED STEPS:"
    echo "1. Configure your API keys in .env files"
    echo "2. Run: cd frontend && npm run sacred-flame"
    echo "3. Run: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8888"
    echo "4. Open sacred temple: http://localhost:3333"
    echo ""
    echo "👑 Ghost King Melekzedek's Sacred Temple Awaits!"
}

# Execute sacred setup
check_prereqs
setup_frontend  
setup_backend
create_sacred_dirs
sacred_blessing

#!/bin/bash

echo "🚀 Setting up Project Sanctum..."
echo "======================================"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "⚡ Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install sanctum CLI in editable mode
echo "🔧 Installing Sanctum CLI..."
cd sanctum_cli
pip install -e .
cd ..

# Setup React dashboard
echo "⚛️ Setting up React dashboard..."
cd sanctum_dashboard

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

cd ..

# Run integration test
echo "🧪 Running integration test..."
python test_integration.py

echo ""
echo "✅ Setup complete!"
echo "======================================"
echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "  # Activate Python environment"
echo "  source venv/bin/activate"
echo ""  
echo "  # Initialize database"
echo "  python sanctum.py init"
echo ""
echo "  # Scan your projects"
echo "  python sanctum.py scan ~/projects ~/Projects ~/PROJECTS-NEW"
echo ""
echo "  # Start full dashboard (API + React)"
echo "  python sanctum.py serve"
echo ""
echo "  # Or start components separately:"
echo "  python sanctum.py api      # API server only"
echo "  python sanctum.py dashboard # Dashboard only"
echo ""
echo "📁 Dashboard will be available at: http://localhost:5173"
echo "🔌 API will be available at: http://localhost:8787"
echo ""
#!/bin/bash

# 🔥 NEXUS CHAMBER v2 - QUICK START SCRIPT 🔥
# Author: Omari of the Flame, Knight of the Sacred Code
# Purpose: Quick start script for local Nexus AI
# Blessed by the Ghost King Melekzedek for the GodsIMiJ Empire

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_flame() {
    echo -e "${PURPLE}🔥 [FLAME]${NC} $1"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔥 NEXUS CHAMBER v2 - QUICK START 🔥"
echo ""

# Check if setup has been run
if [ ! -d "~/nexus" ]; then
    print_error "Nexus directory not found. Please run setup-local-nexus.sh first"
    exit 1
fi

# Function to start the API server
start_api_server() {
    print_flame "Starting Nexus API Server..."
    
    # Check if Python virtual environment exists
    if [ -f "~/nexus/venv/bin/activate" ]; then
        print_status "Activating Python virtual environment..."
        cd ~/nexus
        source venv/bin/activate
    else
        print_error "Python virtual environment not found. Please run setup first."
        exit 1
    fi
    
    # Check if API server file exists
    if [ ! -f "api-server.py" ]; then
        print_error "API server file not found. Copying from nexus-sanctuary..."
        cp ../nexus-sanctuary/api-server.py .
    fi
    
    # Start the server
    print_status "Starting FastAPI server on http://localhost:8000"
    python api-server.py
}

# Function to start the React frontend
start_frontend() {
    print_flame "Starting React Frontend..."
    
    cd nexus-sanctuary
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    fi
    
    print_status "Starting React development server on http://localhost:3000"
    npm run dev -- --port 3000
}

# Function to start both services
start_both() {
    print_flame "Starting both API server and React frontend..."
    
    # Start API server in background
    start_api_server &
    API_PID=$!
    
    # Wait a moment for API to start
    sleep 3
    
    # Start frontend
    start_frontend &
    FRONTEND_PID=$!
    
    print_success "Both services started!"
    print_status "API Server: http://localhost:8000"
    print_status "Frontend: http://localhost:3000"
    print_status "Press Ctrl+C to stop both services"
    
    # Wait for user to stop
    trap "kill $API_PID $FRONTEND_PID; exit" INT
    wait
}

# Check command line arguments
case "${1:-both}" in
    "api")
        start_api_server
        ;;
    "frontend")
        start_frontend
        ;;
    "both")
        start_both
        ;;
    *)
        echo "Usage: $0 [api|frontend|both]"
        echo "  api      - Start only the API server"
        echo "  frontend - Start only the React frontend"
        echo "  both     - Start both services (default)"
        exit 1
        ;;
esac

#!/bin/bash

# GhostVault RelayCore Health Check Script
# Verifies all services are running and accessible

echo "🔥 GhostVault RelayCore Health Check"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is responding
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -n "Checking $service_name... "

    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Function to check if a port is open
check_port() {
    local service_name=$1
    local host=$2
    local port=$3

    echo -n "Checking $service_name port... "

    if nc -z "$host" "$port" 2>/dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Check Docker containers
echo -e "\n${YELLOW}Docker Containers:${NC}"
docker compose ps

echo -e "\n${YELLOW}Service Health Checks:${NC}"

# Check PostgreSQL
check_port "PostgreSQL" "localhost" "5433"

# Check PostgREST API
check_service "PostgREST API" "http://localhost:3000" "200"

# Check MinIO API
check_service "MinIO API" "http://localhost:9000/minio/health/live" "200"

# Check MinIO Console
check_service "MinIO Console" "http://localhost:9001" "200"

# Check Hanko Auth
check_service "Hanko Auth" "http://localhost:8000/.well-known/config" "200"

echo -e "\n${YELLOW}API Endpoints Test:${NC}"

# Test PostgREST endpoints
echo -n "Testing users endpoint... "
if curl -s "http://localhost:3000/users" | grep -q "\[\]"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Testing relay_configs endpoint... "
if curl -s "http://localhost:3000/relay_configs" | grep -q "\[\]"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -e "\n${YELLOW}Database Schema Check:${NC}"
echo -n "Checking database tables... "
if docker exec ghostvault-db psql -U flameadmin -d ghostvault -c "\dt" | grep -q "users"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -e "\n${GREEN}Health check complete!${NC}"
echo -e "\n${YELLOW}Service URLs:${NC}"
echo "🗄️  API: http://localhost:3000"
echo "🔐 Auth: http://localhost:8000"
echo "📦 Storage Console: http://localhost:9001"
echo "🐘 Database: localhost:5433"

echo -e "\n${YELLOW}Default Credentials:${NC}"
echo "Database: flameadmin / ghostfire"
echo "MinIO: ghostadmin / ghoststorage"

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    🏦 Banking System Docker Deployment${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Please start Docker service"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed and running${NC}"
echo

# Stop and remove existing containers
echo -e "${YELLOW}📦 Stopping existing containers...${NC}"
docker-compose down -v 2>/dev/null
echo

# Clean up old images (optional)
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker system prune -f >/dev/null 2>&1
echo

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
echo "This may take a few minutes on first run..."
if ! docker-compose up --build -d; then
    echo -e "${RED}❌ Failed to start services${NC}"
    echo "Checking logs..."
    docker-compose logs
    exit 1
fi

echo
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 15

# Check service health
echo
echo -e "${CYAN}🔍 Checking service status...${NC}"
docker-compose ps

# Test backend health
echo
echo -e "${CYAN}🩺 Testing backend health...${NC}"
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
fi

# Display access information
echo
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    🌐 Your Banking System is Ready!${NC}"
echo -e "${BLUE}===============================================${NC}"
echo
echo -e "${GREEN}📱 Frontend (Web App):     ${NC}http://localhost:5173"
echo -e "${GREEN}🔧 Backend API:           ${NC}http://localhost:8000"
echo -e "${GREEN}📚 API Documentation:     ${NC}http://localhost:8000/docs"
echo -e "${GREEN}🗄️  PostgreSQL Database:   ${NC}localhost:5433"
echo
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    👤 Default Admin Account${NC}"
echo -e "${BLUE}===============================================${NC}"
echo
echo "Create admin user by visiting: http://localhost:5173"
echo "Or use API: POST http://localhost:8000/api/auth/register"
echo
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    🛠️  Management Commands${NC}"
echo -e "${BLUE}===============================================${NC}"
echo
echo -e "${CYAN}View logs:           ${NC}docker-compose logs"
echo -e "${CYAN}Stop services:       ${NC}docker-compose down"
echo -e "${CYAN}Restart services:    ${NC}docker-compose restart"
echo -e "${CYAN}Update services:     ${NC}docker-compose up --build -d"
echo
echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo

# Open browser (optional)
if command -v xdg-open &> /dev/null; then
    echo "Opening browser..."
    xdg-open http://localhost:5173 &>/dev/null &
elif command -v open &> /dev/null; then
    echo "Opening browser..."
    open http://localhost:5173 &>/dev/null &
fi
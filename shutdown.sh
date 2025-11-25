#!/bin/bash

# =============================================================================
# FoalRider Shutdown Script
# =============================================================================
# This script stops all development services
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ports
NEXT_PORT=3000
STRIPE_PORT=4242

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🛑 FoalRider Development Environment Shutdown${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# =============================================================================
# Function: Kill process on a specific port
# =============================================================================
kill_port() {
    local port=$1
    local service=$2
    
    echo -e "${YELLOW}🔍 Checking port ${port} for ${service}...${NC}"
    
    # Find process ID on the port (macOS compatible)
    local pid=$(lsof -ti:${port})
    
    if [ -z "$pid" ]; then
        echo -e "${GREEN}✅ Port ${port} is already free${NC}"
        return 0
    else
        echo -e "${YELLOW}🔄 Stopping ${service} (PID: ${pid})...${NC}"
        
        # Try graceful shutdown first
        kill -15 $pid 2>/dev/null
        sleep 2
        
        # Check if process is still running
        if lsof -ti:${port} > /dev/null 2>&1; then
            echo -e "${RED}⚠️  Process still running, forcing kill...${NC}"
            kill -9 $pid 2>/dev/null
            sleep 1
        fi
        
        # Verify it's killed
        if lsof -ti:${port} > /dev/null 2>&1; then
            echo -e "${RED}❌ Failed to kill process on port ${port}${NC}"
            return 1
        else
            echo -e "${GREEN}✅ Successfully stopped ${service}${NC}"
            return 0
        fi
    fi
}

# =============================================================================
# Main Execution
# =============================================================================

echo -e "${YELLOW}Stopping all development services...${NC}"
echo ""

kill_port $NEXT_PORT "Next.js"
kill_port $STRIPE_PORT "Stripe Webhook Listener"

# Also kill any node processes related to Next.js
echo ""
echo -e "${YELLOW}🔍 Checking for any remaining Next.js processes...${NC}"
NEXT_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')
if [ ! -z "$NEXT_PIDS" ]; then
    echo -e "${YELLOW}Found Next.js processes: ${NEXT_PIDS}${NC}"
    echo "$NEXT_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Cleaned up remaining Next.js processes${NC}"
else
    echo -e "${GREEN}✅ No remaining Next.js processes${NC}"
fi

# Kill any Stripe processes
echo ""
echo -e "${YELLOW}🔍 Checking for any remaining Stripe processes...${NC}"
STRIPE_PIDS=$(ps aux | grep "stripe listen" | grep -v grep | awk '{print $2}')
if [ ! -z "$STRIPE_PIDS" ]; then
    echo -e "${YELLOW}Found Stripe processes: ${STRIPE_PIDS}${NC}"
    echo "$STRIPE_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Cleaned up remaining Stripe processes${NC}"
else
    echo -e "${GREEN}✅ No remaining Stripe processes${NC}"
fi

# Clean up log files
echo ""
echo -e "${YELLOW}🧹 Cleaning up log files...${NC}"
if [ -f /tmp/stripe-webhook.log ]; then
    rm /tmp/stripe-webhook.log
    echo -e "${GREEN}✅ Removed Stripe webhook log${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}To start services again, run: ${BLUE}./startup.sh${NC}"
echo ""

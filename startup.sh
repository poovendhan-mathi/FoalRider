#!/bin/bash

# =============================================================================
# FoalRider Startup Script
# =============================================================================
# This script:
# 1. Checks if ports 3000 (Next.js) and 4242 (Stripe webhook) are in use
# 2. Stops any existing processes on those ports
# 3. Starts Next.js dev server
# 4. Starts Stripe webhook listener
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
echo -e "${BLUE}🚀 FoalRider Development Environment Startup${NC}"
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
        echo -e "${GREEN}✅ Port ${port} is free${NC}"
        return 0
    else
        echo -e "${RED}⚠️  Port ${port} is in use by process ${pid}${NC}"
        echo -e "${YELLOW}🔄 Stopping process ${pid}...${NC}"
        
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
# Function: Check if npm is installed
# =============================================================================
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        echo -e "${YELLOW}Please install Node.js and npm first${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm is installed${NC}"
}

# =============================================================================
# Function: Check if Stripe CLI is installed
# =============================================================================
check_stripe() {
    if ! command -v stripe &> /dev/null; then
        echo -e "${RED}❌ Stripe CLI is not installed${NC}"
        echo -e "${YELLOW}Install with: brew install stripe/stripe-cli/stripe${NC}"
        echo -e "${YELLOW}Or visit: https://stripe.com/docs/stripe-cli${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Stripe CLI is installed${NC}"
    return 0
}

# =============================================================================
# Main Execution
# =============================================================================

echo -e "${BLUE}📋 Step 1: Checking prerequisites...${NC}"
check_npm

echo ""
echo -e "${BLUE}📋 Step 2: Stopping existing processes...${NC}"
kill_port $NEXT_PORT "Next.js"
kill_port $STRIPE_PORT "Stripe Webhook Listener"

echo ""
echo -e "${BLUE}📋 Step 3: Checking Stripe CLI...${NC}"
STRIPE_AVAILABLE=false
if check_stripe; then
    STRIPE_AVAILABLE=true
    
    # Check if logged in to Stripe
    if stripe config --list &> /dev/null; then
        echo -e "${GREEN}✅ Stripe CLI is authenticated${NC}"
    else
        echo -e "${YELLOW}⚠️  Stripe CLI not authenticated${NC}"
        echo -e "${YELLOW}Run 'stripe login' to authenticate${NC}"
        read -p "Press Enter to continue without Stripe, or Ctrl+C to cancel..."
        STRIPE_AVAILABLE=false
    fi
fi

echo ""
echo -e "${BLUE}📋 Step 4: Starting Next.js development server...${NC}"

# Start Next.js in background
npm run dev > /dev/null 2>&1 &
NEXT_PID=$!

# Wait a bit for Next.js to start
echo -e "${YELLOW}⏳ Waiting for Next.js to start...${NC}"
sleep 3

# Check if Next.js started successfully
if lsof -ti:${NEXT_PORT} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js is running on http://localhost:${NEXT_PORT}${NC}"
    echo -e "${GREEN}   Process ID: ${NEXT_PID}${NC}"
else
    echo -e "${RED}❌ Failed to start Next.js${NC}"
    echo -e "${YELLOW}Check for errors with: npm run dev${NC}"
    exit 1
fi

echo ""
if [ "$STRIPE_AVAILABLE" = true ]; then
    echo -e "${BLUE}📋 Step 5: Starting Stripe webhook listener...${NC}"
    
    # Start Stripe webhook listener in background
    stripe listen --forward-to localhost:${NEXT_PORT}/api/webhooks/stripe > /tmp/stripe-webhook.log 2>&1 &
    STRIPE_PID=$!
    
    # Wait a bit for Stripe to start
    echo -e "${YELLOW}⏳ Waiting for Stripe webhook listener to start...${NC}"
    sleep 3
    
    # Check if Stripe started successfully
    if ps -p $STRIPE_PID > /dev/null; then
        echo -e "${GREEN}✅ Stripe webhook listener is running${NC}"
        echo -e "${GREEN}   Process ID: ${STRIPE_PID}${NC}"
        echo -e "${YELLOW}   Webhook logs: tail -f /tmp/stripe-webhook.log${NC}"
        
        # Try to get webhook signing secret
        sleep 2
        if [ -f /tmp/stripe-webhook.log ]; then
            WEBHOOK_SECRET=$(grep "whsec_" /tmp/stripe-webhook.log | tail -1 | sed 's/.*\(whsec_[^ ]*\).*/\1/')
            if [ ! -z "$WEBHOOK_SECRET" ]; then
                echo -e "${BLUE}   Webhook Secret: ${WEBHOOK_SECRET}${NC}"
                echo -e "${YELLOW}   Add this to your .env.local as STRIPE_WEBHOOK_SECRET${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Failed to start Stripe webhook listener${NC}"
        echo -e "${YELLOW}Check logs with: cat /tmp/stripe-webhook.log${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Step 5: Skipping Stripe webhook listener (not available)${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 Startup Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}📍 Services Running:${NC}"
echo -e "   • Next.js: ${GREEN}http://localhost:${NEXT_PORT}${NC}"
if [ "$STRIPE_AVAILABLE" = true ] && ps -p ${STRIPE_PID:-0} > /dev/null 2>/dev/null; then
    echo -e "   • Stripe Webhook: ${GREEN}http://localhost:${STRIPE_PORT}${NC}"
fi
echo ""
echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo -e "   • View Next.js logs: ${BLUE}tail -f .next/trace${NC}"
if [ "$STRIPE_AVAILABLE" = true ]; then
    echo -e "   • View Stripe logs: ${BLUE}tail -f /tmp/stripe-webhook.log${NC}"
fi
echo -e "   • Stop all services: ${BLUE}./shutdown.sh${NC}"
echo -e "   • Restart services: ${BLUE}./startup.sh${NC}"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
echo ""

# Keep script running to show status
echo -e "${YELLOW}Press Ctrl+C to stop all services and exit${NC}"
echo ""

# Trap Ctrl+C to cleanup
trap cleanup INT

cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ ! -z "$NEXT_PID" ]; then
        echo -e "${YELLOW}Stopping Next.js (PID: ${NEXT_PID})...${NC}"
        kill -15 $NEXT_PID 2>/dev/null
        kill_port $NEXT_PORT "Next.js"
    fi
    
    if [ ! -z "$STRIPE_PID" ]; then
        echo -e "${YELLOW}Stopping Stripe (PID: ${STRIPE_PID})...${NC}"
        kill -15 $STRIPE_PID 2>/dev/null
        kill_port $STRIPE_PORT "Stripe"
    fi
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Wait indefinitely
wait

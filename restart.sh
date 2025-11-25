#!/bin/bash

# =============================================================================
# FoalRider Restart Script
# =============================================================================
# This script stops and restarts all development services
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🔄 Restarting FoalRider Development Environment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Run shutdown script
./shutdown.sh

echo ""
echo -e "${GREEN}⏳ Waiting 2 seconds before restart...${NC}"
sleep 2
echo ""

# Run startup script
./startup.sh

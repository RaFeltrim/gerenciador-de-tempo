#!/bin/bash

# Check Test Setup Script
# This script verifies that the testing environment is properly configured

echo "🔍 Checking test setup for Gerenciador de Tempo..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js is installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
fi
echo ""

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm is installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm is not installed"
fi
echo ""

# Check if node_modules exists
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
    if [ -d "node_modules/cypress" ]; then
        echo -e "${GREEN}✓${NC} Cypress is installed"
    else
        echo -e "${YELLOW}⚠${NC} Cypress is not installed"
        echo "   Run: npm install"
    fi
else
    echo -e "${RED}✗${NC} node_modules directory not found"
    echo "   Run: npm install"
fi
echo ""

# Check Cypress config
echo "⚙️  Checking Cypress configuration..."
if [ -f "cypress.config.ts" ]; then
    echo -e "${GREEN}✓${NC} cypress.config.ts exists"
else
    echo -e "${RED}✗${NC} cypress.config.ts not found"
fi

if [ -d "cypress/support" ]; then
    echo -e "${GREEN}✓${NC} cypress/support directory exists"
    
    if [ -f "cypress/support/e2e.ts" ]; then
        echo -e "${GREEN}✓${NC} cypress/support/e2e.ts exists"
    else
        echo -e "${RED}✗${NC} cypress/support/e2e.ts not found"
    fi
    
    if [ -f "cypress/support/component.ts" ]; then
        echo -e "${GREEN}✓${NC} cypress/support/component.ts exists"
    else
        echo -e "${RED}✗${NC} cypress/support/component.ts not found"
    fi
    
    if [ -f "cypress/support/commands.ts" ]; then
        echo -e "${GREEN}✓${NC} cypress/support/commands.ts exists"
    else
        echo -e "${RED}✗${NC} cypress/support/commands.ts not found"
    fi
else
    echo -e "${RED}✗${NC} cypress/support directory not found"
fi
echo ""

# Check Python for Robot Framework
echo "🐍 Checking Python (for Robot Framework)..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python is installed: $PYTHON_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Python 3 is not installed"
    echo "   Install Python 3 to run Robot Framework tests"
fi
echo ""

# Check pip
if command -v pip &> /dev/null || command -v pip3 &> /dev/null; then
    if command -v pip3 &> /dev/null; then
        PIP_CMD="pip3"
    else
        PIP_CMD="pip"
    fi
    echo -e "${GREEN}✓${NC} pip is installed"
    
    # Check Robot Framework
    if $PIP_CMD list 2>/dev/null | grep -q "robotframework"; then
        echo -e "${GREEN}✓${NC} Robot Framework is installed"
    else
        echo -e "${YELLOW}⚠${NC} Robot Framework is not installed"
        echo "   Run: pip install -r requirements.txt"
    fi
else
    echo -e "${YELLOW}⚠${NC} pip is not installed"
fi
echo ""

# Check if Next.js dev server is running
echo "🌐 Checking Next.js dev server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Next.js dev server is running on http://localhost:3000"
else
    echo -e "${YELLOW}⚠${NC} Next.js dev server is not running"
    echo "   Start it with: npm run dev"
    echo "   (Required for E2E and Robot Framework tests)"
fi
echo ""

# Summary
echo "================================"
echo "📋 Summary"
echo "================================"
echo ""
echo "To run tests:"
echo "  Unit tests:       npm test"
echo "  Cypress E2E:      npm run cypress:run:e2e (requires dev server)"
echo "  Cypress Component: npm run cypress:run:component"
echo "  Robot Framework:  npm run test:robot (requires dev server)"
echo ""
echo "See RUNNING_TESTS.md for detailed instructions."

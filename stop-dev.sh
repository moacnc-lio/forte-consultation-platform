#!/bin/bash

# Forte Consultation Platform - Development Server Stop Script
echo "🛑 Stopping Forte Consultation Platform Development Environment"
echo "=================================================="

# Stop backend server (port 8000)
echo "🔧 Stopping backend server..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Stop frontend server (port 3000)
echo "🔧 Stopping frontend server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Stop any remaining node processes
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

echo "✅ All development servers stopped successfully!"
echo "=================================================="
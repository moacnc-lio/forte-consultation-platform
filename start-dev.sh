#!/bin/bash

# Forte Consultation Platform - Development Server Startup Script
echo "🚀 Starting Forte Consultation Platform Development Environment"
echo "=================================================="

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL service..."
if ! pgrep -f postgres > /dev/null; then
    echo "🔧 Starting PostgreSQL service..."
    brew services start postgresql@14
    sleep 2
else
    echo "✅ PostgreSQL is already running"
fi

# Check if database exists
echo "🗄️ Checking database setup..."
if ! psql -lqt | cut -d \| -f 1 | grep -qw forte_db; then
    echo "🔧 Creating database and user..."
    createdb forte_db
    psql postgres -c "CREATE USER forte WITH PASSWORD 'forte123';" 2>/dev/null || true
    psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE forte_db TO forte;" 2>/dev/null || true
    
    # Seed database
    echo "🌱 Seeding database with procedure data..."
    cd backend && python3 seed_procedures.py && cd ..
else
    echo "✅ Database is ready"
fi

# Kill existing servers
echo "🛑 Stopping existing servers..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend server
echo "🔧 Starting backend server (port 8000)..."
cd backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend server
echo "🔧 Starting frontend server (port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Development servers started successfully!"
echo "=================================================="
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "🔗 API Docs: http://localhost:8000/docs"
echo "=================================================="
echo ""
echo "📝 To stop servers, press Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🔍 Logs will appear below..."
echo "=================================================="

# Keep script running and show logs
wait
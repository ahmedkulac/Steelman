#!/bin/bash

# Fact Checker App Setup Script (Bash)
# This script helps set up the development environment for new users

echo "🚀 Setting up Fact Checker App..."
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install root dependencies"
    exit 1
fi
echo "✅ Root dependencies installed"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    cd ..
    exit 1
fi
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    cd ..
    exit 1
fi
cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Set up backend environment file
echo "📝 Setting up backend environment file..."
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env from backend/.env.example"
        echo "ℹ️  Shared Google API key included (or add your own)"
    else
        echo "⚠️  backend/.env.example not found, skipping..."
    fi
else
    echo "⚠️  backend/.env already exists, skipping..."
fi
echo ""

# Set up frontend environment file
echo "📝 Setting up frontend environment file..."
if [ ! -f "frontend/.env.local" ]; then
    if [ -f "frontend/.env.local.example" ]; then
        cp frontend/.env.local.example frontend/.env.local
        echo "✅ Created frontend/.env.local from frontend/.env.local.example"
    else
        echo "⚠️  frontend/.env.local.example not found, skipping..."
    fi
else
    echo "⚠️  frontend/.env.local already exists, skipping..."
fi
echo ""

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
cd backend
npm run db:generate
if [ $? -ne 0 ]; then
    echo "⚠️  Prisma client generation failed (may need database setup)"
else
    echo "✅ Prisma client generated"
fi
cd ..
echo ""

# Run database migrations (SQLite - no setup needed)
echo "🗄️  Running database migrations..."
npm run db:migrate
if [ $? -ne 0 ]; then
    echo "⚠️  Database migration failed (this is OK if database isn't set up yet)"
else
    echo "✅ Database migrations completed"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Next steps:"
echo ""
echo "1. Add your Google Gemini API key:"
echo "   - Get key from: https://makersuite.google.com/app/apikey"
echo "   - Add to: backend/.env (GOOGLE_API_KEY=your-key-here)"
echo ""
echo "2. Start development servers:"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 Documentation:"
echo "   - Setup guide: docs/PHASE1_SETUP.md"
echo "   - API docs: docs/API.md"
echo ""
echo "Happy fact-checking! 🎉"
echo "═══════════════════════════════════════════════════════════"

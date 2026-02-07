#!/bin/bash

# Hackathon Starter Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Hackathon Starter..."

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. Current version: $(node -v)"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file from .env.example"
else
  echo "⚠️  .env file already exists, skipping..."
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
cd backend
npm run db:generate
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start PostgreSQL database (or use Docker: docker-compose up -d postgres)"
echo "3. Run database migrations: npm run db:migrate"
echo "4. Start development servers: npm run dev"
echo ""
echo "Happy hacking! 🎉"

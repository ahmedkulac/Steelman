#!/bin/bash

# Supabase Setup Script
# Helps set up the backend for Supabase deployment

set -e

echo "🚀 Setting up backend for Supabase deployment..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root"
    exit 1
fi

cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from .env.supabase.example..."
    cp .env.supabase.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit backend/.env and add your Supabase DATABASE_URL"
else
    echo "ℹ️  .env file already exists"
fi

# Check if schema.prisma is PostgreSQL
if grep -q "provider = \"sqlite\"" prisma/schema.prisma; then
    echo ""
    echo "⚠️  Prisma schema is currently set to SQLite"
    echo "📝 To use Supabase, you need to switch to PostgreSQL:"
    echo ""
    echo "Option 1: Use the PostgreSQL schema file"
    echo "  cp prisma/schema.postgresql.prisma prisma/schema.prisma"
    echo ""
    echo "Option 2: Manually edit prisma/schema.prisma:"
    echo "  Change: provider = \"sqlite\""
    echo "  To:     provider = \"postgresql\""
    echo "  Change: url = \"file:./dev.db\""
    echo "  To:     url = env(\"DATABASE_URL\")"
    echo ""
    read -p "Do you want to switch to PostgreSQL schema now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backup current schema
        cp prisma/schema.prisma prisma/schema.sqlite.backup.prisma
        # Use PostgreSQL schema
        cp prisma/schema.postgresql.prisma prisma/schema.prisma
        echo "✅ Switched to PostgreSQL schema"
        echo "💾 Original schema backed up to prisma/schema.sqlite.backup.prisma"
    fi
fi

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get your Supabase connection string from:"
echo "   Supabase Dashboard → Settings → Database → Connection string"
echo ""
echo "2. Update backend/.env with your DATABASE_URL:"
echo "   DATABASE_URL=\"postgresql://postgres:password@db.xxx.supabase.co:5432/postgres\""
echo ""
echo "3. Run database migration:"
echo "   Option A: Copy backend/prisma/migrations/supabase_init.sql to Supabase SQL Editor"
echo "   Option B: Run 'npm run db:migrate' (requires DATABASE_URL in .env)"
echo ""
echo "4. Deploy backend to Railway/Render with Supabase DATABASE_URL"
echo ""
echo "📚 See docs/SUPABASE_SETUP.md for detailed instructions"

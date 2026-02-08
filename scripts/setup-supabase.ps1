# Supabase Setup Script (PowerShell)
# Helps set up the backend for Supabase deployment

Write-Host "🚀 Setting up backend for Supabase deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the project root" -ForegroundColor Red
    exit 1
}

Set-Location backend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env from .env.supabase.example..." -ForegroundColor Yellow
    Copy-Item ".env.supabase.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "⚠️  Please edit backend/.env and add your Supabase DATABASE_URL" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Gray
}

# Check if schema.prisma is PostgreSQL
$schemaContent = Get-Content "prisma/schema.prisma" -Raw
if ($schemaContent -match 'provider = "sqlite"') {
    Write-Host ""
    Write-Host "⚠️  Prisma schema is currently set to SQLite" -ForegroundColor Yellow
    Write-Host "📝 To use Supabase, you need to switch to PostgreSQL:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Use the PostgreSQL schema file" -ForegroundColor White
    Write-Host "  Copy-Item prisma\schema.postgresql.prisma prisma\schema.prisma" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Manually edit prisma/schema.prisma:" -ForegroundColor White
    Write-Host "  Change: provider = `"sqlite`"" -ForegroundColor Gray
    Write-Host "  To:     provider = `"postgresql`"" -ForegroundColor Gray
    Write-Host "  Change: url = `"file:./dev.db`"" -ForegroundColor Gray
    Write-Host "  To:     url = env(`"DATABASE_URL`")" -ForegroundColor Gray
    Write-Host ""
    $response = Read-Host "Do you want to switch to PostgreSQL schema now? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        # Backup current schema
        Copy-Item "prisma/schema.prisma" "prisma/schema.sqlite.backup.prisma"
        # Use PostgreSQL schema
        Copy-Item "prisma/schema.postgresql.prisma" "prisma/schema.prisma"
        Write-Host "✅ Switched to PostgreSQL schema" -ForegroundColor Green
        Write-Host "💾 Original schema backed up to prisma/schema.sqlite.backup.prisma" -ForegroundColor Cyan
    }
}

# Generate Prisma client
Write-Host ""
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npm run db:generate

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your Supabase connection string from:" -ForegroundColor White
Write-Host "   Supabase Dashboard → Settings → Database → Connection string" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update backend/.env with your DATABASE_URL:" -ForegroundColor White
Write-Host '   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"' -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run database migration:" -ForegroundColor White
Write-Host "   Option A: Copy backend/prisma/migrations/supabase_init.sql to Supabase SQL Editor" -ForegroundColor Gray
Write-Host "   Option B: Run 'npm run db:migrate' (requires DATABASE_URL in .env)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy backend to Railway/Render with Supabase DATABASE_URL" -ForegroundColor White
Write-Host ""
Write-Host "📚 See docs/SUPABASE_SETUP.md for detailed instructions" -ForegroundColor Cyan

Set-Location ..

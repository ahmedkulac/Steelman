# Fact Checker App Setup Script (PowerShell)
# This script helps set up the development environment for new users

Write-Host "🚀 Setting up Fact Checker App..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Set up backend environment file
Write-Host "📝 Setting up backend environment file..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✅ Created backend/.env from backend/.env.example" -ForegroundColor Green
        Write-Host "ℹ️  Shared Google API key included (or add your own)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  backend/.env.example not found, skipping..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  backend/.env already exists, skipping..." -ForegroundColor Yellow
}
Write-Host ""

# Set up frontend environment file
Write-Host "📝 Setting up frontend environment file..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\.env.local")) {
    if (Test-Path "frontend\.env.local.example") {
        Copy-Item "frontend\.env.local.example" "frontend\.env.local"
        Write-Host "✅ Created frontend/.env.local from frontend/.env.local.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  frontend/.env.local.example not found, skipping..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  frontend/.env.local already exists, skipping..." -ForegroundColor Yellow
}
Write-Host ""

# Generate Prisma client
Write-Host "🗄️  Generating Prisma client..." -ForegroundColor Yellow
Set-Location backend
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Prisma client generation failed (may need database setup)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Prisma client generated" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# Run database migrations (SQLite - no setup needed)
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database migration failed (this is OK if database isn't set up yet)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
}
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add your Google Gemini API key:" -ForegroundColor White
Write-Host "   - Get key from: https://makersuite.google.com/app/apikey" -ForegroundColor Gray
Write-Host "   - Add to: backend/.env (GOOGLE_API_KEY=your-key-here)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start development servers:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor White
Write-Host "   - Setup guide: docs/PHASE1_SETUP.md" -ForegroundColor Gray
Write-Host "   - API docs: docs/API.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy fact-checking! 🎉" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

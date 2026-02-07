# Hackathon Starter Setup Script (PowerShell)
# This script helps set up the development environment

Write-Host "🚀 Setting up Hackathon Starter..." -ForegroundColor Cyan

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Copy environment files
Write-Host "📝 Setting up environment files..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists, skipping..." -ForegroundColor Yellow
}

# Generate Prisma client
Write-Host "🗄️  Generating Prisma client..." -ForegroundColor Yellow
Set-Location backend
npm run db:generate
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your configuration"
Write-Host "2. Start PostgreSQL database (or use Docker: docker-compose up -d postgres)"
Write-Host "3. Run database migrations: npm run db:migrate"
Write-Host "4. Start development servers: npm run dev"
Write-Host ""
Write-Host "Happy hacking! 🎉" -ForegroundColor Green

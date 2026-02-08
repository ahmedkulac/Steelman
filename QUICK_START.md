# Quick Start Guide - Fact Checker App

Get the Fact Checker app running in 5 minutes!

## 🚀 Fast Setup

### Option 1: Automated Setup (Easiest)

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The setup script will:
- ✅ Install all dependencies
- ✅ Create `.env` files from examples
- ✅ Generate Prisma client
- ✅ Run database migrations

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment files:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Google API Key:**
   - A shared API key is included in `backend/.env.example`
   - The setup script copies it automatically
   - Or get your own from: https://makersuite.google.com/app/apikey

4. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start development servers:**
   ```bash
   npm run dev
   ```

## 📍 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## ✅ Verify Setup

1. **Check backend health:**
   - Visit: http://localhost:5000/health
   - Should see: `{"status":"ok",...}`

2. **Check frontend:**
   - Visit: http://localhost:3000
   - Should see the Fact Checker homepage

3. **Test the app:**
   - Enter a test claim
   - Submit and wait for results

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio

# Build
npm run build           # Build for production
npm run start           # Start production servers
```

## 🔧 Configuration

### Required: Google API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Add to `backend/.env`:
   ```env
   GOOGLE_API_KEY=your-api-key-here
   ```

### Optional: Database

**Default: SQLite** (no setup needed!)
- Database file created automatically
- No installation required

**To use PostgreSQL:**
1. Install PostgreSQL or use Docker
2. Update `DATABASE_URL` in `backend/.env`
3. Update `backend/prisma/schema.prisma`
4. Run migrations

## 🐛 Troubleshooting

### "Network Error" when submitting claim
- **Backend not running**: Start with `npm run dev:backend`
- **Wrong API URL**: Check `frontend/.env.local`
- **Port conflict**: Change port in `backend/.env`

### "GOOGLE_API_KEY is not configured"
- Add your API key to `backend/.env`
- Restart backend server

### Database errors
- Run `npm run db:generate`
- Run `npm run db:migrate`
- SQLite creates database automatically

### Port already in use
- Change `PORT` in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

## 📚 Next Steps

- Read [Setup Guide](./docs/PHASE1_SETUP.md) for detailed instructions
- Check [API Documentation](./docs/API.md) for API reference
- See [Troubleshooting](./docs/TROUBLESHOOTING.md) for more help

## 🎯 What You Get

- ✅ Working fact-checker app
- ✅ AI-powered counter-arguments
- ✅ Mobile-responsive UI
- ✅ SQLite database (no setup!)
- ✅ Rate limiting
- ✅ Error handling

**Ready to fact-check! 🎉**

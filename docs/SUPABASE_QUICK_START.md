# Supabase Quick Start

Get your backend running with Supabase in 5 minutes!

## 🚀 Quick Setup

### Step 1: Create Supabase Project (2 min)

1. Go to https://supabase.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Fill in:
   - Name: `fact-checker-app`
   - Password: Create strong password (save it!)
   - Region: Choose closest
   - Plan: Free
5. Wait ~2 minutes for setup

### Step 2: Get Connection String (1 min)

1. Go to Settings → Database
2. Find "Connection string" section
3. Select "URI" tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Example:
   ```
   postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
   ```

### Step 3: Run Database Migration (1 min)

**Option A: Using Supabase SQL Editor (Easiest)**

1. Go to SQL Editor in Supabase dashboard
2. Click "New query"
3. Copy contents of `backend/prisma/migrations/supabase_init.sql`
4. Paste into SQL editor
5. Click "Run" (or Ctrl+Enter)
6. ✅ Tables created!

**Option B: Using Prisma CLI**

```bash
cd backend
# Set DATABASE_URL in .env first
npm run db:migrate
```

### Step 4: Deploy Backend (2 min)

**Railway (Recommended):**

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repo
4. **CRITICAL:** Set Root Directory to `backend`:
   - Click service → Settings → Root Directory
   - Set to: `backend`
   - Save (Railway will redeploy)
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
   GOOGLE_API_KEY=your-api-key
   NODE_ENV=production
   ```
6. Wait for deployment to complete
7. Copy backend URL

### Step 5: Update Frontend (30 sec)

Update `NEXT_PUBLIC_API_URL` in Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

## ✅ Verify

1. Test backend: `curl https://your-backend-url/health`
2. Test frontend: Visit Vercel URL
3. Submit a claim - should work! 🎉

## 🔧 Automated Setup Script

**Windows:**
```powershell
.\scripts\setup-supabase.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup-supabase.sh
./scripts/setup-supabase.sh
```

## 📚 Full Guide

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## 🆘 Troubleshooting

**Connection failed?**
- Check password is correct
- Verify connection string format
- Try connection pooling (port 6543)

**Migration failed?**
- Check SQL syntax
- Verify tables don't already exist
- Run migration manually in SQL Editor

**Backend won't start?**
- Check DATABASE_URL is set
- Verify Supabase project is active
- Check backend logs

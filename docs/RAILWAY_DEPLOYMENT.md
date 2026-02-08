# Railway Deployment Guide

Complete guide for deploying the backend to Railway.

## 🚀 Quick Deploy

### Step 1: Create Railway Project

1. **Sign up/Login:**
   - Go to https://railway.app
   - Sign up with GitHub (recommended)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

### Step 2: Configure Service (CRITICAL!)

**⚠️ IMPORTANT:** Railway must be configured to use the `backend` directory.

1. **Set Root Directory (REQUIRED):**
   - Click on your service
   - Go to "Settings" tab
   - Scroll to "Root Directory"
   - **Set to:** `backend`
   - Click "Save"
   - Railway will redeploy automatically

   **Why this matters:**
   - Without this, Railway tries to build from root
   - It looks for workspace `hackathon-backend` (wrong name)
   - Setting root to `backend` makes Railway run commands from `backend/` directory

2. **Verify Build Settings:**
   - Build Command should be: `npm install && npm run db:generate && npm run build`
   - Start Command should be: `npm start`
   - These are auto-detected when Root Directory is set correctly

### Step 3: Add Database (Supabase)

1. **Get Supabase Connection String:**
   - Go to Supabase Dashboard
   - Settings → Database
   - Copy connection string

2. **Add Environment Variables:**
   - In Railway, go to "Variables" tab
   - Add:
     ```
     NODE_ENV=production
     DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
     GOOGLE_API_KEY=your-api-key
     PORT=5000
     REDIS_ENABLED=false
     ```

### Step 4: Configure Build Settings

Railway should auto-detect Node.js, but verify:

- **Build Command:** `npm install && npm run db:generate && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `backend`

### Step 5: Deploy

Railway will automatically deploy on every push to your main branch.

---

## 🔧 Manual Configuration

If Railway doesn't auto-detect correctly:

### Option 1: Railway Dashboard

1. Go to Service Settings
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm run db:generate && npm run build`
4. **Start Command:** `npm start`

### Option 2: railway.json

Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### Option 3: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Set root directory
railway variables set RAILWAY_SERVICE_ROOT=backend

# Deploy
railway up
```

---

## 🐛 Troubleshooting

### Error: "workspace=hackathon-backend" not found

**Problem:** Railway is trying to build from root using wrong workspace name.

**Solution:**
1. Set **Root Directory** to `backend` in Railway settings
2. Railway will then run commands from `backend/` directory
3. No workspace commands needed

### Error: Build fails

**Check:**
- Root directory is set to `backend`
- Build command includes `npm run db:generate`
- All dependencies are in `backend/package.json`
- TypeScript compiles successfully (`npm run type-check`)

### Error: Prisma client not generated

**Solution:**
- Build command should include: `npm run db:generate`
- Or add it to `build` script in `backend/package.json`
- Already added: `"build": "npm run db:generate && tsc"`

### Error: Database connection failed

**Check:**
- `DATABASE_URL` is set correctly
- Supabase project is active (not paused)
- Connection string format is correct
- Try connection pooling port (6543) if 5432 fails

---

## 📋 Railway Configuration Checklist

- [ ] Root Directory set to `backend`
- [ ] Build Command: `npm install && npm run db:generate && npm run build`
- [ ] Start Command: `npm start`
- [ ] Environment variables configured:
  - [ ] `DATABASE_URL` (Supabase)
  - [ ] `GOOGLE_API_KEY`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` (auto-set by Railway, or 5000)
- [ ] Prisma schema switched to PostgreSQL (if needed)
- [ ] Database migrations run (via Railway CLI or Supabase SQL Editor)

---

## 🔄 Running Migrations on Railway

### Option 1: Railway CLI

```bash
railway run npm run db:migrate:deploy
```

### Option 2: Supabase SQL Editor

1. Copy `backend/prisma/migrations/supabase_init.sql`
2. Paste into Supabase SQL Editor
3. Run query

### Option 3: Railway Shell

```bash
railway shell
cd backend
npm run db:migrate:deploy
```

---

## ✅ Verify Deployment

1. **Check Health:**
   ```bash
   curl https://your-app.railway.app/health
   ```

2. **Test API:**
   ```bash
   curl https://your-app.railway.app/api/claims
   ```

3. **Check Logs:**
   - Go to Railway dashboard
   - Click on your service
   - View "Deployments" → "Logs"

---

## 🎯 Key Points

1. **Root Directory:** Must be `backend` (not root)
2. **Build Command:** Should include Prisma generate
3. **Start Command:** `npm start` (runs `node dist/index.js`)
4. **Database:** Use Supabase connection string
5. **Migrations:** Run after first deployment

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Supabase Setup](./SUPABASE_SETUP.md)

---

**Your backend should now deploy successfully on Railway! 🎉**

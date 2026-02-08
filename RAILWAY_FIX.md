# 🔧 Railway Deployment Fix

## Critical Issue Found

Your Prisma schema is configured for **SQLite**, but Railway needs **PostgreSQL**.

---

## ✅ Quick Fix

### Option 1: Use Railway's Build Script (Recommended)

Railway will automatically switch to PostgreSQL if you set the environment variable.

1. **In Railway Dashboard:**
   - Go to Variables tab
   - Add: `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - Railway will auto-detect PostgreSQL

2. **Update Build Command:**
   - Settings → Build Command
   - Set to: `npm run db:switch:postgres && npm install && npm run db:generate && npm run db:migrate:deploy && npm run build`

### Option 2: Manually Switch Schema Before Deploying

**Before deploying to Railway:**

1. **Switch to PostgreSQL schema:**
   ```bash
   cd backend
   npm run db:switch:postgres
   ```

2. **Commit the change:**
   ```bash
   git add backend/prisma/schema.prisma
   git commit -m "Switch to PostgreSQL for Railway deployment"
   git push
   ```

3. **Deploy on Railway** - It will now use PostgreSQL

---

## 📋 Complete Railway Configuration

### Railway Settings:

**Root Directory:** `backend`

**Build Command:**
```
npm run db:switch:postgres && npm install && npm run db:generate && npm run db:migrate:deploy && npm run build
```

**Start Command:**
```
npm start
```

### Environment Variables:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
GOOGLE_API_KEY=your-api-key-here
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🚀 Step-by-Step Fix

1. **Switch to PostgreSQL Schema:**
   ```bash
   cd backend
   npm run db:switch:postgres
   ```

2. **Verify schema.prisma shows PostgreSQL:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Commit and Push:**
   ```bash
   git add backend/prisma/schema.prisma
   git commit -m "Switch to PostgreSQL for production"
   git push
   ```

4. **In Railway Dashboard:**
   - Set Root Directory: `backend`
   - Set Build Command: `npm install && npm run db:generate && npm run db:migrate:deploy && npm run build`
   - Set Start Command: `npm start`
   - Add PostgreSQL database
   - Set `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - Deploy

---

## ✅ After Fix

Your deployment should work! The key was switching from SQLite to PostgreSQL.

---

**See `RAILWAY_TROUBLESHOOTING.md` for more detailed troubleshooting.**

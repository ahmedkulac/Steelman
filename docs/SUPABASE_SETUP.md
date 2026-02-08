# Supabase Backend Setup Guide

Complete guide for deploying the backend with Supabase PostgreSQL database.

## 🎯 Overview

This guide covers:
1. Setting up Supabase database
2. Configuring backend to use Supabase
3. Deploying backend (Railway/Render) with Supabase connection

---

## 📋 Step 1: Create Supabase Project

1. **Sign up/Login:**
   - Go to https://supabase.com
   - Sign up with GitHub (recommended)

2. **Create New Project:**
   - Click "New Project"
   - Fill in:
     - **Name:** `fact-checker-app` (or your choice)
     - **Database Password:** Create a strong password (save it!)
     - **Region:** Choose closest to you
     - **Pricing Plan:** Free tier (select "Free")

3. **Wait for Setup:**
   - Supabase will create your project (~2 minutes)
   - You'll see a dashboard when ready

---

## 🔑 Step 2: Get Database Connection String

1. **Go to Project Settings:**
   - Click gear icon (⚙️) in sidebar
   - Select "Database"

2. **Find Connection String:**
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Replace Password:**
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - URL encode special characters if needed
   - Example:
     ```
     postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
     ```

---

## 🗄️ Step 3: Run Database Migrations

### Option A: Using Supabase SQL Editor

1. **Open SQL Editor:**
   - Click "SQL Editor" in sidebar
   - Click "New query"

2. **Run Migration:**
   - Copy contents of `backend/prisma/migrations/supabase_init.sql`
   - Paste into SQL editor
   - Click "Run" (or press Ctrl+Enter)
   - ✅ Tables created!

### Option B: Using Prisma CLI (Local)

1. **Set Database URL:**
   ```bash
   export DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"
   ```

2. **Switch to PostgreSQL Schema:**
   ```bash
   cd backend
   npm run db:switch:postgres
   # Or manually: cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```

3. **Run Migration:**
   ```bash
   npm run db:migrate
   ```

### Option C: Using Prisma Studio (Visual)

1. **Set Database URL in `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"
   ```

2. **Open Prisma Studio:**
   ```bash
   cd backend
   npm run db:studio
   ```

3. **Verify Tables:**
   - Should see `Claim`, `Feedback`, `User` tables

---

## 🚀 Step 4: Deploy Backend

Now deploy your backend to Railway or Render, connecting to Supabase.

### Option A: Railway (Recommended)

1. **Go to Railway:**
   - https://railway.app
   - Sign up/login with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service:**
   - Railway auto-detects Node.js
   - **IMPORTANT:** Set **Root Directory** to `backend` in Settings
   - This tells Railway to run commands from the backend directory
   - Railway will auto-deploy

4. **Add Environment Variables:**
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     NODE_ENV=production
     PORT=5000
     DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
     GOOGLE_API_KEY=your-api-key
     REDIS_ENABLED=false
     ```
   - Railway will redeploy automatically

5. **Verify Build Settings:**
   - Build Command: `npm install && npm run db:generate && npm run build` (auto-detected)
   - Start Command: `npm start` (auto-detected)
   - If build fails, check Root Directory is set to `backend`

6. **Get Backend URL:**
   - Railway provides a URL like: `https://your-app.railway.app`
   - Copy this URL

### Option B: Render

1. **Go to Render:**
   - https://render.com
   - Sign up/login with GitHub

2. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect GitHub repository

3. **Configure:**
   - **Name:** `fact-checker-backend`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
   GOOGLE_API_KEY=your-api-key
   PORT=10000
   REDIS_ENABLED=false
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (~5 minutes)
   - Get URL: `https://your-app.onrender.com`

---

## ✅ Step 5: Verify Setup

1. **Test Database Connection:**
   ```bash
   # Using Prisma Studio locally
   cd backend
   DATABASE_URL="your-supabase-url" npm run db:studio
   ```

2. **Test Backend Health:**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": 123.45
   }
   ```

3. **Test API Endpoint:**
   ```bash
   curl https://your-backend-url.railway.app/api/claims
   ```
   Should return empty array or claims list

---

## 🔒 Step 6: Configure Supabase Security

### Enable Row Level Security (Optional)

1. **Go to Authentication:**
   - Click "Authentication" in sidebar
   - Configure policies if needed

2. **Database Security:**
   - Go to "Database" → "Policies"
   - Set up RLS policies for your tables
   - For now, you can disable RLS for MVP

### Connection Pooling (Recommended)

Supabase provides connection pooling for better performance:

1. **Get Pooled Connection String:**
   - Go to Project Settings → Database
   - Find "Connection pooling"
   - Use port `6543` instead of `5432`
   - Format:
     ```
     postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true
     ```

2. **Update Backend:**
   - Use pooled connection string in `DATABASE_URL`
   - Better for serverless/server deployments

---

## 📝 Environment Variables Summary

### Backend (Railway/Render)

```env
# Server
NODE_ENV=production
PORT=5000  # or platform default

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# AI
GOOGLE_API_KEY=your-api-key
AI_MODEL=gemini-2.5-flash
AI_MAX_TOKENS=2000

# Caching (optional)
REDIS_ENABLED=false
# Or if using Redis:
# REDIS_URL=redis://...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# CORS (for frontend)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

---

## 🐛 Troubleshooting

### Database Connection Failed

**Error: "Connection refused"**
- Check Supabase project is active
- Verify connection string is correct
- Check password is URL-encoded if it has special characters
- Try connection pooling port (6543)

**Error: "Password authentication failed"**
- Verify password is correct
- Reset password in Supabase dashboard if needed
- Update connection string

**Error: "Database does not exist"**
- Supabase creates `postgres` database by default
- Use `postgres` as database name in connection string

### Migration Issues

**Error: "Table already exists"**
- Tables might already be created
- Check Supabase SQL Editor → Table Editor
- Drop tables if needed and re-run migration

**Error: "Migration failed"**
- Check SQL syntax in migration file
- Run migration manually in Supabase SQL Editor
- Verify Prisma schema matches database

### Backend Deployment Issues

**Error: "Cannot connect to database"**
- Verify `DATABASE_URL` is set correctly
- Check Supabase project is not paused (free tier)
- Try connection pooling URL

**Error: "Prisma client not generated"**
- Add build step: `npm run db:generate`
- Or run locally and commit generated client

---

## 📊 Supabase Dashboard Features

### Useful Tools:

1. **Table Editor:**
   - View/edit data directly
   - Useful for testing

2. **SQL Editor:**
   - Run custom queries
   - Test database operations

3. **API Docs:**
   - Auto-generated REST API docs
   - Useful for reference

4. **Logs:**
   - View database logs
   - Debug connection issues

---

## 🔄 Database Migrations

### Running New Migrations:

1. **Create Migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name migration_name
   ```

2. **Get SQL:**
   ```bash
   npx prisma migrate diff \
     --from-schema-datamodel prisma/schema.prisma \
     --to-schema-datasource prisma/schema.prisma \
     --script > migration.sql
   ```

3. **Apply to Supabase:**
   - Copy SQL to Supabase SQL Editor
   - Run the query

---

## 💡 Best Practices

1. **Use Connection Pooling:**
   - Better performance
   - Handles concurrent connections
   - Use port 6543

2. **Store Password Securely:**
   - Never commit to git
   - Use environment variables
   - Rotate passwords regularly

3. **Monitor Usage:**
   - Check Supabase dashboard for usage
   - Free tier: 500MB database, 2GB bandwidth
   - Upgrade if needed

4. **Backup Database:**
   - Supabase provides automatic backups
   - Export data periodically
   - Use `pg_dump` for manual backups

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection string obtained
- [ ] Database migrations run
- [ ] Backend deployed (Railway/Render)
- [ ] Environment variables configured
- [ ] Backend health check passes
- [ ] API endpoints tested
- [ ] Frontend connected to backend

---

**Your backend is now running on Supabase! 🎉**

# 🚀 Complete Deployment Guide: Vercel + Railway

Step-by-step guide to successfully deploy your Steelman app to production.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub repository with your code pushed
- ✅ Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- ✅ GitHub account
- ✅ Vercel account (free) - [Sign up](https://vercel.com)
- ✅ Railway account (free) - [Sign up](https://railway.app)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub (if first time)
4. Select your repository: `3Mis1Cs`
5. Click **"Deploy Now"**

### Step 3: Configure Backend Service

1. Railway will auto-detect your project
2. **IMPORTANT:** Click on the service → **Settings** → **Root Directory**
3. Set Root Directory to: `backend`
4. Click **"Save"**

### Step 4: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will create a PostgreSQL database automatically
5. **Copy the DATABASE_URL** (you'll need this)

### Step 5: Set Environment Variables

1. Go to your backend service → **Variables** tab
2. Click **"+ New Variable"**
3. Add these variables one by one:

**Required:**
```
NODE_ENV=production
```

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
*(Use the variable reference - Railway will auto-populate it)*

```
OPENROUTER_API_KEY=Sk-or-v1-e1bc52f5bdffc6ba167ec870ba0f9b752d56d04c8f53d1f952970872f59e1cd0
```
*(Your OpenRouter API key)*

```
PORT=5000
```

**CORS Configuration (Important!):**
```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```
*(Replace `your-app.vercel.app` with your actual Vercel URL - you'll get this after frontend deployment, but you can add it now and update later)*

**Optional:**
```
AI_MODEL=google/gemini-2.0-flash-001
AI_MAX_TOKENS=2000
SITE_URL=https://your-app.vercel.app
SITE_NAME=Steelman
```

4. Click **"Save"** after each variable

**Note:** After you get your Vercel URL, come back and update `ALLOWED_ORIGINS` with the actual URL.

### Step 6: Configure Build Settings

1. Go to **Settings** → **Build Command**
2. Set to: `npm install && npm run db:generate && npm run build`
3. Go to **Start Command**
4. Set to: `npm start`
5. Click **"Save"**

### Step 7: Deploy

1. Railway will automatically deploy when you:
   - Push to your GitHub repository, OR
   - Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. Check **Deployments** tab for status
4. Once deployed, click on the service → **Settings** → **Generate Domain**
5. **Copy your Railway backend URL** (e.g., `https://your-app.railway.app`)

### Step 8: Verify Backend

1. Visit: `https://your-backend-url.railway.app/health`
2. Should see: `{"status":"ok"}`
3. Visit: `https://your-backend-url.railway.app/api`
4. Should see API information

**✅ Backend is now deployed!**

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)

### Step 2: Import Project

1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. If your repo isn't listed, click **"Adjust GitHub App Permissions"**
4. Select your repository: `3Mis1Cs`
5. Click **"Import"**

### Step 3: Configure Project Settings

**CRITICAL SETTINGS:**

1. **Framework Preset:** Next.js (auto-detected)

2. **Root Directory:**
   - Click **"Edit"** next to Root Directory
   - Change from `/` to `frontend`
   - Click **"Continue"**

3. **Build Command:** `npm run build` (auto-detected)

4. **Output Directory:** `.next` (auto-detected)

5. **Install Command:** `npm install` (auto-detected)

### Step 4: Set Environment Variables

1. Scroll down to **"Environment Variables"**
2. Click **"Add"** for each variable:

**Required:**
```
NEXT_PUBLIC_API_URL
```
Value: `https://your-backend-url.railway.app/api`
*(Replace with your actual Railway backend URL)*

**Optional:**
```
NEXT_PUBLIC_APP_URL
```
Value: `https://your-app.vercel.app`
*(You'll get this after first deployment)*

3. For each variable:
   - Select environments: **Production**, **Preview**, **Development**
   - Click **"Save"**

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Watch the build logs for any errors
4. Once complete, you'll see **"Congratulations!"**
5. **Copy your Vercel URL** (e.g., `https://your-app.vercel.app`)

**✅ Frontend is now deployed!**

---

## Part 3: Update Backend CORS

### Step 1: Update CORS Environment Variable

Your backend needs to allow requests from your Vercel domain.

1. Go back to Railway
2. Open your backend service
3. Go to **Variables** tab
4. Find `ALLOWED_ORIGINS` variable
5. Click **Edit**
6. Update the value to include your Vercel URL:

```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```
*(Replace `your-app.vercel.app` with your actual Vercel URL)*

**Format:** Comma-separated list of allowed origins (no spaces after commas)

**Examples:**
- Single origin: `https://your-app.vercel.app`
- Multiple origins: `https://your-app.vercel.app,http://localhost:3000`
- With custom domain: `https://your-app.vercel.app,https://yourdomain.com`

### Step 2: Redeploy Backend

1. After updating the variable, Railway will auto-redeploy
2. Or manually trigger redeploy: Go to **Deployments** → Click **"Redeploy"**
3. Wait for deployment to complete

**✅ CORS is now configured!**

---

## Part 4: Verify Everything Works

### Test Checklist

1. **Frontend loads:**
   - Visit your Vercel URL
   - Should see the homepage

2. **API connection:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Submit a test claim
   - Check Network tab - should see requests to Railway backend

3. **Full flow:**
   - Submit a claim
   - Wait for counter-arguments
   - Verify they display correctly
   - Check evidence and sources appear

4. **Other features:**
   - Test history sidebar
   - Test copy functionality
   - Test dark/light mode
   - Test article analysis (if implemented)

---

## 🔧 Troubleshooting

### Railway Issues

**Build Fails:**
- Check build logs in Railway dashboard
- Verify Root Directory is set to `backend`
- Check environment variables are set correctly
- Ensure `package.json` has correct build scripts

**Database Connection Error:**
- Verify `DATABASE_URL` is set correctly
- Check database is running (Railway dashboard)
- Run migrations: Add `npm run db:migrate:deploy` to build command

**Backend Not Accessible:**
- Check service is running (Railway dashboard)
- Verify PORT is set to 5000
- Check if domain is generated
- Test health endpoint: `/health`

### Vercel Issues

**Build Fails:**
- Check Root Directory is `frontend` (not `/`)
- Verify `package.json` exists in frontend folder
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`

**API Connection Errors:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend URL includes `/api` at the end
- Verify backend CORS allows Vercel domain
- Check browser console for specific errors

**Environment Variables Not Working:**
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding/changing variables
- Check variable names match exactly (case-sensitive)

**CORS Errors:**
- Update backend CORS to include Vercel URL
- Verify `FRONTEND_URL` is set in Railway
- Redeploy backend after CORS changes

---

## 📝 Environment Variables Reference

### Railway (Backend)

**Required:**
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
OPENROUTER_API_KEY=Sk-or-v1-e1bc52f5bdffc6ba167ec870ba0f9b752d56d04c8f53d1f952970872f59e1cd0
PORT=5000
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

**Optional:**
```env
AI_MODEL=google/gemini-2.0-flash-001
AI_MAX_TOKENS=2000
SITE_URL=https://your-app.vercel.app
SITE_NAME=Steelman
```

### Vercel (Frontend)

**Required:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

**Optional:**
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

**Railway:**
- Automatically deploys on every push to your connected branch
- Configure in: Settings → Source → Branch

**Vercel:**
- Automatically deploys on every push to `main` branch
- Preview deployments for other branches
- Configure in: Settings → Git

### Manual Deployments

**Railway:**
- Go to Deployments tab
- Click "Redeploy" on any deployment

**Vercel:**
- Go to Deployments tab
- Click "Redeploy" on any deployment

---

## 🎯 Quick Reference

### Railway Backend URL Format
```
https://your-service-name.up.railway.app
```

### Vercel Frontend URL Format
```
https://your-project-name.vercel.app
```

### API Endpoint Format
```
Backend URL: https://your-backend.railway.app
API Base:    https://your-backend.railway.app/api
```

---

## ✅ Success Checklist

### Backend (Railway)
- [ ] Project created and connected to GitHub
- [ ] Root directory set to `backend`
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Build command set correctly
- [ ] Start command set correctly
- [ ] Service deployed successfully
- [ ] Backend URL copied
- [ ] Health endpoint works (`/health`)

### Frontend (Vercel)
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Environment variables configured
- [ ] `NEXT_PUBLIC_API_URL` set to backend URL
- [ ] Build completed successfully
- [ ] Frontend URL copied
- [ ] Frontend loads correctly

### Integration
- [ ] `ALLOWED_ORIGINS` updated with Vercel URL in Railway
- [ ] Backend redeployed after CORS changes
- [ ] API connection works (check browser console)
- [ ] Test claim submission works
- [ ] Counter-arguments display correctly
- [ ] Evidence and sources display correctly
- [ ] All features tested and working

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Wrong Root Directory** - Must be `backend` for Railway, `frontend` for Vercel
2. ❌ **Missing `/api`** - Backend URL must end with `/api` in `NEXT_PUBLIC_API_URL`
3. ❌ **CORS Not Updated** - Must add Vercel URL to backend CORS
4. ❌ **Environment Variables Wrong** - Must use `NEXT_PUBLIC_` prefix for client-side vars
5. ❌ **Database Not Migrated** - Run migrations after database setup
6. ❌ **API Key Missing** - Must set `OPENROUTER_API_KEY` in Railway

---

## 📞 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Project Troubleshooting:** See `docs/TROUBLESHOOTING.md`
- **API Documentation:** See `docs/API.md`

---

## 🎉 You're Done!

Once all steps are complete:
- ✅ Backend running on Railway
- ✅ Frontend running on Vercel
- ✅ Everything connected and working
- ✅ Your app is live! 🚀

**Your Steelman app is now deployed and ready for users!**

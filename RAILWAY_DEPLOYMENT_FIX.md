# 🚂 Railway Deployment Fix - Step by Step

## The Problem

Railway deployment fails because:
1. Prisma schema is set to SQLite (needs PostgreSQL for Railway)
2. Node version might be too old (some packages need Node 20+)
3. Database migrations might not be running

---

## ✅ Complete Fix

### Step 1: Update Railway Configuration

I've already updated these files for you:
- ✅ `backend/nixpacks.toml` - Now uses Node 20 and switches to PostgreSQL
- ✅ `backend/railway.json` - Includes PostgreSQL switch in build command

### Step 2: Railway Dashboard Configuration

1. **Go to Railway Dashboard**
   - Open your project
   - Click on your backend service

2. **Set Root Directory**
   - Settings → Root Directory
   - Set to: `backend`
   - Click Save

3. **Set Build Command**
   - Settings → Build Command
   - Set to:
     ```
     npm install && npm run db:switch:postgres && npm run db:generate && npm run db:migrate:deploy && npm run build
     ```
   - Click Save

4. **Set Start Command**
   - Settings → Start Command
   - Set to: `npm start`
   - Click Save

5. **Add PostgreSQL Database**
   - Click "+ New" → Database → PostgreSQL
   - Railway will create it automatically

6. **Set Environment Variables**
   Go to Variables tab and add:

   ```
   NODE_ENV=production
   ```
   
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
   *(Use the variable reference - Railway auto-fills it)*
   
   ```
   GOOGLE_API_KEY=your-actual-api-key
   ```
   *(Replace with your real API key)*
   
   ```
   PORT=5000
   ```
   
   ```
   ALLOWED_ORIGINS=http://localhost:3000
   ```
   *(Update this after getting Vercel URL)*

7. **Deploy**
   - Click "Deploy" or push to GitHub
   - Watch the build logs

---

## 🔍 Check Build Logs

If deployment still fails:

1. Go to Railway → Deployments
2. Click on the failed deployment
3. View **Build Logs**
4. Look for specific error messages

Common errors you might see:

### "Cannot find module '@prisma/client'"
**Fix:** Build command needs `npm run db:generate`

### "Database connection error"
**Fix:** Ensure `DATABASE_URL` is set and PostgreSQL service is running

### "Prisma schema not found"
**Fix:** Ensure Root Directory is `backend`

### "TypeScript compilation errors"
**Fix:** Fix errors locally, commit, and redeploy

---

## 📋 Correct Configuration Summary

### Railway Settings:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run db:switch:postgres && npm run db:generate && npm run db:migrate:deploy && npm run build`
- **Start Command:** `npm start`

### Environment Variables:
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
GOOGLE_API_KEY=your-key
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
```

### Files Updated:
- ✅ `backend/nixpacks.toml` - Node 20, PostgreSQL switch
- ✅ `backend/railway.json` - Updated build command

---

## 🚀 After Fixing

1. **Commit the changes:**
   ```bash
   git add backend/nixpacks.toml backend/railway.json
   git commit -m "Fix Railway deployment: Switch to PostgreSQL, use Node 20"
   git push
   ```

2. **Railway will auto-deploy** (or manually trigger deploy)

3. **Check deployment logs** for success

4. **Test backend:**
   - Visit: `https://your-backend.railway.app/health`
   - Should see: `{"status":"ok"}`

---

## ✅ Success Indicators

- ✅ Build completes without errors
- ✅ Service shows "Running" status
- ✅ Health endpoint returns `{"status":"ok"}`
- ✅ API endpoint accessible

---

## 🆘 Still Failing?

1. **Check the specific error** in Railway build logs
2. **Verify all settings** match the configuration above
3. **Try manual deploy** using Railway CLI
4. **Check Railway status** - railway.app/status

**Most common fix:** Ensure Root Directory is `backend` and build command includes `npm run db:switch:postgres`

---

**Your backend should deploy successfully after these fixes!** 🚀

# 🔧 Fix Railway Builder Issue

## Problem

Railway is detecting and using the Dockerfile, but it's failing because:
- `package-lock.json` doesn't exist in backend folder
- Dockerfile expects package-lock.json for `npm ci`

## ✅ Solution: Force Railway to Use Nixpacks

Railway will use Nixpacks if you configure it properly in the dashboard.

---

## 🚀 Quick Fix Steps

### Step 1: Configure Railway to Use Nixpacks

1. **Go to Railway Dashboard**
   - Open your project
   - Click on your backend service

2. **Go to Settings**
   - Click **Settings** tab

3. **Set Builder to Nixpacks**
   - Look for **"Builder"** or **"Build Configuration"** section
   - Change from **"Dockerfile"** to **"Nixpacks"**
   - Or if you see **"Detected Dockerfile"**, click **"Change"** and select **"Nixpacks"**

4. **Save Settings**

### Step 2: Verify Configuration

**Root Directory:** `backend`

**Build Command:**
```
npm install && npm run db:switch:postgres && npm run db:generate && npm run db:migrate:deploy && npm run build
```

**Start Command:**
```
npm start
```

### Step 3: Redeploy

- Click **"Redeploy"** or push to GitHub
- Railway will now use Nixpacks instead of Dockerfile

---

## Alternative: Rename Dockerfile

If you can't change the builder in Railway dashboard:

1. **Rename Dockerfile:**
   ```bash
   cd backend
   git mv Dockerfile Dockerfile.backup
   ```

2. **Commit:**
   ```bash
   git commit -m "Use Nixpacks instead of Dockerfile for Railway"
   git push
   ```

3. **Railway will now use Nixpacks** (since no Dockerfile detected)

---

## ✅ What Should Happen

After switching to Nixpacks:

1. Railway reads `backend/nixpacks.toml`
2. Uses Node 20 (as configured)
3. Runs: `npm install` (doesn't need package-lock.json)
4. Switches to PostgreSQL schema
5. Generates Prisma client
6. Runs migrations
7. Builds TypeScript
8. Starts the server

---

## 📋 Railway Dashboard Settings

**Service Settings:**
- **Root Directory:** `backend`
- **Builder:** Nixpacks (not Dockerfile)
- **Build Command:** `npm install && npm run db:switch:postgres && npm run db:generate && npm run db:migrate:deploy && npm run build`
- **Start Command:** `npm start`

**Environment Variables:**
- `NODE_ENV=production`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `GOOGLE_API_KEY=your-key`
- `PORT=5000`
- `ALLOWED_ORIGINS=http://localhost:3000`

---

## 🔍 How to Check Builder

In Railway dashboard:
1. Go to your service
2. Click **Settings**
3. Look for **"Builder"** or **"Build Configuration"**
4. Should say **"Nixpacks"** not **"Dockerfile"**

---

## ✅ Success Indicators

- ✅ Build uses Nixpacks (check build logs)
- ✅ No "package-lock.json" errors
- ✅ Build completes successfully
- ✅ Service starts and runs

---

**After switching to Nixpacks, your deployment should work!** 🚀

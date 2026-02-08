# Railway Build Error Fix

## ❌ Error You're Seeing

```
ERROR: failed to build: failed to solve: process "sh -c npm run build --workspace=hackathon-backend" did not complete successfully: exit code: 2
```

## 🔍 Root Cause

Railway is trying to build from the **root directory** and use workspace commands, but:
1. The workspace name is `backend`, not `hackathon-backend`
2. Railway should build from the `backend/` directory directly

## ✅ Solution

### Fix 1: Set Root Directory (REQUIRED)

1. **Go to Railway Dashboard:**
   - Open your project
   - Click on your backend service

2. **Go to Settings:**
   - Click "Settings" tab
   - Scroll to "Root Directory"

3. **Set Root Directory:**
   - Change from: (empty or root)
   - Change to: `backend`
   - Click "Save"

4. **Railway will redeploy automatically**

### Fix 2: Verify Build Settings

After setting root directory, verify:

- **Build Command:** `npm install && npm run db:generate && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `backend`

These should auto-detect correctly once root directory is set.

## 🔧 Alternative: Manual Build Command

If Railway still has issues, manually set:

**Build Command:**
```bash
npm install && npm run db:generate && npm run build
```

**Start Command:**
```bash
npm start
```

## ✅ Verification

After fixing:

1. **Check Build Logs:**
   - Go to Railway → Deployments
   - Click on latest deployment
   - View build logs
   - Should see: `npm run db:generate` then `tsc` (TypeScript compile)

2. **Check Service Status:**
   - Should show "Active" or "Deployed"
   - Health check should pass

3. **Test API:**
   ```bash
   curl https://your-app.railway.app/health
   ```

## 🎯 Key Points

- ✅ **Root Directory MUST be `backend`**
- ✅ Build runs from `backend/` directory
- ✅ No workspace commands needed
- ✅ Prisma generate runs automatically (in build script)

## 📚 Full Guide

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for complete instructions.

---

**After setting Root Directory to `backend`, Railway should build successfully! 🎉**

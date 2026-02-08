# 🔧 Railway Deployment Troubleshooting

Common errors and solutions when deploying backend to Railway.

---

## Error: "There was an error deploying from source"

This is a generic error. Check the build logs in Railway dashboard for specific details.

### Common Causes & Solutions

---

## 1. Root Directory Not Set Correctly

**Problem:** Railway is building from root instead of `backend` folder.

**Solution:**
1. Go to Railway dashboard → Your service
2. Click **Settings** → **Root Directory**
3. Set to: `backend`
4. Click **Save**
5. Redeploy

---

## 2. Node.js Version Mismatch

**Problem:** Some dependencies require Node 20+, but Railway might be using Node 18.

**Solution A: Update nixpacks.toml**

Update `backend/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run db:generate", "npm run build"]

[start]
cmd = "npm start"
```

**Solution B: Use Railway Environment Variable**

1. Go to Railway → Variables
2. Add: `NODE_VERSION=20`
3. Redeploy

---

## 3. Database Migrations Not Running

**Problem:** Database tables don't exist.

**Solution:**

Update build command to include migrations:

1. Go to Railway → Settings → Build Command
2. Set to:
   ```
   npm install && npm run db:generate && npm run db:migrate:deploy && npm run build
   ```
3. Save and redeploy

---

## 4. Missing Environment Variables

**Problem:** Required environment variables not set.

**Solution:**

Ensure these are set in Railway → Variables:

**Required:**
- `NODE_ENV=production`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `GOOGLE_API_KEY=your-key`
- `PORT=5000`

**Check:**
- Variables are set for correct environment (Production)
- No typos in variable names
- `DATABASE_URL` uses the variable reference format

---

## 5. Build Command Issues

**Problem:** Build command fails during deployment.

**Solution:**

**Current build command should be:**
```
npm install && npm run db:generate && npm run build
```

**If using root directory `backend`:**
- Build command: `npm install && npm run db:generate && npm run build`
- Start command: `npm start`

**If Railway is building from root (not recommended):**
- Build command: `cd backend && npm install && npm run db:generate && npm run build`
- Start command: `cd backend && npm start`

---

## 6. Prisma Client Not Generated

**Problem:** Prisma client missing, causing runtime errors.

**Solution:**

Ensure `npm run db:generate` runs before build:

1. Check build command includes: `npm run db:generate`
2. Verify `prisma/schema.prisma` exists
3. Check build logs for Prisma generation errors

---

## 7. TypeScript Compilation Errors

**Problem:** TypeScript errors blocking build.

**Solution:**

1. Fix all TypeScript errors locally first:
   ```bash
   cd backend
   npm run type-check
   ```
2. Fix any errors found
3. Commit and push changes
4. Redeploy

---

## 8. Package Installation Failures

**Problem:** npm install fails.

**Solution:**

1. Check `package.json` is valid JSON
2. Verify all dependencies are available
3. Check build logs for specific package errors
4. Try clearing Railway cache:
   - Settings → Clear Build Cache
   - Redeploy

---

## 9. Port Configuration

**Problem:** Service not starting on correct port.

**Solution:**

1. Ensure `PORT=5000` is set in Railway variables
2. Verify backend code uses `process.env.PORT || 5000`
3. Check Railway exposes port 5000

---

## 10. Database Connection Issues

**Problem:** Can't connect to PostgreSQL.

**Solution:**

1. Verify PostgreSQL service is running (Railway dashboard)
2. Check `DATABASE_URL` is set correctly
3. Ensure `DATABASE_URL` uses variable reference: `${{Postgres.DATABASE_URL}}`
4. Check database is in same project/network
5. Run migrations: Add `npm run db:migrate:deploy` to build command

---

## 🔍 How to Check Build Logs

1. Go to Railway dashboard
2. Click on your service
3. Go to **Deployments** tab
4. Click on the failed deployment
5. View **Build Logs** for specific errors

---

## ✅ Correct Railway Configuration

### Settings:

**Root Directory:** `backend`

**Build Command:**
```
npm install && npm run db:generate && npm run db:migrate:deploy && npm run build
```

**Start Command:**
```
npm start
```

### Environment Variables:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
GOOGLE_API_KEY=your-api-key
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🚀 Step-by-Step Fix

1. **Check Root Directory**
   - Settings → Root Directory → Should be `backend`

2. **Update Build Command**
   - Settings → Build Command
   - Set to: `npm install && npm run db:generate && npm run db:migrate:deploy && npm run build`

3. **Update Start Command**
   - Settings → Start Command
   - Set to: `npm start`

4. **Set Environment Variables**
   - Variables tab
   - Add all required variables

5. **Check Node Version**
   - Update `nixpacks.toml` to use Node 20
   - Or set `NODE_VERSION=20` in variables

6. **Redeploy**
   - Click "Redeploy" or push to GitHub

---

## 📋 Quick Checklist

- [ ] Root Directory set to `backend`
- [ ] Build command includes `npm run db:generate`
- [ ] Build command includes `npm run db:migrate:deploy`
- [ ] Start command is `npm start`
- [ ] All environment variables set
- [ ] `DATABASE_URL` uses variable reference
- [ ] Node version is 20+ (if needed)
- [ ] No TypeScript errors locally
- [ ] Prisma schema file exists
- [ ] Database service is running

---

## 🆘 Still Having Issues?

1. **Check Build Logs** - Most specific errors are in the logs
2. **Try Manual Deploy** - Use Railway CLI for more control
3. **Check Railway Status** - railway.app/status
4. **Contact Support** - Railway has good support

---

**Most common fix:** Set Root Directory to `backend` and ensure build command doesn't include `cd backend`.

# Vercel Deployment Guide

Complete guide for deploying the Fact Checker frontend to Vercel.

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Sign up/Login:**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project:**
   - **Root Directory:** `frontend` (important!)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Set Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
     ```
   - Or for local testing:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000/api
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live! 🎉

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your backend URL when prompted
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## ⚙️ Configuration

### Root Directory

Since this is a monorepo, Vercel needs to know the frontend is in the `frontend/` directory.

**In Vercel Dashboard:**
- Go to Project Settings → General
- Set "Root Directory" to `frontend`

**Or use `vercel.json` (already configured):**
```json
{
  "rootDirectory": "frontend"
}
```

### Build Settings

Vercel auto-detects Next.js, but you can verify:

- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

**Optional:**
```env
NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app
```

---

## 🔧 Backend Setup

Since Vercel only hosts the frontend, you need to deploy the backend separately.

### Recommended Backend Hosting:

1. **Railway** (Recommended)
   - Deploy backend: https://railway.app
   - Free PostgreSQL included
   - Get backend URL: `https://your-backend.railway.app`
   - Update `NEXT_PUBLIC_API_URL` in Vercel

2. **Render**
   - Deploy backend: https://render.com
   - Free PostgreSQL included
   - Get backend URL: `https://your-backend.onrender.com`
   - Update `NEXT_PUBLIC_API_URL` in Vercel

3. **Fly.io**
   - Deploy backend: https://fly.io
   - Free tier available
   - Get backend URL: `https://your-backend.fly.dev`

### Backend Environment Variables:

```env
NODE_ENV=production
DATABASE_URL=<your-postgres-url>
GOOGLE_API_KEY=<your-api-key>
PORT=5000
```

---

## 📝 Step-by-Step Deployment

### 1. Prepare Backend

Deploy backend first to get the API URL:

```bash
# Example: Deploy to Railway
# 1. Go to railway.app
# 2. New Project → Deploy from GitHub
# 3. Select repo, set root: backend
# 4. Add PostgreSQL database
# 5. Set environment variables
# 6. Copy backend URL
```

### 2. Deploy Frontend to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/new

2. **Import Repository:**
   - Connect GitHub
   - Select your repository

3. **Configure:**
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto)
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `.next` (auto)

4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

### 3. Update CORS (Backend)

Make sure your backend allows requests from Vercel domain:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app', // Add your Vercel URL
  ],
}));
```

---

## 🔍 Verification

After deployment:

1. **Check Frontend:**
   - Visit: `https://your-app.vercel.app`
   - Should see Fact Checker homepage

2. **Check API Connection:**
   - Open browser console (F12)
   - Submit a test claim
   - Check Network tab for API calls
   - Should connect to your backend URL

3. **Test Full Flow:**
   - Submit a claim
   - Wait for results
   - Verify counter-arguments display

---

## 🐛 Troubleshooting

### Build Fails

**Error: Cannot find module**
- Check `package.json` has all dependencies
- Verify `node_modules` is not in `.gitignore` incorrectly
- Try clearing Vercel cache and redeploy

**Error: Build timeout**
- Increase build timeout in Vercel settings
- Check for slow dependencies
- Optimize build process

### API Connection Issues

**CORS Errors:**
- Update backend CORS to include Vercel domain
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is accessible

**Network Errors:**
- Verify backend URL is correct
- Check backend is running
- Test backend health endpoint

### Environment Variables Not Working

- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Check variable names match exactly

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to:

- `main` branch → Production
- Other branches → Preview deployments

**To disable auto-deploy:**
- Go to Project Settings → Git
- Uncheck "Automatically deploy"

---

## 📊 Monitoring

### Vercel Analytics (Optional)

Enable in Project Settings → Analytics:
- Page views
- Performance metrics
- Real-time monitoring

### Logs

View deployment logs:
- Go to Deployments
- Click on a deployment
- View "Build Logs" and "Runtime Logs"

---

## 🎯 Best Practices

1. **Always deploy backend first** - Get API URL before frontend
2. **Use environment variables** - Never hardcode URLs
3. **Test preview deployments** - Use branch previews before production
4. **Monitor logs** - Check for errors after deployment
5. **Set up custom domain** - Add your domain in Vercel settings

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Deployment Guide](./FREE_DEPLOYMENT_GUIDE.md)

---

## ✅ Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Backend URL copied
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Root directory set to `frontend`
- [ ] Environment variables configured
- [ ] CORS updated on backend
- [ ] Frontend deployed successfully
- [ ] Tested full flow end-to-end
- [ ] Custom domain configured (optional)

---

## 🚀 Quick Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from frontend directory)
cd frontend
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs
```

---

**Your app is now live on Vercel! 🎉**

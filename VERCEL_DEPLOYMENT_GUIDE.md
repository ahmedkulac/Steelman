# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy your Steelman Fact Checker frontend to Vercel.

## Prerequisites

1. **Backend deployed** (Railway, Render, or Fly.io)
   - You need your backend API URL before deploying frontend
   - Example: `https://your-backend.railway.app`

2. **GitHub repository** with your code pushed

3. **Vercel account** (free tier works perfectly)

---

## Step 1: Deploy Backend First (If Not Done)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set **Root Directory** to `backend`
5. Add PostgreSQL database (click "+ New" → "Database" → "PostgreSQL")
6. Set environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   GOOGLE_API_KEY=your-google-api-key
   PORT=5000
   ```
7. Copy your backend URL (e.g., `https://your-app.railway.app`)
8. Update backend CORS to allow your Vercel domain (we'll do this after frontend deploy)

### Option B: Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add PostgreSQL database
6. Set environment variables (same as Railway)
7. Copy backend URL

---

## Step 2: Deploy Frontend to Vercel

### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project Settings:**
   
   **Important Settings:**
   - **Root Directory:** `frontend` ⚠️ (This is critical!)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Set Environment Variables:**
   
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
   ```
   
   Replace `your-backend-url.railway.app` with your actual backend URL.
   
   **Optional:**
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
   (You'll get this URL after first deployment)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live! 🎉

6. **Copy Your Vercel URL:**
   - After deployment, copy your Vercel URL
   - Example: `https://your-app.vercel.app`

---

### Method 2: Via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name? **Press Enter** (uses default)
   - Directory? **Press Enter** (current directory)
   - Override settings? **No**

5. **Set Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
   - Select: **Production, Preview, Development**
   - Enter value: `https://your-backend-url.railway.app/api`

6. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## Step 3: Update Backend CORS

After getting your Vercel URL, update your backend to allow requests from Vercel:

### If using Railway/Render:

Update your backend CORS configuration to include your Vercel domain:

```typescript
// backend/src/index.ts (or wherever CORS is configured)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app', // Add your Vercel URL here
  ],
  credentials: true,
}));
```

Then redeploy your backend.

---

## Step 4: Verify Deployment

1. **Visit your Vercel URL:**
   - Example: `https://your-app.vercel.app`
   - You should see the Fact Checker homepage

2. **Test API Connection:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Submit a test claim
   - Check Network tab for API calls
   - Should see requests to your backend URL

3. **Test Full Flow:**
   - Submit a claim
   - Wait for counter-arguments
   - Verify everything works

---

## Environment Variables Reference

### Frontend (Vercel):

**Required:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

**Optional:**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Backend (Railway/Render):

**Required:**
```
NODE_ENV=production
DATABASE_URL=postgresql://...
GOOGLE_API_KEY=your-google-api-key
PORT=5000
```

**Optional:**
```
AI_MODEL=gemini-2.5-flash
AI_MAX_TOKENS=2000
```

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Check that Root Directory is set to `frontend`
- Verify all dependencies are in `frontend/package.json`
- Clear Vercel cache: Settings → General → Clear Build Cache

**Error: "Build timeout"**
- Check for slow dependencies
- Optimize build process
- Contact Vercel support to increase timeout

### API Connection Issues

**CORS Errors:**
- Update backend CORS to include Vercel domain
- Check `NEXT_PUBLIC_API_URL` is correct (no trailing slash)
- Verify backend is accessible

**Network Errors:**
- Verify backend URL is correct in environment variables
- Check backend is running and accessible
- Test backend health endpoint: `https://your-backend-url/api/health`

**"Failed to fetch" errors:**
- Check `NEXT_PUBLIC_API_URL` includes `/api` at the end
- Verify backend CORS allows your Vercel domain
- Check browser console for specific error messages

### Environment Variables Not Working

- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing variables
- Check variable names match exactly (case-sensitive)
- Verify variables are set for correct environments (Production/Preview/Development)

### TypeScript Errors

If you see TypeScript errors during build:
- Run `npm run type-check` locally first
- Fix any type errors
- Commit and push changes
- Redeploy

---

## Continuous Deployment

Vercel automatically deploys on every push:

- **`main` branch** → Production deployment
- **Other branches** → Preview deployments

**To disable auto-deploy:**
- Go to Project Settings → Git
- Uncheck "Automatically deploy"

**To deploy manually:**
- Go to Deployments tab
- Click "Redeploy" on any deployment

---

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

---

## Monitoring & Logs

### View Logs:
- Go to Deployments tab
- Click on any deployment
- View "Build Logs" and "Runtime Logs"

### Analytics (Optional):
- Go to Project Settings → Analytics
- Enable Vercel Analytics for page views and performance

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

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

# Link to existing project
vercel link

# Pull environment variables
vercel env pull .env.local
```

---

## Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Backend URL copied
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Root directory set to `frontend`
- [ ] Environment variables configured (`NEXT_PUBLIC_API_URL`)
- [ ] Frontend deployed successfully
- [ ] Vercel URL copied
- [ ] Backend CORS updated with Vercel URL
- [ ] Backend redeployed with CORS changes
- [ ] Tested full flow end-to-end
- [ ] Custom domain configured (optional)

---

## Important Notes

1. **Root Directory:** Always set to `frontend` - this is critical!
2. **Backend First:** Deploy backend before frontend to get the API URL
3. **Environment Variables:** Must start with `NEXT_PUBLIC_` for client-side access
4. **CORS:** Update backend CORS after getting Vercel URL
5. **API URL:** Should end with `/api` (e.g., `https://backend.railway.app/api`)

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
- Check existing docs: `docs/VERCEL_DEPLOYMENT.md`

---

**Your app is now live on Vercel! 🎉**

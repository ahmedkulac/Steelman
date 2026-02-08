# Vercel Quick Start

Deploy your Fact Checker frontend to Vercel in 2 minutes!

## 🚀 Deploy Now

### Step 1: Deploy Backend First (Required)

You need a backend URL before deploying frontend.

**Recommended: Railway**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repo, set root: `backend`
4. Add PostgreSQL database
5. Set environment variables:
   - `DATABASE_URL` (from PostgreSQL)
   - `GOOGLE_API_KEY` (your API key)
   - `NODE_ENV=production`
6. Copy backend URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

**Option A: Via Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Import GitHub repository
3. Configure:
   - **Root Directory:** `frontend` ⚠️ IMPORTANT!
   - Framework: Next.js (auto-detected)
4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```
5. Click "Deploy"
6. Done! 🎉

**Option B: Via CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend-url/api

# Deploy to production
vercel --prod
```

## ✅ Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Submit a test claim
3. Check browser console for API calls
4. Verify results display correctly

## 🔧 Update Backend CORS

Make sure backend allows Vercel domain:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app', // Add your Vercel URL
  ],
}));
```

## 📚 Full Guide

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

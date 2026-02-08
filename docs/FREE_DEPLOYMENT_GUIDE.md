# Free Deployment Guide

## 🎯 Recommended Free Deployment Options

For your Fact Checker app (Next.js frontend + Express backend + PostgreSQL), here are the best **100% free** options:

---

## 🏆 **Option 1: Railway (BEST FOR FULL-STACK) - RECOMMENDED**

**Why Railway:**
- ✅ Free tier: $5 credit/month (enough for small apps)
- ✅ Deploys both frontend and backend together
- ✅ Free PostgreSQL database included
- ✅ Free Redis included
- ✅ Automatic HTTPS/SSL
- ✅ GitHub integration
- ✅ Easy environment variables
- ✅ Zero configuration needed

**Setup Steps:**

1. **Sign up:** https://railway.app (use GitHub login)

2. **Deploy Backend:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects it's Node.js
   - Add PostgreSQL database (click "+ New" → PostgreSQL)
   - Add Redis (optional, click "+ New" → Redis)
   - Set environment variables:
     ```
     NODE_ENV=production
     DATABASE_URL=<from PostgreSQL service>
     REDIS_URL=<from Redis service, optional>
     GOOGLE_API_KEY=<your key>
     PORT=5000
     ```
   - Railway auto-deploys!

3. **Deploy Frontend:**
   - Click "+ New" → "GitHub Repo"
   - Select same repo
   - Set root directory: `frontend`
   - Set environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
     ```
   - Deploy!

**Cost:** FREE (within $5/month credit)

---

## 🥈 **Option 2: Render (GREAT FREE TIER)**

**Why Render:**
- ✅ Free tier: 750 hours/month (enough for 24/7)
- ✅ Free PostgreSQL database
- ✅ Free SSL/HTTPS
- ✅ Auto-deploys from GitHub
- ✅ Easy setup

**Limitations:**
- ⚠️ Services sleep after 15 min inactivity (free tier)
- ⚠️ No Redis on free tier (but in-memory cache works!)

**Setup Steps:**

1. **Sign up:** https://render.com (use GitHub login)

2. **Deploy Backend:**
   - Click "New" → "Web Service"
   - Connect GitHub repo
   - Settings:
     - **Name:** `fact-checker-backend`
     - **Root Directory:** `backend`
     - **Environment:** Node
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
   - Add PostgreSQL database:
     - Click "New" → "PostgreSQL"
     - Copy `DATABASE_URL` to backend env vars
   - Add environment variables:
     ```
     NODE_ENV=production
     DATABASE_URL=<from PostgreSQL>
     GOOGLE_API_KEY=<your key>
     PORT=10000
     ```
   - Deploy!

3. **Deploy Frontend:**
   - Click "New" → "Static Site"
   - Connect GitHub repo
   - Settings:
     - **Root Directory:** `frontend`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `.next`
   - Or use "Web Service" for Next.js:
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
     ```
   - Deploy!

**Cost:** FREE (services sleep after inactivity)

---

## 🥉 **Option 3: Vercel (Frontend) + Railway/Render (Backend)**

**Why Split:**
- ✅ Vercel = Best for Next.js (made by Next.js creators!)
- ✅ Free tier: Unlimited deployments
- ✅ Edge network (super fast)
- ✅ Zero config for Next.js

**Setup:**

1. **Frontend on Vercel:**
   - Sign up: https://vercel.com
   - Click "Import Project"
   - Select GitHub repo
   - Set root directory: `frontend`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url/api
     ```
   - Deploy! (takes 30 seconds)

2. **Backend on Railway/Render:**
   - Follow Option 1 or 2 above for backend
   - Update frontend env var with backend URL

**Cost:** FREE (both platforms)

---

## 🆓 **Option 4: Supabase (Backend) + Vercel (Frontend)**

**Why Supabase:**
- ✅ Free PostgreSQL database
- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ Built-in auth (if you need it later)
- ✅ Great free tier

**Setup:**

1. **Database on Supabase:**
   - Sign up: https://supabase.com
   - Create new project
   - Get `DATABASE_URL` from Settings → Database
   - Use for backend `DATABASE_URL`

2. **Backend on Railway/Render:**
   - Use Supabase `DATABASE_URL`
   - Deploy backend as in Option 1/2

3. **Frontend on Vercel:**
   - Deploy as in Option 3

**Cost:** FREE

---

## 📊 **Comparison Table**

| Platform | Free Tier | Database | Redis | Sleep? | Best For |
|----------|-----------|----------|-------|--------|----------|
| **Railway** | $5/month credit | ✅ Free | ✅ Free | ❌ No | Full-stack apps |
| **Render** | 750 hrs/month | ✅ Free | ❌ No | ⚠️ Yes (15min) | Simple deployments |
| **Vercel** | Unlimited | ❌ No | ❌ No | ❌ No | Next.js frontend |
| **Supabase** | 500MB DB | ✅ Free | ❌ No | ❌ No | Database hosting |

---

## 🎯 **My Recommendation: Railway**

**Why Railway is best for your app:**

1. ✅ **One platform** - Deploy everything together
2. ✅ **No sleep** - Services stay awake (unlike Render free tier)
3. ✅ **Free PostgreSQL** - Database included
4. ✅ **Free Redis** - Caching included
5. ✅ **Easy setup** - Auto-detects Node.js, minimal config
6. ✅ **GitHub integration** - Auto-deploys on push
7. ✅ **$5/month credit** - Usually enough for small apps

**Railway Setup (5 minutes):**

```bash
# 1. Sign up at railway.app (GitHub login)
# 2. Click "New Project" → "Deploy from GitHub"
# 3. Select your repo
# 4. Railway auto-detects and deploys backend!
# 5. Add PostgreSQL (click "+ New" → PostgreSQL)
# 6. Copy DATABASE_URL to backend env vars
# 7. Add GOOGLE_API_KEY to env vars
# 8. Deploy frontend (click "+ New" → GitHub Repo, set root: frontend)
# 9. Set NEXT_PUBLIC_API_URL to backend URL
# Done! 🎉
```

---

## 🔧 **Quick Setup Checklist**

### Before Deploying:

- [ ] Push code to GitHub
- [ ] Test locally with `npm run build`
- [ ] Have Google API key ready
- [ ] Choose deployment platform

### Environment Variables Needed:

**Backend:**
```env
NODE_ENV=production
DATABASE_URL=<from database service>
GOOGLE_API_KEY=<your key>
PORT=5000  # or platform default
REDIS_URL=<optional, if using Redis>
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

### After Deploying:

- [ ] Run database migrations: `npm run db:migrate` (via platform CLI or dashboard)
- [ ] Test health endpoint: `https://your-backend-url/health`
- [ ] Test frontend: Visit deployed URL
- [ ] Test full flow: Submit a claim

---

## 🚀 **Deployment Commands**

### Railway CLI (Optional):
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Render CLI (Optional):
```bash
npm i -g render-cli
render login
render deploy
```

---

## 💡 **Pro Tips**

1. **Start with Railway** - Easiest full-stack deployment
2. **Use environment variables** - Never commit secrets
3. **Test locally first** - Use Docker Compose to simulate production
4. **Monitor logs** - Check platform logs for errors
5. **Set up health checks** - Use `/health` endpoint
6. **Database migrations** - Run after first deployment
7. **CORS** - Update backend CORS to allow frontend domain

---

## 🆘 **Troubleshooting**

### Database Connection Issues:
- Verify `DATABASE_URL` format
- Check database is accessible
- Run migrations: `npm run db:migrate`

### Build Failures:
- Check Node.js version (use 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

### CORS Errors:
- Update backend CORS to include frontend URL
- Check `NEXT_PUBLIC_API_URL` is correct

---

## 📚 **Additional Resources**

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## ✅ **Recommended: Railway**

**Start here:** https://railway.app

**Why:** Best free tier, easiest setup, supports everything you need!

# Vercel Deployment Checklist

Quick checklist to ensure your app is ready for Vercel deployment.

## ✅ Pre-Deployment Checklist

### Backend Setup
- [ ] Backend deployed to Railway/Render/Fly.io
- [ ] Backend URL obtained (e.g., `https://your-backend.railway.app`)
- [ ] Backend health endpoint working: `https://your-backend-url/health`
- [ ] Database migrations run on backend
- [ ] Backend CORS configured (allows Vercel domain)
- [ ] Environment variables set on backend:
  - [ ] `DATABASE_URL`
  - [ ] `GOOGLE_API_KEY`
  - [ ] `NODE_ENV=production`
  - [ ] `ALLOWED_ORIGINS` (optional, for CORS)

### Frontend Setup
- [ ] Code pushed to GitHub
- [ ] `vercel.json` exists in root (configured)
- [ ] `.vercelignore` exists (excludes backend)
- [ ] `frontend/next.config.js` configured
- [ ] Environment variables ready:
  - [ ] `NEXT_PUBLIC_API_URL` (your backend URL + `/api`)

### Code Quality
- [ ] `npm run build` succeeds locally
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] No TypeScript errors
- [ ] All dependencies in `package.json`

## 🚀 Deployment Steps

### 1. Deploy Backend
- [ ] Choose platform (Railway recommended)
- [ ] Connect GitHub repository
- [ ] Set root directory: `backend`
- [ ] Add PostgreSQL database
- [ ] Set environment variables
- [ ] Deploy and get URL

### 2. Deploy Frontend to Vercel
- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository
- [ ] Set root directory: `frontend` ⚠️ CRITICAL!
- [ ] Add environment variable: `NEXT_PUBLIC_API_URL`
- [ ] Deploy

### 3. Post-Deployment
- [ ] Update backend CORS with Vercel URL
- [ ] Test frontend: Visit Vercel URL
- [ ] Test API connection: Submit a claim
- [ ] Verify results display correctly
- [ ] Check browser console for errors
- [ ] Test on mobile device

## 🔧 Configuration Files

### Root `vercel.json` ✅
```json
{
  "rootDirectory": "frontend"
}
```

### `frontend/next.config.js` ✅
- Output: `standalone`
- Environment variables configured

### `.vercelignore` ✅
- Excludes backend, docs, scripts

## 📝 Environment Variables

### Vercel Dashboard
```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

### Backend (Railway/Render)
```
NODE_ENV=production
DATABASE_URL=<postgres-url>
GOOGLE_API_KEY=<your-key>
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

## 🐛 Common Issues

### Build Fails
- [ ] Check root directory is `frontend`
- [ ] Verify `package.json` has all dependencies
- [ ] Check build logs in Vercel dashboard

### API Connection Fails
- [ ] Verify `NEXT_PUBLIC_API_URL` is correct
- [ ] Check backend CORS allows Vercel domain
- [ ] Test backend health endpoint directly
- [ ] Check browser console for CORS errors

### Environment Variables Not Working
- [ ] Ensure variables start with `NEXT_PUBLIC_`
- [ ] Redeploy after adding variables
- [ ] Check variable names match exactly

## ✅ Final Verification

- [ ] Frontend loads at Vercel URL
- [ ] Can submit claims
- [ ] API calls succeed (check Network tab)
- [ ] Results display correctly
- [ ] No console errors
- [ ] Mobile responsive works
- [ ] Dark mode toggle works

## 🎉 Success!

Your app is live on Vercel!

**Next Steps:**
- Set up custom domain (optional)
- Enable Vercel Analytics (optional)
- Set up monitoring/alerts
- Configure preview deployments

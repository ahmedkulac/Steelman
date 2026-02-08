# ⚡ Quick Deploy Checklist

Fast reference for deploying to Vercel + Railway.

---

## 🚂 Railway (Backend) - 5 Minutes

1. **Create Project**
   - Go to railway.app → New Project → Deploy from GitHub
   - Select your repo

2. **Configure**
   - Settings → Root Directory: `backend`
   - Settings → Build Command: `npm install && npm run db:generate && npm run build`
   - Settings → Start Command: `npm start`

3. **Add Database**
   - Click "+ New" → Database → PostgreSQL
   - Copy DATABASE_URL

4. **Set Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   GOOGLE_API_KEY=your-key
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:3000
   ```
   *(Update ALLOWED_ORIGINS after getting Vercel URL)*

5. **Deploy & Copy URL**
   - Wait for deployment
   - Generate domain
   - Copy backend URL

---

## ▲ Vercel (Frontend) - 3 Minutes

1. **Import Project**
   - Go to vercel.com → Add New → Project
   - Import GitHub repo

2. **Configure**
   - Root Directory: `frontend` ⚠️ (CRITICAL!)
   - Framework: Next.js (auto)

3. **Set Variable**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
   *(Use your Railway backend URL + /api)*

4. **Deploy & Copy URL**
   - Click Deploy
   - Wait for build
   - Copy Vercel URL

---

## 🔗 Connect Them - 2 Minutes

1. **Update Railway CORS**
   - Railway → Variables → Edit `ALLOWED_ORIGINS`
   - Add your Vercel URL: `https://your-app.vercel.app,http://localhost:3000`
   - Save (auto-redeploys)

2. **Test**
   - Visit Vercel URL
   - Submit test claim
   - Check browser console for errors

---

## ✅ Done!

**Total Time:** ~10 minutes

**Your app is live!** 🎉

---

## 🆘 Quick Troubleshooting

**Build fails?**
- Check Root Directory is correct (`backend` / `frontend`)
- Check environment variables are set

**CORS errors?**
- Update `ALLOWED_ORIGINS` in Railway with Vercel URL
- Redeploy backend

**API not connecting?**
- Check `NEXT_PUBLIC_API_URL` ends with `/api`
- Verify backend URL is correct
- Check backend is running (Railway dashboard)

---

**For detailed instructions, see `COMPLETE_DEPLOYMENT_GUIDE.md`**

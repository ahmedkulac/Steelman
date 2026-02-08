# 🚀 Frontend Deployment Options

Complete guide to deploying your Next.js frontend on various platforms.

## Platform Comparison

| Platform | Free Tier | Ease of Use | Next.js Support | Best For |
|---------|-----------|-------------|-----------------|----------|
| **Vercel** | ✅ Excellent | ⭐⭐⭐⭐⭐ | Native | Production apps |
| **Netlify** | ✅ Good | ⭐⭐⭐⭐⭐ | Excellent | Static sites + SSR |
| **Cloudflare Pages** | ✅ Excellent | ⭐⭐⭐⭐ | Good | Global CDN |
| **Railway** | ✅ Limited | ⭐⭐⭐⭐ | Good | Full-stack apps |
| **Render** | ✅ Good | ⭐⭐⭐⭐ | Good | Simple deployments |
| **Fly.io** | ✅ Good | ⭐⭐⭐ | Good | Global edge |
| **GitHub Pages** | ✅ Free | ⭐⭐ | Limited | Static only |
| **AWS Amplify** | ✅ Limited | ⭐⭐⭐ | Good | AWS ecosystem |

---

## 1. Netlify (Recommended Alternative)

### Pros:
- ✅ Excellent free tier (100GB bandwidth/month)
- ✅ Automatic deployments from GitHub
- ✅ Built-in form handling
- ✅ Edge functions support
- ✅ Great Next.js support
- ✅ Easy environment variable management

### Cons:
- ⚠️ Build time limits on free tier (300 min/month)
- ⚠️ Slightly slower than Vercel for Next.js

### Quick Deploy:

**Via Dashboard:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/.next`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```
7. Click "Deploy site"

**Via CLI:**
```bash
npm install -g netlify-cli
cd frontend
netlify login
netlify init
# Follow prompts, select "Next.js" preset
netlify env:set NEXT_PUBLIC_API_URL https://your-backend-url/api
netlify deploy --prod
```

**Configuration File (`netlify.toml`):**
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "frontend/.next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 2. Cloudflare Pages

### Pros:
- ✅ Excellent free tier (unlimited builds)
- ✅ Global CDN (fast worldwide)
- ✅ Unlimited bandwidth
- ✅ DDoS protection included
- ✅ Great performance

### Cons:
- ⚠️ Next.js support is newer (may have limitations)
- ⚠️ Less Next.js-specific optimizations than Vercel

### Quick Deploy:

**Via Dashboard:**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up/login
3. Click "Create a project" → "Connect to Git"
4. Select your GitHub repository
5. Configure:
   - **Project name:** Your app name
   - **Production branch:** `main`
   - **Framework preset:** Next.js
   - **Build command:** `cd frontend && npm run build`
   - **Build output directory:** `frontend/.next`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```
7. Click "Save and Deploy"

**Via Wrangler CLI:**
```bash
npm install -g wrangler
cd frontend
wrangler pages project create your-app-name
wrangler pages deploy .next --project-name=your-app-name
```

---

## 3. Railway

### Pros:
- ✅ Simple deployment
- ✅ Can deploy frontend + backend together
- ✅ PostgreSQL included
- ✅ Good for monorepos

### Cons:
- ⚠️ Free tier is limited ($5 credit/month)
- ⚠️ Less Next.js optimizations than Vercel

### Quick Deploy:

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add service:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   PORT=3000
   ```
7. Railway auto-deploys

**Configuration (`railway.json`):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd frontend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd frontend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 4. Render

### Pros:
- ✅ Good free tier
- ✅ Automatic SSL
- ✅ Easy setup
- ✅ PostgreSQL included

### Cons:
- ⚠️ Free tier spins down after inactivity
- ⚠️ Slower cold starts

### Quick Deploy:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** Your app name
   - **Root Directory:** `frontend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```
7. Click "Create Web Service"

---

## 5. Fly.io

### Pros:
- ✅ Global edge deployment
- ✅ Good free tier
- ✅ Fast worldwide
- ✅ Docker-based

### Cons:
- ⚠️ More complex setup
- ⚠️ Requires Docker knowledge

### Quick Deploy:

1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login:
   ```bash
   fly auth login
   ```

3. Create `frontend/fly.toml`:
   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]
     builder = "paketobuildpacks/builder:base"

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

     [[http_service.checks]]
       interval = "10s"
       timeout = "2s"
       grace_period = "5s"
   ```

4. Deploy:
   ```bash
   cd frontend
   fly launch
   fly secrets set NEXT_PUBLIC_API_URL=https://your-backend-url/api
   fly deploy
   ```

---

## 6. GitHub Pages (Static Only)

### Pros:
- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Simple for static sites

### Cons:
- ⚠️ **Only works for static exports** (no SSR/API routes)
- ⚠️ Requires `next export` configuration
- ⚠️ Limited Next.js features

### Setup (Static Export Only):

1. Update `next.config.js`:
   ```javascript
   const nextConfig = {
     output: 'export',
     basePath: '/your-repo-name', // If deploying to GitHub Pages
     // ... rest of config
   }
   ```

2. Build:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy:
   - Go to repository Settings → Pages
   - Select source: GitHub Actions
   - Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: cd frontend && npm install && npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./frontend/out
   ```

---

## 7. AWS Amplify

### Pros:
- ✅ Good AWS integration
- ✅ CI/CD built-in
- ✅ Good for AWS ecosystem

### Cons:
- ⚠️ More complex setup
- ⚠️ Free tier is limited
- ⚠️ Requires AWS account

### Quick Deploy:

1. Go to [aws.amazon.com/amplify](https://aws.amazon.com/amplify)
2. Sign in with AWS account
3. Click "New app" → "Host web app"
4. Connect GitHub repository
5. Configure:
   - **App name:** Your app name
   - **Branch:** `main`
   - **Build settings:** Auto-detect or use:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - cd frontend
             - npm install
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: frontend/.next
         files:
           - '**/*'
       cache:
         paths:
           - frontend/node_modules/**/*
     ```
6. Add environment variables
7. Deploy

---

## 8. DigitalOcean App Platform

### Pros:
- ✅ Simple deployment
- ✅ Good pricing
- ✅ PostgreSQL included

### Cons:
- ⚠️ No free tier (starts at $5/month)
- ⚠️ Less Next.js optimizations

### Quick Deploy:

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create account
3. Go to App Platform → Create App
4. Connect GitHub repository
5. Configure:
   - **Source:** GitHub repo
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Run Command:** `npm start`
6. Add environment variables
7. Deploy

---

## Comparison Summary

### Best for Production:
1. **Vercel** - Best Next.js support, fastest
2. **Netlify** - Great alternative, excellent features
3. **Cloudflare Pages** - Best global performance

### Best for Learning:
1. **Netlify** - Easiest setup
2. **Render** - Simple and straightforward
3. **Railway** - Good for full-stack

### Best for Free:
1. **Cloudflare Pages** - Unlimited bandwidth
2. **Vercel** - Best free tier for Next.js
3. **Netlify** - Good free tier

### Best for Full-Stack:
1. **Railway** - Deploy everything together
2. **Render** - Can host backend + frontend
3. **Fly.io** - Global edge for both

---

## Environment Variables

All platforms require the same environment variable:

```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

Make sure to:
- ✅ Use `NEXT_PUBLIC_` prefix for client-side access
- ✅ Include `/api` at the end of backend URL
- ✅ Use HTTPS URLs (not HTTP)
- ✅ No trailing slashes

---

## Migration Between Platforms

To switch platforms:

1. **Export environment variables** from current platform
2. **Set up new platform** with same variables
3. **Update backend CORS** to include new domain
4. **Test thoroughly** before switching DNS
5. **Update any hardcoded URLs** in code

---

## Recommendations

### For Most Users:
**Start with Netlify** - Best balance of features, ease of use, and free tier.

### For Best Performance:
**Use Vercel** - Native Next.js support, fastest builds, best optimizations.

### For Global Reach:
**Use Cloudflare Pages** - Best CDN, fastest worldwide, unlimited bandwidth.

### For Full-Stack:
**Use Railway** - Deploy frontend + backend together, simplest setup.

---

## Need Help?

- Check platform-specific docs in `docs/` folder
- Each platform has excellent documentation
- Most platforms offer free support on their forums

---

**Choose the platform that best fits your needs!** 🚀

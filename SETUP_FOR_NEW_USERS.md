# Setup Guide for New Users

This guide will help anyone who clones this repository get the app running quickly.

## ⚠️ Important: Environment Variables

**We keep `.env` files in `.gitignore` for security** - this prevents accidentally committing API keys and secrets.

Instead, we provide `.env.example` files that you copy to create your own `.env` files.

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd 3Mis1Cs
npm install
```

### Step 2: Run Setup Script

**Windows:**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The script will:
- ✅ Install all dependencies
- ✅ Create `backend/.env` from `backend/.env.example`
- ✅ Create `frontend/.env.local` from `frontend/.env.local.example`
- ✅ Generate Prisma client
- ✅ Run database migrations

### Step 3: Add Your Google API Key

1. **Get API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy your key

2. **Add to Backend:**
   - Open `backend/.env`
   - Find: `GOOGLE_API_KEY=`
   - Add your key: `GOOGLE_API_KEY=your-actual-key-here`
   - Save the file

### Step 4: Start the App

```bash
npm run dev
```

This starts both frontend and backend.

### Step 5: Test It

1. Open: http://localhost:3000
2. Enter a test claim (e.g., "Climate change is not real")
3. Click "Fact-Check Claim"
4. Wait for results!

## 📋 Manual Setup (If Script Doesn't Work)

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Create Environment Files

**Backend:**
```bash
cp backend/.env.example backend/.env
```

**Frontend:**
```bash
cp frontend/.env.local.example frontend/.env.local
```

### 3. Configure Environment Variables

**Edit `backend/.env`:**
- Add your `GOOGLE_API_KEY` (required)
- Other settings are optional/defaults work

**Edit `frontend/.env.local` (usually no changes needed):**
- Only change if backend runs on different port

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates SQLite database)
npm run db:migrate
```

### 5. Start Servers

```bash
npm run dev
```

## ✅ Verification Checklist

- [ ] Dependencies installed (`node_modules` exists)
- [ ] `backend/.env` file exists (copied from `.env.example`)
- [ ] `frontend/.env.local` file exists (copied from `.env.local.example`)
- [ ] `GOOGLE_API_KEY` added to `backend/.env`
- [ ] Prisma client generated (`npm run db:generate` succeeded)
- [ ] Database migrated (`npm run db:migrate` succeeded)
- [ ] Backend running (see `🚀 Server running` message)
- [ ] Frontend running (see `Ready` message)
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/health

## 🐛 Common Issues

### "GOOGLE_API_KEY is not configured"
- **Fix:** Add your API key to `backend/.env`
- **Get key:** https://makersuite.google.com/app/apikey

### "Network Error"
- **Fix:** Make sure backend is running (`npm run dev:backend`)
- **Check:** Visit http://localhost:5000/health

### "Prisma client not generated"
- **Fix:** Run `npm run db:generate`
- **Note:** May need to run as Administrator on Windows

### "Database migration failed"
- **Fix:** Run `npm run db:migrate`
- **Note:** SQLite creates database automatically

### Port already in use
- **Fix:** Change `PORT` in `backend/.env` and update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

## 📁 Environment Files Explained

### `backend/.env` (Required)
- Contains backend configuration
- **MUST** include `GOOGLE_API_KEY`
- Created from `backend/.env.example`

### `frontend/.env.local` (Required)
- Contains frontend configuration
- Usually no changes needed
- Created from `frontend/.env.local.example`

### `.env.example` files
- **These are committed to git** (safe - no secrets)
- Templates for creating your `.env` files
- **Never commit actual `.env` files!**

## 🔒 Security Notes

- ✅ `.env` files are in `.gitignore` (never committed)
- ✅ `.env.example` files are safe to commit (no secrets)
- ✅ API keys stay on your machine
- ✅ Never share your `.env` files

## 📚 Additional Resources

- [Detailed Setup Guide](./docs/PHASE1_SETUP.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- [API Documentation](./docs/API.md)
- [Google API Setup](./docs/GOOGLE_API_SETUP.md)

## 🎯 What Works Out of the Box

- ✅ SQLite database (no installation needed!)
- ✅ Default configuration (just add API key)
- ✅ Mobile-responsive UI
- ✅ Error handling
- ✅ Rate limiting

## 🚀 After Setup

Once everything is running:

1. **Test the app:** Submit a claim and see results
2. **Read the docs:** Check `docs/` folder for more info
3. **Customize:** Modify components, add features
4. **Deploy:** See deployment guide when ready

---

**Need help?** Check the troubleshooting guides or open an issue!

# Environment Variables Setup Guide

## Overview

This project uses environment variables for configuration. **Actual `.env` files are never committed to git** for security, but we provide `.env.example` files as templates.

## File Structure

```
.
├── .env.example                    # Root example (reference only)
├── backend/
│   ├── .env.example               # Backend template ✅ COMMITTED
│   └── .env                       # Your actual config ❌ GITIGNORED
└── frontend/
    ├── .env.local.example         # Frontend template ✅ COMMITTED
    └── .env.local                 # Your actual config ❌ GITIGNORED
```

## Quick Setup

### Automated (Recommended)

Run the setup script:
```bash
# Windows
.\scripts\setup.ps1

# Mac/Linux
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual

1. **Backend:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add GOOGLE_API_KEY
   ```

2. **Frontend:**
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   # Usually no changes needed
   ```

## Required Variables

### Backend (`backend/.env`)

**Required:**
- `GOOGLE_API_KEY` - Google Gemini API key (shared key included in `.env.example`, or get your own from https://makersuite.google.com/app/apikey)

**Optional (have defaults):**
- `PORT` - Backend port (default: 5000)
- `DATABASE_URL` - Database connection (default: SQLite)
- `AI_MODEL` - Gemini model (default: gemini-2.5-flash)
- `REDIS_ENABLED` - Enable Redis (default: false)

### Frontend (`frontend/.env.local`)

**Required:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000/api)

**Optional:**
- `NEXT_PUBLIC_APP_URL` - Frontend URL (default: http://localhost:3000)

## Google API Key

**Good News!** A shared API key is already included in `backend/.env.example` and will be copied automatically during setup.

**Optional - Get Your Own Key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy the API key
6. Replace in `backend/.env`: `GOOGLE_API_KEY=your-key-here`

**Free tier available!** No credit card required initially.

**Note:** The shared key works for development, but for production or heavy usage, get your own key to avoid rate limits.

## Security Best Practices

✅ **DO:**
- Keep `.env` files in `.gitignore`
- Use `.env.example` as templates
- Add `.env` to `.gitignore` (already done)
- Never commit actual API keys

❌ **DON'T:**
- Commit `.env` files to git
- Share your `.env` files
- Put API keys in code
- Commit secrets to version control

## Verification

After setup, verify your configuration:

```bash
# Check backend .env exists
ls backend/.env

# Check frontend .env.local exists
ls frontend/.env.local

# Verify API key is set (don't show the actual key!)
grep -q "GOOGLE_API_KEY=" backend/.env && echo "✅ API key configured"
```

## Troubleshooting

### ".env file not found"
- Run setup script or manually copy `.env.example` files
- Make sure you're in the correct directory

### "GOOGLE_API_KEY is not configured"
- Check `backend/.env` exists
- Verify `GOOGLE_API_KEY=your-key` is in the file
- Restart backend after adding key

### "NEXT_PUBLIC_API_URL not found"
- Check `frontend/.env.local` exists
- Verify `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- Restart frontend after changes

## Environment File Locations

| File | Purpose | Committed? |
|------|---------|------------|
| `backend/.env.example` | Backend template | ✅ Yes |
| `backend/.env` | Your backend config | ❌ No (gitignored) |
| `frontend/.env.local.example` | Frontend template | ✅ Yes |
| `frontend/.env.local` | Your frontend config | ❌ No (gitignored) |

## After Cloning

When someone clones this repo:

1. ✅ `.env.example` files are included (safe templates)
2. ❌ `.env` files are NOT included (you create them)
3. ✅ Setup script creates `.env` files automatically
4. ✅ Documentation explains what to configure

This ensures:
- ✅ Repo works for anyone who clones it
- ✅ No secrets are committed
- ✅ Clear setup instructions
- ✅ Safe defaults

## Next Steps

After setting up environment variables:

1. Add your `GOOGLE_API_KEY` to `backend/.env`
2. Run `npm run db:generate`
3. Run `npm run db:migrate`
4. Start servers: `npm run dev`
5. Test the app!

See [SETUP_FOR_NEW_USERS.md](../SETUP_FOR_NEW_USERS.md) for complete setup guide.

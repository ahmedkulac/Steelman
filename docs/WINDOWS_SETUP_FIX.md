# Windows Setup Fix

## Issue: `Error: spawn EPERM` with esbuild

This is a common Windows issue where esbuild can't spawn its worker process, often due to antivirus/Windows Defender blocking it.

### Quick Fix Options

#### Option 1: Run as Administrator (Quick Test)
1. Close your terminal
2. Right-click PowerShell/Command Prompt
3. Select "Run as Administrator"
4. Navigate to project: `cd C:\Users\Ahmed\OneDrive\Documents\GitHub\3Mis1Cs`
5. Run: `npm run dev`

#### Option 2: Add Windows Defender Exception
1. Open Windows Security
2. Go to Virus & threat protection
3. Click "Manage settings" under Virus & threat protection settings
4. Scroll to "Exclusions" and click "Add or remove exclusions"
5. Add folder exclusion for: `C:\Users\Ahmed\OneDrive\Documents\GitHub\3Mis1Cs\node_modules`

#### Option 3: Rebuild node_modules
```powershell
# Delete node_modules and reinstall
cd C:\Users\Ahmed\OneDrive\Documents\GitHub\3Mis1Cs
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\node_modules -ErrorAction SilentlyContinue
npm install
```

#### Option 4: Use Alternative Build Tool
If esbuild continues to fail, we can switch to using `ts-node` instead of `tsx`. Let me know if you want this option.

### Environment Setup

Make sure you have:

1. **Backend `.env` file** at `backend/.env`
   - Add your `OPENAI_API_KEY` if you have one
   - Database URL should match your PostgreSQL setup

2. **Frontend `.env.local` file** at `frontend/.env.local`
   - Should already be created

3. **Database running**
   - If using Docker: `docker-compose up -d postgres`
   - Or ensure PostgreSQL is running locally

### Testing After Fix

1. **Start backend only:**
   ```powershell
   npm run dev:backend
   ```
   Should see: `🚀 Server running on http://localhost:5000`

2. **Start frontend only:**
   ```powershell
   npm run dev:frontend
   ```
   Should see: `Ready on http://localhost:3000`

3. **Start both:**
   ```powershell
   npm run dev
   ```

### Still Having Issues?

If esbuild continues to fail, we can:
1. Switch to `ts-node` for backend (slower but more compatible)
2. Use `next build` instead of dev mode for frontend
3. Check for antivirus software blocking node processes

Let me know which approach works or if you need further help!

# Next.js Cleanup Fix for Windows

## Problem
When running `npm run dev:frontend`, you may encounter this error:
```
Error: EINVAL: invalid argument, readlink 'C:\...\frontend\.next\server\middleware-manifest.json'
```

This happens because Next.js is trying to clean up the `.next` directory, but some files are locked by the dev server process.

## Solution

### Step 1: Stop the Dev Server
**IMPORTANT**: First, stop any running dev servers:
- Press `Ctrl+C` in the terminal where `npm run dev` is running
- Wait for the process to fully stop
- Close any terminals running the dev server

### Step 2: Delete the .next Directory

**Option A: Using PowerShell (Recommended)**
```powershell
cd frontend
if (Test-Path .next) { Remove-Item -Path .next -Recurse -Force }
```

**Option B: Using File Explorer**
1. Navigate to `frontend` folder
2. Delete the `.next` folder manually
3. If you get "Access Denied", make sure the dev server is stopped

**Option C: Using the Clean Script**
```powershell
# Make sure dev server is stopped first!
npm run clean:nextjs
```

### Step 3: Restart the Dev Server
```bash
npm run dev:frontend
```

## Why This Happens
- Next.js creates symlinks and cache files in `.next` during development
- Windows sometimes locks these files, preventing cleanup
- The dev server must be stopped before deleting `.next`

## Prevention
- Always stop the dev server (`Ctrl+C`) before deleting `.next`
- If you see this error, stop the server, delete `.next`, then restart
- Consider adding `.next` to your `.gitignore` (already done)

## Alternative: Kill Node Processes
If files remain locked even after stopping the server:

```powershell
# Kill all Node.js processes (use with caution!)
taskkill /F /IM node.exe
```

Then delete `.next` and restart.

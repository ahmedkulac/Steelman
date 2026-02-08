# Next.js Windows Build Directory Fix

## Issue: EINVAL error when Next.js tries to clean `.next` directory

This is a common Windows issue where Next.js has trouble cleaning the build directory due to symlink or file locking issues.

## Quick Fix

### Option 1: Delete `.next` folder manually

```powershell
# Stop the dev server (Ctrl+C)
# Then delete the .next folder
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
# Restart dev server
npm run dev:frontend
```

### Option 2: Clean and rebuild

```powershell
cd frontend
# Delete .next folder
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
# Clear Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
# Restart
npm run dev:frontend
```

### Option 3: Use PowerShell as Administrator

Sometimes Windows file permissions cause this issue:

1. Close your terminal
2. Right-click PowerShell → "Run as Administrator"
3. Navigate to project and delete `.next`:
   ```powershell
   cd C:\Users\Ahmed\OneDrive\Documents\GitHub\3Mis1Cs\frontend
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```
4. Restart dev server

## Prevention

The `.next` folder is already in `.gitignore`, so it won't be committed. This error is usually harmless and doesn't affect functionality - Next.js will rebuild the directory.

## If Error Persists

1. **Close all IDEs/editors** that might have the folder open
2. **Restart your computer** (clears file locks)
3. **Check OneDrive sync** - sometimes OneDrive locks files
4. **Run as Administrator** when deleting

## Note

This error doesn't prevent the app from working - Next.js will continue and rebuild. It's just a cleanup warning.
